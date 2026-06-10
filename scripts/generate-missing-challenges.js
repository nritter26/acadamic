/**
 * Generate Missing Challenges (Comprehensive) — fills app-data.json with 300 challenges
 * per language for ALL curriculum languages/tabs that currently have fewer than 300.
 *
 * Uses category-based template pools shared across related languages.
 *
 * Usage: node scripts/generate-missing-challenges.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'backend', 'content', 'app-data.json');
const TARGET = 300;

const appData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
const challengeData = appData.challengeData || {};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Category Template Pools ──
// Each template: { title, level, desc, bug, solution, test }

// 1. Web Frameworks (React, Vue, Angular, Svelte, Next, Nuxt, SvelteKit, Remix)
const webFrameworkTemplates = [
  { title: 'Missing Component Export', level: 'beginner', desc: 'Component is not exported from module.', bug: 'function MyComponent() { return <div>Hello</div> }', solution: 'export function MyComponent() { return <div>Hello</div> }', test: 'true' },
  { title: 'Missing Props Destructuring', level: 'beginner', desc: 'Props object used without destructuring.', bug: 'function Greeting(props) { return <h1>{props.name}</h1> }', solution: 'function Greeting({ name }) { return <h1>{name}</h1> }', test: 'true' },
  { title: 'Missing Key Prop', level: 'beginner', desc: 'List items missing unique key prop.', bug: 'function List({ items }) { return items.map(item => <li>{item}</li>) }', solution: 'function List({ items }) { return items.map((item, i) => <li key={i}>{item}</li>) }', test: 'true' },
  { title: 'State Mutation', level: 'intermediate', desc: 'Directly mutating state instead of using setter.', bug: 'function Counter() { const [count, setCount] = useState(0); count = 5; }', solution: 'function Counter() { const [count, setCount] = useState(0); setCount(5); }', test: 'true' },
  { title: 'Effect Dependencies', level: 'intermediate', desc: 'useEffect missing dependency array causing infinite loop.', bug: 'function App() { useEffect(() => { fetchData() }); }', solution: 'function App() { useEffect(() => { fetchData() }, []); }', test: 'true' },
  { title: 'Conditional Hook Call', level: 'expert', desc: 'Hook called inside a conditional block (violates rules of hooks).', bug: 'function App() { if (condition) { useState(0) } }', solution: 'function App() { const [state, setState] = useState(0); if (condition) { /* use state */ } }', test: 'true' },
  { title: 'Missing Event Handler Binding', level: 'beginner', desc: 'Event handler loses this context.', bug: 'class Button { handleClick() { alert("Clicked") } render() { return <button onClick={this.handleClick}>Click</button> } }', solution: 'class Button { handleClick() { alert("Clicked") } render() { return <button onClick={() => this.handleClick()}>Click</button> } }', test: 'true' },
  { title: 'Default Export Import', level: 'beginner', desc: 'Named import used for default export.', bug: 'import { Component } from "./MyComponent"', solution: 'import Component from "./MyComponent"', test: 'true' },
  { title: 'Fragment Syntax', level: 'beginner', desc: 'Using unnecessary wrapper div instead of Fragment.', bug: 'function App() { return <div><h1>Title</h1><p>Text</p></div> }', solution: 'function App() { return <><h1>Title</h1><p>Text</p></> }', test: 'true' },
  { title: 'Async Effect Cleanup', level: 'intermediate', desc: 'Async effect without cleanup can cause memory leaks.', bug: 'useEffect(() => { const timer = setInterval(fetch, 1000) }, [])', solution: 'useEffect(() => { const timer = setInterval(fetch, 1000); return () => clearInterval(timer) }, [])', test: 'true' },
  { title: 'Props Spreading', level: 'beginner', desc: 'Manually passing multiple props instead of spreading.', bug: 'function App() { return <Child a={props.a} b={props.b} c={props.c} /> }', solution: 'function App() { return <Child {...props} /> }', test: 'true' },
  { title: 'Children Prop Type', level: 'intermediate', desc: 'Children not typed as ReactNode.', bug: 'function Card({ children }) { return <div>{children}</div> }', solution: 'function Card({ children }: { children: React.ReactNode }) { return <div>{children}</div> }', test: 'true' },
  { title: 'Render Prop Pattern', level: 'intermediate', desc: 'Missing render prop invocation.', bug: 'function DataProvider({ render }) { return <div>{render}</div> }', solution: 'function DataProvider({ render }) { return <div>{render()}</div> }', test: 'true' },
  { title: 'Stale Closure', level: 'expert', desc: 'Stale closure in useEffect due to missing dependency.', bug: 'function App({ id }) { useEffect(() => { fetch(`/api/${id}`) }, []) }', solution: 'function App({ id }) { useEffect(() => { fetch(`/api/${id}`) }, [id]) }', test: 'true' },
  { title: 'UseRef Initial Value', level: 'beginner', desc: 'useRef initial value not provided.', bug: 'function App() { const inputRef = useRef(); }', solution: 'function App() { const inputRef = useRef(null); }', test: 'true' },
  { title: 'Immer Immerability', level: 'expert', desc: 'Direct mutation inside Immer produce without using draft.', bug: 'const next = produce(state, (draft) => { state.count++ })', solution: 'const next = produce(state, (draft) => { draft.count++ })', test: 'true' },
  { title: 'Callback Dependency', level: 'intermediate', desc: 'useCallback missing dependency causing stale closure.', bug: 'const fn = useCallback(() => doSomething(id), [])', solution: 'const fn = useCallback(() => doSomething(id), [id])', test: 'true' },
  { title: 'Memo Without Comparison', level: 'intermediate', desc: 'React.memo used on component that always re-renders.', bug: 'export default React.memo(ExpensiveComponent)', solution: 'export default React.memo(ExpensiveComponent, (prev, next) => prev.id === next.id)', test: 'true' },
  { title: 'Context Provider Value', level: 'beginner', desc: 'Context provider has undefined value.', bug: '<MyContext.Provider><Child /></MyContext.Provider>', solution: '<MyContext.Provider value={someValue}><Child /></MyContext.Provider>', test: 'true' },
  { title: 'Reducer Initial State', level: 'intermediate', desc: 'useReducer called without initial state argument.', bug: 'const [state, dispatch] = useReducer(reducer)', solution: 'const [state, dispatch] = useReducer(reducer, initialState)', test: 'true' },
  { title: 'SetState Callback', level: 'intermediate', desc: 'setState used without functional update form when depending on previous state.', bug: 'setCount(count + 1); setCount(count + 1);', solution: 'setCount(prev => prev + 1); setCount(prev => prev + 1);', test: 'true' },
  { title: 'Props Default Value', level: 'beginner', desc: 'Props without default value causing undefined errors.', bug: 'function Button({ text }) { return <button>{text.toUpperCase()}</button> }', solution: 'function Button({ text = "Click" }) { return <button>{text.toUpperCase()}</button> }', test: 'true' },
  { title: 'Event Parameter Type', level: 'beginner', desc: 'Event handler missing event parameter type.', bug: 'function handleChange(e) { setValue(e.target.value) }', solution: 'function handleChange(e: React.ChangeEvent<HTMLInputElement>) { setValue(e.target.value) }', test: 'true' },
  { title: 'CSS Module Import', level: 'beginner', desc: 'CSS module imported but used as plain string.', bug: 'import "./styles.css"; className="container"', solution: 'import styles from "./styles.module.css"; className={styles.container}', test: 'true' },
];

