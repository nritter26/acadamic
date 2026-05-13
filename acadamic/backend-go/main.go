package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"os"
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
	{[]string{"variable", "declare", "let", "const", "var"}, "Variables store data values. Use `let`/`const` in JS, `var`/`val` in Kotlin, `:=` in Go, or just `name = value` in Python."},
	{[]string{"function", "method", "def", "func"}, "Functions are reusable blocks. `function name(){}` in JS, `def name():` in Python, `func name(){}` in Go, `fun name(){}` in Kotlin."},
	{[]string{"class", "object", "oop", "inherit", "extends"}, "OOP organizes code around objects. Classes define blueprints. Go uses structs+methods. Favor composition over inheritance."},
	{[]string{"array", "list", "collection", "map", "set"}, "Collections hold multiple values. Arrays are fixed-size. Lists/Slices grow dynamically. Maps store key-value pairs."},
	{[]string{"loop", "for", "while", "iterate"}, "Loops repeat code. `for` is universal. `while` runs while a condition is true. Use `break`/`continue` to control flow."},
	{[]string{"error", "exception", "try", "catch", "panic"}, "Error handling: JS/Python/C# use try/catch. Go returns errors as values. Zig uses error unions."},
	{[]string{"async", "await", "promise", "future", "coroutine"}, "Async code runs without blocking. JS: Promises. Python: asyncio. Go: goroutines. Kotlin: coroutines."},
	{[]string{"type", "string", "int", "bool", "float"}, "Types define data. Statically-typed languages catch errors at compile time. Dynamically-typed languages offer flexibility."},
	{[]string{"git", "commit", "push", "pull", "branch", "merge"}, "Git tracks changes. `git add` stages, `git commit` saves, `git push` uploads. Branches isolate work."},
	{[]string{"sql", "select", "join", "table", "database", "query"}, "SQL manages relational data. SELECT retrieves, JOINs combine tables. Indexes speed up queries."},
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
		if req.Lang == "js" {
			// JS execution via os/exec using node
			// Simulated for safety in Go backend
			json.NewEncoder(w).Encode(ExecRsp{Output: "// JS execution via Node.js backend\n// (Go backend: placeholder)"})
		} else {
			json.NewEncoder(w).Encode(ExecRsp{Output: fmt.Sprintf("// Logical Preview for %s\n// Run this code in your %s environment to execute it locally.", strings.ToUpper(req.Lang), strings.ToUpper(req.Lang))})
		}
	})

	mux.HandleFunc("POST /api/chat", func(w http.ResponseWriter, r *http.Request) {
		var req ChatReq
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), 400)
			return
		}
		q := strings.ToLower(req.Message)
		lang := strings.ToUpper(req.Lang)
		if lang == "" {
			lang = "PROGRAMMING"
		}
		for _, rule := range aiRules {
			for _, kw := range rule.keywords {
				if strings.Contains(q, kw) {
					json.NewEncoder(w).Encode(ChatRsp{Reply: rule.reply})
					return
				}
			}
		}
		if strings.Contains(q, "hello") || strings.Contains(q, "hi") {
			json.NewEncoder(w).Encode(ChatRsp{Reply: fmt.Sprintf("Hello! I'm your %s assistant. Ask me about variables, functions, classes, or any programming concept.", lang)})
			return
		}
		json.NewEncoder(w).Encode(ChatRsp{Reply: fmt.Sprintf("Great question about %s! I suggest exploring the curriculum for detailed code examples and explanations.", lang)})
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
