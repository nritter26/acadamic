export function shuffleOptions(options: string[], correctIndex: number): { shuffledOptions: string[]; newCorrectIdx: number } {
  const pairs = options.map((opt, i) => ({ opt, isCorrect: i === correctIndex }));
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return {
    shuffledOptions: pairs.map(p => p.opt),
    newCorrectIdx: pairs.findIndex(p => p.isCorrect),
  };
}
