"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateExercise = generateExercise;
const provider_1 = require("./provider");
const embeddings_1 = require("./embeddings");
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
    const searchResults = await (0, embeddings_1.search)(topic, lang, 1);
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
        const reply = await (0, provider_1.askLLM)([{ role: 'user', content: prompt }]);
        if (!reply)
            return generateStaticExercise(topic, lang, level);
        try {
            const jsonMatch = reply.match(/\{[\s\S]*\}/);
            if (jsonMatch)
                return JSON.parse(jsonMatch[0]);
        }
        catch { }
        return {
            title: `Practice: ${topic}`,
            description: reply.slice(0, 500),
            starterCode: '// Write your code here',
            solution: '',
            hint: 'Review the curriculum topic and try step by step.',
            test: 'true',
        };
    }
    catch {
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
        classes: {
            beginner: {
                title: 'Create a Simple Class',
                description: 'Create a class called `Car` with a `brand` property and a `honk()` method that prints "Beep beep!".',
                starterCode: 'class Car {\n  constructor(brand) {\n    this.brand = brand;\n  }\n  honk() {\n    // Your code here\n  }\n}\nconst myCar = new Car("Tesla");\nmyCar.honk();',
                solution: 'class Car {\n  constructor(brand) {\n    this.brand = brand;\n  }\n  honk() {\n    console.log("Beep beep!");\n  }\n}\nconst myCar = new Car("Tesla");\nmyCar.honk();',
                hint: 'Methods are functions defined inside the class body without the `function` keyword.',
                test: 'typeof Car === "function"',
            },
            intermediate: {
                title: 'Class Inheritance',
                description: 'Create a `SportsCar` class that extends `Car` and overrides `honk()` to print "Vroom vroom!".',
                starterCode: 'class Car {\n  constructor(brand) { this.brand = brand; }\n  honk() { console.log("Beep beep!"); }\n}\n// Your SportsCar class here\nconst myCar = new SportsCar("Ferrari");\nmyCar.honk();',
                solution: 'class Car {\n  constructor(brand) { this.brand = brand; }\n  honk() { console.log("Beep beep!"); }\n}\nclass SportsCar extends Car {\n  honk() { console.log("Vroom vroom!"); }\n}\nconst myCar = new SportsCar("Ferrari");\nmyCar.honk();',
                hint: 'Use the `extends` keyword for inheritance and redefine the method in the child class.',
                test: 'SportsCar.prototype.__proto__ === Car.prototype',
            },
        },
        promises: {
            beginner: {
                title: 'Create and Resolve a Promise',
                description: 'Create a promise that resolves with the value "Done!" after a 100ms delay using `setTimeout`.',
                starterCode: 'function waitAndResolve() {\n  return new Promise((resolve) => {\n    // Your code here\n  });\n}\nwaitAndResolve().then(console.log);',
                solution: 'function waitAndResolve() {\n  return new Promise((resolve) => {\n    setTimeout(() => resolve("Done!"), 100);\n  });\n}\nwaitAndResolve().then(console.log);',
                hint: 'The `resolve` parameter is a function — call it with the value you want the promise to fulfill with.',
                test: 'true',
            },
            intermediate: {
                title: 'Async/Await with Error Handling',
                description: 'Write an async function `divide` that takes two numbers and throws an error if the second is zero, otherwise returns the quotient.',
                starterCode: 'async function divide(a, b) {\n  // Your code here\n}\ndivide(10, 2).then(console.log).catch(console.error);\ndivide(10, 0).then(console.log).catch(console.error);',
                solution: 'async function divide(a, b) {\n  if (b === 0) throw new Error("Cannot divide by zero");\n  return a / b;\n}\ndivide(10, 2).then(console.log).catch(console.error);\ndivide(10, 0).then(console.log).catch(console.error);',
                hint: 'Use `throw new Error(...)` to reject the promise, and try/catch inside the async function if you need to handle errors locally.',
                test: 'true',
            },
        },
        error_handling: {
            beginner: {
                title: 'Try/Catch a TypeError',
                description: 'Wrap the risky code in a try/catch block to handle the error gracefully.',
                starterCode: 'const obj = null;\ntry {\n  // Your code here — access obj.name safely\n} catch (e) {\n  console.log("Caught an error:", e.message);\n}',
                solution: 'const obj = null;\ntry {\n  console.log(obj.name);\n} catch (e) {\n  console.log("Caught an error:", e.message);\n}',
                hint: 'Accessing a property on `null` throws a TypeError — the catch block handles it.',
                test: 'true',
            },
            intermediate: {
                title: 'Custom Error Class',
                description: 'Create a custom `ValidationError` class and a function `validateAge(n)` that throws it if age is less than 0 or more than 150.',
                starterCode: 'class ValidationError extends Error {\n  constructor(message) {\n    super(message);\n    this.name = "ValidationError";\n  }\n}\n\nfunction validateAge(age) {\n  // Your code here\n}\n\ntry {\n  validateAge(-5);\n} catch (e) {\n  console.log(e.name + ": " + e.message);\n}',
                solution: 'class ValidationError extends Error {\n  constructor(message) {\n    super(message);\n    this.name = "ValidationError";\n  }\n}\n\nfunction validateAge(age) {\n  if (age < 0 || age > 150) {\n    throw new ValidationError("Age must be between 0 and 150");\n  }\n  return age;\n}\n\ntry {\n  validateAge(-5);\n} catch (e) {\n  console.log(e.name + ": " + e.message);\n}',
                hint: 'A custom error class extends `Error`. Use `throw new YourError(...)` to raise it.',
                test: 'true',
            },
        },
        types: {
            beginner: {
                title: 'Type Conversion',
                description: 'Convert a string to a number, a number to a string, and check types with `typeof`.',
                starterCode: 'const strNum = "42";\nconst num = // convert strNum to number\nconst backToString = // convert num back to string\n\nconsole.log(typeof num);      // should print "number"\nconsole.log(typeof backToString); // should print "string"',
                solution: 'const strNum = "42";\nconst num = Number(strNum);\nconst backToString = String(num);\n\nconsole.log(typeof num);\nconsole.log(typeof backToString);',
                hint: 'Use `Number()` for string-to-number and `String()` for number-to-string conversion.',
                test: 'typeof num === "number" && typeof backToString === "string" && num === 42',
            },
            intermediate: {
                title: 'Type Guard Function',
                description: 'Write a function `processInput(input)` that returns the length if it\'s a string, the doubled value if it\'s a number, and "Unknown" otherwise.',
                starterCode: 'function processInput(input) {\n  // Your code here\n}\nconsole.log(processInput("hello")); // should print 5\nconsole.log(processInput(21));      // should print 42\nconsole.log(processInput(true));    // should print "Unknown"',
                solution: 'function processInput(input) {\n  if (typeof input === "string") return input.length;\n  if (typeof input === "number") return input * 2;\n  return "Unknown";\n}\nconsole.log(processInput("hello"));\nconsole.log(processInput(21));\nconsole.log(processInput(true));',
                hint: 'Use `typeof` to check the type at runtime before deciding what to do.',
                test: 'processInput("hello") === 5 && processInput(21) === 42 && processInput(true) === "Unknown"',
            },
        },
        recursion: {
            beginner: {
                title: 'Recursive Countdown',
                description: 'Write a recursive function `countdown(n)` that prints numbers from n down to 1.',
                starterCode: 'function countdown(n) {\n  // Base case: if n <= 0, return\n  // Recursive case: print n, then call countdown(n - 1)\n}\ncountdown(5); // should print 5, 4, 3, 2, 1',
                solution: 'function countdown(n) {\n  if (n <= 0) return;\n  console.log(n);\n  countdown(n - 1);\n}\ncountdown(5);',
                hint: 'The base case stops the recursion. The recursive case calls itself with a smaller value.',
                test: 'true',
            },
            intermediate: {
                title: 'Fibonacci with Recursion',
                description: 'Write a recursive function `fib(n)` that returns the nth Fibonacci number (F(0)=0, F(1)=1).',
                starterCode: 'function fib(n) {\n  // Your code here\n}\nconsole.log(fib(0)); // should print 0\nconsole.log(fib(1)); // should print 1\nconsole.log(fib(6)); // should print 8',
                solution: 'function fib(n) {\n  if (n <= 0) return 0;\n  if (n === 1) return 1;\n  return fib(n - 1) + fib(n - 2);\n}\nconsole.log(fib(0));\nconsole.log(fib(1));\nconsole.log(fib(6));',
                hint: 'Fibonacci is the classic recursion example: fib(n) = fib(n-1) + fib(n-2) with base cases n=0 and n=1.',
                test: 'fib(0) === 0 && fib(1) === 1 && fib(6) === 8',
            },
        },
        closures: {
            beginner: {
                title: 'Simple Counter Closure',
                description: 'Write a function `createCounter()` that returns a function. Each call to the returned function increments and returns a count starting from 0.',
                starterCode: 'function createCounter() {\n  let count = 0;\n  return function() {\n    // Your code here\n  };\n}\nconst counter = createCounter();\nconsole.log(counter()); // should print 1\nconsole.log(counter()); // should print 2\nconsole.log(counter()); // should print 3',
                solution: 'function createCounter() {\n  let count = 0;\n  return function() {\n    count++;\n    return count;\n  };\n}\nconst counter = createCounter();\nconsole.log(counter());\nconsole.log(counter());\nconsole.log(counter());',
                hint: 'The inner function "closes over" the `count` variable — it remembers it between calls.',
                test: 'counter() === 1 && counter() === 2 && counter() === 3',
            },
            intermediate: {
                title: 'Function Factory',
                description: 'Write a function `makeMultiplier(x)` that returns a function which multiplies its input by `x`.',
                starterCode: 'function makeMultiplier(x) {\n  // Your code here\n}\nconst double = makeMultiplier(2);\nconst triple = makeMultiplier(3);\nconsole.log(double(5));  // should print 10\nconsole.log(triple(5));  // should print 15',
                solution: 'function makeMultiplier(x) {\n  return function(n) {\n    return n * x;\n  };\n}\nconst double = makeMultiplier(2);\nconst triple = makeMultiplier(3);\nconsole.log(double(5));\nconsole.log(triple(5));',
                hint: 'The returned function "remembers" the `x` value from the outer function\'s scope.',
                test: 'double(5) === 10 && triple(5) === 15',
            },
        },
        io: {
            beginner: {
                title: 'Console Output Formats',
                description: 'Use different console methods to output: a simple log, a warning, an error, and a table.',
                starterCode: '// Print a regular message\nconsole.log("Hello, world!");\n// Print a warning\nconsole.warn("This is a warning");\n// Print an error\nconsole.error("This is an error");\n// Print a table\nconsole.table([{ name: "Alice", age: 25 }, { name: "Bob", age: 30 }]);',
                solution: 'console.log("Hello, world!");\nconsole.warn("This is a warning");\nconsole.error("This is an error");\nconsole.table([{ name: "Alice", age: 25 }, { name: "Bob", age: 30 }]);',
                hint: 'Different console methods produce different formatting in the terminal/browser console.',
                test: 'true',
            },
        },
        modules: {
            beginner: {
                title: 'Export and Import a Function',
                description: 'Create an exported `add` function and import it. Split code into two conceptual modules.',
                starterCode: '// math.js (conceptual module)\nexport function add(a, b) {\n  // Your code here\n}\n\n// main.js (conceptual module)\nimport { add } from "./math.js";\nconsole.log(add(3, 4)); // should print 7',
                solution: '// math.js\nexport function add(a, b) {\n  return a + b;\n}\n\n// main.js\nimport { add } from "./math.js";\nconsole.log(add(3, 4));',
                hint: 'Use the `export` keyword before `function` to make it available for import elsewhere.',
                test: 'true',
            },
        },
        concurrency: {
            beginner: {
                title: 'Sequential vs Parallel Timers',
                description: 'Use setTimeout to simulate two async tasks. Start both, then use a promise to wait for both to complete.',
                starterCode: 'function task(name, delay) {\n  return new Promise(resolve => {\n    setTimeout(() => {\n      console.log(name + " done");\n      resolve(name);\n    }, delay);\n  });\n}\n\n// Start both tasks, then log "All done" when both complete\nconst task1 = task("Task 1", 200);\nconst task2 = task("Task 2", 100);\n// Your code here to wait for both',
                solution: 'function task(name, delay) {\n  return new Promise(resolve => {\n    setTimeout(() => {\n      console.log(name + " done");\n      resolve(name);\n    }, delay);\n  });\n}\n\nconst task1 = task("Task 1", 200);\nconst task2 = task("Task 2", 100);\nPromise.all([task1, task2]).then(() => console.log("All done"));',
                hint: 'Use `Promise.all([...])` to wait for multiple promises to resolve.',
                test: 'true',
            },
        },
        testing: {
            beginner: {
                title: 'Write and Run a Simple Test',
                description: 'Write a function `add(a, b)` and test it using simple assertion checks.',
                starterCode: 'function add(a, b) {\n  // Your code here\n}\n\n// Write your tests here\nconsole.assert(add(2, 3) === 5, "2 + 3 should be 5");\nconsole.assert(add(-1, 1) === 0, "-1 + 1 should be 0");\nconsole.assert(add(0, 0) === 0, "0 + 0 should be 0");\nconsole.log("All tests passed!");',
                solution: 'function add(a, b) {\n  return a + b;\n}\n\nconsole.assert(add(2, 3) === 5, "2 + 3 should be 5");\nconsole.assert(add(-1, 1) === 0, "-1 + 1 should be 0");\nconsole.assert(add(0, 0) === 0, "0 + 0 should be 0");\nconsole.log("All tests passed!");',
                hint: '`console.assert(condition, message)` does nothing if the condition is true, and logs the message if false.',
                test: 'true',
            },
            intermediate: {
                title: 'Test-Driven Development Cycle',
                description: 'Write a function `isEven(n)` that returns true if a number is even. First write the tests, then implement the function.',
                starterCode: '// Step 1: Write the tests first\nfunction isEven(n) {\n  // TODO: implement\n}\n\n// Step 2: Run tests — they should fail\nconsole.assert(isEven(2) === true, "2 should be even");\nconsole.assert(isEven(3) === false, "3 should not be even");\nconsole.assert(isEven(0) === true, "0 should be even");\nconsole.assert(isEven(-2) === true, "-2 should be even");\nconsole.log("All tests passed!");',
                solution: 'function isEven(n) {\n  return n % 2 === 0;\n}\n\nconsole.assert(isEven(2) === true, "2 should be even");\nconsole.assert(isEven(3) === false, "3 should not be even");\nconsole.assert(isEven(0) === true, "0 should be even");\nconsole.assert(isEven(-2) === true, "-2 should be even");\nconsole.log("All tests passed!");',
                hint: 'Use the modulo operator `%` — if `n % 2 === 0`, the number is even.',
                test: 'true',
            },
        },
    };
    const key = Object.keys(exercises).find(k => topic.toLowerCase().includes(k));
    if (key) {
        const topicExercises = exercises[key];
        if (topicExercises[level])
            return topicExercises[level];
        return topicExercises.beginner;
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
//# sourceMappingURL=exercises.js.map