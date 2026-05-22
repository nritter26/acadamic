async function generateResponse(messages) {
  const lastMsg = messages[messages.length - 1]?.content || '';

  const isQuestionLike = /\b(what|how|why|when|where|which|can|could|would|should|explain|tell|describe|show|help|difference|example|mean|define)\b/i.test(lastMsg);
  const isLongEnough = lastMsg.split(/\s+/).length > 3;

  if (!isQuestionLike && !isLongEnough) {
    return {
      response: "I understand you're asking something, but could you be more specific? Tell me what programming topic you'd like help with, or paste a code snippet you're working on.",
      source: 'template-matcher'
    };
  }

  const detectedTopics = [];
  const topicPatterns = [
    { word: /variable/i, topic: 'variables' },
    { word: /function|method/i, topic: 'functions' },
    { word: /class|object/i, topic: 'classes and objects' },
    { word: /array|list/i, topic: 'arrays and lists' },
    { word: /string|text/i, topic: 'strings' },
    { word: /loop|iterate/i, topic: 'loops and iteration' },
    { word: /promise|async|await/i, topic: 'asynchronous programming' },
    { word: /error|exception/i, topic: 'error handling' },
    { word: /type/i, topic: 'types and type systems' },
    { word: /pointer|ref/i, topic: 'pointers and references' },
    { word: /pattern.*match|switch/i, topic: 'pattern matching' },
    { word: /generic|template/i, topic: 'generics and templates' },
    { word: /concurr|thread|parallel/i, topic: 'concurrency' },
    { word: /test|assert/i, topic: 'testing' },
    { word: /import|module/i, topic: 'modules and imports' },
    { word: /syntax/i, topic: 'syntax' },
  ];

  for (const p of topicPatterns) {
    if (p.word.test(lastMsg)) detectedTopics.push(p.topic);
  }

  let response;
  if (detectedTopics.length > 0) {
    response = `That's a great question about **${detectedTopics[0]}**! Here's what I can tell you:\n\nWhen working with ${detectedTopics[0]} in programming, the key ideas are:\n\n1. **Understand the basics** — make sure you know what problem this concept solves\n2. **Practice with small examples** — start simple and add complexity gradually\n3. **Read the documentation** — every language has its own conventions for ${detectedTopics[0]}\n\nCould you be more specific about which part of ${detectedTopics[0]} you're trying to understand? If you share your code, I can give you more targeted help!`;
  } else {
    response = `That's an interesting question! Based on what you're asking, here are some general tips:\n\n1. **Check your understanding** — What do you expect this code to do?\n2. **Simplify** — Try a minimal example that isolates just the part you're curious about\n3. **Experiment** — Change one thing at a time and observe the result\n\nIf you can share more context or specific code, I'll be able to give you a more helpful answer!`;
  }

  return { response, source: 'template-matcher' };
}

async function getTinyLLMResponse(messages, onStream) {
  try {
    const result = await generateResponse(messages);

    if (onStream) {
      const words = result.response.split(/(\s+)/);
      for (const word of words) {
        onStream(word);
        await new Promise(r => setTimeout(r, 10));
      }
    }

    return result.response;
  } catch (e) {
    console.error('[template-matcher] Error:', e.message);
    return null;
  }
}

module.exports = {
  getTinyLLMResponse,
};
