import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const LANG_MAP = {
  js: { title: 'JavaScript', icon: '/public/logos/js.svg' },
  ts: { title: 'TypeScript', icon: '/public/logos/ts.svg' },
  py: { title: 'Python', icon: '/public/logos/py.svg' },
  go: { title: 'Go', icon: '/public/logos/go.svg' },
  rust: { title: 'Rust', icon: '/public/logos/rs.svg' },
  java: { title: 'Java', icon: '/public/logos/java.svg' },
  kt: { title: 'Kotlin', icon: '/public/logos/kt.svg' },
  cs: { title: 'C#', icon: '/public/logos/cs.svg' },
  cpp: { title: 'C++', icon: '/public/logos/cpp.svg' },
  c: { title: 'C', icon: '/public/logos/c.svg' },
  rb: { title: 'Ruby', icon: '/public/logos/rb.svg' },
  php: { title: 'PHP', icon: '/public/logos/php.svg' },
  swift: { title: 'Swift', icon: '/public/logos/swift.svg' },
  scala: { title: 'Scala', icon: '/public/logos/scala.svg' },
  lua: { title: 'Lua', icon: '/public/logos/lua.svg' },
  zig: { title: 'Zig', icon: '/public/logos/zig.svg' },
  asm: { title: 'Assembly', icon: '/public/logos/asm.svg' },
};

const LANG_ORDER = ['js', 'ts', 'py', 'go', 'rust', 'java', 'kt', 'cs', 'cpp', 'c', 'rb', 'php', 'swift', 'scala', 'lua', 'zig', 'asm'];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateQuizQuestions(langId, phaseTitle, topics) {
  const questions = [];
  const key = `${langId}:${slugify(phaseTitle)}`;
  const lc = phaseTitle.toLowerCase();
  const lang = LANG_MAP[langId].title;

  if (topics.length >= 2) {
    questions.push({
      question: `Which of these best describes "${topics[0]}" in ${lang}?`,
      options: [
        `A core concept covered in ${phaseTitle}`,
        `An advanced feature not yet available`,
        `A deprecated syntax pattern`,
        `A third-party library function`,
      ],
      answer: 0,
      explanation: `"${topics[0]}" is one of the fundamental topics covered in the ${phaseTitle} section of ${lang}.`,
    });
    questions.push({
      question: `In ${lang}, what is the purpose of "${topics[topics.length >= 2 ? 1 : 0]}"?`,
      options: [
        `To define application configuration`,
        `To handle a specific programming concern in ${phaseTitle.toLowerCase()}`,
        `To optimize network requests`,
        `To manage package dependencies`,
      ],
      answer: 1,
      explanation: `"${topics[topics.length >= 2 ? 1 : 0]}" is a key concept in ${lang}'s ${phaseTitle} domain.`,
    });
  } else {
    questions.push({
      question: `Which topic is part of ${lang}'s ${phaseTitle}?`,
      options: [...topics, `None of the above`],
      answer: 0,
      explanation: `"${topics[0]}" is covered in ${phaseTitle}.`,
    });
    questions.push({
      question: `What does ${phaseTitle} cover in ${lang}?`,
      options: [
        `The basics of ${topics.join(' and ')}`,
        `Only advanced concepts`,
        `Network protocols`,
        `Database design patterns`,
      ],
      answer: 0,
      explanation: `${phaseTitle} introduces the core concepts including ${topics.join(', ')}.`,
    });
  }

  return { key, questions };
}

const contentDir = join(process.cwd(), 'content');
const allFiles = readdirSync(contentDir).filter(f => f.endsWith('.json') && f !== 'projects' && f !== 'app-data.json' && f !== 'curriculum.json');

const courses = [];
const allQuizzes = {};

for (const langId of LANG_ORDER) {
  const filePath = join(contentDir, `${langId}.json`);
  let data;
  try {
    data = JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch {
    continue;
  }

  const langInfo = LANG_MAP[langId];
  const phaseKeys = Object.keys(data);
  const phases = phaseKeys.map((title, idx) => {
    const topics = Object.keys(data[title]);
    return { id: slugify(title), title, topics };
  });

  if (phases.length === 0) continue;

  courses.push({
    id: langId,
    title: langInfo.title,
    summary: `Learn ${langInfo.title} from the ground up — ${phases.slice(0, 3).map(p => p.title.toLowerCase()).join(', ')}, and more.`,
    lang: langId,
    icon: langInfo.icon,
    phases,
  });

  for (const phase of phases) {
    const phaseData = data[phase.title];
    const topicNames = Object.keys(phaseData);
    const { key, questions } = generateQuizQuestions(langId, phase.title, topicNames);
    allQuizzes[key] = questions;
  }
}

let output = `export const TUTORIAL_COURSES = ${JSON.stringify(courses, null, 2)};\n\n`;
output += `export const TUTORIAL_QUIZZES = ${JSON.stringify(allQuizzes, null, 2)};\n`;

writeFileSync(join(process.cwd(), 'src/lib/lib/tutorial-content.js'), output);
console.log(`Generated ${courses.length} courses, ${Object.keys(allQuizzes).length} quiz sets`);