// 2. Backend Frameworks (Express, Node, Django, Flask, FastAPI, Rails, Spring)
const backendFrameworksTemplates = [
  { title: 'Missing Route Method', level: 'beginner', desc: 'Route defined without HTTP method.', bug: "app('/', (req, res) => res.send('Hi'))", solution: "app.get('/', (req, res) => res.send('Hi'))", test: 'true' },
  { title: 'Missing JSON Parser', level: 'beginner', desc: 'Request body is undefined because JSON parser middleware is missing.', bug: "app.post('/data', (req, res) => { console.log(req.body) })", solution: "app.use(express.json()); app.post('/data', (req, res) => { console.log(req.body) })", test: 'true' },
  { title: 'Hardcoded Port', level: 'beginner', desc: 'Port is hardcoded instead of using environment variable.', bug: "app.listen(3000)", solution: "const PORT = process.env.PORT || 3000; app.listen(PORT)", test: 'true' },
  { title: 'Async Error Handler', level: 'intermediate', desc: 'Async route handler missing error catch.', bug: "app.get('/data', async (req, res) => { const data = await fetchData(); res.json(data) })", solution: "app.get('/data', async (req, res, next) => { try { const data = await fetchData(); res.json(data) } catch(e) { next(e) } })", test: 'true' },
  { title: 'SQL Injection Risk', level: 'expert', desc: 'Query built with string concatenation instead of parameterized query.', bug: "db.query('SELECT * FROM users WHERE id = ' + id)", solution: "db.query('SELECT * FROM users WHERE id = $1', [id])", test: 'true' },
  { title: 'CORS Missing', level: 'intermediate', desc: 'No CORS headers causing cross-origin requests to fail.', bug: "app.get('/api/data', (req, res) => res.json({ ok: true }))", solution: "app.use(cors()); app.get('/api/data', (req, res) => res.json({ ok: true }))", test: 'true' },
  { title: 'Wrong Status Code', level: 'beginner', desc: 'Created resource should return 201 status.', bug: "app.post('/users', (req, res) => res.json({ id: 1 }))", solution: "app.post('/users', (req, res) => res.status(201).json({ id: 1 }))", test: 'true' },
  { title: 'Missing Route Param', level: 'beginner', desc: 'Route parameter defined but not used in handler.', bug: "app.get('/users/:id', (req, res) => { res.send('User') })", solution: "app.get('/users/:id', (req, res) => { res.send('User ' + req.params.id) })", test: 'true' },
  { title: 'Middleware Order', level: 'intermediate', desc: 'Error handling middleware must be last.', bug: "app.use(errorHandler); app.get('/', handler)", solution: "app.get('/', handler); app.use(errorHandler)", test: 'true' },
  { title: 'Static File Serving', level: 'beginner', desc: 'Static files not being served because directory path is missing.', bug: "app.use(express.static())", solution: "app.use(express.static('public'))", test: 'true' },
  { title: 'Environment Check', level: 'beginner', desc: 'Using development config in production.', bug: "const config = { debug: true, db: 'localhost' }", solution: "const config = process.env.NODE_ENV === 'production' ? prodConfig : devConfig", test: 'true' },
  { title: 'Cookie Parser Missing', level: 'beginner', desc: 'Cookies not accessible because parser is missing.', bug: "app.get('/', (req, res) => { console.log(req.cookies) })", solution: "app.use(cookieParser()); app.get('/', (req, res) => { console.log(req.cookies) })", test: 'true' },
  { title: 'Missing Content Type', level: 'beginner', desc: 'Response missing Content-Type header.', bug: "app.get('/data', (req, res) => { res.send(JSON.stringify(data)) })", solution: "app.get('/data', (req, res) => { res.json(data) })", test: 'true' },
  { title: 'Route Not Found', level: 'beginner', desc: 'No 404 handler for unknown routes.', bug: "app.get('/', (req, res) => res.send('OK'))", solution: "app.get('/', (req, res) => res.send('OK')); app.use((req, res) => res.status(404).send('Not Found'))", test: 'true' },
  { title: 'Rate Limiting Missing', level: 'intermediate', desc: 'API endpoint not protected by rate limiting.', bug: "app.post('/api/login', loginHandler)", solution: "const limiter = rateLimit({ windowMs: 15*60*1000, max: 100 }); app.post('/api/login', limiter, loginHandler)", test: 'true' },
  { title: 'Helmet Missing', level: 'intermediate', desc: 'Security headers not set via helmet.', bug: "app.get('/', (req, res) => res.send('Hello'))", solution: "app.use(helmet()); app.get('/', (req, res) => res.send('Hello'))", test: 'true' },
  { title: 'Morgan Missing', level: 'beginner', desc: 'Request logging not configured.', bug: "app.get('/', handler)", solution: "app.use(morgan('combined')); app.get('/', handler)", test: 'true' },
  { title: 'Compression Missing', level: 'intermediate', desc: 'Response compression not enabled for large payloads.', bug: "app.get('/data', (req, res) => res.json(largeData))", solution: "app.use(compression()); app.get('/data', (req, res) => res.json(largeData))", test: 'true' },
  { title: 'Connection Pool Exhaustion', level: 'expert', desc: 'Database queries not using connection pool properly.', bug: "app.get('/users', (req, res) => { const conn = db.connect(); conn.query('SELECT *') })", solution: "app.get('/users', (req, res) => { pool.query('SELECT *', (err, result) => { res.json(result.rows) }) })", test: 'true' },
  { title: 'N+1 Query Problem', level: 'expert', desc: 'Loop queries causing N+1 database requests.', bug: "const posts = await Post.findAll(); for (const post of posts) { const comments = await Comment.findAll({ where: { postId: post.id } }) }", solution: "const posts = await Post.findAll({ include: [Comment] })", test: 'true' },
];

// 3. Mobile (Flutter/Dart, React Native)
const mobileTemplates = [
  { title: 'Missing Widget Build', level: 'beginner', desc: 'Widget missing build method override.', bug: 'class MyApp extends StatelessWidget {}', solution: "class MyApp extends StatelessWidget { @override Widget build(BuildContext context) { return MaterialApp(home: Text('Hello')) } }", test: 'true' },
  { title: 'Missing MaterialApp', level: 'beginner', desc: 'App widget not wrapped in MaterialApp.', bug: "void main() { runApp(Text('Hello')) }", solution: "void main() { runApp(MaterialApp(home: Text('Hello'))) }", test: 'true' },
  { title: 'SetState Outside Build', level: 'beginner', desc: 'Calling setState outside State class.', bug: "setState(() { count++ })", solution: "setState(() { count++ })", test: 'true' },
  { title: 'Missing Scaffold', level: 'beginner', desc: 'Body content not wrapped in Scaffold.', bug: "MaterialApp(home: Container(child: Text('Hi')))", solution: "MaterialApp(home: Scaffold(body: Container(child: Text('Hi'))))", test: 'true' },
  { title: 'Flex Expanded Missing', level: 'beginner', desc: 'Row/Column children missing Flexible or Expanded wrapper.', bug: "Row(children: [TextField(), TextField()])", solution: "Row(children: [Expanded(child: TextField()), Expanded(child: TextField())])", test: 'true' },
  { title: 'ListView Builder Missing', level: 'intermediate', desc: 'Using ListView with all children instead of ListView.builder for large lists.', bug: "ListView(children: items.map((i) => ListTile(title: Text(i))).toList())", solution: "ListView.builder(itemCount: items.length, itemBuilder: (ctx, i) => ListTile(title: Text(items[i])))", test: 'true' },
  { title: 'Async InitState', level: 'intermediate', desc: 'initState with async operation but no handling.', bug: "@override void initState() { fetchData() }", solution: "@override void initState() { super.initState(); fetchData().then((d) => setState(() => data = d)) }", test: 'true' },
  { title: 'Context After Dispose', level: 'expert', desc: 'Using BuildContext after widget is disposed.', bug: "Future.delayed(Duration(seconds: 3), () => Navigator.push(context, route))", solution: "Future.delayed(Duration(seconds: 3), () => { if (mounted) Navigator.push(context, route) })", test: 'true' },
  { title: 'Stateful Widget Constructor', level: 'beginner', desc: 'Stateful widget missing createState override.', bug: "class CounterWidget extends StatefulWidget { const CounterWidget(); }", solution: "class CounterWidget extends StatefulWidget { const CounterWidget(); @override State<CounterWidget> createState() => _CounterWidgetState() }", test: 'true' },
  { title: 'Missing Const Constructor', level: 'beginner', desc: 'Widget missing const constructor preventing performance optimization.', bug: "class MyWidget extends StatelessWidget { MyWidget() }", solution: "class MyWidget extends StatelessWidget { const MyWidget() }", test: 'true' },
  { title: 'Infinite Scroll Listener', level: 'intermediate', desc: 'ScrollController not disposed causing memory leak.', bug: "class _ListState extends State<MyList> { final scrollController = ScrollController(); }", solution: "class _ListState extends State<MyList> { final scrollController = ScrollController(); @override void dispose() { scrollController.dispose(); super.dispose() } }", test: 'true' },
  { title: 'Text Style Override', level: 'beginner', desc: 'DefaultTextStyle used without proper cascading.', bug: "Text('Hello', style: TextStyle(fontSize: 20))", solution: "Text('Hello', style: const TextStyle(fontSize: 20))", test: 'true' },
  { title: 'Navigator Push Named', level: 'intermediate', desc: 'Navigator.pushNamed used without route registration.', bug: "Navigator.pushNamed(context, '/details')", solution: "MaterialApp(routes: {'/details': (ctx) => DetailsPage()}, home: Home()); Navigator.pushNamed(context, '/details')", test: 'true' },
  { title: 'Stream Subscription', level: 'intermediate', desc: 'Stream subscription not cancelled on dispose.', bug: "stream.listen((data) => setState(() => this.data = data))", solution: "final sub = stream.listen((data) => setState(() => this.data = data)); @override void dispose() { sub.cancel(); super.dispose() }", test: 'true' },
  { title: 'Platform Channel', level: 'expert', desc: 'MethodChannel invoked before being registered.', bug: "final result = await platform.invokeMethod('getBatteryLevel')", solution: "const platform = MethodChannel('app/battery'); final result = await platform.invokeMethod('getBatteryLevel')", test: 'true' },
  { title: 'Form Validation', level: 'intermediate', desc: 'Form submitted without validation check.', bug: "onPressed: () { _formKey.currentState.save() }", solution: "onPressed: () { if (_formKey.currentState.validate()) { _formKey.currentState.save() } }", test: 'true' },
  { title: 'Image Asset Path', level: 'beginner', desc: 'Image asset path missing from pubspec.yaml.', bug: "Image.asset('images/logo.png')", solution: "Image.asset('assets/images/logo.png') // Ensure assets/images/ is declared in pubspec.yaml", test: 'true' },
  { title: 'PageView Controller', level: 'intermediate', desc: 'PageController not disposed.', bug: "final controller = PageController()", solution: "final controller = PageController(); @override void dispose() { controller.dispose(); super.dispose() }", test: 'true' },
];

