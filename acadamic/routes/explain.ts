import { Router, Request, Response } from 'express';
import { askLLM } from '../ai/provider';
import { review as codeReview } from '../ai/reviewer';
import { validate } from '../middleware';
import { ExplainSchema } from '../types';

const router = Router();

router.post('/', validate(ExplainSchema), async (req: Request, res: Response) => {
  try {
    const { code, lang, topic } = req.body;
    if (!code) {
      res.json({ explanation: 'No code provided to explain.' });
      return;
    }

    const activeProvider = process.env.AI_PROVIDER || 'hybrid';
    if (activeProvider !== 'keyword') {
      const context = topic
        ? `The user is studying ${topic} in ${lang || 'programming'}.`
        : `The user is programming in ${lang || 'a language'}.`;

      const messages = [
        {
          role: 'user' as const,
          content: `${context}\n\nPlease explain the following code step by step. Describe what each line does, identify the programming concepts used, and suggest any improvements:\n\n\`\`\`\n${code}\n\`\`\``,
        },
      ];

      const llmReply = await askLLM(messages);
      if (llmReply) {
        res.json({ explanation: llmReply, source: 'llm' });
        return;
      }
    }

    const reviewResult = await codeReview(code, lang || 'js', topic);
    const lines = code.split('\n');
    let explanation = '';

    if (reviewResult.source === 'llm') {
      explanation = reviewResult.review;
    } else {
      explanation = `**Code Overview:**\n`;
      explanation += `- **${lines.length} lines** of ${(lang || 'code').toUpperCase()}\n`;
      if (code.includes('function') || code.includes('=>')) explanation += "- Defines one or more **functions**\n";
      if (code.includes('for(') || code.includes('for (')) explanation += "- Contains a **for loop**\n";
      if (code.includes('while(') || code.includes('while (')) explanation += "- Contains a **while loop**\n";
      if (code.includes('if(') || code.includes('if (')) explanation += "- Contains **conditional logic** (if statements)\n";
      if (code.includes('class ')) explanation += "- Defines a **class**\n";
      if (code.includes('return ')) explanation += "- Uses **return statements**\n";
      if (code.includes('const ') || code.includes('let ') || code.includes('var ')) explanation += "- Declares **variables**\n";
      if (code.includes('.')) explanation += "- Calls **methods** or accesses **properties**\n";

      if (reviewResult.issues?.length > 0) {
        explanation += '\n\n**Potential Issues:**\n';
        explanation += reviewResult.issues.map((h, i) => `${i + 1}. ${h.message}`).join('\n');
      }

      if (reviewResult.score) {
        explanation += `\n\n**Code Score:** ${reviewResult.score}/10`;
      }

      explanation += "\n\n**Suggestion:** Try modifying the code in the editor and running it to see how changes affect the output!";
    }

    res.json({
      explanation,
      source: reviewResult.source || 'static',
      issues: reviewResult.issues,
      score: reviewResult.score,
    });
  } catch (e) {
    res.status(500).json({ explanation: 'Error: ' + (e as Error).message, source: 'error' });
  }
});

export default router;
