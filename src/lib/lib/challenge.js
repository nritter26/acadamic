export function buildChallengeCode(code, tests = []) {
  return [code, ...tests].filter(Boolean).join('\n');
}

export function parseTestResults(output = '', tests = []) {
  const lines = output.split('\n');
  return tests.map((test, index) => ({
    test,
    passed: (lines[index] || '').includes('PASS'),
  }));
}