// 4. Game Engines (Unity / C#, Unreal / C++, Godot / GDScript)
const gameEngineTemplates = [
  { title: 'Missing MonoBehaviour', level: 'beginner', desc: 'Script does not extend MonoBehaviour.', bug: 'public class PlayerController {}', solution: 'public class PlayerController : MonoBehaviour {}', test: 'true' },
  { title: 'Start vs Awake', level: 'beginner', desc: 'Using Start when Awake is needed for initialization order.', bug: 'void Start() { instance = this }', solution: 'void Awake() { instance = this }', test: 'true' },
  { title: 'Update Delta Time', level: 'beginner', desc: 'Movement not multiplied by delta time causing frame-rate dependent speed.', bug: 'transform.Translate(Vector3.forward * speed)', solution: 'transform.Translate(Vector3.forward * speed * Time.deltaTime)', test: 'true' },
  { title: 'Missing Collider', level: 'beginner', desc: 'OnCollisionEnter not triggered because collider is missing.', bug: 'void OnCollisionEnter(Collision col) { Destroy(gameObject) }', solution: 'void OnCollisionEnter(Collision col) { Destroy(gameObject) } // Add Collider component to GameObject', test: 'true' },
  { title: 'Instantiate Prefab', level: 'beginner', desc: 'Instantiate used without a prefab reference.', bug: 'Instantiate(bulletObject)', solution: 'public GameObject bulletPrefab; Instantiate(bulletPrefab, spawnPos, Quaternion.identity)', test: 'true' },
  { title: 'Destroy in Collision', level: 'beginner', desc: 'Destroying wrong object in collision.', bug: 'void OnTriggerEnter(Collider other) { Destroy(this) }', solution: 'void OnTriggerEnter(Collider other) { Destroy(gameObject) }', test: 'true' },
  { title: 'Input GetKey', level: 'beginner', desc: 'Using GetKey instead of GetAxis for smooth movement.', bug: 'if (Input.GetKey("w")) MoveForward()', solution: 'float h = Input.GetAxis("Horizontal"); float v = Input.GetAxis("Vertical")', test: 'true' },
  { title: 'FindGameObject', level: 'intermediate', desc: 'Using FindGameObjectInUpdate causing performance issues.', bug: 'void Update() { GameObject player = GameObject.Find("Player") }', solution: 'GameObject player; void Start() { player = GameObject.Find("Player") }', test: 'true' },
  { title: 'Coroutine Start', level: 'intermediate', desc: 'Coroutine method called directly instead of via StartCoroutine.', bug: 'void Start() { WaitAndPrint() }', solution: 'void Start() { StartCoroutine(WaitAndPrint()) }', test: 'true' },
  { title: 'Raycast Hit Check', level: 'beginner', desc: 'Raycast result used without checking if hit occurred.', bug: 'RaycastHit hit; Physics.Raycast(ray, out hit); Debug.Log(hit.collider.name)', solution: 'RaycastHit hit; if (Physics.Raycast(ray, out hit)) { Debug.Log(hit.collider.name) }', test: 'true' },
  { title: 'Transform Parent', level: 'beginner', desc: 'Setting transform parent incorrectly.', bug: 'child.transform.parent.transform.SetParent(parentTransform)', solution: 'child.transform.SetParent(parentTransform)', test: 'true' },
  { title: 'Physics2D vs Physics', level: 'beginner', desc: 'Using Physics for 2D game objects.', bug: 'Physics2D.Raycast(transform.position, Vector2.right)', solution: 'Physics2D.Raycast(transform.position, Vector2.right)', test: 'true' },
  { title: 'FixedUpdate vs Update', level: 'beginner', desc: 'Physics calculations in Update instead of FixedUpdate.', bug: 'void Update() { rb.AddForce(Vector3.up * force) }', solution: 'void FixedUpdate() { rb.AddForce(Vector3.up * force) }', test: 'true' },
  { title: 'Scene Load', level: 'beginner', desc: 'Scene loaded by name without Build Settings inclusion.', bug: 'SceneManager.LoadScene("Level2")', solution: 'SceneManager.LoadScene(1) // Ensure Level2 is in Build Settings', test: 'true' },
  { title: 'Quaternion Look Rotation', level: 'intermediate', desc: 'Using Euler angles for rotation instead of Quaternion.', bug: 'transform.rotation = new Vector3(0, 90, 0)', solution: 'transform.rotation = Quaternion.Euler(0, 90, 0)', test: 'true' },
  { title: 'Serialize Field', level: 'beginner', desc: 'Private field not visible in inspector.', bug: 'private float speed = 5f', solution: '[SerializeField] private float speed = 5f', test: 'true' },
  { title: 'Animation Parameter', level: 'intermediate', desc: 'Animator parameter name typo fails silently.', bug: 'animator.SetBool("isRunningg", true)', solution: 'animator.SetBool("isRunning", true)', test: 'true' },
  { title: 'Audio Source Play', level: 'beginner', desc: 'Audio clip played without AudioSource component.', bug: 'AudioSource.PlayClipAtPoint(clip, pos)', solution: 'GetComponent<AudioSource>().Play()', test: 'true' },
  { title: 'Object Pooling Missing', level: 'expert', desc: 'Instantiating and destroying objects frequently instead of pooling.', bug: 'void Fire() { var b = Instantiate(bullet); StartCoroutine(DelayedDestroy(b)) }', solution: 'var b = pool.Get(); b.SetActive(true); b.GetComponent<Bullet>().Fire()', test: 'true' },
  { title: 'Layer-based Collision', level: 'intermediate', desc: 'Missing layer-based collision filtering.', bug: 'Physics.IgnoreLayerCollision(8, 9, false)', solution: 'Physics.IgnoreLayerCollision(8, 9, true) // Prevent player-bullet collision on same team', test: 'true' },
  { title: 'NavMesh Agent Destination', level: 'intermediate', desc: 'NavMeshAgent destination set but not started.', bug: 'agent.destination = target.position', solution: 'agent.SetDestination(target.position); agent.isStopped = false', test: 'true' },
];

