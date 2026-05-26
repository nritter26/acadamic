import { Router, Request, Response } from 'express';
import { askLLM } from '../ai/provider';
import { validate } from '../middleware';
import { ExplainSchema } from '../types';

const router = Router();

function analyzeCode(code: string): {
  funcs: { name: string; args: string[] }[];
  vars: { name: string; type: string }[];
  calls: string[];
  patterns: string[];
  imports: string[];
  flow: string[];
} {
  const result = { funcs: [] as { name: string; args: string[] }[], vars: [] as { name: string; type: string }[], calls: [] as string[], patterns: [] as string[], imports: [] as string[], flow: [] as string[] };
  const lines = code.split('\n');

  const funcRe = /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\)\s*)?(?:=>|\bfunction\b)|def\s+(\w+)|func\s+(\w+)|fn\s+(\w+))/g;
  let m: RegExpExecArray | null;
  while ((m = funcRe.exec(code)) !== null) {
    const name = m[1] || m[2] || m[3] || m[4] || m[5];
    if (name) {
      const lineIdx = code.slice(0, m.index).split('\n').length;
      const line = lines[lineIdx] || '';
      const argsMatch = line.match(/\(([^)]*)\)/);
      const args = argsMatch ? argsMatch[1].split(',').map(a => a.trim()).filter(Boolean) : [];
      result.funcs.push({ name, args });
    }
  }

  const callRe = /(\w+(?:\.\w+)?)\s*\(([^)]*)\)/g;
  const seen = new Set<string>();
  while ((m = callRe.exec(code)) !== null) {
    const fullCall = m[1];
    if (fullCall === 'if' || fullCall === 'while' || fullCall === 'for' || fullCall === 'function') continue;
    if (!seen.has(fullCall)) {
      seen.add(fullCall);
      result.calls.push(fullCall);
    }
  }

  const declRe = /(?:const|let|var)\s+(\w+)\s*=\s*(['"`{\[]|true|false|\d)/g;
  while ((m = declRe.exec(code)) !== null) {
    const val = m[2];
    let type = 'unknown';
    if (val === '{') type = 'object';
    else if (val === '[') type = 'array';
    else if (val === "'" || val === '"' || val === '`') type = 'string';
    else if (val === 'true' || val === 'false') type = 'boolean';
    else if (/^\d/.test(val)) type = 'number';
    result.vars.push({ name: m[1], type });
  }

  if (/\bimport\s/.test(code) || /\brequire\s*\(/.test(code)) result.imports.push('module imports');
  if (/\btry\b/.test(code) && /\bcatch\b/.test(code)) result.patterns.push('error handling');
  if (/\basync\b|\bawait\b/.test(code)) result.patterns.push('async/await');
  if (/\bPromise\b/.test(code)) result.patterns.push('Promises');
  if (/\.map\s*\(/.test(code)) result.patterns.push('Array.map');
  if (/\.filter\s*\(/.test(code)) result.patterns.push('Array.filter');
  if (/\.reduce\s*\(/.test(code)) result.patterns.push('Array.reduce');
  if (/\.then\s*\(/.test(code)) result.patterns.push('Promise chaining');
  if (/console\.log\s*\(/.test(code)) result.flow.push('prints to console');
  if (/fetch\s*\(/.test(code)) result.flow.push('makes HTTP requests');
  if (/addEventListener|\.on\w+\s*=/.test(code)) result.flow.push('handles events');

  result.patterns = [...new Set(result.patterns)];
  return result;
}

function generateStaticExplain(code: string, lang: string, topic: string): string {
  const analysis = analyzeCode(code);
  const lines = code.split('\n');
  const langLabel = (lang || 'code').toUpperCase();
  let exp = `**Code Explanation — ${langLabel}**\n\n`;

  exp += `This code is **${lines.length} lines** long.`;

  if (analysis.funcs.length > 0) {
    const fnames = analysis.funcs.map(f => `\`${f.name}\``).join(', ');
    exp += ` It defines **${analysis.funcs.length} function(s)**: ${fnames}.`;
    for (const f of analysis.funcs) {
      if (f.args.length > 0) {
        exp += ` \`${f.name}\` takes ${f.args.length} parameter(s) (${f.args.join(', ')}).`;
      }
    }
  }

  if (analysis.vars.length > 0) {
    const typedVars = analysis.vars.map(v => `\`${v.name}\` (${v.type})`).join(', ');
    exp += `\n\n**Variables:** Declares ${typedVars}.`;
  }

  if (analysis.calls.length > 0) {
    const filteredCalls = analysis.calls.filter(c => !/\b(function|if|for|while|return|const|let|var|import|require)\b/.test(c) && c.length > 1);
    if (filteredCalls.length > 0) {
      exp += `\n\n**Key operations:** Calls ${filteredCalls.slice(0, 8).join(', ')}.`;
    }
  }

  if (analysis.patterns.length > 0) {
    exp += `\n\n**Techniques used:** ${analysis.patterns.join(', ')}.`;
  }

  if (analysis.imports.length > 0) {
    exp += `\n\n**Dependencies:** Uses ${analysis.imports.join(', ')}.`;
  }

  if (analysis.flow.length > 0) {
    exp += `\n\n**Behavior:** This code ${analysis.flow.join(' and ')}.`;
  }

  exp += `\n\n**How it works (step by step):**`;
  const relevantLines = lines.filter(l => l.trim() && !l.trim().startsWith('//') && !l.trim().startsWith('#'));
  if (relevantLines.length <= 15) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (/^\s*(\/\/|#)/.test(line)) {
        exp += `\n• *(comment)* ${trimmed.replace(/^\/\/\s*|^#\s*/, '')}`;
      } else if (/^\s*(import|require|from)\b/.test(line)) {
        exp += `\n• **import** — loads dependencies`;
      } else if (/^\s*(const|let|var)\s+\w+\s*=/.test(line)) {
        const varName = trimmed.match(/(?:const|let|var)\s+(\w+)/)?.[1] || '';
        const varVal = trimmed.match(/=\s*(.+)/)?.[1] || '';
        exp += `\n• Declares \`${varName}\` with value ${varVal.slice(0, 40)}`;
      } else if (/^\s*(function|def|func|fn)\s/.test(line)) {
        const fname = trimmed.match(/(?:function|def|func|fn)\s+(\w+)/)?.[1] || '';
        exp += `\n• Defines **\`${fname}\`** function`;
      } else if (/^\s*return\b/.test(line)) {
        const retVal = trimmed.replace(/^return\s*/, '').slice(0, 40);
        exp += `\n• **Returns** ${retVal}`;
      } else if (/^\s*(if|elif|else if|else)\b/.test(line)) {
        exp += `\n• **Conditional** branch`;
      } else if (/^\s*(for|while)\b/.test(line)) {
        exp += `\n• **Loop** — repeats execution`;
      } else if (/^\s*console\.log\s*\(/.test(line)) {
        const logged = trimmed.match(/console\.log\s*\((.+)\)/)?.[1] || '';
        exp += `\n• **Prints** ${logged.slice(0, 40)}`;
      } else if (/^\s*try\b/.test(line)) {
        exp += `\n• **Try** — starts error handling block`;
      } else if (/^\s*catch\b/.test(line)) {
        exp += `\n• **Catch** — handles errors`;
      } else if (/^\s*(throw|panic)\b/.test(line)) {
        exp += `\n• **Throws** an error`;
      } else if (/^\s*\}\s*$/.test(line)) {
        exp += `\n• *End of block*`;
      } else {
        exp += `\n• \`${trimmed.slice(0, 60)}\``;
      }
    }
  } else {
    const firstLines = relevantLines.slice(0, 10);
    exp += `\n• First, runs ${firstLines.length} lines of code`;
    const lastLines = relevantLines.slice(-5);
    exp += `\n• Then, executes ${lastLines.length} more lines`;
    if (/\breturn\b/.test(code)) exp += '\n• Finally, **returns** a value';
    if (/console\.log/.test(code)) exp += '\n• **Outputs** results to the console';
  }

  if (topic) {
    exp += `\n\n**Context:** This relates to the topic **"${topic}"**. Focus on understanding how ${topic} is applied here.`;
  }

  exp += '\n\n**Try this:** Modify values in the editor, then click **Run ▶** to see how the output changes!';
  return exp;
}

router.post('/', validate(ExplainSchema), async (req: Request, res: Response) => {
  try {
    const { code, lang, topic } = req.body;
    if (!code) {
      res.json({ explanation: 'No code provided to explain.' });
      return;
    }

    const activeProvider = process.env.AI_PROVIDER || 'hybrid';
    const messages = [
      {
        role: 'user' as const,
        content: topic
          ? `The user is studying ${topic} in ${lang || 'programming'}.\n\nExplain the following code. Describe what it does, how it works line by line, what concepts it uses, and any improvements:\n\n\`\`\`\n${code}\n\`\`\``
          : `Explain the following code. Describe what it does, how it works line by line, what concepts it uses, and any improvements:\n\n\`\`\`\n${code}\n\`\`\``,
      },
    ];

    if (activeProvider !== 'keyword') {
      const llmReply = await askLLM(messages, undefined, { lang, topic, code });
      if (llmReply) {
        res.json({ explanation: llmReply, source: 'llm' });
        return;
      }
    }

    const staticExplain = generateStaticExplain(code, lang || '', topic || '');
    res.json({ explanation: staticExplain, source: 'static', issues: [], score: null });
  } catch (e) {
    res.status(500).json({ explanation: 'Error: ' + (e as Error).message, source: 'error' });
  }
});

export default router;
