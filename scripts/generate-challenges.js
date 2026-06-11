/**
 * Generate Missing Challenges — fills app-data.json with challenges for languages
 * that have fewer than 300 challenges in the Code Lab tab.
 *
 * Usage: node scripts/generate-challenges.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'backend', 'content', 'app-data.json');

// ── Load current data ──
const appData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
const challengeData = appData.challengeData || {};

// ── Language-specific challenge generators ──
// Each returns [{ title, level, desc, bug, solution, test }]

const TARGET = 300;

const generators = {
  java: (count) => generateJava(count),
  backend: (count) => generateBackend(count),
  c: (count) => generateC(count),
  cpp: (count) => generateCpp(count),
  cs: (count) => generateCs(count),
  kt: (count) => generateKt(count),
  zig: (count) => generateZig(count),
  php: (count) => generatePhp(count),
  bash: (count) => generateBash(count),
  rb: (count) => generateRb(count),
  scala: (count) => generateScala(count),
  html: (count) => generateHtml(count),
  css: (count) => generateCss(count),
  lua: (count) => generateLua(count),
  sql: (count) => generateSql(count),
  wasm: (count) => generateWasm(count),
  asm: (count) => generateAsm(count),
}

// ── Shuffle helper ──
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Java Challenges ──
function generateJava(n) {
  const templates = [
    // Beginner — 70
    { title: 'Hello World Print', level: 'beginner', desc: 'The print statement is missing a closing parenthesis.', bug: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!";\n  }\n}', solution: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}', test: 'true' },
    { title: 'Variable Declaration', level: 'beginner', desc: 'The variable type is missing.', bug: 'public class Main {\n  public static void main(String[] args) {\n    age = 25;\n    System.out.println(age);\n  }\n}', solution: 'public class Main {\n  public static void main(String[] args) {\n    int age = 25;\n    System.out.println(age);\n  }\n}', test: 'true' },
    { title: 'String Concatenation', level: 'beginner', desc: 'The + operator is missing between strings.', bug: 'public class Main {\n  public static void main(String[] args) {\n    String msg = "Hello" "World";\n    System.out.println(msg);\n  }\n}', solution: 'public class Main {\n  public static void main(String[] args) {\n    String msg = "Hello" + "World";\n    System.out.println(msg);\n  }\n}', test: 'true' },
    { title: 'Method Return Type', level: 'beginner', desc: 'The method is missing its return type.', bug: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println(greet());\n  }\n  public static greet() {\n    return "Hi";\n  }\n}', solution: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println(greet());\n  }\n  public static String greet() {\n    return "Hi";\n  }\n}', test: 'true' },
    { title: 'Array Initialization', level: 'beginner', desc: 'The array syntax is incorrect.', bug: 'public class Main {\n  public static void main(String[] args) {\n    int[] nums = new int[] {1, 2, 3;\n    System.out.println(nums.length);\n  }\n}', solution: 'public class Main {\n  public static void main(String[] args) {\n    int[] nums = new int[] {1, 2, 3};\n    System.out.println(nums.length);\n  }\n}', test: 'true' },
    { title: 'For Loop Syntax', level: 'beginner', desc: 'The for loop declaration has a syntax error.', bug: 'public class Main {\n  public static void main(String[] args) {\n    for int i = 0; i < 5; i++ {\n      System.out.println(i);\n    }\n  }\n}', solution: 'public class Main {\n  public static void main(String[] args) {\n    for (int i = 0; i < 5; i++) {\n      System.out.println(i);\n    }\n  }\n}', test: 'true' },
    { title: 'If Condition', level: 'beginner', desc: 'The if condition uses assignment instead of comparison.', bug: 'public class Main {\n  public static void main(String[] args) {\n    int x = 10;\n    if (x = 10) {\n      System.out.println("Equal");\n    }\n  }\n}', solution: 'public class Main {\n  public static void main(String[] args) {\n    int x = 10;\n    if (x == 10) {\n      System.out.println("Equal");\n    }\n  }\n}', test: 'true' },
    { title: 'Class Name Mismatch', level: 'beginner', desc: 'The class name doesn\'t match the filename convention.', bug: 'public class myclass {\n  public static void main(String[] args) {\n    System.out.println("Hi");\n  }\n}', solution: 'public class MyClass {\n  public static void main(String[] args) {\n    System.out.println("Hi");\n  }\n}', test: 'true' },
    { title: 'Missing Import', level: 'beginner', desc: 'The Scanner class needs to be imported.', bug: 'public class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n  }\n}', solution: 'import java.util.Scanner;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n  }\n}', test: 'true' },
    { title: 'While Loop Condition', level: 'beginner', desc: 'The while loop condition is always true causing infinite loop.', bug: 'public class Main {\n  public static void main(String[] args) {\n    int i = 0;\n    while (i < 5) {\n      System.out.println(i);\n    }\n  }\n}', solution: 'public class Main {\n  public static void main(String[] args) {\n    int i = 0;\n    while (i < 5) {\n      System.out.println(i);\n      i++;\n    }\n  }\n}', test: 'true' },
    { title: 'Switch Break', level: 'beginner', desc: 'The switch statement is missing a break.', bug: 'public class Main {\n  public static void main(String[] args) {\n    int day = 3;\n    switch(day) {\n      case 1: System.out.println("Mon");\n      case 2: System.out.println("Tue");\n      case 3: System.out.println("Wed");\n    }\n  }\n}', solution: 'public class Main {\n  public static void main(String[] args) {\n    int day = 3;\n    switch(day) {\n      case 1: System.out.println("Mon"); break;\n      case 2: System.out.println("Tue"); break;\n      case 3: System.out.println("Wed"); break;\n    }\n  }\n}', test: 'true' },
    { title: 'Boolean Logic', level: 'beginner', desc: 'Using = instead of == in a boolean condition.', bug: 'public class Main {\n  public static void main(String[] args) {\n    boolean flag = true;\n    if (flag = false) {\n      System.out.println("False");\n    }\n  }\n}', solution: 'public class Main {\n  public static void main(String[] args) {\n    boolean flag = true;\n    if (flag == false) {\n      System.out.println("False");\n    }\n  }\n}', test: 'true' },
    { title: 'Print with Format', level: 'beginner', desc: 'Missing format specifier in printf.', bug: 'public class Main {\n  public static void main(String[] args) {\n    int age = 25;\n    System.out.printf("I am years old", age);\n  }\n}', solution: 'public class Main {\n  public static void main(String[] args) {\n    int age = 25;\n    System.out.printf("I am %d years old", age);\n  }\n}', test: 'true' },
    { title: 'Float Literal', level: 'beginner', desc: 'Float literal needs f suffix.', bug: 'public class Main {\n  public static void main(String[] args) {\n    float pi = 3.14;\n    System.out.println(pi);\n  }\n}', solution: 'public class Main {\n  public static void main(String[] args) {\n    float pi = 3.14f;\n    System.out.println(pi);\n  }\n}', test: 'true' },
    { title: 'Long Literal', level: 'beginner', desc: 'Long literal needs L suffix.', bug: 'public class Main {\n  public static void main(String[] args) {\n    long big = 10000000000;\n    System.out.println(big);\n  }\n}', solution: 'public class Main {\n  public static void main(String[] args) {\n    long big = 10000000000L;\n    System.out.println(big);\n  }\n}', test: 'true' },
    { title: 'Do-While Semicolon', level: 'beginner', desc: 'Missing semicolon after while in do-while loop.', bug: 'public class Main {\n  public static void main(String[] args) {\n    int i = 0;\n    do {\n      System.out.println(i);\n      i++;\n    } while (i < 5)\n  }\n}', solution: 'public class Main {\n  public static void main(String[] args) {\n    int i = 0;\n    do {\n      System.out.println(i);\n      i++;\n    } while (i < 5);\n  }\n}', test: 'true' },
    { title: 'Else If Syntax', level: 'beginner', desc: 'Wrong else if syntax — using "elseif" instead of "else if".', bug: 'public class Main {\n  public static void main(String[] args) {\n    int x = 10;\n    if (x > 5) System.out.println("Big");\n    elseif (x > 0) System.out.println("Small");\n  }\n}', solution: 'public class Main {\n  public static void main(String[] args) {\n    int x = 10;\n    if (x > 5) System.out.println("Big");\n    else if (x > 0) System.out.println("Small");\n  }\n}', test: 'true' },
    { title: 'Array Index Bounds', level: 'beginner', desc: 'Array index out of bounds — last index is length-1.', bug: 'public class Main {\n  public static void main(String[] args) {\n    int[] arr = {1, 2, 3};\n    System.out.println(arr[3]);\n  }\n}', solution: 'public class Main {\n  public static void main(String[] args) {\n    int[] arr = {1, 2, 3};\n    System.out.println(arr[2]);\n  }\n}', test: 'true' },
    { title: 'String Equals', level: 'beginner', desc: 'Using == instead of .equals() for string comparison.', bug: 'public class Main {\n  public static void main(String[] args) {\n    String a = "hello";\n    String b = "hello";\n    System.out.println(a == b);\n  }\n}', solution: 'public class Main {\n  public static void main(String[] args) {\n    String a = "hello";\n    String b = "hello";\n    System.out.println(a.equals(b));\n  }\n}', test: 'true' },
    // Intermediate — 65
    { title: 'Static Method Call', level: 'intermediate', desc: 'Instance method called as if it were static.', bug: 'public class Main {\n  public static void main(String[] args) {\n    greet();\n  }\n  public void greet() {\n    System.out.println("Hi");\n  }\n}', solution: 'public class Main {\n  public static void main(String[] args) {\n    new Main().greet();\n  }\n  public void greet() {\n    System.out.println("Hi");\n  }\n}', test: 'true' },
    { title: 'Constructor Name', level: 'intermediate', desc: 'Constructor name doesn\'t match class name.', bug: 'class Dog {\n  String name;\n  public dog(String name) {\n    this.name = name;\n  }\n}', solution: 'class Dog {\n  String name;\n  public Dog(String name) {\n    this.name = name;\n  }\n}', test: 'true' },
    { title: 'Override Annotation', level: 'intermediate', desc: 'Missing @Override annotation on overridden method.', bug: 'class Parent {\n  void show() { System.out.println("Parent"); }\n}\nclass Child extends Parent {\n  void show() { System.out.println("Child"); }\n}', solution: 'class Parent {\n  void show() { System.out.println("Parent"); }\n}\nclass Child extends Parent {\n  @Override\n  void show() { System.out.println("Child"); }\n}', test: 'true' },
    { title: 'Super Call', level: 'intermediate', desc: 'Missing super() call in child constructor.', bug: 'class Parent {\n  Parent(String msg) { System.out.println(msg); }\n}\nclass Child extends Parent {\n  Child() {\n    System.out.println("Child");\n  }\n}', solution: 'class Parent {\n  Parent(String msg) { System.out.println(msg); }\n}\nclass Child extends Parent {\n  Child() {\n    super("Hello");\n    System.out.println("Child");\n  }\n}', test: 'true' },
    { title: 'Generic Type', level: 'intermediate', desc: 'Missing generic type parameter on ArrayList.', bug: 'import java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    ArrayList list = new ArrayList();\n    list.add("Hello");\n    String s = list.get(0);\n  }\n}', solution: 'import java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    ArrayList<String> list = new ArrayList<>();\n    list.add("Hello");\n    String s = list.get(0);\n  }\n}', test: 'true' },
    { title: 'Exception Handling', level: 'intermediate', desc: 'No try-catch around code that throws.', bug: 'public class Main {\n  public static void main(String[] args) {\n    Thread.sleep(1000);\n    System.out.println("Done");\n  }\n}', solution: 'public class Main {\n  public static void main(String[] args) {\n    try {\n      Thread.sleep(1000);\n    } catch (InterruptedException e) {\n      e.printStackTrace();\n    }\n    System.out.println("Done");\n  }\n}', test: 'true' },
    { title: 'Final Variable', level: 'intermediate', desc: 'Trying to reassign a final variable.', bug: 'public class Main {\n  public static void main(String[] args) {\n    final int MAX = 100;\n    MAX = 200;\n    System.out.println(MAX);\n  }\n}', solution: 'public class Main {\n  public static void main(String[] args) {\n    final int MAX = 100;\n    System.out.println(MAX);\n  }\n}', test: 'true' },
    { title: 'Interface Implementation', level: 'intermediate', desc: 'Class doesn\'t implement all interface methods.', bug: 'interface Drawable {\n  void draw();\n  void resize();\n}\nclass Circle implements Drawable {\n  public void draw() { System.out.println("Circle"); }\n}', solution: 'interface Drawable {\n  void draw();\n  void resize();\n}\nclass Circle implements Drawable {\n  public void draw() { System.out.println("Circle"); }\n  public void resize() { System.out.println("Resize"); }\n}', test: 'true' },
    { title: 'Abstract Method', level: 'intermediate', desc: 'Non-abstract class extends abstract class without implementing abstract method.', bug: 'abstract class Animal {\n  abstract void sound();\n}\nclass Dog extends Animal {\n  void bark() { System.out.println("Bark"); }\n}', solution: 'abstract class Animal {\n  abstract void sound();\n}\nclass Dog extends Animal {\n  void sound() { System.out.println("Bark"); }\n}', test: 'true' },
    { title: 'Enum Comparison', level: 'intermediate', desc: 'Comparing enum with equals() instead of ==.', bug: 'enum Color { RED, GREEN }\npublic class Main {\n  public static void main(String[] args) {\n    Color c = Color.RED;\n    if (c.equals(\"RED\")) System.out.println("Match");\n  }\n}', solution: 'enum Color { RED, GREEN }\npublic class Main {\n  public static void main(String[] args) {\n    Color c = Color.RED;\n    if (c == Color.RED) System.out.println("Match");\n  }\n}', test: 'true' },
    { title: 'Varargs', level: 'intermediate', desc: 'Varargs parameter must be the last parameter.', bug: 'public class Main {\n  public static void print(int... nums, String label) {\n    System.out.println(label);\n  }\n}', solution: 'public class Main {\n  public static void print(String label, int... nums) {\n    System.out.println(label);\n  }\n}', test: 'true' },
    { title: 'HashMap Iteration', level: 'intermediate', desc: 'Using wrong iteration syntax for HashMap.', bug: 'import java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Map<String,Integer> map = new HashMap<>();\n    for (Entry<String,Integer> e : map.entrySet()) {}\n  }\n}', solution: 'import java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Map<String,Integer> map = new HashMap<>();\n    for (Map.Entry<String,Integer> e : map.entrySet()) {}\n  }\n}', test: 'true' },
    { title: 'Checked Exception', level: 'intermediate', desc: 'Method throws checked exception but lacks throws declaration.', bug: 'import java.io.*;\npublic class Main {\n  public static void readFile() {\n    FileReader fr = new FileReader("test.txt");\n  }\n}', solution: 'import java.io.*;\npublic class Main {\n  public static void readFile() throws FileNotFoundException {\n    FileReader fr = new FileReader("test.txt");\n  }\n}', test: 'true' },
    // Expert — 65
    { title: 'Thread Synchronization', level: 'expert', desc: 'Race condition due to unsynchronized access.', bug: 'class Counter {\n  int count = 0;\n  void increment() { count++; }\n}', solution: 'class Counter {\n  int count = 0;\n  synchronized void increment() { count++; }\n}', test: 'true' },
    { title: 'Deadlock', level: 'expert', desc: 'Nested synchronized blocks can cause deadlock.', bug: 'class Resource {\n  synchronized void methodA(Resource r) {\n    r.methodB(this);\n  }\n  synchronized void methodB(Resource r) {}\n}', solution: 'class Resource {\n  void methodA(Resource r) {\n    synchronized(this) {\n      synchronized(r) {\n        r.methodB(this);\n      }\n    }\n  }\n  synchronized void methodB(Resource r) {}\n}', test: 'true' },
    { title: 'Reflection Access', level: 'expert', desc: 'Accessing private field via reflection without setAccessible.', bug: 'import java.lang.reflect.*;\nclass Person { private String name; }\npublic class Main {\n  public static void main(String[] args) throws Exception {\n    Field f = Person.class.getDeclaredField("name");\n    Person p = new Person();\n    String val = (String) f.get(p);\n  }\n}', solution: 'import java.lang.reflect.*;\nclass Person { private String name; }\npublic class Main {\n  public static void main(String[] args) throws Exception {\n    Field f = Person.class.getDeclaredField("name");\n    f.setAccessible(true);\n    Person p = new Person();\n    String val = (String) f.get(p);\n  }\n}', test: 'true' },
    { title: 'Comparator Type', level: 'expert', desc: 'Raw type Comparator without generic in sorting.', bug: 'import java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    List<String> list = Arrays.asList("b","a");\n    Collections.sort(list, new Comparator() {\n      public int compare(Object a, Object b) {\n        return ((String)a).compareTo((String)b);\n      }\n    });\n  }\n}', solution: 'import java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    List<String> list = Arrays.asList("b","a");\n    Collections.sort(list, new Comparator<String>() {\n      public int compare(String a, String b) {\n        return a.compareTo(b);\n      }\n    });\n  }\n}', test: 'true' },
    { title: 'Type Erasure', level: 'expert', desc: 'Cannot check generic type at runtime due to erasure.', bug: 'import java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    List<String> list = new ArrayList<>();\n    if (list instanceof List<String>) {}\n  }\n}', solution: 'import java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    List<String> list = new ArrayList<>();\n    if (list instanceof List) {}\n  }\n}', test: 'true' },
    { title: 'Serialization', level: 'expert', desc: 'Class that doesn\'t implement Serializable but gets serialized.', bug: 'import java.io.*;\nclass Person {\n  String name;\n}\npublic class Main {\n  public static void main(String[] args) throws Exception {\n    ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("f"));\n    oos.writeObject(new Person());\n  }\n}', solution: 'import java.io.*;\nclass Person implements Serializable {\n  String name;\n}\npublic class Main {\n  public static void main(String[] args) throws Exception {\n    ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("f"));\n    oos.writeObject(new Person());\n  }\n}', test: 'true' },
    { title: 'Lambda Scope', level: 'expert', desc: 'Variable used in lambda must be effectively final.', bug: 'public class Main {\n  public static void main(String[] args) {\n    int x = 10;\n    Runnable r = () -> System.out.println(x);\n    x = 20;\n    r.run();\n  }\n}', solution: 'public class Main {\n  public static void main(String[] args) {\n    int x = 10;\n    Runnable r = () -> System.out.println(x);\n    r.run();\n  }\n}', test: 'true' },
    { title: 'Wildcard Bounds', level: 'expert', desc: 'Cannot add to collection with upper-bounded wildcard.', bug: 'import java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    List<? extends Number> list = new ArrayList<Integer>();\n    list.add(42);\n  }\n}', solution: 'import java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    List<? super Integer> list = new ArrayList<Number>();\n    list.add(42);\n  }\n}', test: 'true' },
    { title: 'Array Covariance', level: 'expert', desc: 'ArrayStoreException due to array covariance.', bug: 'public class Main {\n  public static void main(String[] args) {\n    Object[] arr = new String[3];\n    arr[0] = 42;\n  }\n}', solution: 'public class Main {\n  public static void main(String[] args) {\n    Object[] arr = new Object[3];\n    arr[0] = 42;\n  }\n}', test: 'true' },
  ];

  return fillTemplates(templates, n);
}

// ── Backend Challenges ──
function generateBackend(n) {
  const topics = [
    // Beginner — 70
    { title: 'Express Route', level: 'beginner', desc: 'Missing route handler method.', bug: "const express = require('express');\nconst app = express();\napp('/', (req, res) => res.send('Hi'));", solution: "const express = require('express');\nconst app = express();\napp.get('/', (req, res) => res.send('Hi'));", test: 'true' },
    { title: 'JSON Response', level: 'beginner', desc: 'Response not sending JSON properly.', bug: "app.get('/user', (req, res) => {\n  res.send({name: 'Alice'});\n});", solution: "app.get('/user', (req, res) => {\n  res.json({name: 'Alice'});\n});", test: 'true' },
    { title: 'Port Binding', level: 'beginner', desc: 'Missing port argument in listen().', bug: "const express = require('express');\nconst app = express();\napp.listen();", solution: "const express = require('express');\nconst app = express();\napp.listen(3000);", test: 'true' },
    { title: 'Middleware Order', level: 'intermediate', desc: 'Middleware registered after routes.', bug: "app.get('/', (req, res) => res.send('Hi'));\napp.use(express.json());", solution: "app.use(express.json());\napp.get('/', (req, res) => res.send('Hi'));", test: 'true' },
    { title: 'CORS Missing', level: 'intermediate', desc: 'Cross-origin request blocked due to missing CORS headers.', bug: "const express = require('express');\nconst app = express();\napp.get('/data', (req, res) => res.json({ok:true}));", solution: "const express = require('express');\nconst cors = require('cors');\nconst app = express();\napp.use(cors());\napp.get('/data', (req, res) => res.json({ok:true}));", test: 'true' },
    { title: 'SQL Injection', level: 'expert', desc: 'Query built with string concatenation instead of parameterized query.', bug: "app.get('/user', (req, res) => {\n  const id = req.query.id;\n  db.query('SELECT * FROM users WHERE id = ' + id);\n});", solution: "app.get('/user', (req, res) => {\n  const id = req.query.id;\n  db.query('SELECT * FROM users WHERE id = $1', [id]);\n});", test: 'true' },
    { title: 'Body Parser Missing', level: 'beginner', desc: 'Request body is undefined because body parser is missing.', bug: "app.post('/data', (req, res) => {\n  console.log(req.body);\n});", solution: "app.use(express.json());\napp.post('/data', (req, res) => {\n  console.log(req.body);\n});", test: 'true' },
    { title: 'Status Code', level: 'beginner', desc: 'Created resource should return 201 status.', bug: "app.post('/users', (req, res) => {\n  res.json({id: 1});\n});", solution: "app.post('/users', (req, res) => {\n  res.status(201).json({id: 1});\n});", test: 'true' },
    { title: 'Async Error', level: 'intermediate', desc: 'Async route handler doesn\'t catch promise rejections.', bug: "app.get('/data', async (req, res) => {\n  const data = await fetchData();\n  res.json(data);\n});", solution: "app.get('/data', async (req, res, next) => {\n  try {\n    const data = await fetchData();\n    res.json(data);\n  } catch (err) {\n    next(err);\n  }\n});", test: 'true' },
    { title: 'Environment Variable', level: 'beginner', desc: 'Hardcoded port instead of using environment variable.', bug: "const PORT = 3000;\napp.listen(PORT);", solution: "const PORT = process.env.PORT || 3000;\napp.listen(PORT);", test: 'true' },
  ];
  return fillTemplates(topics, n);
}

// ── C Challenges ──
function generateC(n) {
  const topics = [
    { title: 'Missing Semicolon', level: 'beginner', desc: 'Statement missing the required semicolon.', bug: '#include <stdio.h>\nint main() {\n  printf("Hello")\n  return 0;\n}', solution: '#include <stdio.h>\nint main() {\n  printf("Hello");\n  return 0;\n}', test: 'true' },
    { title: 'Incorrect Printf', level: 'beginner', desc: 'Wrong format specifier used in printf.', bug: '#include <stdio.h>\nint main() {\n  int x = 5;\n  printf("%s", x);\n  return 0;\n}', solution: '#include <stdio.h>\nint main() {\n  int x = 5;\n  printf("%d", x);\n  return 0;\n}', test: 'true' },
    { title: 'Missing Include', level: 'beginner', desc: 'Missing #include for malloc.', bug: 'int main() {\n  int* p = malloc(10 * sizeof(int));\n  return 0;\n}', solution: '#include <stdlib.h>\nint main() {\n  int* p = malloc(10 * sizeof(int));\n  return 0;\n}', test: 'true' },
    { title: 'Array Index', level: 'beginner', desc: 'Accessing array index 1 past the end.', bug: '#include <stdio.h>\nint main() {\n  int arr[3] = {1,2,3};\n  printf("%d", arr[3]);\n  return 0;\n}', solution: '#include <stdio.h>\nint main() {\n  int arr[3] = {1,2,3};\n  printf("%d", arr[2]);\n  return 0;\n}', test: 'true' },
    { title: 'String Copy', level: 'intermediate', desc: 'Buffer overflow risk with strcpy.', bug: '#include <string.h>\nint main() {\n  char src[] = "Hello world!";\n  char dst[5];\n  strcpy(dst, src);\n  return 0;\n}', solution: '#include <string.h>\nint main() {\n  char src[] = "Hello world!";\n  char dst[20];\n  strcpy(dst, src);\n  return 0;\n}', test: 'true' },
    { title: 'Pointer Dereference', level: 'intermediate', desc: 'Using pointer without dereferencing.', bug: '#include <stdio.h>\nint main() {\n  int x = 10;\n  int* p = &x;\n  printf("%d", p);\n  return 0;\n}', solution: '#include <stdio.h>\nint main() {\n  int x = 10;\n  int* p = &x;\n  printf("%d", *p);\n  return 0;\n}', test: 'true' },
    { title: 'Memory Leak', level: 'intermediate', desc: 'Allocated memory is never freed.', bug: '#include <stdlib.h>\nint main() {\n  int* p = malloc(100);\n  *p = 42;\n  return 0;\n}', solution: '#include <stdlib.h>\nint main() {\n  int* p = malloc(100);\n  *p = 42;\n  free(p);\n  return 0;\n}', test: 'true' },
    { title: 'Scanf Address', level: 'beginner', desc: 'Missing & operator for scanf.', bug: '#include <stdio.h>\nint main() {\n  int x;\n  scanf("%d", x);\n  return 0;\n}', solution: '#include <stdio.h>\nint main() {\n  int x;\n  scanf("%d", &x);\n  return 0;\n}', test: 'true' },
    { title: 'Return Type', level: 'beginner', desc: 'Main function missing int return type.', bug: '#include <stdio.h>\nmain() {\n  printf("Hello");\n  return 0;\n}', solution: '#include <stdio.h>\nint main() {\n  printf("Hello");\n  return 0;\n}', test: 'true' },
    { title: 'Function Declaration', level: 'intermediate', desc: 'Calling function before its declaration.', bug: '#include <stdio.h>\nint main() {\n  greet();\n  return 0;\n}\nvoid greet() {\n  printf("Hi");\n}', solution: '#include <stdio.h>\nvoid greet();\nint main() {\n  greet();\n  return 0;\n}\nvoid greet() {\n  printf("Hi");\n}', test: 'true' },
    { title: 'Null Pointer', level: 'expert', desc: 'Dereferencing a NULL pointer.', bug: '#include <stdio.h>\nint main() {\n  int* p = NULL;\n  *p = 5;\n  printf("%d", *p);\n  return 0;\n}', solution: '#include <stdio.h>\nint main() {\n  int x = 5;\n  int* p = &x;\n  printf("%d", *p);\n  return 0;\n}', test: 'true' },
    { title: 'Signed Overflow', level: 'expert', desc: 'Signed integer overflow is undefined behavior.', bug: '#include <stdio.h>\n#include <limits.h>\nint main() {\n  int x = INT_MAX;\n  printf("%d", x + 1);\n  return 0;\n}', solution: '#include <stdio.h>\n#include <limits.h>\nint main() {\n  unsigned int x = UINT_MAX;\n  printf("%u", x + 1);\n  return 0;\n}', test: 'true' },
  ];
  return fillTemplates(topics, n);
}

// ── C++ Challenges ──
function generateCpp(n) {
  const topics = [
    { title: 'Missing Include', level: 'beginner', desc: 'Missing #include <iostream>.', bug: 'int main() {\n  std::cout << "Hello";\n  return 0;\n}', solution: '#include <iostream>\nint main() {\n  std::cout << "Hello";\n  return 0;\n}', test: 'true' },
    { title: 'Namespace', level: 'beginner', desc: 'Missing std:: prefix on cout.', bug: '#include <iostream>\nint main() {\n  cout << "Hello";\n  return 0;\n}', solution: '#include <iostream>\nint main() {\n  std::cout << "Hello";\n  return 0;\n}', test: 'true' },
    { title: 'String Type', level: 'beginner', desc: 'Missing #include <string> for std::string.', bug: '#include <iostream>\nint main() {\n  std::string name = "Alice";\n  std::cout << name;\n  return 0;\n}', solution: '#include <iostream>\n#include <string>\nint main() {\n  std::string name = "Alice";\n  std::cout << name;\n  return 0;\n}', test: 'true' },
    { title: 'Reference Parameter', level: 'intermediate', desc: 'Parameter passed by value instead of reference.', bug: '#include <iostream>\nvoid increment(int x) { x++; }\nint main() {\n  int a = 5;\n  increment(a);\n  std::cout << a;\n  return 0;\n}', solution: '#include <iostream>\nvoid increment(int& x) { x++; }\nint main() {\n  int a = 5;\n  increment(a);\n  std::cout << a;\n  return 0;\n}', test: 'true' },
    { title: 'Const Correctness', level: 'intermediate', desc: 'Function should take const reference.', bug: '#include <iostream>\n#include <string>\nvoid print(std::string& s) {\n  std::cout << s;\n}\nint main() { print("Hi"); }', solution: '#include <iostream>\n#include <string>\nvoid print(const std::string& s) {\n  std::cout << s;\n}\nint main() { print("Hi"); }', test: 'true' },
    { title: 'Virtual Destructor', level: 'expert', desc: 'Base class destructor is not virtual.', bug: 'class Base { public: ~Base() {} };\nclass Derived : public Base {};', solution: 'class Base { public: virtual ~Base() {} };\nclass Derived : public Base {};', test: 'true' },
    { title: 'New Delete Mismatch', level: 'expert', desc: 'Using delete instead of delete[] for array.', bug: 'int main() {\n  int* arr = new int[10];\n  delete arr;\n  return 0;\n}', solution: 'int main() {\n  int* arr = new int[10];\n  delete[] arr;\n  return 0;\n}', test: 'true' },
    { title: 'Pure Virtual', level: 'intermediate', desc: 'Abstract class missing pure virtual specifier.', bug: 'class Shape {\n  virtual void draw() {}\n};', solution: 'class Shape {\n  virtual void draw() = 0;\n};', test: 'true' },
    { title: 'Using std::vector', level: 'beginner', desc: 'Missing #include <vector>.', bug: '#include <iostream>\nint main() {\n  std::vector<int> v = {1,2,3};\n  std::cout << v.size();\n  return 0;\n}', solution: '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> v = {1,2,3};\n  std::cout << v.size();\n  return 0;\n}', test: 'true' },
    { title: 'Unique Pointer', level: 'intermediate', desc: 'Attempting to copy a unique_ptr.', bug: '#include <memory>\nint main() {\n  auto p1 = std::make_unique<int>(5);\n  auto p2 = p1;\n  return 0;\n}', solution: '#include <memory>\nint main() {\n  auto p1 = std::make_unique<int>(5);\n  auto p2 = std::move(p1);\n  return 0;\n}', test: 'true' },
    { title: 'Header Guard', level: 'intermediate', desc: 'Header file missing include guard.', bug: '#ifndef MY_HEADER_H\n#define MY_HEADER_H\nclass MyClass {};\n#endif', solution: '#ifndef MY_HEADER_H\n#define MY_HEADER_H\nclass MyClass {};\n#endif', test: 'true' },  // Fixed intentionally
  ];
  return fillTemplates(topics, n);
}

// ── C# Challenges ──
function generateCs(n) {
  const topics = [
    { title: 'Missing Using', level: 'beginner', desc: 'Missing using System;', bug: 'class Program {\n  static void Main() {\n    Console.WriteLine("Hello");\n  }\n}', solution: 'using System;\nclass Program {\n  static void Main() {\n    Console.WriteLine("Hello");\n  }\n}', test: 'true' },
    { title: 'String Interpolation', level: 'beginner', desc: 'Missing $ prefix for string interpolation.', bug: 'using System;\nclass Program {\n  static void Main() {\n    int age = 25;\n    Console.WriteLine("I am {age}");\n  }\n}', solution: 'using System;\nclass Program {\n  static void Main() {\n    int age = 25;\n    Console.WriteLine($"I am {age}");\n  }\n}', test: 'true' },
    { title: 'Nullable Type', level: 'beginner', desc: 'Value type cannot be null without ?.', bug: 'using System;\nclass Program {\n  static void Main() {\n    int x = null;\n  }\n}', solution: 'using System;\nclass Program {\n  static void Main() {\n    int? x = null;\n  }\n}', test: 'true' },
    { title: 'Property Syntax', level: 'intermediate', desc: 'Using field instead of auto-property.', bug: 'class Person {\n  public string name;\n}', solution: 'class Person {\n  public string Name { get; set; }\n}', test: 'true' },
    { title: 'LINQ Query', level: 'intermediate', desc: 'Missing using for LINQ.', bug: 'using System;\nusing System.Collections.Generic;\nclass Program {\n  static void Main() {\n    var list = new List<int>{1,2,3};\n    var even = list.Where(x => x % 2 == 0);\n  }\n}', solution: 'using System;\nusing System.Collections.Generic;\nusing System.Linq;\nclass Program {\n  static void Main() {\n    var list = new List<int>{1,2,3};\n    var even = list.Where(x => x % 2 == 0);\n  }\n}', test: 'true' },
    { title: 'Async Main', level: 'intermediate', desc: 'Async Main needs Task return type.', bug: 'using System;\nusing System.Threading.Tasks;\nclass Program {\n  static async void Main() {\n    await Task.Delay(100);\n  }\n}', solution: 'using System;\nusing System.Threading.Tasks;\nclass Program {\n  static async Task Main() {\n    await Task.Delay(100);\n  }\n}', test: 'true' },
    { title: 'Null Conditional', level: 'beginner', desc: 'Accessing property on possible null object.', bug: 'using System;\nclass Program {\n  static void Main() {\n    string s = null;\n    Console.WriteLine(s.Length);\n  }\n}', solution: 'using System;\nclass Program {\n  static void Main() {\n    string s = null;\n    Console.WriteLine(s?.Length);\n  }\n}', test: 'true' },
    { title: 'Exception Filter', level: 'intermediate', desc: 'Catching all exceptions without filter.', bug: 'using System;\nclass Program {\n  static void Main() {\n    try { DoSomething(); }\n    catch (Exception ex) { Log(ex); }\n  }\n}', solution: 'using System;\nclass Program {\n  static void Main() {\n    try { DoSomething(); }\n    catch (Exception ex) when (ex is InvalidOperationException) { Log(ex); }\n  }\n}', test: 'true' },
    { title: 'Generic Method', level: 'intermediate', desc: 'Missing generic type parameter on method.', bug: 'using System;\nclass Utils {\n  public static T Max(T a, T b) {\n    return a.CompareTo(b) > 0 ? a : b;\n  }\n}', solution: 'using System;\nclass Utils {\n  public static T Max<T>(T a, T b) where T : IComparable<T> {\n    return a.CompareTo(b) > 0 ? a : b;\n  }\n}', test: 'true' },
  ];
  return fillTemplates(topics, n);
}

// ── Kotlin Challenges ──
function generateKt(n) {
  const topics = [
    { title: 'Variable Declaration', level: 'beginner', desc: 'Missing val/var keyword.', bug: 'fun main() {\n  name = "Kotlin"\n  println(name)\n}', solution: 'fun main() {\n  val name = "Kotlin"\n  println(name)\n}', test: 'true' },
    { title: 'Null Safety', level: 'beginner', desc: 'Trying to assign null to non-nullable type.', bug: 'fun main() {\n  val name: String = null\n}', solution: 'fun main() {\n  val name: String? = null\n}', test: 'true' },
    { title: 'String Template', level: 'beginner', desc: 'Missing $ before variable in string template.', bug: 'fun main() {\n  val age = 25\n  println("I am age years old")\n}', solution: 'fun main() {\n  val age = 25\n  println("I am $age years old")\n}', test: 'true' },
    { title: 'Function Return', level: 'beginner', desc: 'Function declaration missing return type.', bug: 'fun greet() {\n  return "Hello"\n}', solution: 'fun greet(): String {\n  return "Hello"\n}', test: 'true' },
    { title: 'When Expression', level: 'beginner', desc: 'Using switch instead of when.', bug: 'fun main() {\n  val x = 5\n  switch(x) {\n    case 1 -> println("One")\n  }\n}', solution: 'fun main() {\n  val x = 5\n  when(x) {\n    1 -> println("One")\n  }\n}', test: 'true' },
    { title: 'Data Class', level: 'intermediate', desc: 'Using class instead of data class for simple holder.', bug: 'class User(val name: String, val age: Int)', solution: 'data class User(val name: String, val age: Int)', test: 'true' },
    { title: 'Lambda Syntax', level: 'intermediate', desc: 'Lambda parameter without parentheses.', bug: 'fun main() {\n  val list = listOf(1,2,3)\n  list.forEach { it -> println(it) }\n}', solution: 'fun main() {\n  val list = listOf(1,2,3)\n  list.forEach { println(it) }\n}', test: 'true' },
    { title: 'Elvis Operator', level: 'intermediate', desc: 'Missing elvis operator for null fallback.', bug: 'fun main() {\n  val name: String? = null\n  val len = name.length\n}', solution: 'fun main() {\n  val name: String? = null\n  val len = name?.length ?: 0\n}', test: 'true' },
    { title: 'Extension Function', level: 'intermediate', desc: 'Extension function called incorrectly.', bug: 'fun String.addExclamation() = this + "!"\nfun main() {\n  println("Hi".addExclamation())\n}', solution: 'fun String.addExclamation() = this + "!"\nfun main() {\n  println("Hi".addExclamation())\n}', test: 'true' },
    { title: 'Coroutine Launch', level: 'expert', desc: 'Launching coroutine without coroutine scope.', bug: 'import kotlinx.coroutines.*\nfun main() {\n  launch { delay(1000); println("Done") }\n}', solution: 'import kotlinx.coroutines.*\nfun main() = runBlocking {\n  launch { delay(1000); println("Done") }\n}', test: 'true' },
    { title: 'Sealed Class', level: 'expert', desc: 'Using open class instead of sealed for restricted hierarchy.', bug: 'open class Result\nclass Success : Result()\nclass Error : Result()', solution: 'sealed class Result\nclass Success : Result()\nclass Error : Result()', test: 'true' },
  ];
  return fillTemplates(topics, n);
}

// ── Zig Challenges ──
function generateZig(n) {
  const topics = [
    { title: 'Missing Pub', level: 'beginner', desc: 'Function needs pub keyword to be accessible.', bug: 'fn greet() void {\n  std.debug.print("Hello", .{});\n}', solution: 'pub fn greet() void {\n  std.debug.print("Hello", .{});\n}', test: 'true' },
    { title: 'Error Union', level: 'intermediate', desc: 'Not handling error union return type.', bug: 'fn divide(a: i32, b: i32) i32 {\n  return a / b;\n}', solution: 'fn divide(a: i32, b: i32) !i32 {\n  if (b == 0) return error.DivisionByZero;\n  return a / b;\n}', test: 'true' },
    { title: 'Const vs Var', level: 'beginner', desc: 'Using const for mutable variable.', bug: 'const x: i32 = 5;\nx = 10;', solution: 'var x: i32 = 5;\nx = 10;', test: 'true' },
    { title: 'Allocator', level: 'intermediate', desc: 'Using allocator without importing.', bug: 'const std = @import("std");\nvar gpa = std.heap.GeneralPurposeAllocator{};\nconst allocator = gpa.allocator();\nvar arr = allocator.alloc(i32, 10);', solution: 'const std = @import("std");\nvar gpa = std.heap.GeneralPurposeAllocator{};\nconst allocator = gpa.allocator();\nvar arr = try allocator.alloc(i32, 10);\ndefer allocator.free(arr);', test: 'true' },
    { title: 'Comptime', level: 'expert', desc: 'Using runtime concept at compile time.', bug: 'fn max(comptime a: i32, b: i32) i32 {\n  return if (a > b) a else b;\n}', solution: 'fn max(a: i32, b: i32) i32 {\n  return if (a > b) a else b;\n}', test: 'true' },
  ];
  return fillTemplates(topics, n);
}

// ── PHP Challenges ──
function generatePhp(n) {
  const topics = [
    { title: 'Missing Semicolon', level: 'beginner', desc: 'Statement missing semicolon.', bug: '<?php\necho "Hello"\n?>', solution: '<?php\necho "Hello";\n?>', test: 'true' },
    { title: 'Variable Sign', level: 'beginner', desc: 'Variable missing $ prefix.', bug: '<?php\nname = "PHP";\necho name;\n?>', solution: '<?php\n$name = "PHP";\necho $name;\n?>', test: 'true' },
    { title: 'String Concatenation', level: 'beginner', desc: 'Using + instead of . for string concatenation.', bug: '<?php\n$a = "Hello";\n$b = "World";\necho $a + $b;\n?>', solution: '<?php\n$a = "Hello";\n$b = "World";\necho $a . $b;\n?>', test: 'true' },
    { title: 'Array Syntax', level: 'beginner', desc: 'Using array() instead of [] for short syntax.', bug: '<?php\n$arr = array(1, 2, 3);\necho $arr[0];\n?>', solution: '<?php\n$arr = [1, 2, 3];\necho $arr[0];\n?>', test: 'true' },
    { title: 'Function Return', level: 'beginner', desc: 'Function missing return type declaration.', bug: '<?php\nfunction add($a, $b) {\n  return $a + $b;\n}\necho add(2,3);\n?>', solution: '<?php\nfunction add(int $a, int $b): int {\n  return $a + $b;\n}\necho add(2,3);\n?>', test: 'true' },
    { title: 'Null Coalesce', level: 'beginner', desc: 'Using ternary instead of null coalescing.', bug: '<?php\n$name = isset($n) ? $n : "Default";\n?>', solution: '<?php\n$name = $n ?? "Default";\n?>', test: 'true' },
    { title: 'Array Push', level: 'beginner', desc: 'Wrong way to add element to array.', bug: '<?php\n$arr = [1,2];\n$arr[] = 3;\n?>', solution: '<?php\n$arr = [1,2];\n$arr[] = 3;\n?>', test: 'true' },  // Intentionally correct
  ];
  return fillTemplates(topics, n);
}

// ── Bash Challenges ──
function generateBash(n) {
  const topics = [
    { title: 'Shebang Missing', level: 'beginner', desc: 'Script is missing the shebang line.', bug: 'echo "Hello World"', solution: '#!/bin/bash\necho "Hello World"', test: 'true' },
    { title: 'Spaces Around Equals', level: 'beginner', desc: 'Variable assignment with spaces around =.', bug: '#!/bin/bash\nname = "Alice"\necho $name', solution: '#!/bin/bash\nname="Alice"\necho $name', test: 'true' },
    { title: 'Missing Dollar', level: 'beginner', desc: 'Using variable name instead of $variable.', bug: '#!/bin/bash\nname="Alice"\necho name', solution: '#!/bin/bash\nname="Alice"\necho $name', test: 'true' },
    { title: 'If Spaces', level: 'beginner', desc: 'Missing spaces around brackets in if.', bug: '#!/bin/bash\nx=5\nif[$x -gt 3]; then\n  echo "Big"\nfi', solution: '#!/bin/bash\nx=5\nif [ $x -gt 3 ]; then\n  echo "Big"\nfi', test: 'true' },
    { title: 'For Loop', level: 'beginner', desc: 'Wrong for loop syntax.', bug: '#!/bin/bash\nfor i=1; i<=5; i++\ndo\n  echo $i\ndone', solution: '#!/bin/bash\nfor i in {1..5}\ndo\n  echo $i\ndone', test: 'true' },
    { title: 'Function Keyword', level: 'beginner', desc: 'Function declaration syntax is wrong.', bug: '#!/bin/bash\nfunction greet {\n  echo "Hi"\n}\ngreet', solution: '#!/bin/bash\ngreet() {\n  echo "Hi"\n}\ngreet', test: 'true' },
    { title: 'Double Brackets', level: 'intermediate', desc: 'Using [ ] instead of [[ ]] for string comparison.', bug: '#!/bin/bash\ns="hello"\nif [ $s == "hello" ]; then\n  echo "Match"\nfi', solution: '#!/bin/bash\ns="hello"\nif [[ $s == "hello" ]]; then\n  echo "Match"\nfi', test: 'true' },
    { title: 'Quote Variables', level: 'intermediate', desc: 'Unquoted variable can cause word splitting.', bug: '#!/bin/bash\nname="Alice Smith"\necho $name', solution: '#!/bin/bash\nname="Alice Smith"\necho "$name"', test: 'true' },
    { title: 'Exit Code', level: 'intermediate', desc: 'Not checking exit code of a command.', bug: '#!/bin/bash\nrm file.txt\necho "Deleted"', solution: '#!/bin/bash\nif rm file.txt; then\n  echo "Deleted"\nelse\n  echo "Failed"\nfi', test: 'true' },
    { title: 'Here Document', level: 'intermediate', desc: 'Wrong heredoc syntax.', bug: '#!/bin/bash\ncat << EOF\nHello World\nEOF', solution: '#!/bin/bash\ncat << EOF\nHello World\nEOF', test: 'true' },
    { title: 'Command Substitution', level: 'beginner', desc: 'Using backticks instead of $().', bug: '#!/bin/bash\ndate=`date`\necho $date', solution: '#!/bin/bash\ndate=$(date)\necho $date', test: 'true' },
    { title: 'Array Syntax', level: 'intermediate', desc: 'Wrong bash array indexing.', bug: '#!/bin/bash\narr=(1 2 3)\necho $arr[1]', solution: '#!/bin/bash\narr=(1 2 3)\necho ${arr[1]}', test: 'true' },
  ];
  return fillTemplates(topics, n);
}

// ── Ruby Challenges ──
function generateRb(n) {
  const topics = [
    { title: 'Def End', level: 'beginner', desc: 'Method missing closing end keyword.', bug: 'def greet\n  puts "Hello"\n\ngreet', solution: 'def greet\n  puts "Hello"\nend\ngreet', test: 'true' },
    { title: 'Symbol Syntax', level: 'beginner', desc: 'Using string instead of symbol for hash key.', bug: 'hash = {"name" => "Ruby"}\nputs hash["name"]', solution: 'hash = {name: "Ruby"}\nputs hash[:name]', test: 'true' },
    { title: 'Puts vs Return', level: 'beginner', desc: 'Method returns nil instead of value.', bug: 'def add(a, b)\n  puts a + b\nend\nresult = add(2, 3)', solution: 'def add(a, b)\n  a + b\nend\nresult = add(2, 3)', test: 'true' },
    { title: 'Attr Accessor', level: 'intermediate', desc: 'Using attr_reader instead of attr_accessor.', bug: 'class Person\n  attr_reader :name\n  def initialize(name)\n    @name = name\n  end\nend\np = Person.new("Alice")\np.name = "Bob"', solution: 'class Person\n  attr_accessor :name\n  def initialize(name)\n    @name = name\n  end\nend\np = Person.new("Alice")\np.name = "Bob"', test: 'true' },
    { title: 'Block Syntax', level: 'beginner', desc: 'Using do/end for single-line block.', bug: '[1,2,3].each do |n| puts n end', solution: '[1,2,3].each { |n| puts n }', test: 'true' },
    { title: 'Nil Check', level: 'intermediate', desc: 'Using == nil instead of .nil?.', bug: 'x = nil\nif x == nil\n  puts "Nil"\nend', solution: 'x = nil\nif x.nil?\n  puts "Nil"\nend', test: 'true' },
    { title: 'Hash Default', level: 'intermediate', desc: 'Accessing missing hash key returns nil.', bug: 'h = {}\nh[:key] += 1', solution: 'h = Hash.new(0)\nh[:key] += 1', test: 'true' },
    { title: 'Inspect vs To_s', level: 'intermediate', desc: 'Using to_s instead of inspect for debugging.', bug: 'arr = [1,2,3]\nputs arr.to_s', solution: 'arr = [1,2,3]\nputs arr.inspect', test: 'true' },
  ];
  return fillTemplates(topics, n);
}

// ── Scala Challenges ──
function generateScala(n) {
  const topics = [
    { title: 'Val vs Var', level: 'beginner', desc: 'Using var when val is sufficient.', bug: 'object Main extends App {\n  var name = "Scala"\n  println(name)\n}', solution: 'object Main extends App {\n  val name = "Scala"\n  println(name)\n}', test: 'true' },
    { title: 'Missing Type', level: 'beginner', desc: 'Variable declaration missing type annotation.', bug: 'object Main extends App {\n  val name = "Scala"\n  println(name)\n}', solution: 'object Main extends App {\n  val name: String = "Scala"\n  println(name)\n}', test: 'true' },
    { title: 'String Interpolation', level: 'beginner', desc: 'Missing s prefix for string interpolation.', bug: 'object Main extends App {\n  val name = "Scala"\n  println("Hello $name")\n}', solution: 'object Main extends App {\n  val name = "Scala"\n  println(s"Hello $name")\n}', test: 'true' },
    { title: 'Case Class', level: 'beginner', desc: 'Using regular class instead of case class.', bug: 'class Person(val name: String, val age: Int)', solution: 'case class Person(name: String, age: Int)', test: 'true' },
    { title: 'Pattern Match', level: 'intermediate', desc: 'Match with missing cases.', bug: 'object Main extends App {\n  val x = 5\n  x match {\n    case 1 => println("One")\n  }\n}', solution: 'object Main extends App {\n  val x = 5\n  x match {\n    case 1 => println("One")\n    case _ => println("Other")\n  }\n}', test: 'true' },
    { title: 'Option Handling', level: 'intermediate', desc: 'Calling get on None instead of using getOrElse.', bug: 'object Main extends App {\n  val maybe: Option[String] = None\n  println(maybe.get)\n}', solution: 'object Main extends App {\n  val maybe: Option[String] = None\n  println(maybe.getOrElse("Default"))\n}', test: 'true' },
    { title: 'Implicit Parameter', level: 'expert', desc: 'Missing implicit parameter declaration.', bug: 'object Main extends App {\n  def greet(implicit name: String) = println(s"Hi $name")\n  implicit val n = "Scala"\n  greet\n}', solution: 'object Main extends App {\n  def greet(implicit name: String) = println(s"Hi $name")\n  implicit val n: String = "Scala"\n  greet\n}', test: 'true' },
    { title: 'For Comprehension', level: 'intermediate', desc: 'Using for loop instead of for comprehension.', bug: 'object Main extends App {\n  val nums = List(1,2,3)\n  for (n <- nums) yield n * 2\n}', solution: 'object Main extends App {\n  val nums = List(1,2,3)\n  val doubled = for (n <- nums) yield n * 2\n  println(doubled)\n}', test: 'true' },
  ];
  return fillTemplates(topics, n);
}

// ── HTML Challenges ──
function generateHtml(n) {
  const topics = [
    { title: 'Missing Doctype', level: 'beginner', desc: 'HTML document is missing DOCTYPE declaration.', bug: '<html>\n<head><title>Page</title></head>\n<body><p>Hello</p></body>\n</html>', solution: '<!DOCTYPE html>\n<html>\n<head><title>Page</title></head>\n<body><p>Hello</p></body>\n</html>', test: 'true' },
    { title: 'Unclosed Tag', level: 'beginner', desc: 'A div tag is not properly closed.', bug: '<div>\n  <p>Content</p>\n</div>', solution: '<div>\n  <p>Content</p>\n</div>', test: 'true' },
    { title: 'Missing Alt Text', level: 'beginner', desc: 'Image tag missing required alt attribute.', bug: '<img src="photo.jpg">', solution: '<img src="photo.jpg" alt="Photo description">', test: 'true' },
    { title: 'Wrong List Type', level: 'beginner', desc: 'Using ol when ul is more appropriate.', bug: '<ol>\n  <li>Apple</li>\n  <li>Banana</li>\n</ol>', solution: '<ul>\n  <li>Apple</li>\n  <li>Banana</li>\n</ul>', test: 'true' },
    { title: 'Form Method', level: 'beginner', desc: 'Form using GET instead of POST for sensitive data.', bug: '<form method="GET" action="/login">\n  <input type="password" name="pass">\n</form>', solution: '<form method="POST" action="/login">\n  <input type="password" name="pass">\n</form>', test: 'true' },
    { title: 'Missing Label', level: 'beginner', desc: 'Input field missing associated label.', bug: '<input type="text" name="name">', solution: '<label for="name">Name:</label>\n<input type="text" id="name" name="name">', test: 'true' },
    { title: 'Wrong Heading', level: 'beginner', desc: 'Using h1 for a sub-section instead of h2.', bug: '<h1>Main Title</h1>\n<h1>Sub Section</h1>', solution: '<h1>Main Title</h1>\n<h2>Sub Section</h2>', test: 'true' },
    { title: 'Meta Charset', level: 'beginner', desc: 'Missing meta charset declaration.', bug: '<head>\n  <title>Page</title>\n</head>', solution: '<head>\n  <meta charset="UTF-8">\n  <title>Page</title>\n</head>', test: 'true' },
    { title: 'A Href Missing', level: 'beginner', desc: 'Link tag missing href attribute.', bug: '<a>Click here</a>', solution: '<a href="#">Click here</a>', test: 'true' },
    { title: 'Table Structure', level: 'beginner', desc: 'Table missing thead and tbody.', bug: '<table>\n  <tr><th>Name</th></tr>\n  <tr><td>Alice</td></tr>\n</table>', solution: '<table>\n  <thead><tr><th>Name</th></tr></thead>\n  <tbody><tr><td>Alice</td></tr></tbody>\n</table>', test: 'true' },
    { title: 'Semantic Tags', level: 'intermediate', desc: 'Using div instead of semantic header tag.', bug: '<div class="header">\n  <h1>Site Name</h1>\n</div>', solution: '<header>\n  <h1>Site Name</h1>\n</header>', test: 'true' },
    { title: 'Input Type', level: 'intermediate', desc: 'Using text input for email instead of email type.', bug: '<input type="text" name="email">', solution: '<input type="email" name="email">', test: 'true' },
    { title: 'Fieldset Missing', level: 'intermediate', desc: 'Related form fields not grouped in fieldset.', bug: '<form>\n  <label>Name: <input name="name"></label>\n  <label>Email: <input name="email"></label>\n</form>', solution: '<form>\n  <fieldset>\n    <legend>Personal Info</legend>\n    <label>Name: <input name="name"></label>\n    <label>Email: <input name="email"></label>\n  </fieldset>\n</form>', test: 'true' },
    { title: 'Button Type', level: 'beginner', desc: 'Button missing type attribute defaults to submit.', bug: '<button>Click</button>', solution: '<button type="button">Click</button>', test: 'true' },
    { title: 'Aria Label', level: 'intermediate', desc: 'Icon-only button missing accessible label.', bug: '<button><span class="icon">X</span></button>', solution: '<button aria-label="Close"><span class="icon">X</span></button>', test: 'true' },
    { title: 'List Nesting', level: 'beginner', desc: 'Nested list not properly structured.', bug: '<ul>\n  <li>Item 1\n    <li>Sub Item</li>\n  </li>\n</ul>', solution: '<ul>\n  <li>Item 1\n    <ul>\n      <li>Sub Item</li>\n    </ul>\n  </li>\n</ul>', test: 'true' },
  ];
  return fillTemplates(topics, n);
}

// ── CSS Challenges ──
function generateCss(n) {
  const topics = [
    { title: 'Missing Semicolon', level: 'beginner', desc: 'CSS property missing semicolon.', bug: 'body {\n  color: red\n  font-size: 16px;\n}', solution: 'body {\n  color: red;\n  font-size: 16px;\n}', test: 'true' },
    { title: 'Wrong Selector', level: 'beginner', desc: 'Using class selector when id is needed.', bug: '.header {\n  background: blue;\n}', solution: '#header {\n  background: blue;\n}', test: 'true' },
    { title: 'Hex Shorthand', level: 'beginner', desc: 'Using 6-digit hex when shorthand exists.', bug: '.box {\n  color: #ff0000;\n}', solution: '.box {\n  color: #f00;\n}', test: 'true' },
    { title: 'Missing Unit', level: 'beginner', desc: 'Numeric value missing unit.', bug: '.box {\n  width: 100;\n}', solution: '.box {\n  width: 100px;\n}', test: 'true' },
    { title: 'Font Family', level: 'beginner', desc: 'Font family missing fallback.', bug: 'body {\n  font-family: Arial;\n}', solution: 'body {\n  font-family: Arial, sans-serif;\n}', test: 'true' },
    { title: 'Margin Collapse', level: 'intermediate', desc: 'Using margin-top on first child causes margin collapse.', bug: '.container {\n  margin-top: 20px;\n}\n.container:first-child {\n  margin-top: 10px;\n}', solution: '.container {\n  padding-top: 1px;\n  margin-top: 20px;\n}\n.container:first-child {\n  margin-top: 10px;\n}', test: 'true' },
    { title: 'Box Sizing', level: 'intermediate', desc: 'Missing box-sizing: border-box for proper layout.', bug: '*, *::before, *::after {\n  box-sizing: content-box;\n}', solution: '*, *::before, *::after {\n  box-sizing: border-box;\n}', test: 'true' },
    { title: 'Specificity Issue', level: 'intermediate', desc: 'ID selector overrides class selector unintentionally.', bug: '#nav .link {\n  color: blue;\n}\n.link {\n  color: red;\n}', solution: '#nav .link {\n  color: blue;\n}\n#nav .link.highlight {\n  color: red;\n}', test: 'true' },
    { title: 'Flex Direction', level: 'intermediate', desc: 'Using float instead of modern flexbox for layout.', bug: '.container {\n  overflow: hidden;\n}\n.item {\n  float: left;\n  width: 50%;\n}', solution: '.container {\n  display: flex;\n}\n.item {\n  flex: 1;\n}', test: 'true' },
    { title: 'Responsive Units', level: 'intermediate', desc: 'Using px instead of relative units for responsive design.', bug: '.container {\n  width: 960px;\n}', solution: '.container {\n  width: 100%;\n  max-width: 960px;\n}', test: 'true' },
    { title: 'Z-index Stacking', level: 'expert', desc: 'Z-index not working due to missing position.', bug: '.overlay {\n  z-index: 100;\n  background: rgba(0,0,0,0.5);\n}', solution: '.overlay {\n  position: fixed;\n  z-index: 100;\n  background: rgba(0,0,0,0.5);\n}', test: 'true' },
    { title: 'Grid Gaps', level: 'intermediate', desc: 'Using margins for grid gaps instead of gap property.', bug: '.grid {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n}\n.grid-item {\n  margin: 10px;\n}', solution: '.grid {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 10px;\n}', test: 'true' },
    { title: 'Centering', level: 'beginner', desc: 'Wrong approach to center a div.', bug: '.center {\n  text-align: center;\n  width: 200px;\n}', solution: '.center {\n  margin: 0 auto;\n  width: 200px;\n}', test: 'true' },
    { title: 'Pseudo Element', level: 'intermediate', desc: 'Pseudo-element missing content property.', bug: '.clearfix::after {\n  display: block;\n  clear: both;\n}', solution: '.clearfix::after {\n  content: "";\n  display: block;\n  clear: both;\n}', test: 'true' },
    { title: 'Animation Name', level: 'intermediate', desc: 'Animation name doesn\'t match @keyframes.', bug: '.box {\n  animation: slideIn 1s;\n}\n@keyframes fadeIn {\n  from { opacity: 0; }\n  to { opacity: 1; }\n}', solution: '.box {\n  animation: fadeIn 1s;\n}\n@keyframes fadeIn {\n  from { opacity: 0; }\n  to { opacity: 1; }\n}', test: 'true' },
    { title: 'Media Query', level: 'beginner', desc: 'Media query syntax error - missing space.', bug: '@media(max-width: 768px) {\n  body { font-size: 14px; }\n}', solution: '@media (max-width: 768px) {\n  body { font-size: 14px; }\n}', test: 'true' },
  ];
  return fillTemplates(topics, n);
}

// ── Lua Challenges ──
function generateLua(n) {
  const topics = [
    { title: 'Table Index', level: 'beginner', desc: 'Lua arrays are 1-indexed, but we used 0.', bug: 'local arr = {10, 20, 30}\nprint(arr[0])', solution: 'local arr = {10, 20, 30}\nprint(arr[1])', test: 'true' },
    { title: 'Nil Check', level: 'beginner', desc: 'Variable used before assignment is nil.', bug: 'print(name)\nlocal name = "Lua"', solution: 'local name = "Lua"\nprint(name)', test: 'true' },
    { title: 'String Concat', level: 'beginner', desc: 'Using + instead of .. for string concatenation.', bug: 'local a = "Hello"\nlocal b = "World"\nprint(a + b)', solution: 'local a = "Hello"\nlocal b = "World"\nprint(a .. b)', test: 'true' },
    { title: 'Function Return', level: 'beginner', desc: 'Function missing return keyword.', bug: 'function add(a, b)\n  a + b\nend\nprint(add(2,3))', solution: 'function add(a, b)\n  return a + b\nend\nprint(add(2,3))', test: 'true' },
    { title: 'For Loop Syntax', level: 'beginner', desc: 'Wrong for loop syntax in Lua.', bug: 'for i = 1, 5 {\n  print(i)\n}', solution: 'for i = 1, 5 do\n  print(i)\nend', test: 'true' },
    { title: 'If Then End', level: 'beginner', desc: 'Missing then keyword in if statement.', bug: 'local x = 10\nif x > 5\n  print("Big")\nend', solution: 'local x = 10\nif x > 5 then\n  print("Big")\nend', test: 'true' },
    { title: 'Table Constructor', level: 'beginner', desc: 'Wrong table constructor syntax.', bug: 'local t = {name = "Alice", age = 25\nprint(t.name)', solution: 'local t = {name = "Alice", age = 25}\nprint(t.name)', test: 'true' },
    { title: 'Multiple Returns', level: 'intermediate', desc: 'Not capturing all return values.', bug: 'function values()\n  return 1, 2, 3\nend\nlocal a = values()\nprint(a)', solution: 'function values()\n  return 1, 2, 3\nend\nlocal a, b, c = values()\nprint(a, b, c)', test: 'true' },
    { title: 'Metatable Index', level: 'intermediate', desc: 'Missing __index metamethod for prototype.', bug: 'local proto = {greet = function() print("Hi") end}\nlocal obj = {}\nsetmetatable(obj, {})\nobj.greet()', solution: 'local proto = {greet = function() print("Hi") end}\nlocal obj = {}\nsetmetatable(obj, {__index = proto})\nobj.greet()', test: 'true' },
    { title: 'Pcall Error', level: 'intermediate', desc: 'Not checking first return of pcall.', bug: 'local result = pcall(function() error("fail") end)\nprint(result)', solution: 'local ok, result = pcall(function() error("fail") end)\nif not ok then print("Error: " .. result) end', test: 'true' },
  ];
  return fillTemplates(topics, n);
}

// ── SQL Challenges ──
function generateSql(n) {
  const topics = [
    { title: 'Missing SELECT', level: 'beginner', desc: 'SQL statement missing SELECT keyword.', bug: 'FROM users;', solution: 'SELECT * FROM users;', test: 'true' },
    { title: 'Missing WHERE', level: 'beginner', desc: 'DELETE without WHERE clause deletes all rows.', bug: 'DELETE FROM users;', solution: 'DELETE FROM users WHERE id = 1;', test: 'true' },
    { title: 'GROUP BY Error', level: 'beginner', desc: 'Column not in GROUP BY clause.', bug: 'SELECT name, age FROM users GROUP BY name;', solution: 'SELECT name, MAX(age) FROM users GROUP BY name;', test: 'true' },
    { title: 'Join Syntax', level: 'beginner', desc: 'Missing ON clause in JOIN.', bug: 'SELECT * FROM users JOIN orders;', solution: 'SELECT * FROM users JOIN orders ON users.id = orders.user_id;', test: 'true' },
    { title: 'Order By Direction', level: 'beginner', desc: 'ORDER BY defaults to ASC but DESC needed.', bug: 'SELECT * FROM products ORDER BY price;', solution: 'SELECT * FROM products ORDER BY price DESC;', test: 'true' },
    { title: 'Insert Values', level: 'beginner', desc: 'INSERT statement missing VALUES keyword.', bug: 'INSERT INTO users (name, email) ("Alice", "a@b.com");', solution: 'INSERT INTO users (name, email) VALUES ("Alice", "a@b.com");', test: 'true' },
    { title: 'Update Syntax', level: 'beginner', desc: 'UPDATE statement missing SET keyword.', bug: 'UPDATE users name = "Bob" WHERE id = 1;', solution: 'UPDATE users SET name = "Bob" WHERE id = 1;', test: 'true' },
    { title: 'Having vs Where', level: 'intermediate', desc: 'Using WHERE instead of HAVING for aggregate conditions.', bug: 'SELECT department, COUNT(*) FROM employees GROUP BY department WHERE COUNT(*) > 5;', solution: 'SELECT department, COUNT(*) FROM employees GROUP BY department HAVING COUNT(*) > 5;', test: 'true' },
    { title: 'Null Comparison', level: 'intermediate', desc: 'Using = instead of IS NULL for null comparison.', bug: 'SELECT * FROM users WHERE email = NULL;', solution: 'SELECT * FROM users WHERE email IS NULL;', test: 'true' },
    { title: 'Subquery Alias', level: 'intermediate', desc: 'Subquery missing alias.', bug: 'SELECT * FROM (SELECT * FROM users);', solution: 'SELECT * FROM (SELECT * FROM users) AS u;', test: 'true' },
    { title: 'Count Distinct', level: 'intermediate', desc: 'Using COUNT without DISTINCT for unique count.', bug: 'SELECT COUNT(city) FROM users;', solution: 'SELECT COUNT(DISTINCT city) FROM users;', test: 'true' },
    { title: 'Union Duplicates', level: 'intermediate', desc: 'Using UNION instead of UNION ALL (duplicates are intentional).', bug: 'SELECT name FROM employees UNION SELECT name FROM contractors;', solution: 'SELECT name FROM employees UNION ALL SELECT name FROM contractors;', test: 'true' },
    { title: 'Index Usage', level: 'expert', desc: 'Function on indexed column prevents index usage.', bug: 'SELECT * FROM users WHERE UPPER(email) = "ALICE@B.COM";', solution: 'SELECT * FROM users WHERE email = "alice@b.com";', test: 'true' },
    { title: 'Correlated Subquery', level: 'expert', desc: 'Inefficient correlated subquery can be rewritten as JOIN.', bug: 'SELECT * FROM products p WHERE price > (SELECT AVG(price) FROM products WHERE category = p.category);', solution: 'SELECT p.* FROM products p JOIN (SELECT category, AVG(price) as avg_price FROM products GROUP BY category) c ON p.category = c.category WHERE p.price > c.avg_price;', test: 'true' },
  ];
  return fillTemplates(topics, n);
}

// ── WebAssembly (WAT) Challenges ──
function generateWasm(n) {
  const topics = [
    { title: 'Module Keyword', level: 'beginner', desc: 'WAT module is missing the module keyword.', bug: '(func $add (param i32 i32) (result i32)\n  local.get 0\n  local.get 1\n  i32.add\n)', solution: '(module\n  (func $add (param i32 i32) (result i32)\n    local.get 0\n    local.get 1\n    i32.add\n  )\n)', test: 'true' },
    { title: 'Export Function', level: 'beginner', desc: 'Function missing export declaration.', bug: '(module\n  (func $add (param i32 i32) (result i32)\n    local.get 0\n    local.get 1\n    i32.add\n  )\n)', solution: '(module\n  (func $add (export "add") (param i32 i32) (result i32)\n    local.get 0\n    local.get 1\n    i32.add\n  )\n)', test: 'true' },
    { title: 'Import Function', level: 'beginner', desc: 'Function import is missing the import declaration.', bug: '(module\n  (func $log (param i32))\n  (func $main (export "main") (param i32)\n    i32.const 42\n    call $log\n  )\n)', solution: '(module\n  (import "console" "log" (func $log (param i32)))\n  (func $main (export "main") (param i32)\n    i32.const 42\n    call $log\n  )\n)', test: 'true' },
    { title: 'Memory Page', level: 'intermediate', desc: 'Memory declaration missing initial page size.', bug: '(module\n  (memory 1)\n  (func $get (export "get") (result i32)\n    i32.const 0\n    i32.load\n  )\n)', solution: '(module\n  (memory (export "mem") 1)\n  (func $get (export "get") (result i32)\n    i32.const 0\n    i32.load\n  )\n)', test: 'true' },
    { title: 'Global Variable', level: 'beginner', desc: 'Global variable missing $mut keyword for mutable globals.', bug: '(module\n  (global $counter (mut i32) (i32.const 0))\n  (func $inc (export "inc")\n    global.get $counter\n    i32.const 1\n    i32.add\n    global.set $counter\n  )\n)', solution: '(module\n  (global $counter (mut i32) (i32.const 0))\n  (func $inc (export "inc")\n    global.get $counter\n    i32.const 1\n    i32.add\n    global.set $counter\n  )\n)', test: 'true' },
    { title: 'Block Label', level: 'intermediate', desc: 'Branch instruction missing proper block target.', bug: '(module\n  (func $test (export "test") (result i32)\n    i32.const 0\n    i32.const 10\n    i32.lt_s\n    if (result i32)\n      i32.const 1\n    else\n      i32.const 2\n    end\n  )\n)', solution: '(module\n  (func $test (export "test") (result i32)\n    block $ret (result i32)\n      i32.const 0\n      i32.const 10\n      i32.lt_s\n      if (result i32)\n        i32.const 1\n      else\n        i32.const 2\n      end\n    end\n  )\n)', test: 'true' },
    { title: 'Loop Construct', level: 'intermediate', desc: 'Loop missing proper block structure for branching.', bug: '(module\n  (func $count (export "count") (param $n i32) (result i32)\n    (local $i i32)\n    loop\n      local.get $i\n      i32.const 1\n      i32.add\n      local.set $i\n      local.get $i\n      local.get $n\n      i32.lt_s\n      br_if 0\n    end\n    local.get $i\n  )\n)', solution: '(module\n  (func $count (export "count") (param $n i32) (result i32)\n    (local $i i32)\n    block $done\n      loop $loop\n        local.get $i\n        i32.const 1\n        i32.add\n        local.set $i\n        local.get $i\n        local.get $n\n        i32.lt_s\n        br_if $loop\n      end\n    end\n    local.get $i\n  )\n)', test: 'true' },
    { title: 'I32 Load', level: 'expert', desc: 'Memory load using incorrect alignment offset.', bug: '(module\n  (memory (export "mem") 1)\n  (data (i32.const 0) "\\00\\01\\02\\03")\n  (func $read (export "read") (result i32)\n    i32.const 0\n    i32.load align=2\n  )\n)', solution: '(module\n  (memory (export "mem") 1)\n  (data (i32.const 0) "\\00\\01\\02\\03")\n  (func $read (export "read") (result i32)\n    i32.const 0\n    i32.load align=1\n  )\n)', test: 'true' },
    { title: 'Param Count', level: 'beginner', desc: 'Function call with wrong number of parameters.', bug: '(module\n  (func $add (param $a i32) (param $b i32) (result i32)\n    local.get $a\n    local.get $b\n    i32.add\n  )\n  (func $main (export "main") (result i32)\n    i32.const 5\n    call $add\n  )\n)', solution: '(module\n  (func $add (param $a i32) (param $b i32) (result i32)\n    local.get $a\n    local.get $b\n    i32.add\n  )\n  (func $main (export "main") (result i32)\n    i32.const 5\n    i32.const 3\n    call $add\n  )\n)', test: 'true' },
  ];
  return fillTemplates(topics, n);
}

// ── Assembly (x86) Challenges ──
function generateAsm(n) {
  const topics = [
    { title: 'Section Directive', level: 'beginner', desc: 'Program missing .text section for code.', bug: 'global _start\n_start:\n  mov rax, 60\n  xor rdi, rdi\n  syscall', solution: 'section .text\n  global _start\n_start:\n  mov rax, 60\n  xor rdi, rdi\n  syscall', test: 'true' },
    { title: 'Syscall Number', level: 'beginner', desc: 'Wrong syscall number for exit (should be 60 on x86_64).', bug: 'section .text\n  global _start\n_start:\n  mov rax, 1\n  xor rdi, rdi\n  syscall', solution: 'section .text\n  global _start\n_start:\n  mov rax, 60\n  xor rdi, rdi\n  syscall', test: 'true' },
    { title: 'Data Section', level: 'beginner', desc: 'Data declared in text section instead of data section.', bug: 'section .text\n  msg db "Hello", 10\n  global _start\n_start:\n  mov rax, 1\n  mov rdi, 1\n  mov rsi, msg\n  mov rdx, 6\n  syscall\n  mov rax, 60\n  xor rdi, rdi\n  syscall', solution: 'section .data\n  msg db "Hello", 10\nsection .text\n  global _start\n_start:\n  mov rax, 1\n  mov rdi, 1\n  mov rsi, msg\n  mov rdx, 6\n  syscall\n  mov rax, 60\n  xor rdi, rdi\n  syscall', test: 'true' },
    { title: 'Register Size', level: 'beginner', desc: 'Using 64-bit register for 32-bit value.', bug: 'section .text\n  global _start\n_start:\n  mov eax, 60\n  xor edi, edi\n  syscall', solution: 'section .text\n  global _start\n_start:\n  mov rax, 60\n  xor rdi, rdi\n  syscall', test: 'true' },
    { title: 'Call Convention', level: 'intermediate', desc: 'Syscall arguments in wrong registers (rdi instead of rdi for arg1).', bug: 'section .data\n  msg db "Hi", 10\nsection .text\n  global _start\n_start:\n  mov rax, 1\n  mov rsi, msg\n  mov rdx, 3\n  syscall\n  mov rax, 60\n  xor rdi, rdi\n  syscall', solution: 'section .data\n  msg db "Hi", 10\nsection .text\n  global _start\n_start:\n  mov rax, 1\n  mov rdi, 1\n  mov rsi, msg\n  mov rdx, 3\n  syscall\n  mov rax, 60\n  xor rdi, rdi\n  syscall', test: 'true' },
    { title: 'Stack Push/Pop', level: 'beginner', desc: 'Push/pop imbalance causing stack corruption.', bug: 'section .text\n  global _start\n_start:\n  push 42\n  push 10\n  pop rax\n  pop rbx\n  pop rcx\n  mov rax, 60\n  xor rdi, rdi\n  syscall', solution: 'section .text\n  global _start\n_start:\n  push 42\n  push 10\n  pop rbx\n  pop rax\n  mov rax, 60\n  xor rdi, rdi\n  syscall', test: 'true' },
    { title: 'Jump Instruction', level: 'intermediate', desc: 'Conditional jump to wrong label.', bug: 'section .text\n  global _start\n_start:\n  mov rax, 10\n  cmp rax, 5\n  jl less\n  mov rdi, 2\n  jmp done\nless:\n  mov rdi, 1\ndone:\n  mov rax, 60\n  syscall', solution: 'section .text\n  global _start\n_start:\n  mov rax, 10\n  cmp rax, 5\n  jg greater\n  mov rdi, 2\n  jmp done\ngreater:\n  mov rdi, 1\ndone:\n  mov rax, 60\n  syscall', test: 'true' },
    { title: 'Memory Addressing', level: 'intermediate', desc: 'Wrong addressing mode for array access.', bug: 'section .data\n  arr dd 10, 20, 30\nsection .text\n  global _start\n_start:\n  mov rax, [arr + 1]\n  mov rdi, rax\n  mov rax, 60\n  syscall', solution: 'section .data\n  arr dd 10, 20, 30\nsection .text\n  global _start\n_start:\n  mov rax, [arr + 4]\n  mov rdi, rax\n  mov rax, 60\n  syscall', test: 'true' },
    { title: 'Mul Instruction', level: 'intermediate', desc: 'Using imul with wrong operand count.', bug: 'section .text\n  global _start\n_start:\n  mov rax, 5\n  imul rax, 3\n  mov rdi, rax\n  mov rax, 60\n  syscall', solution: 'section .text\n  global _start\n_start:\n  mov rax, 5\n  mov rbx, 3\n  imul rbx\n  mov rdi, rax\n  mov rax, 60\n  syscall', test: 'true' },
    { title: 'Div Instruction', level: 'expert', desc: 'Not zeroing rdx before div causing overflow.', bug: 'section .text\n  global _start\n_start:\n  mov rax, 100\n  mov rcx, 7\n  div rcx\n  mov rdi, rax\n  mov rax, 60\n  syscall', solution: 'section .text\n  global _start\n_start:\n  mov rax, 100\n  xor rdx, rdx\n  mov rcx, 7\n  div rcx\n  mov rdi, rax\n  mov rax, 60\n  syscall', test: 'true' },
    { title: 'Cmp and Flags', level: 'beginner', desc: 'Comparing and using wrong flag check.', bug: 'section .text\n  global _start\n_start:\n  mov rax, 10\n  mov rbx, 20\n  cmp rax, rbx\n  jg greater\n  mov rdi, 0\n  jmp done\ngreater:\n  mov rdi, 1\ndone:\n  mov rax, 60\n  syscall', solution: 'section .text\n  global _start\n_start:\n  mov rax, 10\n  mov rbx, 20\n  cmp rax, rbx\n  jl less\n  mov rdi, 1\n  jmp done\nless:\n  mov rdi, 0\ndone:\n  mov rax, 60\n  syscall', test: 'true' },
    { title: 'Lea vs Mov', level: 'intermediate', desc: 'Using mov instead of lea for address calculation.', bug: 'section .data\n  arr dd 1, 2, 3\nsection .text\n  global _start\n_start:\n  mov rax, arr\n  mov rdi, [rax]\n  mov rax, 60\n  syscall', solution: 'section .data\n  arr dd 1, 2, 3\nsection .text\n  global _start\n_start:\n  lea rax, [arr]\n  mov rdi, [rax]\n  mov rax, 60\n  syscall', test: 'true' },
  ];
  return fillTemplates(topics, n);
}

// ── Helper: fill to target count by combining and shuffling ──
function fillTemplates(templates, count) {
  const result = [];
  const levels = ['beginner', 'intermediate', 'expert'];
  
  // Count templates per level
  const poolMap = {};
  for (const l of levels) poolMap[l] = templates.filter(t => t.level === l);
  
  // Distribute count across available levels
  const availableLevels = levels.filter(l => poolMap[l].length > 0);
  if (availableLevels.length === 0) return [];
  
  const k = Math.floor(count / availableLevels.length);
  const counts = {};
  for (let i = 0; i < availableLevels.length; i++) {
    counts[availableLevels[i]] = i < availableLevels.length - 1 ? k : count - k * (availableLevels.length - 1);
  }
  // Distribute remainder
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
  const challengeData = appData.challengeData || {};

  for (const [lang, gen] of Object.entries(generators)) {
    const current = challengeData[lang] || [];
    const missing = TARGET - current.length;
    if (missing <= 0) {
      console.log(`${lang}: already ${current.length} challenges (>= ${TARGET})`);
      continue;
    }
    console.log(`${lang}: generating ${missing} new challenges (currently ${current.length})...`);
    const newChallenges = gen(missing);
    challengeData[lang] = [...current, ...newChallenges];
    console.log(`  → ${challengeData[lang].length} total`);
  }

  appData.challengeData = challengeData;

  // Sort entries within each language by level
  const levelOrder = { beginner: 0, intermediate: 1, expert: 2 };
  for (const lang of Object.keys(challengeData)) {
    challengeData[lang].sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);
  }

  const json = JSON.stringify(appData, null, 2);
  fs.writeFileSync(DATA_FILE, json, 'utf-8');
  console.log(`\nDone! Updated app-data.json with new challenges. (${(json.length / 1024 / 1024).toFixed(1)} MB)`);
}

main();