// 5. Databases (MongoDB, Redis, Prisma, PostgreSQL, MySQL, SQLite)
const databaseTemplates = [
  { title: 'Missing Connection String', level: 'beginner', desc: 'Database connection string is not configured.', bug: 'const client = new MongoClient()', solution: 'const client = new MongoClient("mongodb://localhost:27017/mydb")', test: 'true' },
  { title: 'Missing Error Handling', level: 'beginner', desc: 'Database query without try/catch error handling.', bug: 'const result = await db.query("SELECT * FROM users")', solution: 'try { const result = await db.query("SELECT * FROM users") } catch (err) { console.error(err) }', test: 'true' },
  { title: 'SQL Injection', level: 'expert', desc: 'User input concatenated directly into SQL query.', bug: 'db.query("SELECT * FROM users WHERE id = " + userId)', solution: 'db.query("SELECT * FROM users WHERE id = $1", [userId])', test: 'true' },
  { title: 'Missing Index', level: 'intermediate', desc: 'Query on unindexed column causing full table scan.', bug: 'CREATE TABLE users (id INT, email TEXT); SELECT * FROM users WHERE email = "test@test.com"', solution: 'CREATE INDEX idx_email ON users(email)', test: 'true' },
  { title: 'Connection Not Closed', level: 'beginner', desc: 'Database connection not closed after operations.', bug: 'const conn = await pool.getConnection(); const result = await conn.query("SELECT 1")', solution: 'const conn = await pool.getConnection(); const result = await conn.query("SELECT 1"); conn.release()', test: 'true' },
  { title: 'Transaction Not Committed', level: 'intermediate', desc: 'Transaction started but never committed.', bug: 'await db.query("BEGIN"); await db.query("UPDATE accounts SET balance = balance - 100 WHERE id = 1")', solution: 'await db.query("BEGIN"); try { await db.query("UPDATE..."); await db.query("COMMIT") } catch(e) { await db.query("ROLLBACK") }', test: 'true' },
  { title: 'Missing WHERE in DELETE', level: 'beginner', desc: 'DELETE statement without WHERE clause deletes all rows.', bug: 'DELETE FROM users', solution: 'DELETE FROM users WHERE id = 1', test: 'true' },
  { title: 'Join Without ON', level: 'beginner', desc: 'JOIN without ON clause causes cross join.', bug: 'SELECT * FROM users JOIN orders', solution: 'SELECT * FROM users JOIN orders ON users.id = orders.user_id', test: 'true' },
  { title: 'Null Comparison', level: 'beginner', desc: 'Using = instead of IS NULL for null comparisons.', bug: 'SELECT * FROM users WHERE email = NULL', solution: 'SELECT * FROM users WHERE email IS NULL', test: 'true' },
  { title: 'Group By Without Aggregate', level: 'beginner', desc: 'Column in SELECT not in GROUP BY or aggregate function.', bug: 'SELECT name, age FROM users GROUP BY name', solution: 'SELECT name, MAX(age) FROM users GROUP BY name', test: 'true' },
  { title: 'Missing Prisma Migrate', level: 'beginner', desc: 'Prisma schema changed but migration not applied.', bug: 'model User { id Int @id @default(autoincrement()) name String }', solution: 'npx prisma migrate dev --name add_user', test: 'true' },
  { title: 'Prisma Raw Query', level: 'intermediate', desc: 'Using raw queries instead of Prisma ORM methods.', bug: "const users = await prisma.$queryRaw('SELECT * FROM users')", solution: "const users = await prisma.user.findMany()", test: 'true' },
  { title: 'Redis Key Expiry', level: 'beginner', desc: 'Redis key set without TTL causing expired data to persist.', bug: 'await redis.set("session:123", JSON.stringify(data))', solution: 'await redis.setex("session:123", 3600, JSON.stringify(data))', test: 'true' },
  { title: 'Redis Connection Pool', level: 'intermediate', desc: 'Creating new Redis client for every request.', bug: 'app.get("/", async (req, res) => { const redis = new Redis(); const val = await redis.get("key") })', solution: 'const redis = new Redis(); app.get("/", async (req, res) => { const val = await redis.get("key") })', test: 'true' },
  { title: 'Prisma Include', level: 'beginner', desc: 'Related data not included in query causing N+1.', bug: 'const posts = await prisma.post.findMany(); posts.forEach(p => console.log(p.author))', solution: 'const posts = await prisma.post.findMany({ include: { author: true } })', test: 'true' },
  { title: 'Unique Constraint', level: 'intermediate', desc: 'Inserting duplicate value into unique column.', bug: 'INSERT INTO users (email) VALUES ("same@test.com"); INSERT INTO users (email) VALUES ("same@test.com")', solution: 'INSERT INTO users (email) VALUES ("unique@test.com") ON CONFLICT (email) DO NOTHING', test: 'true' },
  { title: 'Redis Pipeline', level: 'expert', desc: 'Multiple Redis commands sent individually instead of pipelined.', bug: 'await redis.set("a", 1); await redis.set("b", 2); await redis.get("a")', solution: 'const p = redis.pipeline(); p.set("a", 1); p.set("b", 2); p.get("a"); await p.exec()', test: 'true' },
  { title: 'MongoDB Unwind', level: 'intermediate', desc: 'Aggregation pipeline missing $unwind step for arrays.', bug: 'db.posts.aggregate([{ $group: { _id: "$category", tags: { $push: "$tags" } } }])', solution: 'db.posts.aggregate([{ $unwind: "$tags" }, { $group: { _id: "$category", tags: { $addToSet: "$tags" } } }])', test: 'true' },
  { title: 'MongoDB Projection', level: 'beginner', desc: 'Fetching all fields when only specific fields are needed.', bug: 'db.users.find({ role: "admin" })', solution: 'db.users.find({ role: "admin" }, { name: 1, email: 1 })', test: 'true' },
  { title: 'Data Type Mismatch', level: 'beginner', desc: 'Inserting wrong data type into column.', bug: 'INSERT INTO products (price) VALUES ("19.99")', solution: 'INSERT INTO products (price) VALUES (19.99)', test: 'true' },
];

