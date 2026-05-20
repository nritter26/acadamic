const LANG_NAMES_AI = {
  js: 'JavaScript', py: 'Python', go: 'Go', rs: 'Rust',
  c: 'C', cpp: 'C++', cs: 'C#', kt: 'Kotlin',
  swift: 'Swift', ts: 'TypeScript', zig: 'Zig'
};

const GREETINGS = [
  /^(hi|hello|hey|howdy|yo|sup|greetings|good\s*(morning|afternoon|evening))[.!]*$/i,
  /^(what'?s up|wassup|how are you|how'?s it going)[!?]*$/i,
];

const THANKS = [
  /\b(thanks?|thank\s*you|thx|ty|appreciate\s*(it|that)|that\s*helps|got\s*it)\b/i,
  /\b(make\s*sense|clear|understood|understood)\b/i,
];

const FOLLOW_UP = [
  /\b(what\s*about|how\s*(about|do\s*i)|what\s*next|next|continue|more|elaborate|expand)\b/i,
  /\b(can\s*you\s*(give|show|tell)\s*(me\s*)?(more|an?\s*example))\b/i,
  /^(and\s*then|so\s*what|tell\s*me\s*more|go\s*on)$/i,
];

const ERROR_KEYWORDS = [
  /error|bug|fix|wrong|not\s*working|issue|broken|crash|fail|exception|unexpected/i,
  /(doesn'?t|does\s*not|isn'?t|is\s*not|won'?t|will\s*not)\s*work/i,
  /\b(TypeError|ReferenceError|SyntaxError|RangeError|undefined|null|NaN)\b/,
  /(\d{2,}:\d{2}:\d{2}|line\s*\d+|at\s+\w+)/i,
  /(stack\s*trace|traceback|error\s*message)/i,
];

const TOPIC_KEYWORDS = {
  variable: /variab|let|const|var|declar|assign|muta|scope/i,
  function: /function|func|fn|method|def|return|arrow|lambda|callback/i,
  string: /string|str|template.*literal|concatenat|char|text/i,
  number: /number|int|float|numeric|arithmetic|math|parseInt|parseFloat|toFixed/i,
  boolean: /boolean|bool|true|false|truthy|falsy|logical|comparison|if.*else|condition/i,
  array: /array|list|vector|slice|splice|push|pop|map|filter|reduce|forEach|index/i,
  object: /object|dictionary|map|hash|property|key.*value|json|record|struct/i,
  class: /class|constructor|extend|inherit|prototype|oop|object.orient/i,
  promise: /promise|async|await|then|catch|future|defer/i,
  loop: /loop|for|while|do.*while|iterate|foreach/i,
  type: /type|interface|generic|enum|typedef|type.*annotation|static.*typing/i,
  null: /null|undefined|nil|none|option|maybe|optional/i,
  error_handling: /try|catch|throw|except|error.*handl|panic|result|unwrap/i,
  import: /import|export|require|module|include|using|namespace|use\s+/i,
  io: /print|log|read|input|output|file|console|stdin|stdout/i,
  comment: /comment|docstring|document|documentation|\/\/|\/\*/i,
  operator: /operator|\+|-|\*|\/|%|\+\+|--|compound|assignment/i,
  recursion: /recurs|stack|base\s*case|tail\s*call/i,
  closure: /closur|lexical.*scope|inner.*function|capture/i,
  generics: /generic|template|type.*param|trait.*bound/i,
  pointer: /pointer|ref|deref|borrow|address|\*const|\*mut/i,
  pattern_match: /match|pattern|switch|case|destructur|deconstruct/i,
  concurrency: /concurr|parallel|thread|async.*task|goroutine|channel|tokio|spawn/i,
  testing: /test|assert|spec|unit\s*test|mock|tdd/i,
  module: /module|package|crate|namespace|import|export|pub/i,
};

const SOCRATIC_PROMPTS = [
  "What have you tried so far? Let's start there.",
  "Let me ask you: what do you think should happen here?",
  "Can you explain what this code is supposed to do, in your own words?",
  "Try reading the error message carefully — it usually tells you exactly what's wrong.",
  "What would you expect to see if you added a `console.log()` right before this line?",
  "Think about what type that value is — does the operation make sense for that type?",
  "Let's break this down. What's the first thing that happens when this code runs?",
  "Have you checked the documentation for that method? What does it say it returns?",
  "Try changing one thing at a time and see what happens. Debugging is experimental!",
  "What similar problems have you solved before? Can you apply the same pattern here?",
];

function getSocratic() {
  return SOCRATIC_PROMPTS[Math.floor(Math.random() * SOCRATIC_PROMPTS.length)];
}

function getGreet() {
  const greets = [
    "Hey there! 👋 I'm Devin, your coding buddy. What are you working on?",
    "Hello! Ready to learn some code? I'm here to help!",
    "Hi! Stuck on something? Just ask — I've got your back.",
    "Hey! What programming challenge are we tackling today?",
  ];
  return greets[Math.floor(Math.random() * greets.length)];
}

function getThank() {
  const thanks = [
    "You're welcome! Keep up the great work! 🎉",
    "Happy to help! That's what I'm here for.",
    "No problem! What's next on your learning journey?",
    "Glad that helped! Don't forget to practice to make it stick.",
  ];
  return thanks[Math.floor(Math.random() * thanks.length)];
}

function detectLangFromMsg(msg) {
  const lower = msg.toLowerCase();
  if (/\b(python|py\b)/.test(lower) && !/\b(py\s+script|pypy)\b/.test(lower)) return 'py';
  if (/\b(javascript|js\b)/.test(lower) && !/\b(jsx|json)\b/.test(lower)) return 'js';
  if (/\b(typescript|ts\b)/.test(lower)) return 'ts';
  if (/\b(golang|go\s+lang)\b/.test(lower) || (/\bgo\b/.test(lower) && /\b(goroutine|gopath|gofmt|package|import|func\s+main)\b/.test(lower))) return 'go';
  if (/\brust\b/.test(lower) && !/\brusty\b|rust[- ]proof|surface\s+rust/.test(lower)) return 'rs';
  if (/\b(c\s*(\+\+|plus\s*plus)|cpp)\b/.test(lower)) return 'cpp';
  if (/\b(c\s*sharp|csharp)\b/.test(lower)) return 'cs';
  if (/\bkotlin\b/.test(lower)) return 'kt';
  if (/\bswift\b/.test(lower)) return 'swift';
  if (/\bzig\b/.test(lower)) return 'zig';
  if (/\bc\b/.test(lower) && /\b(pointer|malloc|free|printf|scanf|struct|union|sizeof)\b/.test(lower)) return 'c';
  return null;
}

function getCurrContext(message, topic) {
  const lower = message.toLowerCase();
  const isFollowUp = FOLLOW_UP.some(r => r.test(message));
  if (topic && isFollowUp) return { type: 'followup', topic };
  if (isFollowUp) return { type: 'followup', topic: null };
  if (topic) return { type: 'topic', topic };
  return { type: 'general' };
}

function matchTopic(message) {
  const lower = message.toLowerCase();
  const matches = [];
  for (const [topic, pattern] of Object.entries(TOPIC_KEYWORDS)) {
    if (pattern.test(lower)) {
      matches.push(topic);
    }
  }
  return matches;
}

function curriculumSearch(message, lang) {
  try {
    const fs = require('fs');
    const path = require('path');
    const contentDir = path.join(__dirname, '..', 'content');
    const langFile = path.join(contentDir, (lang || 'js') + '.json');
    if (fs.existsSync(langFile)) {
      const data = JSON.parse(fs.readFileSync(langFile, 'utf-8'));
      const topics = matchTopic(message);
      const results = [];
      for (const [phase, phaseData] of Object.entries(data)) {
        for (const [topicName, topicContent] of Object.entries(phaseData)) {
          const lowerTopic = topicName.toLowerCase();
          const contentStr = Array.isArray(topicContent) ? topicContent[0] : (topicContent.exp || topicContent.code || '');
          if (topics.some(t => lowerTopic.includes(t)) ||
              topics.some(t => contentStr.toLowerCase().includes(t))) {
            results.push({ phase, topic: topicName, content: contentStr.slice(0, 200) });
          }
        }
      }
      return results.slice(0, 3);
    }
  } catch (e) {
    return [];
  }
  return [];
}

function handleErrorHelp(message, code, lang, hasError) {
  const lower = message.toLowerCase();
  let response = '';
  if (hasError === undefined || hasError === null) {
    hasError = /error|bug|fix|wrong|not\s*working|issue|broken|crash|fail|exception/i.test(lower);
  }

  if (hasError || code) {
    const langName = LANG_NAMES_AI[lang] || lang || 'your code';

    if (/undefined/.test(lower) || /undefined/.test(code || '')) {
      response = `It looks like you're dealing with an **undefined** value. This usually means:\n\n1. The variable hasn't been declared yet\n2. The variable is out of scope\n3. A function didn't return what you expected\n4. A property doesn't exist on the object\n\n**Try this:** add a \`console.log()\` right before the error to check what the value actually is. Also check that the variable name is spelled exactly the same everywhere (JavaScript is case-sensitive!).`;
      return response;
    }

    if (/null/.test(lower) || /null/.test(code || '')) {
      response = `A **null** value error means something that should have a value is empty.\n\nCommon causes:\n1. A function returned \`null\` because it couldn't find what you asked for\n2. An API call hasn't loaded yet\n3. A DOM element doesn't exist yet\n\n**Fix:** Check if the value is \`null\` before using it: \`if (value !== null) { ... }\` or use optional chaining: \`value?.property\`.`;
      return response;
    }

    if (/type\s*error|cannot\s*read\s*property/i.test(lower) || /TypeError/.test(lower)) {
      response = `**TypeError** means you're trying to do something with a value that doesn't support that operation.\n\nExample: \`undefined.something\` or \`null()\`\n\n**Fix:** Check what type your value actually is using \`typeof\` or \`console.log()\`. Then make sure you're only calling methods that exist for that type.`;
      return response;
    }

    if (/syntax/i.test(lower) || /SyntaxError|Unexpected token|Unexpected identifier/i.test(lower)) {
      response = `**SyntaxError** means the ${langName} parser can't understand your code.\n\nCommon causes:\n1. Missing closing bracket \`}\`, \`]\`, or \`)\`\n2. Missing comma in an object or array\n3. Using a keyword as a variable name\n4. Forgetting quotes around a string\n\n**Fix:** Look at the line number in the error message. Check that all brackets are matched and all strings are quoted properly.`;
      return response;
    }
  }
  return null;
}

function handleTopicHelp(message, lang) {
  const topics = matchTopic(message);
  if (topics.length === 0) return null;

  const langName = LANG_NAMES_AI[lang] || lang || 'programming';
  const topic = topics[0];

  const topicResponses = {
    variable: `**Variables** are containers for storing data values. In ${langName}:\n\n• Use descriptive names like \`userCount\` instead of \`x\`\n• Choose the right declaration keyword\n• Think about scope — where can this variable be accessed?\n\nWant me to show you an example of declaring and using variables in ${langName}?`,
    function: `**Functions** are reusable blocks of code. In ${langName}:\n\n• They take inputs (parameters) and return outputs\n• Good functions do ONE thing well\n• Name them with verbs like \`calculateTotal\` or \`getUserName\`\n\nWould you like to see a ${langName} function example?`,
    string: `**Strings** represent text data. In ${langName}:\n\n• Use quotes or template literals to create them\n• Common operations: concatenation, slicing, searching, replacing\n• Strings are usually immutable — operations return new strings\n\nWant string manipulation examples for ${langName}?`,
    array: `**Arrays/Lists** hold ordered collections of items. In ${langName}:\n\n• Access items by index (usually starting at 0)\n• Common operations: add, remove, find, filter, transform\n• Arrays can hold mixed types in some languages\n\nWant to see array operations in ${langName}?`,
    object: `**Objects/Dictionaries** hold key-value pairs. In ${langName}:\n\n• Keys are usually strings, values can be any type\n• Access properties with dot notation \`obj.prop\` or bracket notation \`obj["prop"]\`\n• Useful for grouping related data\n\nShow me an object example in ${langName}?`,
    class: `**Classes** are blueprints for creating objects. In ${langName}:\n\n• Define properties and methods\n• Support inheritance (extending from parent classes)\n• Help organize code following OOP principles\n\nWant to see a class example in ${langName}?`,
    loop: `**Loops** let you repeat code. In ${langName}:\n\n• \`for\` loops: when you know how many times\n• \`while\` loops: when you have a condition to check\n• Be careful of infinite loops! Always make sure the condition will eventually be false\n\nNeed a loop example for ${langName}?`,
    promise: `**Promises/Async** handle asynchronous operations. In ${langName}:\n\n• A promise represents a future value\n• Use \`async/await\` for cleaner code than raw callbacks\n• Always handle errors with \`try/catch\` or \`.catch()\`\n\nWant to see async patterns in ${langName}?`,
    type: `**Types** define what kind of data a value can hold. In ${langName}:\n\n• Static types catch errors at compile time\n• Types include: numbers, strings, booleans, and complex types\n• Good type systems balance safety with flexibility\n\nInterested in type examples for ${langName}?`,
    error_handling: `**Error Handling** helps your code fail gracefully:\n\n• Use try/catch (or similar) to handle expected errors\n• Always clean up resources in error cases\n• Think about what CAN go wrong, not just the happy path\n\nWant error handling examples for ${langName}?`,
  };

  return topicResponses[topic] || null;
}

function runKeywordTutor(message, lang, topic, code, hasError) {
  const lower = message.trim().toLowerCase();

  if (GREETINGS.some(r => r.test(message))) {
    return { response: getGreet(), source: 'keyword' };
  }

  if (THANKS.some(r => r.test(message))) {
    return { response: getThank(), source: 'keyword' };
  }

  if (/w(hat|ho|hy|hen|here|hich|hom)|how|can you|could you|please|tell/i.test(lower) &&
      /\b(i('m| am|'d| would)|you|your)\b/i.test(lower) &&
      /(devin|buddy|tutor|bot|assistant)/i.test(lower)) {
    return { response: "I'm Devin! I'm here to help you learn programming. Ask me about specific topics, paste your code if something's broken, or tell me what you're trying to build. What do you need help with? 😊", source: 'keyword' };
  }

  if (code && code.length > 3) {
    if (hasError || /error|bug|fix|wrong|issue|broken/i.test(lower)) {
      return { response: "I see you've shared some code. Let me look at it and help you figure out what's going on. Can you tell me what you expect it to do and what's actually happening?", source: 'keyword' };
    }
    return { response: "Thanks for sharing your code! What would you like to know about it? I can help explain how it works, find bugs, or suggest improvements.", source: 'keyword' };
  }

  const errorHelp = handleErrorHelp(message, code, lang);
  if (errorHelp) {
    return { response: errorHelp, source: 'keyword' };
  }

  const topicHelp = handleTopicHelp(message, lang);
  if (topicHelp) {
    return { response: topicHelp, source: 'keyword' };
  }

  if (/lang|program|learn/i.test(lower) &&
      /(recommend|suggest|which|best|what|start|beginner)/i.test(lower)) {
    return { response: "Great question! If you're new to programming:\n\n• **JavaScript**: Great all-rounder, runs in browsers and servers\n• **Python**: Beginner-friendly, popular for data science and automation\n• **Go**: Fast, simple, great for backend services\n\nWhat kind of projects interest you? I can help you pick the best language for your goals!", source: 'keyword' };
  }

  const followUp = FOLLOW_UP.some(r => r.test(message));
  if (followUp) {
    return { response: "Sure! What specific part would you like me to elaborate on? If you mention a topic, I can dive deeper into it.", source: 'keyword' };
  }

  if (/practice|exercis|challenge|problem|project/i.test(lower) &&
      /(give|want|need|have|some|a\s)/i.test(lower)) {
    const langName = LANG_NAMES_AI[lang] || 'programming';
    return { response: `Here's a quick ${langName} practice idea: try writing a program that converts temperatures between Celsius and Fahrenheit. Start with a function that takes a temperature and the conversion direction. Want more specific practice problems?`, source: 'keyword' };
  }

  if (lower.length < 3) {
    return { response: getSocratic(), source: 'keyword' };
  }

  return null;
}

module.exports = {
  runKeywordTutor,
  detectLangFromMsg,
  getCurrContext,
  getThank,
  getGreet,
  getSocratic,
};
