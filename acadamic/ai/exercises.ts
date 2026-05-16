import { askLLM } from './provider';
import { search } from './embeddings';

interface ExerciseTemplate {
  type: string;
  desc: string;
}

interface Exercise {
  title: string;
  description: string;
  starterCode: string;
  solution: string;
  hint: string;
  test: string;
}

type Level = 'beginner' | 'intermediate' | 'expert';

const EXERCISE_TEMPLATES: Record<Level, ExerciseTemplate[]> = {
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

export async function generateExercise(topic: string, lang: string, level: Level = 'beginner'): Promise<Exercise> {
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
      if (jsonMatch) return JSON.parse(jsonMatch[0]) as Exercise;
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

interface StaticExercises {
  [topic: string]: Partial<Record<Level, Exercise>>;
}

function generateStaticExercise(topic: string, lang: string, level: Level): Exercise {
  const exercises: StaticExercises = {
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
    arrays: {
      beginner: {
        title: 'Sum an Array',
        description: 'Write a function that takes an array of numbers and returns their sum.',
        starterCode: 'function sumArray(arr) {\n  // Your code here\n}\nconsole.log(sumArray([1, 2, 3, 4])); // should print 10',
        solution: 'function sumArray(arr) {\n  return arr.reduce((a, b) => a + b, 0);\n}\nconsole.log(sumArray([1, 2, 3, 4]));',
        hint: 'Use `reduce` or a loop to accumulate values.',
        test: 'sumArray([1,2,3,4]) === 10',
      },
      intermediate: {
        title: 'Remove Duplicates',
        description: 'Write a function to remove duplicate values from an array.',
        starterCode: 'function removeDuplicates(arr) {\n  // Your code here\n}\nconsole.log(removeDuplicates([1, 2, 2, 3, 3, 4])); // should print [1, 2, 3, 4]',
        solution: 'function removeDuplicates(arr) {\n  return [...new Set(arr)];\n}\nconsole.log(removeDuplicates([1, 2, 2, 3, 3, 4]));',
        hint: 'A `Set` automatically keeps unique values.',
        test: 'JSON.stringify(removeDuplicates([1,2,2,3,3,4])) === JSON.stringify([1,2,3,4])',
      },
    },
    strings: {
      beginner: {
        title: 'Reverse a String',
        description: 'Write a function to reverse a string.',
        starterCode: 'function reverseString(str) {\n  // Your code here\n}\nconsole.log(reverseString("hello")); // should print "olleh"',
        solution: 'function reverseString(str) {\n  return str.split("").reverse().join("");\n}\nconsole.log(reverseString("hello"));',
        hint: 'Use `.split("")`, `.reverse()`, and `.join("")`.',
        test: 'reverseString("hello") === "olleh"',
      },
      intermediate: {
        title: 'Check Palindrome',
        description: 'Write a function to check if a string is a palindrome (reads the same forward and backward).',
        starterCode: 'function isPalindrome(str) {\n  // Your code here\n}\nconsole.log(isPalindrome("racecar")); // should print true\nconsole.log(isPalindrome("hello")); // should print false',
        solution: 'function isPalindrome(str) {\n  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, "");\n  return cleaned === cleaned.split("").reverse().join("");\n}\nconsole.log(isPalindrome("racecar"));\nconsole.log(isPalindrome("hello"));',
        hint: 'Clean the string first (lowercase, remove non-alphanumeric), then compare to its reverse.',
        test: 'isPalindrome("racecar") === true',
      },
    },
    conditionals: {
      beginner: {
        title: 'Even or Odd',
        description: 'Write a function that tells whether a number is even or odd.',
        starterCode: 'function evenOrOdd(n) {\n  // Your code here\n}\nconsole.log(evenOrOdd(4)); // should print "even"\nconsole.log(evenOrOdd(7)); // should print "odd"',
        solution: 'function evenOrOdd(n) {\n  return n % 2 === 0 ? "even" : "odd";\n}\nconsole.log(evenOrOdd(4));\nconsole.log(evenOrOdd(7));',
        hint: 'Use the modulo operator `%` to check divisibility by 2.',
        test: 'evenOrOdd(4) === "even" && evenOrOdd(7) === "odd"',
      },
    },
    objects: {
      beginner: {
        title: 'Create a User Object',
        description: 'Create an object representing a user with `name`, `age`, and `email` properties, then print a greeting.',
        starterCode: '// Create your object here\nconst user = {\n  // Your code here\n};\nconsole.log(user.name); // should print the name',
        solution: 'const user = {\n  name: "Alice",\n  age: 25,\n  email: "alice@example.com"\n};\nconsole.log(user.name);',
        hint: 'Object properties are key-value pairs separated by commas.',
        test: 'typeof user === "object" && user.name !== undefined',
      },
    },
  };

  const key = Object.keys(exercises).find(k => topic.toLowerCase().includes(k));
  if (key) {
    const topicExercises = exercises[key];
    if (topicExercises[level]) return topicExercises[level]!;
    return topicExercises.beginner!;
  }

  return {
    title: `Practice: ${topic}`,
    description: `Write code related to "${topic}" in ${lang || 'JavaScript'}. Try implementing the concept you just learned.`,
    starterCode: `// Practice: ${topic}\n// Write your code here\n`,
    solution: '',
    hint: `Review the ${topic} section in the curriculum.`,
    test: 'true',
  };
}
