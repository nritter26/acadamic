package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"math/rand"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"time"
)

type Progress map[string]map[string]bool

type ProgressStore struct {
	mu sync.Mutex
	db Progress
}

type ExecuteReq struct {
	Lang string `json:"lang"`
	Code string `json:"code"`
}

type ExecRsp struct {
	Output string `json:"output"`
}

type ChatReq struct {
	Message string `json:"message"`
	Lang    string `json:"lang"`
}

type ChatRsp struct {
	Reply string `json:"reply"`
}

var aiRules = []struct {
	keywords []string
	reply    string
}{
	{[]string{"variable", "declare", "let", "const", "var"}, "Variables store data in memory so you can reuse and manipulate values.\n\n**Syntax by language:**\n- **JS:** `let name = value;` (mutable), `const name = value;` (immutable)\n- **Python:** `name = value` (no keyword needed)\n- **Go:** `var name type = value` or `name := value` (type inference)\n\n**Try this:**\n1. Declare a variable with your name\n2. Declare another with your age\n3. Print both\n\n**Avoid:**\n- Using `var` in JS (function-scoped, causes bugs)\n- Forgetting keywords creates globals in JS\n- Using `const` for values that need to change"},
	{[]string{"function", "method", "def", "func"}, "Functions are reusable blocks of code that perform a specific task.\n\n**Syntax by language:**\n- **JS:** `function name(params) { ... }` or arrow functions\n- **Python:** `def name(params):`\n- **Go:** `func name(params) returnType { ... }`\n- **Rust:** `fn name(params) -> returnType { ... }`\n\n**Design principle:** Each function should do ONE thing well.\n\n**Common pitfalls:**\n- Missing `return` — function returns undefined/None\n- Calling without parentheses: `myFunc` vs `myFunc()`"},
	{[]string{"class", "object", "oop", "inherit", "extends"}, "Object-Oriented Programming organizes code around objects.\n\n**Key concepts:**\n- **Encapsulation:** bundle data + methods, hide internals\n- **Inheritance:** a class can extend another\n- **Polymorphism:** same interface, different behavior\n- **Composition:** building from other objects (prefer over inheritance)\n\n**Exercise:** Create a Person class with name/age and a greet() method."},
	{[]string{"array", "list", "collection", "map", "set", "slice"}, "Collections let you store and manipulate groups of values.\n\n**Common types:**\n- **Array/Slice:** ordered sequence\n- **Map:** key-value pairs\n- **Set:** unique values\n\n**Exercise:**\n1. Create an array of 5 numbers\n2. Loop to double each\n3. Store in a new array\n\n**Watch for:** off-by-one errors, 0-indexed in all languages"},
	{[]string{"loop", "for", "while", "iterate", "range"}, "Loops let you repeat code.\n\n**Types:**\n- **`for`:** known iteration count\n- **`while`:** condition-based\n- **`range`/`foreach`:** iterate over collections\n\n**Control:** `break` exits early, `continue` skips to next.\n\n**Most common bugs:**\n- Forgetting to increment = infinite loop\n- Off-by-one: `<=` vs `<`\n- Modifying collection while iterating"},
	{[]string{"error", "exception", "try", "catch", "panic"}, "Error handling is how programs deal with unexpected situations.\n\n**By language:**\n- **JS/Python/C#:** `try/catch`\n- **Go:** errors as return values — check `err != nil`\n- **Rust:** `Result<T, E>` and `Option<T>`\n\n**Best practices:** catch specific errors, clean up resources, don't silently swallow errors."},
	{[]string{"async", "await", "promise", "future", "coroutine", "goroutine"}, "Async code runs without blocking.\n\n**By language:**\n- **JS:** async/await + Promises\n- **Python:** async/await + asyncio\n- **Go:** goroutines + channels\n\n**Mental model:** Like ordering coffee — get a buzzer, do other things, it buzzes when ready.\n\n**Common mistake:** forgetting `await` gives you a Promise, not the value!"},
	{[]string{"type", "string", "int", "bool", "float"}, "Types describe what kind of data a value is.\n\n**Static:** caught at compile time (Go, Rust, C#). **Dynamic:** checked at runtime (JS, Python).\n\n**Oddities:**\n- JS: `typeof null === 'object'` (a bug!)\n- JS: `'5' + 3 = '53'` but `'5' - 3 = 2`\n- Python: everything is an object\n- Go: zero values — `int` defaults to `0`"},
	{[]string{"git", "commit", "push", "pull", "branch", "merge"}, "Git tracks changes over time.\n\n**Workflow:**\n1. `git add .` — stage\n2. `git commit -m \"msg\"` — save snapshot\n3. `git push` — upload\n\n**Pro tips:** use branches for features, `--force-with-lease` not `--force`, always pull before pushing."},
	{[]string{"sql", "select", "join", "table", "database", "query", "insert", "update", "delete"}, "SQL is the language of relational databases.\n\n**CRUD:** SELECT (read), INSERT (create), UPDATE (modify), DELETE (remove).\n\n**JOINs:** INNER, LEFT, RIGHT, FULL.\n\n**Most common errors:**\n- Missing WHERE in UPDATE/DELETE — affects ALL rows!\n- Not using parameterized queries = SQL injection"},
	{[]string{"debug", "bug", "fix", "issue", "wrong", "not working", "broken"}, "Debugging is a systematic process:\n\n1. **READ** the error — line + description\n2. **REPRODUCE** — find exact conditions\n3. **ISOLATE** — comment out code until bug disappears\n4. **INSPECT** — print values at each step\n5. **FIX** — smallest possible change\n6. **VERIFY** — does it work?\n\nEvery bug is a learning opportunity!"},
	{[]string{"help", "how", "what is", "explain", "understand", "confused", "learn", "start"}, "Effective learning method:\n\n1. **Read** the topic explanation\n2. **Type** the code yourself (no copy-paste)\n3. **Modify** it — experiment!\n4. **Build** something small\n\nI can explain topics, debug your code, and suggest exercises. What are you working on?"},
	{[]string{"pointer", "reference", "memory", "malloc", "free", "heap", "stack"}, "Memory management in systems languages (C, C++, Rust, Zig):\n\n- **Stack:** fast, automatic (local vars)\n- **Heap:** flexible, manual (dynamic alloc)\n\n**By language:**\n- **C:** malloc/free — fully manual\n- **Rust:** ownership — compiler-enforced safety\n- **Zig:** explicit allocators, safe manual management\n\n**Bugs:** memory leaks, dangling pointers, buffer overflows"},
	{[]string{"closure", "scope", "hoist"}, "A **closure** is a function that remembers outer variables after the outer function returns.\n\n**Scope types:** global, function (var), block (let/const).\n\n**Classic bug:** `var i` in loops with async callbacks — use `let` to fix.\n\n**Hoisting:** var is hoisted (undefined), let/const are hoisted but not initialized (Temporal Dead Zone)."},
	{[]string{"syntax", "semicolon", "bracket", "parenthesis", "brace"}, "Syntax errors are NORMAL — every programmer gets them.\n\n**Quick check:**\n1. All `(`, `{`, `[` closed?\n2. Strings quoted correctly?\n3. Statements terminated? (JS needs `;`, Python uses newlines)\n4. Variables spelled the same?\n\nThe error tells you the line — look at the line BEFORE too!"},
	{[]string{"hello", "hi", "hey", "greeting"}, "Hey there! Welcome to Doge's Lab!\n\nI'm your AI tutor. I can explain concepts, debug code, show examples, and guide your learning.\n\n**Get started:** Pick a language, click a topic, read, type the code, run it, and ask me anything!"},
	{[]string{"string", "concatenat", "interpolat", "template", "char", "substring"}, "Strings are sequences of characters.\n\n**Operations:** `.length`, `.slice()`, `.split()`, `.join()`, `.toUpperCase()`, `.trim()`\n\n**Interpolation:**\n- JS: `` `Hello ${name}` ``\n- Python: `f\"Hello {name}\"`\n- Go: `fmt.Sprintf(\"Hello %s\", name)`\n\n**Important:** Strings are IMMUTABLE — methods return new strings."},
}

