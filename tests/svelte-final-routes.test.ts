import { describe, expect, test } from 'vitest';
import { existsSync } from 'node:fs';
import path from 'node:path';

describe('game catalog', () => {
  test('contains the migrated mini-game entries', async () => {
    const { GAME_CATALOG } = await import('../src/lib/lib/games.js');

    expect(GAME_CATALOG).toHaveLength(16);
    expect(GAME_CATALOG.map(game => game.id)).toContain('typing-speed');
  });

  test('has a Svelte component file for each planned mini-game', () => {
    const files = [
      'TypingSpeed.svelte',
      'CodeScramble.svelte',
      'DebugTheBug.svelte',
      'SyntaxSprint.svelte',
      'MemoryMatch.svelte',
      'SpeedRead.svelte',
      'RaceCompiler.svelte',
      'SyntaxSwipe.svelte',
      'CodeGolf.svelte',
      'BinaryHexBlitz.svelte',
      'Crossword.svelte',
      'RegexRally.svelte',
      'SQLJOINMatch.svelte',
      'Errorpedia.svelte',
      'APIArcade.svelte',
      'LogicLadder.svelte',
    ];

    for (const file of files) {
      expect(existsSync(path.join(process.cwd(), 'src/lib/components/games', file))).toBe(true);
    }
  });

  test('checks normalized answers for playable games', async () => {
    const { isCorrectAnswer } = await import('../src/lib/lib/games.js');

    expect(isCorrectAnswer(' LEFT   JOIN ', 'left join')).toBe(true);
    expect(isCorrectAnswer('inner', 'left')).toBe(false);
  });
});

describe('tutorial helpers', () => {
  test('creates initial tutorial state with no completed lessons', async () => {
    const { createTutorialState } = await import('../src/lib/lib/tutorial.js');

    expect(createTutorialState()).toEqual({
      currentLesson: null,
      currentStep: 0,
      completedLessons: [],
    });
  });

  test('finds tutorial lessons by id', async () => {
    const { getLessonById } = await import('../src/lib/lib/tutorial.js');

    expect(getLessonById('practice-loop').title).toBe('Practice Loop');
  });
});

describe('legacy compatibility app', () => {
  test('ships legacy web entrypoint and required script assets', () => {
    expect(existsSync(path.join(process.cwd(), 'static/legacy.html'))).toBe(true);
    expect(existsSync(path.join(process.cwd(), 'public/game.js'))).toBe(true);
    expect(existsSync(path.join(process.cwd(), 'public/tutorial.js'))).toBe(true);
    expect(existsSync(path.join(process.cwd(), 'index.html'))).toBe(true);
  });
});
