import { describe, expect, test } from 'vitest';

describe('challenge helpers', () => {
  test('builds executable challenge code by appending tests after user code', async () => {
    const { buildChallengeCode } = await import('../src/lib/lib/challenge.js');

    expect(buildChallengeCode('function add(a,b){return a+b;}', [
      'console.log(add(1, 2) === 3 ? "PASS" : "FAIL");',
    ])).toContain('function add(a,b){return a+b;}\nconsole.log(add(1, 2) === 3 ? "PASS" : "FAIL");');
  });
});

describe('project catalog helpers', () => {
  test('groups projects by difficulty and applies language filter', async () => {
    const { groupProjectsByDifficulty } = await import('../src/lib/lib/projects.js');
    const projects = [
      { id: 'a', difficulty: 'beginner', languages: ['javascript'] },
      { id: 'b', difficulty: 'expert', languages: ['go'] },
      { id: 'c', difficulty: 'beginner', languages: ['go', 'javascript'] },
    ];

    expect(groupProjectsByDifficulty(projects, { language: 'go' })).toEqual({
      beginner: [projects[2]],
      intermediate: [],
      advanced: [],
      expert: [projects[1]],
    });
  });

  test('exposes project ids used by the migrated projects route', async () => {
    const { PROJECT_IDS } = await import('../src/lib/lib/projects.js');

    expect(PROJECT_IDS).toContain('hello-world');
    expect(PROJECT_IDS).toContain('go-hello-world');
    expect(PROJECT_IDS.length).toBeGreaterThan(100);
  });
});