// 6. Dev Tools (Git, Docker, K8s, Terraform)
const devToolTemplates = [
  { title: 'Missing .dockerignore', level: 'beginner', desc: 'Docker build includes unnecessary files without .dockerignore.', bug: 'FROM node:18\nCOPY . /app', solution: 'FROM node:18\nCOPY . /app\n# Also create .dockerignore: node_modules, .git', test: 'true' },
  { title: 'Docker Expose Missing', level: 'beginner', desc: 'Container port not exposed in Dockerfile.', bug: 'FROM node:18\nCMD ["node", "server.js"]', solution: 'FROM node:18\nEXPOSE 3000\nCMD ["node", "server.js"]', test: 'true' },
  { title: 'Docker Compose Volume', level: 'beginner', desc: 'Named volume used without declaration.', bug: 'services:\n  db:\n    volumes:\n      - dbdata:/var/lib/postgresql/data', solution: 'services:\n  db:\n    volumes:\n      - dbdata:/var/lib/postgresql/data\nvolumes:\n  dbdata:', test: 'true' },
  { title: 'Docker Layer Caching', level: 'intermediate', desc: 'package.json copied after source files, breaking layer caching.', bug: 'COPY . /app\nRUN npm install', solution: 'COPY package.json /app/\nRUN npm install\nCOPY . /app/', test: 'true' },
  { title: 'Docker Multi-stage', level: 'intermediate', desc: 'Single-stage build includes dev dependencies in production image.', bug: 'FROM node:18\nCOPY . .\nRUN npm install\nRUN npm run build\nCMD ["node", "dist/server.js"]', solution: 'FROM node:18 AS builder\nCOPY . .\nRUN npm install\nRUN npm run build\nFROM node:18-alpine\nCOPY --from=builder /app/dist ./dist\nCMD ["node", "dist/server.js"]', test: 'true' },
  { title: 'K8s Resource Limits', level: 'beginner', desc: 'Pod missing resource requests and limits.', bug: 'apiVersion: v1\nkind: Pod\nspec:\n  containers:\n  - name: app\n    image: nginx', solution: "apiVersion: v1\nkind: Pod\nspec:\n  containers:\n  - name: app\n    image: nginx\n    resources:\n      requests:\n        memory: '64Mi'\n        cpu: '250m'\n      limits:\n        memory: '128Mi'\n        cpu: '500m'", test: 'true' },
  { title: 'K8s Liveness Probe', level: 'intermediate', desc: 'Pod missing health check probes.', bug: 'apiVersion: v1\nkind: Pod\nspec:\n  containers:\n  - name: app\n    image: myapp', solution: "apiVersion: v1\nkind: Pod\nspec:\n  containers:\n  - name: app\n    image: myapp\n    livenessProbe:\n      httpGet:\n        path: /health\n        port: 8080\n      initialDelaySeconds: 3\n      periodSeconds: 5", test: 'true' },
  { title: 'Git Commit Message', level: 'beginner', desc: 'Git commit with no message.', bug: 'git commit', solution: 'git commit -m "feat: add user authentication"', test: 'true' },
  { title: 'Git Branch Merge', level: 'beginner', desc: 'Merging without being on target branch.', bug: 'git merge feature', solution: 'git checkout main && git merge feature', test: 'true' },
  { title: 'Git Rebase Interactive', level: 'intermediate', desc: 'Rebasing without interactive mode loses squash opportunity.', bug: 'git rebase main', solution: 'git rebase -i main', test: 'true' },
  { title: 'Git Stash Pop', level: 'beginner', desc: 'Stash applied but not popped, leaving stash list.', bug: 'git stash apply', solution: 'git stash pop', test: 'true' },
  { title: 'Terraform State Lock', level: 'beginner', desc: 'Terraform apply without state locking risks corruption.', bug: 'terraform apply', solution: 'terraform apply -lock=true', test: 'true' },
  { title: 'Terraform Variable Type', level: 'beginner', desc: 'Variable declared without type constraint.', bug: 'variable "region" {}', solution: 'variable "region" { type = string default = "us-east-1" }', test: 'true' },
  { title: 'Terraform Backend', level: 'intermediate', desc: 'Terraform state stored locally instead of remote.', bug: 'terraform { required_version = ">= 1.0" }', solution: 'terraform { backend "s3" { bucket = "my-state" key = "prod/terraform.tfstate" region = "us-east-1" } }', test: 'true' },
  { title: 'Docker Compose Depends', level: 'beginner', desc: 'Service dependency without health check waiting.', bug: 'services:\n  web:\n    depends_on:\n      - db\n  db:\n    image: postgres', solution: 'services:\n  web:\n    depends_on:\n      db:\n        condition: service_healthy\n  db:\n    image: postgres\n    healthcheck:\n      test: ["CMD-SHELL", "pg_isready"]\n      interval: 5s', test: 'true' },
  { title: 'K8s ConfigMap', level: 'beginner', desc: 'Environment variable hardcoded instead of using ConfigMap.', bug: 'env:\n  - name: DB_HOST\n    value: "localhost"', solution: 'env:\n  - name: DB_HOST\n    valueFrom:\n      configMapKeyRef:\n        name: app-config\n        key: db_host', test: 'true' },
];

// 7. Bundlers (Webpack, Vite)
const bundlerTemplates = [
  { title: 'Missing Entry Point', level: 'beginner', desc: 'Webpack config missing entry point.', bug: 'module.exports = { output: { filename: "bundle.js" } }', solution: 'module.exports = { entry: "./src/index.js", output: { filename: "bundle.js" } }', test: 'true' },
  { title: 'Missing Loader', level: 'beginner', desc: 'CSS import fails because style-loader is missing.', bug: 'import "./styles.css"', solution: 'module.exports = { module: { rules: [{ test: /\\.css$/, use: ["style-loader", "css-loader"] }] } }', test: 'true' },
  { title: 'HtmlWebpackPlugin Missing', level: 'beginner', desc: 'No HTML file generated for SPA.', bug: 'module.exports = { entry: "./src/index.js" }', solution: 'const HtmlWebpackPlugin = require("html-webpack-plugin"); module.exports = { plugins: [new HtmlWebpackPlugin({ template: "./src/index.html" })] }', test: 'true' },
  { title: 'Mode Not Set', level: 'beginner', desc: 'Webpack mode not set, defaults to production.', bug: 'module.exports = { entry: "./src/index.js" }', solution: 'module.exports = { mode: "development", entry: "./src/index.js", devtool: "source-map" }', test: 'true' },
  { title: 'Code Splitting Missing', level: 'intermediate', desc: 'Single bundle instead of code splitting for large app.', bug: 'module.exports = { entry: "./src/index.js", output: { filename: "bundle.js" } }', solution: 'module.exports = { entry: { main: "./src/index.js", admin: "./src/admin.js" }, output: { filename: "[name].bundle.js" } }', test: 'true' },
  { title: 'Dev Server Config', level: 'beginner', desc: 'Webpack-dev-server missing port configuration.', bug: 'module.exports = { devServer: {} }', solution: 'module.exports = { devServer: { port: 3000, hot: true, historyApiFallback: true } }', test: 'true' },
  { title: 'Vite Config Missing', level: 'beginner', desc: 'Vite config missing for SPA with routing.', bug: 'export default defineConfig({})', solution: 'export default defineConfig({ plugins: [react()], server: { port: 3000 } })', test: 'true' },
  { title: 'Vite Base Path', level: 'beginner', desc: 'Vite build base path not set for subdirectory deployment.', bug: 'export default defineConfig({})', solution: 'export default defineConfig({ base: "/my-app/" })', test: 'true' },
  { title: 'CSS Extraction', level: 'intermediate', desc: 'CSS in JS bundle instead of extracted file for production.', bug: 'module.exports = { module: { rules: [{ test: /\\.css$/, use: ["style-loader", "css-loader"] }] } }', solution: 'const MiniCssExtractPlugin = require("mini-css-extract-plugin"); module.exports = { module: { rules: [{ test: /\\.css$/, use: [MiniCssExtractPlugin.loader, "css-loader"] }] }, plugins: [new MiniCssExtractPlugin()] }', test: 'true' },
  { title: 'Babel Config Missing', level: 'beginner', desc: 'JSX not transpiled because babel-loader is missing.', bug: 'module.exports = { module: { rules: [{ test: /\\.js$/, use: ["babel-loader"] }] } }', solution: 'module.exports = { module: { rules: [{ test: /\\.jsx?$/, exclude: /node_modules/, use: { loader: "babel-loader", options: { presets: ["@babel/preset-env", "@babel/preset-react"] } } }] } }', test: 'true' },
  { title: 'Tree Shaking Disabled', level: 'expert', desc: 'Tree shaking not working due to sideEffects: false missing.', bug: '{ "name": "my-lib", "main": "index.js" }', solution: '{ "name": "my-lib", "sideEffects": false, "module": "index.js" }', test: 'true' },
  { title: 'Env Variables', level: 'intermediate', desc: 'Environment variables not available in Vite.', bug: 'console.log(process.env.API_KEY)', solution: 'console.log(import.meta.env.VITE_API_KEY)', test: 'true' },
];

