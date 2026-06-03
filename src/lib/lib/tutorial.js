import { TUTORIAL_COURSES as _TUTORIAL_COURSES } from '$lib/lib/tutorial-content.js';

export { _TUTORIAL_COURSES as TUTORIAL_COURSES };

export function createTutorialCourseState() {
  return {
    currentCourse: null,
    currentPhase: null,
    currentTopic: 0,
    completedTopics: [],
    completedPhases: [],
    quizScores: {},
    lastActivity: null,
  };
}

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

export function getCourseById(id, courses = _TUTORIAL_COURSES) {
  return courses.find(c => c.id === id) || null;
}

export function getPhaseById(course, phaseId) {
  if (!course?.phases) return null;
  return course.phases.find(p => p.id === phaseId) || null;
}

export function getTopicIndex(course, phaseId, topicName) {
  const phase = getPhaseById(course, phaseId);
  if (!phase) return -1;
  return phase.topics.indexOf(topicName);
}

export function getTotalProgress(course, completedTopics) {
  if (!course?.phases) return 0;
  const total = course.phases.reduce((sum, p) => sum + p.topics.length, 0);
  if (total === 0) return 0;
  return Math.round((completedTopics.length / total) * 100);
}

export function getPhaseProgress(course, phaseId, completedTopics) {
  const phase = getPhaseById(course, phaseId);
  if (!phase) return 0;
  const done = phase.topics.filter(t => completedTopics.includes(t)).length;
  return Math.round((done / phase.topics.length) * 100);
}