func main() {
	store := &ProgressStore{db: make(Progress)}

	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/progress", func(w http.ResponseWriter, r *http.Request) {
		store.mu.Lock()
		defer store.mu.Unlock()
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(store.db)
	})

	mux.HandleFunc("POST /api/progress", func(w http.ResponseWriter, r *http.Request) {
		var body struct {
			Lang      string `json:"lang"`
			Topic     string `json:"topic"`
			Completed bool   `json:"completed"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			http.Error(w, err.Error(), 400)
			return
		}
		store.mu.Lock()
		if store.db[body.Lang] == nil {
			store.db[body.Lang] = make(map[string]bool)
		}
		store.db[body.Lang][body.Topic] = body.Completed
		store.mu.Unlock()
		json.NewEncoder(w).Encode(map[string]bool{"ok": true})
	})

	mux.HandleFunc("POST /api/execute", func(w http.ResponseWriter, r *http.Request) {
		var req ExecuteReq
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), 400)
			return
		}
		if req.Code == "" {
			json.NewEncoder(w).Encode(ExecRsp{Output: "No code provided"})
			return
		}

		// Build the exec command based on language
		var cmdStr string
		var ext string
		var progBase string

		switch req.Lang {
		case "js":
			ext = ".js"
		case "py":
			ext = ".py"
			cmdStr = fmt.Sprintf("python3 -u \"%s\"", "%f")
		case "go":
			ext = ".go"
			cmdStr = fmt.Sprintf("go run \"%s\"", "%f")
		case "ts":
			ext = ".ts"
			cmdStr = fmt.Sprintf("tsx \"%s\"", "%f")
		case "rs":
			ext = ".rs"
			progBase = fmt.Sprintf("_prog_%d", time.Now().UnixNano())
			cmdStr = fmt.Sprintf("rustc -o %s \"%s\" && ./%s", progBase, "%f", progBase)
		case "c":
			ext = ".c"
			progBase = fmt.Sprintf("_prog_%d", time.Now().UnixNano())
			cmdStr = fmt.Sprintf("gcc -Wall -o %s \"%s\" && ./%s", progBase, "%f", progBase)
		case "cpp":
			ext = ".cpp"
			progBase = fmt.Sprintf("_prog_%d", time.Now().UnixNano())
			cmdStr = fmt.Sprintf("g++ -std=c++20 -Wall -o %s \"%s\" && ./%s", progBase, "%f", progBase)
		case "zig":
			ext = ".zig"
			cmdStr = fmt.Sprintf("zig run \"%s\"", "%f")
		case "swift":
			ext = ".swift"
			cmdStr = fmt.Sprintf("swift \"%s\"", "%f")
		default:
			json.NewEncoder(w).Encode(ExecRsp{Output: fmt.Sprintf("// %s execution not available in Go backend", strings.ToUpper(req.Lang))})
			return
		}

		// For JS, execute inline
		if req.Lang == "js" {
			cmd := exec.Command("node", "-e", req.Code)
			output, err := cmd.CombinedOutput()
			if err != nil {
				json.NewEncoder(w).Encode(ExecRsp{Output: fmt.Sprintf("Error: %s\n%s", err.Error(), string(output))})
				return
			}
			out := strings.TrimSpace(string(output))
			if out == "" {
				out = "(no output)"
			}
			json.NewEncoder(w).Encode(ExecRsp{Output: out})
			return
		}

		// For file-based execution
		tmpDir, err := os.MkdirTemp("", "exec-")
		if err != nil {
			json.NewEncoder(w).Encode(ExecRsp{Output: "Failed to create temp directory"})
			return
		}
		defer os.RemoveAll(tmpDir)

		tmpFile := filepath.Join(tmpDir, "code"+ext)
		if err := os.WriteFile(tmpFile, []byte(req.Code), 0644); err != nil {
			json.NewEncoder(w).Encode(ExecRsp{Output: "Failed to write temp file"})
			return
		}

		cmdLine := strings.ReplaceAll(cmdStr, "%f", tmpFile)
		cmd := exec.Command("sh", "-c", cmdLine)
		cmd.Dir = tmpDir
		cmd.Env = append(os.Environ(),
			fmt.Sprintf("PATH=%s:%s:%s", os.Getenv("PATH"),
				filepath.Join(os.Getenv("HOME"), ".local/bin"),
				filepath.Join(os.Getenv("HOME"), ".cargo/bin")))

		output, err := cmd.CombinedOutput()
		out := strings.TrimSpace(string(output))
		if err != nil && out == "" {
			out = fmt.Sprintf("Process failed: %s", err.Error())
		}
		if out == "" {
			out = "(no output)"
		}
		json.NewEncoder(w).Encode(ExecRsp{Output: out})
	})

	mux.HandleFunc("POST /api/chat", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Message  string `json:"message"`
			Lang     string `json:"lang"`
			Topic    string `json:"topic"`
			Code     string `json:"code"`
			Output   string `json:"output"`
			HasError bool   `json:"hasError"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), 400)
			return
		}
		q := strings.ToLower(req.Message)
		if q == "" {
			json.NewEncoder(w).Encode(ChatRsp{Reply: "Ask me something about programming!"})
			return
		}

		// Error-aware help
		if req.HasError || strings.Contains(q, "error") || strings.Contains(q, "bug") || strings.Contains(q, "fix") || strings.Contains(q, "wrong") || strings.Contains(q, "not working") {
			var errorReply string
			if req.Code != "" {
				errorReply = "Let's debug your code! Try:\n\n1. Check the error message for line numbers\n2. Simplify: comment out parts until it works\n3. Compare with the curriculum example\n\n**Tip:** The most common bugs are typos, missing brackets, and off-by-one errors."
			}
			if req.Output != "" {
				clean := strings.TrimSpace(req.Output)
				if len(clean) > 200 {
					clean = clean[:200] + "..."
				}
				errorReply += "\n\n**Your output:** " + clean
			}
			if errorReply == "" {
				errorReply = "Let's debug systematically:\n**1.** What did you expect?\n**2.** What actually happened?\n**3.** What have you tried?"
			}
			json.NewEncoder(w).Encode(ChatRsp{Reply: errorReply})
			return
		}

		// Topic-aware
		if req.Topic != "" && (strings.Contains(q, "what") || strings.Contains(q, "how") || strings.Contains(q, "explain") || strings.Contains(q, "?")) {
			for _, rule := range aiRules {
				for _, kw := range rule.keywords {
					if strings.Contains(strings.ToLower(req.Topic), kw) {
						reply := rule.reply
						reply += fmt.Sprintf("\n\n**You're studying:** %s\nTry the code example and click Run!", req.Topic)
						json.NewEncoder(w).Encode(ChatRsp{Reply: reply})
						return
					}
				}
			}
		}

		// Keyword matching
		for _, rule := range aiRules {
			for _, kw := range rule.keywords {
				if strings.Contains(q, kw) {
					json.NewEncoder(w).Encode(ChatRsp{Reply: rule.reply})
					return
				}
			}
		}

		if strings.Contains(q, "hello") || strings.Contains(q, "hi ") || q == "hey" {
			langInfo := ""
			if req.Lang != "" {
				langInfo = fmt.Sprintf(" I see you're studying **%s**. ", strings.ToUpper(req.Lang))
			}
			json.NewEncoder(w).Encode(ChatRsp{Reply: fmt.Sprintf("Hello!%sAsk me about the topic you're working on!", langInfo)})
			return
		}

		if strings.Contains(q, "thank") {
			json.NewEncoder(w).Encode(ChatRsp{Reply: "You're welcome! Keep experimenting and asking questions. What would you like to learn next?"})
			return
		}

		if req.Topic != "" {
			json.NewEncoder(w).Encode(ChatRsp{Reply: fmt.Sprintf("Great question about **%s**! What do you think the answer might be? Tell me your thought process and I'll help guide you!", req.Topic)})
			return
		}

		fallbacks := []string{
			"Tell me what language and topic you're working on and I'll explain it clearly!",
			"I'd love to help! What are you studying right now?",
			"Ask me about a specific topic, share your code for debugging, or pick a suggestion below!",
		}
		json.NewEncoder(w).Encode(ChatRsp{Reply: fallbacks[rand.Intn(len(fallbacks))]})
	})

	mux.HandleFunc("GET /api/benchmark", func(w http.ResponseWriter, r *http.Request) {
		count := 10000
		start := time.Now()
		sum := 0
		for i := 0; i < count; i++ {
			sum += i * i
		}
		ms := time.Since(start).Seconds() * 1000
		json.NewEncoder(w).Encode(map[string]interface{}{
			"backend":    "Go",
			"version":    runtime.Version(),
			"iterations": count,
			"result":     sum,
			"timeMs":     math.Round(ms*100) / 100,
			"opsPerSec":  math.Round(float64(count) / (ms / 1000)),
		})
	})

	// Serve static files
	fs := http.FileServer(http.Dir("."))
	mux.Handle("/", fs)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Go backend running at http://localhost:%s", port)
	log.Fatal(http.ListenAndServe(":"+port, corsMiddleware(mux)))
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == "OPTIONS" {
			w.WriteHeader(204)
			return
		}
		next.ServeHTTP(w, r)
	})
}