// 8. CSS Frameworks (Tailwind, Bootstrap)
const cssFrameworkTemplates = [
  { title: 'Missing Tailwind Import', level: 'beginner', desc: 'Tailwind directives not imported in CSS.', bug: '.btn { @apply px-4 py-2 }', solution: '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n.btn { @apply px-4 py-2 }', test: 'true' },
  { title: 'Wrong Class Order', level: 'beginner', desc: 'Tailwind classes in wrong order affecting specificity.', bug: 'class="text-lg px-4 text-red-500 font-bold"', solution: 'class="text-red-500 font-bold text-lg px-4"', test: 'true' },
  { title: 'Responsive Prefix', level: 'beginner', desc: 'Responsive variant missing breakpoint prefix.', bug: 'class="grid grid-cols-1 grid-cols-2"', solution: 'class="grid grid-cols-1 md:grid-cols-2"', test: 'true' },
  { title: 'Custom Color Missing', level: 'beginner', desc: 'Using custom color not defined in tailwind.config.', bug: 'class="bg-brand-blue"', solution: '// tailwind.config.js: { theme: { extend: { colors: { brand: { blue: "#1da1f2" } } } } }\nclass="bg-brand-blue"', test: 'true' },
  { title: 'Dark Mode Config', level: 'beginner', desc: 'Dark mode variants not working without config.', bug: 'class="bg-white dark:bg-gray-800"', solution: '// tailwind.config.js: { darkMode: "class" }\n// Add class="dark" to html element\nclass="bg-white dark:bg-gray-800"', test: 'true' },
  { title: 'Bootstrap Grid', level: 'beginner', desc: 'Grid columns not wrapped in container/row.', bug: '<div class="col-md-6">Content</div>', solution: '<div class="container"><div class="row"><div class="col-md-6">Content</div></div></div>', test: 'true' },
  { title: 'Bootstrap JS Components', level: 'beginner', desc: 'Bootstrap JavaScript features not initialized.', bug: '<div class="dropdown"><button class="btn dropdown-toggle">Menu</button></div>', solution: '<div class="dropdown"><button class="btn dropdown-toggle" data-bs-toggle="dropdown">Menu</button><ul class="dropdown-menu">...</ul></div>', test: 'true' },
  { title: 'Tailwind JIT Mode', level: 'beginner', desc: 'Classes built dynamically not discovered by JIT compiler.', bug: 'const className = `bg-${color}-500`', solution: 'const className = color === "red" ? "bg-red-500" : color === "blue" ? "bg-blue-500" : "bg-gray-500"', test: 'true' },
  { title: 'Bootstrap Breakpoints', level: 'beginner', desc: 'Missing responsive breakpoint classes for mobile.', bug: '<div class="col-6">Content</div>', solution: '<div class="col-12 col-md-6">Content</div>', test: 'true' },
  { title: 'Custom Bootstrap Theme', level: 'intermediate', desc: 'Bootstrap variables overridden without recompilation.', bug: '$primary: #ff0000;\n@import "bootstrap";', solution: '$primary: #ff0000;\n@import "bootstrap";\n// Ensure custom.scss is compiled, not the default bootstrap.css', test: 'true' },
  { title: 'Tailwind Content Paths', level: 'beginner', desc: 'Tailwind scanning wrong paths for class discovery.', bug: 'module.exports = { content: [] }', solution: 'module.exports = { content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"] }', test: 'true' },
  { title: 'Bootstrap Icons', level: 'beginner', desc: 'Bootstrap icons not imported/configured.', bug: '<i class="bi bi-heart"></i>', solution: '@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1/font/bootstrap-icons.css");\n<i class="bi bi-heart"></i>', test: 'true' },
];

// 9. Testing (Cypress, Playwright)
const testingTemplates = [
  { title: 'Missing Assertion', level: 'beginner', desc: 'Test has no assertion, will always pass.', bug: 'it("should work", () => { cy.visit("/") })', solution: 'it("should work", () => { cy.visit("/"); cy.contains("Welcome").should("be.visible") })', test: 'true' },
  { title: 'Hardcoded Wait', level: 'beginner', desc: 'Using cy.wait with hardcoded delay instead of waiting for element.', bug: 'cy.wait(3000); cy.get(".result")', solution: 'cy.get(".result", { timeout: 5000 }).should("be.visible")', test: 'true' },
  { title: 'Cypress Fixture', level: 'beginner', desc: 'Mock data inline instead of using fixture file.', bug: 'cy.intercept("GET", "/api/users", [{ id: 1, name: "John" }])', solution: 'cy.fixture("users.json").then((users) => { cy.intercept("GET", "/api/users", users) })', test: 'true' },
  { title: 'Page Object Missing', level: 'intermediate', desc: 'Duplicate selectors across tests instead of page objects.', bug: 'cy.get("[data-test=submit]").click(); cy.get("[data-test=submit]").should("be.disabled")', solution: '// pages/LoginPage.js: class LoginPage { get submitBtn() { return cy.get("[data-test=submit]") } }', test: 'true' },
  { title: 'Playwright Locator', level: 'beginner', desc: 'Using page.$ instead of locator-based approach.', bug: 'const el = await page.$(".submit")', solution: 'const locator = page.locator(".submit"); await locator.click()', test: 'true' },
  { title: 'Cross-browser Testing', level: 'intermediate', desc: 'Running tests only in Chromium, missing Firefox/Webkit.', bug: 'npx playwright test --project=chromium', solution: 'npx playwright test --project=chromium --project=firefox --project=webkit', test: 'true' },
  { title: 'Screenshot on Failure', level: 'beginner', desc: 'Screenshot not captured on test failure.', bug: 'test("my test", async ({ page }) => { await page.goto("/") })', solution: 'test("my test", async ({ page }) => { await page.goto("/") }) // Configure playwright.config: screenshot: "only-on-failure"', test: 'true' },
  { title: 'API Mocking', level: 'intermediate', desc: 'Network request not intercepted causing flaky tests.', bug: 'await page.goto("/users"); const text = await page.textContent(".user-list")', solution: 'await page.route("**/api/users", route => route.fulfill({ json: mockUsers })); await page.goto("/users")', test: 'true' },
  { title: 'Test Isolation', level: 'beginner', desc: 'Tests share state causing order-dependent failures.', bug: 'let count = 0; test("first", () => { count = 1 }); test("second", () => { expect(count).toBe(0) })', solution: 'beforeEach(() => { count = 0 })', test: 'true' },
  { title: 'E2E vs Unit', level: 'beginner', desc: 'Using E2E test for pure logic function instead of unit test.', bug: 'it("adds numbers", () => { cy.visit("/calc"); cy.get("#result").should("have.text", "5") })', solution: 'it("adds numbers", () => { expect(add(2, 3)).toBe(5) })', test: 'true' },
  { title: 'Custom Command', level: 'intermediate', desc: 'Repeated login logic not extracted as custom command.', bug: 'cy.get("[name=email]").type("user@test.com"); cy.get("[name=password]").type("pass123"); cy.get("[type=submit]").click()', solution: 'Cypress.Commands.add("login", (email, pass) => { cy.get("[name=email]").type(email); cy.get("[name=password]").type(pass); cy.get("[type=submit]").click() })', test: 'true' },
  { title: 'Network Idle', level: 'intermediate', desc: 'Test continues before page finishes loading network requests.', bug: 'await page.goto("/dashboard"); await page.screenshot()', solution: 'await page.goto("/dashboard", { waitUntil: "networkidle" }); await page.screenshot()', test: 'true' },
];

