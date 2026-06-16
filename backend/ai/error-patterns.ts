export interface ErrorPattern {
  type: string;
  message: string;
}

export function detectErrorInOutput(output: string): ErrorPattern | null {
  if (!output || output.trim().length === 0) return null;

  const patterns: { regex: RegExp; type: string }[] = [
    { regex: /SyntaxError:\s*(.+)/i, type: 'SyntaxError' },
    { regex: /TypeError:\s*(.+)/i, type: 'TypeError' },
    { regex: /ReferenceError:\s*(.+)/i, type: 'ReferenceError' },
    { regex: /RangeError:\s*(.+)/i, type: 'RangeError' },
    { regex: /Error:\s*(.+)/i, type: 'Error' },
    { regex: /AssertionError:\s*(.+)/i, type: 'AssertionError' },
    { regex: /Uncaught\s+(.+)/i, type: 'Uncaught' },
    { regex: /Exception:\s*(.+)/i, type: 'Exception' },
    { regex: /Traceback.*?\n(.+)/i, type: 'Traceback' },
    { regex: /panic!:\s*(.+)/i, type: 'Panic' },
    { regex: /Compilation\s+error:\s*(.+)/i, type: 'CompilationError' },
    { regex: /cannot\s+find\s+(symbol|method|class|module)\s+(.+)/i, type: 'CompilationError' },
    { regex: /unexpected\s+token\s+(.+)/i, type: 'SyntaxError' },
    { regex: /is\s+not\s+defined/i, type: 'ReferenceError' },
    { regex: /cannot\s+read\s+property\s+'(.+?)'\s+of\s+(null|undefined)/i, type: 'TypeError' },
  ];

  for (const { regex, type } of patterns) {
    const match = output.match(regex);
    if (match) {
      return { type, message: match[1]?.trim() || match[0].trim() };
    }
  }

  if (/error|exception|failed|failure|panic/i.test(output)) {
    const firstLine = output.split('\n')[0].trim();
    return { type: 'UnknownError', message: firstLine.slice(0, 200) };
  }

  return null;
}
