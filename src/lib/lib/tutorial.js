export function createTutorialState() {
  return {
    currentLesson: null,
    currentStep: 0,
    completedLessons: [],
  };
}

export const DEFAULT_TUTORIAL_LESSONS = [
  {
    id: 'orientation',
    title: 'Orientation',
    summary: 'Learn how to use Kodex lessons, editor, console, and AI tutor.',
    steps: [
      { title: 'Choose a language', body: 'Use the left rail to choose a curriculum language. Each language loads runtime JSON content.' },
      { title: 'Select a topic', body: 'Pick a topic to load an explanation and starter code into the workspace.' },
      { title: 'Ask Devin', body: 'Open the AI panel for contextual help using the current language, phase, and topic.' },
    ],
  },
  {
    id: 'practice-loop',
    title: 'Practice Loop',
    summary: 'Read, edit, run, review, and repeat with focused feedback.',
    steps: [
      { title: 'Read', body: 'Skim the explanation first. Look for key terms and the code pattern being introduced.' },
      { title: 'Edit', body: 'Modify the starter code. Make one intentional change at a time.' },
      { title: 'Run', body: 'Use Run to execute code through the backend and inspect console output.' },
    ],
  },
  {
    id: 'project-path',
    title: 'Project Path',
    summary: 'Move from topic drills into projects and challenges.',
    steps: [
      { title: 'Attempt a challenge', body: 'Use Code Lab to generate a practice exercise for the current language.' },
      { title: 'Build a project', body: 'Open Projects to work through multi-step guided builds.' },
      { title: 'Review and repeat', body: 'Use feedback loops to strengthen recall and move into harder topics.' },
    ],
  },
];

export function getLessonById(id, lessons = DEFAULT_TUTORIAL_LESSONS) {
  return lessons.find(lesson => lesson.id === id) || lessons[0];
}