// 10. Cloud Services (AWS, Azure, GCP, Firebase, Cloud)
const cloudServiceTemplates = [
  { title: 'Missing Region Config', level: 'beginner', desc: 'AWS SDK not configured with region.', bug: 'const s3 = new AWS.S3()', solution: 'AWS.config.update({ region: "us-east-1" }); const s3 = new AWS.S3()', test: 'true' },
  { title: 'IAM Permissions Missing', level: 'beginner', desc: 'S3 bucket operation fails without proper IAM policy.', bug: 's3.putObject({ Bucket: "my-bucket", Key: "file.txt", Body: "data" })', solution: '// IAM policy: { "Effect": "Allow", "Action": "s3:PutObject", "Resource": "arn:aws:s3:::my-bucket/*" }', test: 'true' },
  { title: 'S3 Bucket Public Access', level: 'intermediate', desc: 'S3 bucket publicly accessible instead of using signed URLs.', bug: 's3.putBucketPolicy({ Policy: publicPolicy })', solution: 'const url = s3.getSignedUrl("getObject", { Bucket: "my-bucket", Key: "file.pdf", Expires: 3600 })', test: 'true' },
  { title: 'Lambda Handler Signature', level: 'beginner', desc: 'Lambda handler missing required callback parameter.', bug: 'exports.handler = async (event) => { return { statusCode: 200 } }', solution: 'exports.handler = async (event, context) => { return { statusCode: 200, body: JSON.stringify({ message: "OK" }) } }', test: 'true' },
  { title: 'Lambda Timeout', level: 'beginner', desc: 'Lambda default 3s timeout too short for operation.', bug: '// Lambda config: timeout 3 seconds', solution: '// Lambda config: timeout 30 seconds (for long-running operations)', test: 'true' },
  { title: 'Cloud Storage CORS', level: 'beginner', desc: 'GCP Cloud Storage bucket missing CORS config.', bug: 'gsutil cors set cors.json gs://my-bucket', solution: '[{"origin": ["https://example.com"], "method": ["GET"], "responseHeader": ["Content-Type"], "maxAgeSeconds": 3600}]', test: 'true' },
  { title: 'Firestore Document Ref', level: 'beginner', desc: 'Firestore document path is incorrect.', bug: 'db.collection("users").doc(123).get()', solution: 'db.collection("users").doc("123").get() // Firestore doc IDs are strings', test: 'true' },
  { title: 'Firebase Auth Check', level: 'beginner', desc: 'Firebase auth state not checked before accessing user data.', bug: 'const uid = auth.currentUser.uid', solution: 'const user = auth.currentUser; if (user) { const uid = user.uid } else { // redirect to login }', test: 'true' },
  { title: 'Cloud Function Trigger', level: 'beginner', desc: 'Cloud Function triggered on wrong event type.', bug: 'exports.processFile = functions.storage.object().onFinalize(async (object) => {})', solution: 'exports.processFile = functions.storage.bucket("uploads").object().onArchive(async (object) => {})', test: 'true' },
  { title: 'Azure Blob Connection', level: 'beginner', desc: 'Azure Blob Storage connection string missing.', bug: 'const container = new ContainerClient()', solution: 'const container = new ContainerClient("DefaultEndpointsProtocol=https;AccountName=mystorage;AccountKey=key;EndpointSuffix=core.windows.net", containerName)', test: 'true' },
  { title: 'GCP Service Account', level: 'beginner', desc: 'GCP service account key not set in environment.', bug: 'const storage = new Storage()', solution: 'const storage = new Storage({ keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS })', test: 'true' },
  { title: 'AWS SQS Queue URL', level: 'beginner', desc: 'SQS message sent without queue URL.', bug: 'sqs.sendMessage({ MessageBody: "test" })', solution: 'sqs.sendMessage({ QueueUrl: "https://sqs.us-east-1.amazonaws.com/123456789/MyQueue", MessageBody: "test" })', test: 'true' },
  { title: 'CloudWatch Logging', level: 'intermediate', desc: 'Lambda not logging structured JSON to CloudWatch.', bug: 'console.log("User logged in:", userId)', solution: 'console.log(JSON.stringify({ event: "user_login", userId, timestamp: Date.now() }))', test: 'true' },
  { title: 'Secrets Manager', level: 'intermediate', desc: 'API key hardcoded in code instead of Secrets Manager.', bug: 'const API_KEY = "sk-abc123"', solution: 'const secrets = new SecretsManager(); const secret = await secrets.getSecretValue({ SecretId: "prod/api-key" }).promise(); const API_KEY = secret.SecretString', test: 'true' },
  { title: 'Auto Scaling Config', level: 'intermediate', desc: 'EC2 auto scaling group missing min/max limits.', bug: 'const asg = new AutoScalingGroup({ DesiredCapacity: 2 })', solution: 'const asg = new AutoScalingGroup({ MinSize: 1, MaxSize: 10, DesiredCapacity: 2 })', test: 'true' },
  { title: 'Load Balancer Health', level: 'beginner', desc: 'ELB health check pointing to wrong path.', bug: 'HealthCheck: { Target: "HTTP:80/" }', solution: 'HealthCheck: { Target: "HTTP:80/health", HealthyThreshold: 2, UnhealthyThreshold: 3, Interval: 30 }', test: 'true' },
  { title: 'CloudFront Distribution', level: 'beginner', desc: 'CloudFront pointing to S3 bucket without OAI.', bug: 'Origins: [{ DomainName: "my-bucket.s3.amazonaws.com" }]', solution: 'Origins: [{ DomainName: "my-bucket.s3.amazonaws.com", S3OriginConfig: { OriginAccessIdentity: "origin-access-identity/cloudfront/123" } }]', test: 'true' },
  { title: 'Azure Function Bindings', level: 'beginner', desc: 'Azure Function missing input/output bindings.', bug: 'module.exports = async function (context, req) { context.res = { body: "OK" } }', solution: 'module.exports = async function (context, req) { context.bindings.outputBlob = context.req.body; context.res = { body: "OK" } }', test: 'true' },
];

// 11. Concept Tabs (CI/CD, Compiler, Gamedev, Mobile, AI, GraphQL)
const conceptTemplates = [
  { title: 'CI Pipeline Missing Test', level: 'beginner', desc: 'CI pipeline runs build but no test step.', bug: 'jobs:\n  build:\n    steps:\n      - run: npm run build', solution: 'jobs:\n  build:\n    steps:\n      - run: npm ci\n      - run: npm test\n      - run: npm run build', test: 'true' },
  { title: 'CI Artifact Upload', level: 'beginner', desc: 'Build artifacts not saved for later jobs.', bug: 'jobs:\n  build:\n    steps:\n      - run: npm run build\n  deploy:\n    needs: build', solution: 'jobs:\n  build:\n    steps:\n      - run: npm run build\n      - uses: actions/upload-artifact@v3\n        with:\n          name: dist\n          path: dist/\n  deploy:\n    needs: build\n    steps:\n      - uses: actions/download-artifact@v3', test: 'true' },
  { title: 'CD Without Approval', level: 'intermediate', desc: 'Production deployment without manual approval gate.', bug: 'jobs:\n  deploy:\n    environment: production\n    steps:\n      - run: ./deploy.sh', solution: 'jobs:\n  deploy:\n    environment: production\n    steps:\n      - run: ./deploy.sh\n# Add environment protection rule: Required reviewers', test: 'true' },
  { title: 'Compiler Token Missing', level: 'beginner', desc: 'Lexer missing token type for numeric literals.', bug: 'class Lexer { tokenize(input) { return input.split(" ").map(t => ({ type: "WORD", value: t })) } }', solution: "class Lexer { tokenize(input) { const tokens = []; for (const ch of input) { if (/\\d/.test(ch)) { tokens.push({ type: 'NUMBER', value: ch }) } else { tokens.push({ type: 'SYMBOL', value: ch }) } } return tokens } }", test: 'true' },
  { title: 'AST Node Type', level: 'beginner', desc: 'Parser missing AST node type for binary expressions.', bug: 'function parseBinary(left, op, right) { return { left, op, right } }', solution: 'function parseBinary(left, op, right) { return { type: "BinaryExpression", left, operator: op, right } }', test: 'true' },
  { title: 'Code Generator Visit', level: 'intermediate', desc: 'Code generator missing visit method for AST node type.', bug: 'class CodeGen { generate(node) { return this.visit(node) } visit(node) { return "" } }', solution: "class CodeGen { generate(node) { const method = 'visit' + node.type; return this[method](node) } visitLiteral(node) { return node.value } visitBinaryExpression(node) { return `(${this.generate(node.left)} ${node.operator} ${this.generate(node.right)})` } }", test: 'true' },
  { title: 'Game Loop Delta', level: 'beginner', desc: 'Game loop not using delta time for frame-independent movement.', bug: "function update() { player.x += 5 } setInterval(update, 16)", solution: "let last = Date.now(); function update() { const now = Date.now(); const dt = (now - last) / 1000; last = now; player.x += 200 * dt } setInterval(update, 16)", test: 'true' },
  { title: 'Collision Detection', level: 'beginner', desc: 'Basic AABB collision detection logic is inverted.', bug: "function aabbCollision(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y }", solution: "function aabbCollision(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y } // Already correct!", test: 'true' }, // Intentional correct example
  { title: 'Sprite Animation Frame', level: 'beginner', desc: 'Sprite animation not cycling through frames.', bug: "function drawSprite(sprite) { draw(sprite.frames[0], x, y) }", solution: "let currentFrame = 0; let frameTimer = 0; function updateSprite(dt) { frameTimer += dt; if (frameTimer > 0.1) { currentFrame = (currentFrame + 1) % sprite.frames.length; frameTimer = 0 } } function drawSprite(sprite, x, y) { draw(sprite.frames[currentFrame], x, y) }", test: 'true' },
  { title: 'Mobile Viewport Meta', level: 'beginner', desc: 'Mobile viewport meta tag missing for responsive design.', bug: '<head><title>App</title></head>', solution: '<head><meta name="viewport" content="width=device-width, initial-scale=1"><title>App</title></head>', test: 'true' },
  { title: 'Touch Events', level: 'beginner', desc: 'Using click events on mobile instead of touch events.', bug: 'element.addEventListener("click", handler)', solution: 'element.addEventListener("touchstart", handler, { passive: true }); element.addEventListener("click", handler)', test: 'true' },
  { title: 'AI Model Input Shape', level: 'beginner', desc: 'Tensor shape mismatch when feeding data to model.', bug: 'const input = tf.tensor2d([1, 2, 3])', solution: 'const input = tf.tensor2d([[1, 2, 3]]) // Shape must be [1, 3] not [3]', test: 'true' },
  { title: 'Model Compile Missing', level: 'beginner', desc: 'Keras model used without compile step.', bug: 'model = Sequential([Dense(10)]); model.fit(X, y)', solution: 'model = Sequential([Dense(10, activation="relu"), Dense(1)]); model.compile(optimizer="adam", loss="mse"); model.fit(X, y, epochs=10)', test: 'true' },
  { title: 'Data Leakage', level: 'expert', desc: 'Test data used in training preprocessing.', bug: 'scaler = StandardScaler(); X_scaled = scaler.fit_transform(X); X_train, X_test = train_test_split(X_scaled)', solution: 'X_train, X_test = train_test_split(X); scaler = StandardScaler(); X_train_scaled = scaler.fit_transform(X_train); X_test_scaled = scaler.transform(X_test)', test: 'true' },
  { title: 'Overfitting Detection', level: 'intermediate', desc: 'Model trained for too many epochs without validation monitoring.', bug: 'model.fit(X_train, y_train, epochs=100)', solution: 'model.fit(X_train, y_train, epochs=100, validation_data=(X_val, y_val), callbacks=[EarlyStopping(patience=5)])', test: 'true' },
  { title: 'GraphQL Query Missing', level: 'beginner', desc: 'GraphQL query sent without required fields.', bug: 'query { users }', solution: 'query { users { id name email } }', test: 'true' },
  { title: 'GraphQL Resolver', level: 'beginner', desc: 'GraphQL resolver missing for a defined field.', bug: 'type Query { user(id: ID!): User }', solution: 'const resolvers = { Query: { user: async (_, { id }) => await User.findById(id) } }', test: 'true' },
  { title: 'GraphQL Mutation', level: 'beginner', desc: 'Mutation defined without input type.', bug: 'type Mutation { createUser(name: String, email: String): User }', solution: 'input CreateUserInput { name: String! email: String! } type Mutation { createUser(input: CreateUserInput!): User }', test: 'true' },
  { title: 'GraphQL N+1', level: 'intermediate', desc: 'GraphQL resolver causing N+1 database queries.', bug: 'Post: { comments: (post) => Comment.findAll({ where: { postId: post.id } }) }', solution: '// Use DataLoader: const commentLoader = new DataLoader(keys => Comment.findAll({ where: { postId: { [Op.in]: keys } } })); Post: { comments: (post) => commentLoader.load(post.id) }', test: 'true' },
  { title: 'GraphQL Subscription', level: 'intermediate', desc: 'GraphQL subscription missing pubsub implementation.', bug: 'type Subscription { messageAdded: Message }', solution: 'const pubsub = new PubSub(); Subscription: { messageAdded: { subscribe: () => pubsub.asyncIterator(["MESSAGE_ADDED"]) } }', test: 'true' },
];

