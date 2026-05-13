const fs = require('fs');

function esc(s) {
  return s.replace(/\n/g, '\\n').replace(/"/g, '\\"');
}

function topic(exp, code) {
  return `{ exp: "${esc(exp)}", code: "${esc(code)}" }`;
}

function phase(name, topics) {
  return `    "${name}": {\n${topics.map(([t, e, c]) => `        "${t}": ${topic(e, c)}`).join(',\n')}\n    }`;
}

function appendToFile(file, phases) {
  const path = 'data/' + file;
  let data = fs.readFileSync(path, 'utf8');
  data = data.replace(/\s+$/, ''); // trim trailing whitespace
  const additions = phases.map(([name, topics]) => `,\n${phase(name, topics)}`).join('');
  data += additions + '\n};';
  fs.writeFileSync(path, data, 'utf8');
  console.log('Updated ' + file);
}

// === SWIFT ===
appendToFile('swift.js', [
  ['Concurrency', [
    ['async/await', "Swift's structured concurrency uses async/await for non-blocking code. async functions can suspend and resume, freeing the thread for other work.",
     'func fetchUser(id: Int) async throws -> String {\n    let url = URL(string: "https://api.example.com/user/\\(id)")!\n    let (data, _) = try await URLSession.shared.data(from: url)\n    return String(data: data, encoding: .utf8) ?? ""\n}\n\nTask {\n    let result = try await fetchUser(id: 1)\n    print(result)\n}'],
    ['Actors', "Actors protect shared mutable state with actor isolation. Only one task can access the actor's state at a time, preventing data races at compile time.",
     'actor Counter {\n    private var value = 0\n    func increment() { value += 1 }\n    func getValue() -> Int { value }\n}\n\nlet counter = Counter()\nTask {\n    await counter.increment()\n    print(await counter.getValue())\n}'],
    ['Task Groups', "Task groups create structured concurrency trees. Tasks added to a group run in parallel and complete before the group returns.",
     'let results = try await withThrowingTaskGroup(of: String.self) { group in\n    for id in 1...5 {\n        group.addTask {\n            return try await fetchUser(id: id)\n        }\n    }\n    return try await group.reduce(into: []) { $0.append($1) }\n}\nprint(results)'],
    ['AsyncSequence', "AsyncSequence provides asynchronous iteration over values over time. Use `for try await` to consume streams, lines, or custom async sequences.",
     'let url = URL(string: "https://api.example.com/stream")!\nlet asyncBytes = url.resourceBytes\nfor try await byte in asyncBytes {\n    print(byte)\n}'],
  ]],
  ['Error Handling', [
    ['do/catch & throws', "Functions marked `throws` can propagate errors. Use `do/catch` to handle errors, `try` to call throwing functions.",
     'enum MyError: Error { case networkFailure, notFound }\n\nfunc risky() throws -> String {\n    throw MyError.networkFailure\n}\n\ndo {\n    let result = try risky()\n    print(result)\n} catch MyError.networkFailure {\n    print("Network error")\n} catch {\n    print("Other: \\(error)")\n}'],
    ['try? & try!', "`try?` converts a throwing expression to an optional (nil on error). `try!` force-unwraps, crashing on error.",
     'let optional = try? risky()\nprint(optional ?? "default")\n\nlet forced = try! risky()'],
    ['Result Type', "Result<Success, Failure> captures either a success value or an error as a value. Useful for async callbacks.",
     'func divide(_ a: Int, _ b: Int) -> Result<Int, Error> {\n    guard b != 0 else { return .failure(MyError.networkFailure) }\n    return .success(a / b)\n}\n\nswitch divide(10, 2) {\ncase .success(let val): print(val)\ncase .failure(let err): print(err)\n}'],
  ]],
  ['Memory & Performance', [
    ['ARC in Depth', "Automatic Reference Counting manages memory. Each strong reference increments the count; deallocation at zero. Use deinit for cleanup.",
     'class Person {\n    let name: String\n    init(name: String) { self.name = name; print("\\(name) init") }\n    deinit { print("\\(name) deinit") }\n}\nvar p: Person? = Person(name: "Alice")\np = nil'],
    ['weak & unowned', "Weak references don't increase ref count and become nil on dealloc. Unowned references assume the object lives as long as the reference.",
     'class Child {\n    weak var parent: Parent?\n    deinit { print("Child deinit") }\n}\nclass Parent {\n    var child = Child()\n    init() { child.parent = self }\n    deinit { print("Parent deinit") }\n}\nvar p: Parent? = Parent()\np = nil'],
    ['Copy-on-Write', "Swift value types use copy-on-write. Mutating a shared instance creates a copy only at mutation point, optimizing performance.",
     'var a = [1, 2, 3]\nvar b = a\nb.append(4)\nprint(a)\nprint(b)'],
  ]],
  ['Swift Package Manager', [
    ['Package.swift', "SPM uses Package.swift manifest. Define targets, dependencies, products in a declarative Swift DSL.",
     '// swift-tools-version: 5.9\nimport PackageDescription\nlet package = Package(\n    name: "MyLibrary",\n    platforms: [.macOS(.v14)],\n    products: [.library(name: "MyLibrary", targets: ["MyLibrary"])],\n    dependencies: [\n        .package(url: "https://github.com/pointfreeco/swift-composable-architecture", from: "1.0.0")\n    ],\n    targets: [\n        .target(name: "MyLibrary", dependencies: [\n            .product(name: "ComposableArchitecture", package: "swift-composable-architecture")\n        ]),\n    ]\n)'],
  ]],
]);

// === KOTLIN ===
appendToFile('kt.js', [
  ['Coroutines Deep Dive', [
    ['Dispatchers', "Dispatchers determine thread pools. Default for CPU, IO for I/O, Main for UI, Unconfined for testing.",
     'import kotlinx.coroutines.*\nsuspend fun fetchData(): String = withContext(Dispatchers.IO) {\n    delay(100)\n    "Data from server"\n}\nrunBlocking { println(fetchData()) }'],
    ['Structured Concurrency', "Coroutines lifetime ties to parent scope. Cancellation propagates downward; errors bubble up to parent scope.",
     'runBlocking {\n    coroutineScope {\n        launch { delay(1000); println("1 done") }\n        launch { delay(500); println("2 done") }\n    }\n    println("All done")\n}'],
    ['supervisorScope', "supervisorScope isolates child failures: one child's exception doesn't cancel siblings or parent.",
     'runBlocking {\n    supervisorScope {\n        launch {\n            try { delay(100); throw RuntimeException("Oops") }\n            catch (e: Exception) { println("Caught") }\n        }\n        launch { delay(200); println("Still runs") }\n    }\n}'],
  ]],
  ['Flows & State', [
    ['Flow Basics', "Flow is a cold async stream. Use flow { } builder, emit() values, collect() on consumer. Cold until collected.",
     'import kotlinx.coroutines.flow.*\nfun countUp(): Flow<Int> = flow {\n    for (i in 1..3) { delay(100); emit(i) }\n}\nrunBlocking { countUp().collect { println(it) } }'],
    ['StateFlow & SharedFlow', "StateFlow holds observable state. SharedFlow emits to multiple collectors. Both are hot flows.",
     'class ViewModel {\n    private val _state = MutableStateFlow("initial")\n    val state: StateFlow<String> = _state\n    fun update(v: String) { _state.value = v }\n}\nrunBlocking {\n    val vm = ViewModel()\n    launch { vm.state.collect { println(it) } }\n    vm.update("new")\n}'],
    ['Operators', "Flow operators: map, filter, catch, retry, debounce, zip, combine. Create new flows without triggering collection.",
     'runBlocking {\n    (1..5).asFlow()\n        .filter { it % 2 == 0 }\n        .map { "N: $it" }\n        .catch { println("Err: $it") }\n        .collect { println(it) }\n}'],
  ]],
  ['Serialization', [
    ['kotlinx.serialization', "Type-safe serialization with @Serializable. Supports JSON, Protobuf, CBOR.",
     '@Serializable\ndata class User(val id: Int, val name: String)\nfun main() {\n    val user = User(1, "Alice")\n    val json = Json.encodeToString(user)\n    println(json)\n    val decoded = Json.decodeFromString<User>(json)\n    println(decoded)\n}'],
  ]],
  ['Testing', [
    ['Kotest', "Multiplatform testing with property-based tests, behavior specs, matchers.",
     'class MyTest : StringSpec({\n    "string length" { "hello".length shouldBe 5 }\n    "coroutine test" { runBlocking { fetchData() shouldContain "Data" } }\n})'],
    ['MockK & JUnit', "Kotlin-first mocking with coroutine support, spies, and verification.",
     'class UserServiceTest {\n    private val repo = mockk<UserRepository>()\n    private val service = UserService(repo)\n    @Test\n    fun `test`() = runBlocking {\n        coEvery { repo.findById(1) } returns User(1, "Alice")\n        assertEquals("Alice", service.getUser(1).name)\n    }\n}'],
    ['Coroutine Testing', "kotlinx-coroutines-test: runTest, TestScope, virtual time.",
     'class CoroutineTest {\n    @Test\n    fun `test delay`() = runTest {\n        var result = ""\n        launch { delay(1000); result = "done" }\n        advanceTimeBy(1000)\n        assertEquals("done", result)\n    }\n}'],
  ]],
]);

// === RUST ===
appendToFile('rust.js', [
  ['Modules & Cargo', [
    ['Modules', "Organize code with `mod` declarations. Each file is a module. `pub` controls visibility. `use` brings items into scope.",
     '// src/lib.rs\npub mod math;\n// src/math.rs\npub fn add(a: i32, b: i32) -> i32 { a + b }\nuse crate::math::add;\nprintln!("{}", add(2, 3));'],
    ['Crates & Features', "Crates are packages. Cargo.toml defines dependencies and features.",
     '[package]\nname = "myapp"\n[dependencies]\nserde = { version = "1", features = ["derive"] }\n[features]\ndefault = ["std"]\nstd = []'],
    ['Workspaces', "Workspaces manage multiple crates with shared dependencies and build artifacts.",
     '[workspace]\nmembers = ["crates/core", "crates/cli"]\nresolver = "2"'],
    ['Conditional Compilation', "#[cfg()] conditionally compiles code by target, feature, or OS.",
     '#[cfg(target_os = "linux")]\nfn platform() { println!("Linux") }\n#[cfg(not(target_os = "linux"))]\nfn platform() { println!("Not Linux") }'],
  ]],
  ['Lifetimes', [
    ['Lifetime Elision', "Rust infers lifetimes: one input reference gets one output lifetime.",
     'fn first_word(s: &str) -> &str {\n    s.split_whitespace().next().unwrap_or("")\n}\nfn longest<\'a>(x: &\'a str, y: &\'a str) -> &\'a str {\n    if x.len() > y.len() { x } else { y }\n}'],
    ['Lifetime Bounds', "Lifetime bounds with `'a: 'b`. Used in structs with references.",
     "struct Book<'a> {\n    title: &'a str,\n    author: &'a str,\n}\nimpl<'a> Book<'a> {\n    fn summary(&self) -> &str { self.title }\n}"],
    ["'static Lifetime", "'static references live for the entire program. String literals are 'static.",
     'const MSG: &str = "hi";\nfn get() -> &\'static str { "Hello" }\nstd::thread::spawn(move || println!("{}", get()));'],
  ]],
  ['Async Rust', [
    ['async/await', "async fn returns a Future. .await polls to completion. Futures need an executor.",
     'use tokio;\nasync fn fetch() -> String { "data".to_string() }\n#[tokio::main]\nasync fn main() {\n    let r = fetch().await;\n    println!("{}", r);\n}'],
    ['Tokio Runtime', "Tokio: work-stealing scheduler, I/O drivers, timers, sync primitives.",
     '#[tokio::main(flavor = "multi_thread")]\nasync fn main() {\n    let h = tokio::spawn(async { "task".to_string() });\n    println!("{}", h.await.unwrap());\n}'],
    ['Futures & Streams', "join_all, select!, StreamExt combinators for async data flow.",
     'use futures::future::join_all;\nasync fn task(id: u32) -> u32 {\n    tokio::time::sleep(std::time::Duration::from_millis(10)).await;\n    id\n}\n#[tokio::main]\nasync fn main() {\n    let r = join_all((1..=3).map(task)).await;\n    println!("{:?}", r);\n}'],
  ]],
]);

// === PYTHON ===
appendToFile('py.js', [
  ['Async Python', [
    ['async/await', "asyncio enables concurrent code. async def for coroutines, await to yield control.",
     'import asyncio\nasync def fetch():\n    await asyncio.sleep(0.1)\n    return {"data": 42}\n\nasync def main():\n    r = await fetch()\n    print(r)\nasyncio.run(main())'],
    ['asyncio.gather', "Run multiple coroutines concurrently and collect results.",
     'import asyncio\nasync def task(n):\n    await asyncio.sleep(n)\n    return f"Task {n}"\n\nasync def main():\n    r = await asyncio.gather(task(1), task(2))\n    print(r)\nasyncio.run(main())'],
    ['Async Context Managers', "async with for connections, streams, and resources.",
     'import asyncio\nclass Res:\n    async def __aenter__(self): return self\n    async def __aexit__(self, *a): pass\nasync def main():\n    async with Res() as r:\n        print("ok")\nasyncio.run(main())'],
  ]],
  ['File System & Paths', [
    ['pathlib', "Object-oriented path manipulation across OSes.",
     'from pathlib import Path\nPath("data").mkdir(exist_ok=True)\n(Path("data") / "note.txt").write_text("hi")\nprint(Path("data/note.txt").read_text())'],
    ['shutil', "High-level file operations: copy, move, archive.",
     'import shutil\nshutil.copy("src.txt", "dst.txt")\nshutil.make_archive("backup", "zip", ".")'],
    ['glob', "File pattern matching with wildcards.",
     'import glob\nfor f in glob.glob("**/*.py", recursive=True):\n    print(f)'],
  ]],
  ['Logging', [
    ['logging module', "Configurable loggers with levels, handlers, and formatters.",
     'import logging\nlogging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")\nlogger = logging.getLogger(__name__)\nlogger.info("started")\nlogger.error("fail", exc_info=True)'],
    ['pdb', "Built-in debugger with breakpoint(), stepping, and post-mortem.",
     'def buggy():\n    breakpoint()\n    return 1 / 0\ntry:\n    buggy()\nexcept:\n    import pdb; pdb.post_mortem()'],
  ]],
  ['Itertools & Functools', [
    ['itertools', "Iterator combinators: chain, permutations, groupby, count, islice.",
     'from itertools import chain, permutations, islice, count\nprint(list(chain([1,2],[3,4])))\nprint(list(islice(count(10), 5)))'],
    ['functools', "Higher-order functions: cache, partial, reduce.",
     'from functools import lru_cache, partial, reduce\n@lru_cache\ndef fib(n): return n if n < 2 else fib(n-1)+fib(n-2)\nsquare = partial(pow, exp=2)\nprint(fib(50), square(5))'],
    ['contextlib', "Context manager utilities: contextmanager, suppress, ExitStack.",
     'from contextlib import contextmanager, suppress\n@contextmanager\ndef managed():\n    print("enter"); yield; print("exit")\nwith managed():\n    print("inside")'],
  ]],
]);

console.log('Done');
