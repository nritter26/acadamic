import vm from 'vm'

function getCompileHint(lang) {
  const hints = {
    c: '// gcc -Wall -o program program.c && ./program',
    cpp: '// g++ -std=c++20 -Wall -o program program.cpp && ./program',
    cs: '// dotnet run or csc program.cs && mono program.exe',
    go: '// go run program.go',
    rust: '// rustc program.rs && ./program',
    rs: '// rustc program.rs && ./program',
    zig: '// zig build-exe program.zig && ./program',
    swift: '// swift program.swift',
    kt: '// kotlinc program.kt -include-runtime -d program.jar && java -jar program.jar',
    ts: '// tsc program.ts && node program.js',
    dk: '// docker build -t myapp . && docker run myapp',
    git: '// git commands run in your terminal directly',
    pg: '// psql -f query.sql or run directly in psql shell',
    mongodb: '// mongosh < script.js or paste into mongosh',
    gamedev: '// Use your game engine IDE to run this code',
    quiz: '// Quiz questions are interactive in the UI',
    challenge: '// Challenges run in the JavaScript sandbox above',
  }
  return hints[lang] || `// Check your ${lang.toUpperCase()} documentation for execution instructions.`
}

export default async (req) => {
  const { lang, code } = await req.json()
  if (!code) return Response.json({ error: 'No code provided' }, { status: 400 })

  if (lang === 'js') {
    try {
      new vm.Script(code)
    } catch (e) {
      return Response.json({ output: `// Syntax Error: ${e.message}`, error: true })
    }
    try {
      let output = ''
      const sandbox = {
        console: {
          log: (...args) => {
            output += args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ') + '\n'
          },
          error: (...args) => {
            output += 'ERROR: ' + args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ') + '\n'
          },
          warn: (...args) => {
            output += 'WARN: ' + args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ') + '\n'
          },
        },
      }
      vm.runInNewContext(code, sandbox, { timeout: 5000 })
      return Response.json({ output: output || '(no output)' })
    } catch (e) {
      return Response.json({ output: `// Runtime Error: ${e.message}`, error: true })
    }
  }

  return Response.json({
    output: `// ${lang.toUpperCase()} execution not available on this server\n` + getCompileHint(lang),
  })
}

export const config = {
  path: '/api/execute',
}