// Map languages to category generator functions
const langMap = {
  // Web Frameworks
  react: webFrameworkTemplates, vue: webFrameworkTemplates, angular: webFrameworkTemplates,
  svelte: webFrameworkTemplates, next: webFrameworkTemplates, nuxt: webFrameworkTemplates,
  sveltekit: webFrameworkTemplates, remix: webFrameworkTemplates,
  // Backend Frameworks
  express: backendFrameworksTemplates, node: backendFrameworksTemplates,
  django: backendFrameworksTemplates, flask: backendFrameworksTemplates,
  fastapi: backendFrameworksTemplates, rails: backendFrameworksTemplates,
  spring: backendFrameworksTemplates,
  // Mobile
  flutter: mobileTemplates, rnative: mobileTemplates,
  // Game Engines
  unity: gameEngineTemplates, unreal: gameEngineTemplates, godot: gameEngineTemplates,
  // Databases
  mongodb: databaseTemplates, redis: databaseTemplates, prisma: databaseTemplates,
  pg: databaseTemplates, mysql: databaseTemplates, sqlite: databaseTemplates,
  // Dev Tools
  git: devToolTemplates, dk: devToolTemplates, docker: devToolTemplates,
  k8s: devToolTemplates, terraform: devToolTemplates,
  // Bundlers
  webpack: bundlerTemplates, vite: bundlerTemplates,
  // CSS
  tailwind: cssFrameworkTemplates, bootstrap: cssFrameworkTemplates,
  // Testing
  cypress: testingTemplates, playwright: testingTemplates,
  // Cloud
  aws: cloudServiceTemplates, azure: cloudServiceTemplates,
  gcp: cloudServiceTemplates, firebase: cloudServiceTemplates,
  cloud: cloudServiceTemplates,
  // Concept Tabs
  cicd: conceptTemplates, compiler: conceptTemplates,
  gamedev: conceptTemplates, mobile: conceptTemplates,
  ai: conceptTemplates,  graphql: conceptTemplates,
  htmlcss: conceptTemplates,
  // Missing ones
  rust: conceptTemplates,
  curriculum: conceptTemplates,
};

// ── Generator using fillTemplates ──
function fillTemplates(templates, count) {
  const result = [];
  const levels = ['beginner', 'intermediate', 'expert'];
  const poolMap = {};
  for (const l of levels) poolMap[l] = templates.filter(t => t.level === l);
  const availableLevels = levels.filter(l => poolMap[l].length > 0);
  if (availableLevels.length === 0) return [];
  const k = Math.floor(count / availableLevels.length);
  const counts = {};
  for (let i = 0; i < availableLevels.length; i++) {
    counts[availableLevels[i]] = i < availableLevels.length - 1 ? k : count - k * (availableLevels.length - 1);
  }
  let remainder = count - Object.values(counts).reduce((a, b) => a + b, 0);
  for (const l of availableLevels) {
    if (remainder <= 0) break;
    counts[l] = (counts[l] || 0) + 1;
    remainder--;
  }
  for (const level of availableLevels) {
    const needed = counts[level] || 0;
    const pool = poolMap[level];
    for (let i = 0; i < needed; i++) {
      const t = pool[i % pool.length];
      result.push({
        ...t,
        title: (i >= pool.length) ? `${t.title} ${Math.floor(i / pool.length) + 1}` : t.title,
      });
    }
  }
  return shuffle(result).slice(0, count);
}

// ── Main ──
function main() {
  let generatedCount = 0;
  let skippedCount = 0;

  for (const [lang, templates] of Object.entries(langMap)) {
    const current = challengeData[lang] || [];
    const missing = TARGET - current.length;

    if (missing <= 0) {
      skippedCount++;
      continue;
    }

    console.log(`${lang}: generating ${missing} new challenges (currently ${current.length})...`);
    const newChallenges = fillTemplates(templates, missing);
    challengeData[lang] = [...current, ...newChallenges];
    generatedCount++;
    console.log(`  → ${challengeData[lang].length} total`);
  }

  appData.challengeData = challengeData;

  // Sort entries
  const levelOrder = { beginner: 0, intermediate: 1, expert: 2 };
  for (const lang of Object.keys(challengeData)) {
    challengeData[lang].sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);
  }

  const json = JSON.stringify(appData, null, 2);
  fs.writeFileSync(DATA_FILE, json, 'utf-8');
  console.log(`\nDone! Updated ${generatedCount} languages (${skippedCount} already at target). File: ${(json.length / 1024 / 1024).toFixed(1)} MB`);
}

main();
