const { askLLM } = require('./provider');
const { search } = require('./embeddings');

const EXERCISE_TEMPLATES = {
  beginner: [
    { type: 'fix-bug', desc: 'Fix the bug in this code' },
    { type: 'fill-blank', desc: 'Fill in the missing code' },
    { type: 'write-function', desc: 'Write a function that...' },
    { type: 'predict-output', desc: 'What does this code output?' },
  ],
  intermediate: [
    { type: 'refactor', desc: 'Refactor this code to be more idiomatic' },
    { type: 'implement', desc: 'Implement the following...' },
    { type: 'optimize', desc: 'Optimize this code' },
    { type: 'debug', desc: 'Find and fix the bugs in this code' },
  ],
  expert: [
    { type: 'design', desc: 'Design and implement a solution for...' },
    { type: 'analyze', desc: 'Analyze the time/space complexity' },
    { type: 'extend', desc: 'Add a feature to this existing code' },
  ],
};

async function generateExercise(topic, lang, level = 'beginner') {
  const searchResults = await search(topic, lang, 1);
  const context = searchResults.length > 0
    ? `The curriculum covers "${searchResults[0].topic}" with: ${searchResults[0].exp.slice(0, 300)}`
    : '';

  const templates = EXERCISE_TEMPLATES[level] || EXERCISE_TEMPLATES.beginner;
  const template = templates[Math.floor(Math.random() * templates.length)];

  const prompt = `You are a programming exercise generator. Create a ${level} level exercise about "${topic}" in ${lang || 'programming'}.

${context}

Generate a ${template.type} exercise. Format your response as JSON:
{
  "title": "short exercise title",
  "description": "clear instructions for the student",
  "starterCode": "code template with a placeholder like // TODO or ___",
  "solution": "complete working solution",
  "hint": "a helpful hint without giving away the answer",
  "test": "a test expression or assertion to verify correctness"
}

Make the exercise educational and focused on one concept at a time.`;

  try {
    const reply = await askLLM([{ role: 'user', content: prompt }]);
    if (!reply) return generateStaticExercise(topic, lang, level);
    try {
      const jsonMatch = reply.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch {}
    return {
      title: `Practice: ${topic}`,
      description: reply.slice(0, 500),
      starterCode: '// Write your code here',
      solution: '',
      hint: 'Review the curriculum topic and try step by step.',
    };
  } catch {
    return generateStaticExercise(topic, lang, level);
  }
}

function generateStaticExercise(topic, lang, level) {
  const exercises = {
    variables: {
      beginner: {
        title: 'Declare and Print a Variable',
        description: 'Declare a variable called `name` with your name as a string, then print it.',
        starterCode: '// Declare your variable here\nlet name = "Your Name";\nconsole.log(name);',
        solution: 'let name = "Alice";\nconsole.log(name);',
        hint: 'Use `let variableName = value;` syntax.',
        test: 'typeof name === "string"',
      },
      intermediate: {
        title: 'Variable Swap',
        description: 'Swap the values of two variables without using a temporary variable.',
        starterCode: 'let a = 5;\nlet b = 10;\n// Swap a and b here\nconsole.log(a, b); // should print 10 5',
        solution: 'let a = 5;\nlet b = 10;\n[a, b] = [b, a];\nconsole.log(a, b);',
        hint: 'JavaScript supports destructuring assignment.',
        test: 'a === 10 && b === 5',
      },
    },
    functions: {
      beginner: {
        title: 'Write an Add Function',
        description: 'Write a function called `add` that takes two numbers and returns their sum.',
        starterCode: 'function add(a, b) {\n  // Your code here\n}\nconsole.log(add(2, 3)); // should print 5',
        solution: 'function add(a, b) {\n  return a + b;\n}\nconsole.log(add(2, 3));',
        hint: 'Use the `return` keyword to send back a value.',
        test: 'add(2,3) === 5',
      },
    },
    loops: {
      beginner: {
        title: 'Count to 10',
        description: 'Write a for loop that prints numbers 1 through 10.',
        starterCode: '// Write your loop here\nfor (let i = 1; i <= 10; i++) {\n  console.log(i);\n}',
        solution: 'for (let i = 1; i <= 10; i++) {\n  console.log(i);\n}',
        hint: 'A for loop has: initializer, condition, increment.',
        test: 'true',
      },
    },
  };

  const key = Object.keys(exercises).find(k => topic.toLowerCase().includes(k));
  if (key && exercises[key][level]) return exercises[key][level];
  if (key) return exercises[key].beginner;

  return {
    title: `Practice: ${topic}`,
    description: `Write code related to "${topic}" in ${lang || 'JavaScript'}. Try implementing the concept you just learned.`,
    starterCode: `// Practice: ${topic}\n// Write your code here\n`,
    solution: '',
    hint: `Review the ${topic} section in the curriculum.`,
    test: 'true',
  };
}

module.exports = { generateExercise };
