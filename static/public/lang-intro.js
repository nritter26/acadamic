// ── Language Intros — What/UsedFor/Creator/Code for every language ──

(function() {
  var intro = {};

  // ── Programming Languages ──

  intro.js = {
    name: "JavaScript",
    what: "JavaScript is a lightweight, interpreted programming language primarily used for adding interactivity to web pages. It supports event-driven, functional, and object-oriented programming styles and runs in every modern web browser.",
    usedFor: "Building interactive web frontends, server-side apps via Node.js, mobile apps, desktop applications, and games. JavaScript is the core language of the web platform.",
    creator: "Brendan Eich, created in 10 days in May 1995 while at Netscape. Standardized as ECMAScript, with modern yearly updates since ES6 (2015).",
    code: "// Hello World\nconsole.log('Hello, JavaScript!');\n\n// Function\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet('World'));"
  };

  intro.ts = {
    name: "TypeScript",
    what: "TypeScript is a statically typed superset of JavaScript that compiles to plain JavaScript. It adds optional type annotations, interfaces, generics, and modern ES features with better tooling support.",
    usedFor: "Large-scale web applications, enterprise frontends and backends, and any project where type safety improves maintainability. Popular with Angular, React, and Node.js projects.",
    creator: "Anders Hejlsberg, lead architect of C# and Turbo Pascal, at Microsoft. First released in October 2012.",
    code: "function greet(name: string): string {\n  return `Hello, ${name}!`;\n}\n\nconst message: string = greet('TypeScript');\nconsole.log(message);"
  };

  intro.py = {
    name: "Python",
    what: "Python is a high-level, interpreted programming language known for its readability and simplicity. It emphasizes code readability with significant indentation and a comprehensive standard library.",
    usedFor: "Web development, data science, machine learning, automation, scripting, scientific computing, and backend services. Python is one of the most popular languages for beginners and experts alike.",
    creator: "Guido van Rossum, first released in 1991. The name comes from the British comedy group Monty Python. Python 3 was released in 2008.",
    code: "# Hello World\nprint('Hello, Python!')\n\n# Function\ndef greet(name):\n    return f'Hello, {name}!'\n\nprint(greet('World'))"
  };

  intro.go = {
    name: "Go",
    what: "Go (Golang) is a statically typed, compiled programming language designed for simplicity, efficiency, and concurrency. It features goroutines for lightweight concurrent execution and a fast compilation speed.",
    usedFor: "Cloud services, microservices, CLI tools, network servers, DevOps tooling, and distributed systems. Go powers much of Docker, Kubernetes, and Terraform.",
    creator: "Robert Griesemer, Rob Pike, and Ken Thompson at Google. First announced in November 2009.",
    code: "package main\n\nimport \"fmt\"\n\nfunc main() {\n    fmt.Println(\"Hello, Go!\")\n}"
  };

  intro.rs = {
    name: "Rust",
    what: "Rust is a systems programming language focused on safety, speed, and concurrency. It guarantees memory safety without a garbage collector through its ownership and borrowing system.",
    usedFor: "Systems programming, embedded devices, WebAssembly, CLI tools, game engines, operating systems, and performance-critical applications. Rust is used in Firefox, Dropbox, and Cloudflare.",
    creator: "Graydon Hoare at Mozilla Research, first released in 2010. Rust has been voted the most loved language on Stack Overflow since 2016.",
    code: "fn main() {\n    println!(\"Hello, Rust!\");\n}\n\nfn greet(name: &str) -> String {\n    format!(\"Hello, {}!\", name)\n}"
  };

  intro.c = {
    name: "C",
    what: "C is a general-purpose, procedural programming language that provides low-level memory access and minimal runtime overhead. It remains one of the most influential languages in computing history.",
    usedFor: "Operating systems, embedded systems, firmware, device drivers, compilers, and performance-critical applications. C underlies most modern operating systems including Linux and Windows.",
    creator: "Dennis Ritchie at Bell Labs between 1969 and 1973. Originally developed to write the UNIX operating system.",
    code: "#include <stdio.h>\n\nint main() {\n    printf(\"Hello, C!\\n\");\n    return 0;\n}"
  };

  intro.cpp = {
    name: "C++",
    what: "C++ is a powerful, compiled language that extends C with object-oriented, generic, and functional programming features. It offers manual memory control with high-level abstractions.",
    usedFor: "Game engines, desktop applications, browsers, financial systems, embedded systems, and real-time simulations. C++ is used in Unreal Engine, Chrome, and Microsoft Office.",
    creator: "Bjarne Stroustrup at Bell Labs, first released in 1985 as 'C with Classes'. Standardized by ISO with major revisions every few years.",
    code: "#include <iostream>\n\nint main() {\n    std::cout << \"Hello, C++!\" << std::endl;\n    return 0;\n}"
  };

  intro.cs = {
    name: "C#",
    what: "C# (pronounced C sharp) is a modern, type-safe, object-oriented programming language developed for the .NET ecosystem. It combines the power of C++ with the simplicity of Visual Basic.",
    usedFor: "Windows desktop apps, web applications via ASP.NET, game development with Unity, mobile apps with Xamarin, and enterprise software.",
    creator: "Anders Hejlsberg at Microsoft, first released in 2000 as part of the .NET initiative. Now an open-source, cross-platform language.",
    code: "using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine(\"Hello, C#!\");\n    }\n}"
  };

  intro.kt = {
    name: "Kotlin",
    what: "Kotlin is a modern, statically typed language that runs on the JVM and interoperates fully with Java. It features null safety, coroutines for async programming, and concise syntax.",
    usedFor: "Android app development, server-side applications, web development, and multiplatform projects. Kotlin is the preferred language for Android development by Google.",
    creator: "JetBrains, first released in 2011. Google announced first-class support for Kotlin on Android in 2017.",
    code: "fun main() {\n    println(\"Hello, Kotlin!\")\n}\n\nfun greet(name: String): String {\n    return \"Hello, $name!\"\n}"
  };

  intro.swift = {
    name: "Swift",
    what: "Swift is a powerful and intuitive programming language for Apple platforms. It combines performance with modern language features like optionals, closures, and protocol-oriented programming.",
    usedFor: "iOS, macOS, watchOS, and tvOS app development. Swift is also used for server-side development and system programming on Apple platforms.",
    creator: "Chris Lattner at Apple, first released in 2014. Swift was designed as a safer and more modern alternative to Objective-C.",
    code: "print(\"Hello, Swift!\")\n\nfunc greet(name: String) -> String {\n    return \"Hello, \\(name)!\"\n}\n\nprint(greet(name: \"World\"))"
  };

  intro.java = {
    name: "Java",
    what: "Java is a class-based, object-oriented programming language designed for portability across platforms. It runs on the Java Virtual Machine (JVM) and follows the 'write once, run anywhere' principle.",
    usedFor: "Enterprise applications, Android app development, web servers, big data processing, financial systems, and embedded systems. Java powers billions of devices worldwide.",
    creator: "James Gosling at Sun Microsystems, first released in 1995. Oracle acquired Sun in 2010 and continues to maintain Java.",
    code: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, Java!\");\n    }\n}"
  };

  intro.zig = {
    name: "Zig",
    what: "Zig is a general-purpose systems programming language focused on robustness, optimality, and clarity. It provides manual memory management with no hidden control flow or allocations.",
    usedFor: "Systems programming, embedded development, performance-critical applications, and as a C/C++ alternative. Zig offers seamless C interoperability and a build system that manages dependencies.",
    creator: "Andrew Kelley, first released in 2016. Zig is open-source and developed with community input.",
    code: "const std = @import(\"std\");\n\npub fn main() void {\n    std.debug.print(\"Hello, Zig!\\n\", .{});\n}"
  };

  intro.asm = {
    name: "Assembly",
    what: "Assembly is a low-level programming language that provides a direct representation of machine code instructions. Each assembly language is specific to a particular computer architecture.",
    usedFor: "Operating system kernels, bootloaders, embedded systems, device drivers, performance-critical code sections, and reverse engineering. Assembly gives complete control over hardware.",
    creator: "Assembly languages have existed since the earliest electronic computers in the 1940s. Each CPU architecture defines its own assembly dialect.",
    code: "; x86-64 Linux\nsection .data\n    msg db 'Hello, World!', 0xa\n    len equ $ - msg\n\nsection .text\n    global _start\n\n_start:\n    mov eax, 1\n    mov edi, 1\n    mov rsi, msg\n    mov edx, len\n    syscall\n\n    mov eax, 60\n    xor edi, edi\n    syscall"
  };

  intro.php = {
    name: "PHP",
    what: "PHP (Hypertext Preprocessor) is a widely-used open-source server-side scripting language designed for web development. It can be embedded directly into HTML and integrates seamlessly with databases like MySQL, PostgreSQL, and SQLite.",
    usedFor: "Building dynamic websites and web applications, content management systems (WordPress, Drupal), e-commerce platforms, REST APIs, server-side form handling, and database-driven applications.",
    creator: "Rasmus Lerdorf, created in 1994 as a set of Perl scripts. PHP/FI 2.0 was released in 1997, and PHP 3 (the first modern version) was released in 1998 by Andi Gutmans and Zeev Suraski.",
    code: "<?php\n// Hello from PHP\necho \"Hello, PHP!\";\n\n// Variables\n$name = \"World\";\necho \"Hello, $name!\";\n\n// Arrays\n$fruits = ['apple', 'banana', 'cherry'];\nforeach ($fruits as $fruit) {\n    echo $fruit;\n}\n?>"
  };

  intro.bash = {
    name: "Bash",
    what: "Bash (Bourne Again SHell) is a Unix shell and command language that provides a command-line interface for interacting with operating systems. It supports scripting with variables, control flow, functions, and job control, making it a powerful tool for automation and system administration.",
    usedFor: "System administration, automation, file manipulation, program execution, text processing, DevOps pipelines, server management, and rapid prototyping of complex workflows through shell scripting.",
    creator: "Brian Fox, created in 1987 for the GNU Project as a free replacement for the Bourne shell. Bash is the default shell on most Linux distributions and macOS.",
    code: "#!/bin/bash\n# Hello from Bash\n\necho \"Hello, Bash!\"\n\n# Variables\nname=\"World\"\necho \"Hello, $name!\"\n\n# Loop\nfor i in {1..3}; do\n    echo \"Count: $i\"\ndone"
  };

  intro.rb = {
    name: "Ruby",
    what: "Ruby is a dynamic, open-source programming language focused on simplicity and productivity. It has an elegant syntax that is natural to read and easy to write, with everything in Ruby being an object.",
    usedFor: "Web development (Ruby on Rails), scripting and automation, data processing, DevOps tooling (Chef, Puppet), prototyping, and building APIs. Ruby emphasizes developer happiness and convention over configuration.",
    creator: "Yukihiro 'Matz' Matsumoto, created in 1995. Ruby combines features from Perl, Smalltalk, Eiffel, Ada, and Lisp, with a focus on object-oriented programming and programmer-friendly syntax.",
    code: "# Hello from Ruby\nputs \"Hello, Ruby!\"\n\n# Everything is an object\n5.times { puts \"Ruby!\" }\n\n# Methods and blocks\ndef greet(name)\n  \"Hello, #{name}!\"\nend\n\nputs greet(\"World\")\n\n# Arrays and each\n[1, 2, 3].each { |n| puts n }"
  };

  intro.lua = {
    name: "Lua",
    what: "Lua is a lightweight, high-level, dynamically typed scripting language designed for embedded use in applications. It combines simple procedural syntax with powerful data description constructs (tables), making it ideal for configuration, scripting, and extending other programs.",
    usedFor: "Game development (World of Warcraft, Roblox, Angry Birds), embedded systems, configuration scripting, network appliances, and as an embeddable extension language for C/C++ applications. Lua is known for its speed, small footprint, and easy integration with C.",
    creator: "Roberto Ierusalimschy, Luiz Henrique de Figueiredo, and Waldemar Celes at Pontifical Catholic University of Rio de Janeiro (PUC-Rio). First released in 1993. Lua 5.4 is the current version.",
    code: "-- Hello World\nprint('Hello, Lua!')\n\n-- Function\nfunction greet(name)\n    return \"Hello, \" .. name .. \"!\"\nend\n\nprint(greet('World'))\n\n-- Table (Lua's main data structure)\nlocal fruits = {\"apple\", \"banana\", \"cherry\"}\nfor i, fruit in ipairs(fruits) do\n    print(i .. \": \" .. fruit)\nend"
  };

  intro.scala = {
    name: "Scala",
    what: "Scala (scalable language) is a statically-typed, general-purpose programming language that combines object-oriented and functional programming paradigms. It runs on the JVM and can seamlessly interoperate with Java code. Scala's concise syntax and powerful type system make it ideal for building robust, high-performance applications.",
    usedFor: "Building scalable backend systems, data processing pipelines (Apache Spark is written in Scala), distributed systems, web applications (Play Framework, http4s), domain-driven design, and functional programming education. Scala's type safety and expressiveness reduce runtime errors and improve code maintainability.",
    creator: "Martin Odersky, a programming language researcher at EPFL, who created Scala in 2003. Odersky previously worked on Java generics and the javac compiler. Scala 3 (Dotty), released in 2021, introduced significant improvements to the type system and syntax.",
    code: "// Hello from Scala\nobject Hello extends App {\n  println(\"Hello, Scala!\")\n}\n\n// Functional programming\nval numbers = List(1, 2, 3, 4, 5)\nval doubled = numbers.map(_ * 2)\nval sum = numbers.fold(0)(_ + _)\n\n// Pattern matching\ndef describe(x: Any): String = x match {\n  case i: Int => s\"Integer: $i\"\n  case s: String => s\"String: $s\"\n  case _ => \"Unknown\"\n}\n\n// Case classes (immutable data)\ncase class User(id: Int, name: String)\nval user = User(1, \"Alice\")\nprintln(user.name)"
  };

  intro.wasm = {
    name: "WebAssembly",
    what: "WebAssembly (Wasm) is a binary instruction format for a stack-based virtual machine designed as a portable compilation target. It enables high-performance applications to run in web browsers at near-native speed.",
    usedFor: "Running computationally intensive code in browsers, porting desktop applications to the web, serverless computing, and blockchain smart contracts. Wasm complements JavaScript for web performance.",
    creator: "Developed by W3C working group including engineers from Google, Mozilla, Apple, and Microsoft. First announced in 2015 and became a W3C standard in 2019.",
    code: ";; WebAssembly Text Format\n(module\n  (func $add (param i32 i32) (result i32)\n    local.get 0\n    local.get 1\n    i32.add)\n  (export \"add\" (func $add))\n)"
  };

  // ── Databases ──

  intro.pg = {
    name: "PostgreSQL",
    what: "PostgreSQL is a powerful, open-source object-relational database system with over 30 years of active development. It supports advanced SQL features, ACID transactions, and extensibility.",
    usedFor: "Web application backends, data warehousing, geospatial applications (with PostGIS), financial systems, and as a primary database for enterprise applications.",
    creator: "Started as the POSTGRES project at UC Berkeley led by Michael Stonebraker in 1986. PostgreSQL is developed by a global community.",
    code: "-- Create table\nCREATE TABLE users (\n    id SERIAL PRIMARY KEY,\n    name VARCHAR(100) NOT NULL,\n    email VARCHAR(255) UNIQUE NOT NULL\n);\n\n-- Query\nSELECT * FROM users WHERE name LIKE 'A%';"
  };

  intro.mysql = {
    name: "MySQL",
    what: "MySQL is a widely used open-source relational database management system known for its speed, reliability, and ease of use. It uses Structured Query Language (SQL) for data access.",
    usedFor: "Web application databases (especially with PHP/LAMP stack), content management systems (WordPress, Drupal), e-commerce platforms, and data-driven applications.",
    creator: "Michael Widenius and David Axmark at MySQL AB, first released in 1995. Now owned by Oracle Corporation.",
    code: "-- Create table\nCREATE TABLE users (\n    id INT AUTO_INCREMENT PRIMARY KEY,\n    name VARCHAR(100) NOT NULL,\n    email VARCHAR(255) UNIQUE NOT NULL\n);\n\n-- Query\nSELECT * FROM users WHERE name LIKE 'A%';"
  };

  intro.sqlite = {
    name: "SQLite",
    what: "SQLite is a C-language library that implements a self-contained, serverless, zero-configuration SQL database engine. It stores the entire database in a single cross-platform file.",
    usedFor: "Mobile apps, embedded devices, desktop applications, testing and development, and any scenario requiring a lightweight embedded database. SQLite is the most deployed database engine.",
    creator: "D. Richard Hipp, first released in August 2000. SQLite is public domain and maintained by Hipp and a small team.",
    code: "-- Create table\nCREATE TABLE users (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    name TEXT NOT NULL,\n    email TEXT UNIQUE NOT NULL\n);\n\n-- Query\nSELECT * FROM users WHERE name LIKE 'A%';"
  };

  intro.mongodb = {
    name: "MongoDB",
    what: "MongoDB is a source-available, document-oriented NoSQL database program. It stores data in flexible, JSON-like documents with optional schemas, making it highly scalable.",
    usedFor: "Application backends with rapidly evolving schemas, real-time analytics, content management, IoT data storage, and big data applications requiring horizontal scaling.",
    creator: "Kevin P. Ryan, Eliot Horowitz, and Dwight Merriman at MongoDB Inc. (formerly 10gen), first released in 2009.",
    code: "// Insert a document\ndb.users.insertOne({\n  name: \"Alice\",\n  email: \"alice@example.com\",\n  age: 30\n})\n\n// Query\ndb.users.find({ age: { $gt: 25 } })"
  };

  intro.firebase = {
    name: "Firebase",
    what: "Firebase is Google's mobile and web app development platform that provides backend services including a real-time NoSQL database, authentication, cloud storage, and hosting.",
    usedFor: "Building mobile and web apps with real-time data sync, user authentication, push notifications, serverless functions, and analytics. Firebase accelerates prototyping and MVP development.",
    creator: "Andrew Lee and James Tamplin, founded as Envolve in 2011. Acquired by Google in 2014.",
    code: "// Write data\nimport { getDatabase, ref, set } from \"firebase/database\";\n\nconst db = getDatabase();\nset(ref(db, 'users/alice'), {\n  name: \"Alice\",\n  email: \"alice@example.com\"\n});"
  };

  intro.redis = {
    name: "Redis",
    what: "Redis is an in-memory data structure store used as a database, cache, and message broker. It supports strings, hashes, lists, sets, sorted sets, and more with built-in replication.",
    usedFor: "Caching, session management, real-time analytics, message queues, rate limiting, and as a primary database for high-throughput applications requiring sub-millisecond latency.",
    creator: "Salvatore Sanfilippo (antirez), first released in 2009. Sponsored by Redis Labs.",
    code: "# Set and get\nSET user:1000 \"{\\\"name\\\":\\\"Alice\\\"}\"\nGET user:1000\n\n# List operations\nLPUSH tasks \"task1\"\nLPUSH tasks \"task2\"\nLRANGE tasks 0 -1"
  };

  // ── Cloud & DevOps ──

  intro.aws = {
    name: "AWS",
    what: "Amazon Web Services (AWS) is a comprehensive cloud computing platform offering over 200 services including compute, storage, databases, machine learning, and analytics.",
    usedFor: "Hosting web applications, data storage and backup, scalable computing, big data analytics, IoT, machine learning, and enterprise infrastructure migration to the cloud.",
    creator: "Amazon.com, launched internally in 2002 and publicly in 2006. AWS is the world's leading cloud provider.",
    code: "# AWS CLI: create S3 bucket\naws s3 mb s3://my-bucket\n\n# List buckets\naws s3 ls\n\n# Sync files\naws s3 sync ./local-dir s3://my-bucket/remote-dir"
  };

  intro.azure = {
    name: "Azure",
    what: "Microsoft Azure is a cloud computing platform providing infrastructure as a service (IaaS), platform as a service (PaaS), and software as a service (SaaS) solutions.",
    usedFor: "Enterprise cloud migration, hybrid cloud solutions, AI and machine learning, DevOps pipelines, data analytics, and hosting web applications with Microsoft integration.",
    creator: "Microsoft, announced in October 2008 and launched commercially in 2010 as Windows Azure, later renamed Microsoft Azure in 2014.",
    code: "# Azure CLI: create resource group\naz group create --name MyGroup --location eastus\n\n# Create VM\naz vm create --resource-group MyGroup --name MyVM --image Ubuntu2204"
  };

  intro.gcp = {
    name: "GCP",
    what: "Google Cloud Platform (GCP) is Google's cloud computing services suite offering compute, storage, data analytics, and machine learning services on the same infrastructure Google uses internally.",
    usedFor: "Big data and analytics, machine learning and AI, containerized applications (GKE), serverless computing, and storage solutions. GCP is strong in data and ML services.",
    creator: "Google, launched in 2008 with App Engine. GCP has grown to include over 100+ cloud services.",
    code: "# gcloud CLI: list instances\ngcloud compute instances list\n\n# Create VM\ngcloud compute instances create my-instance --zone=us-central1-a"
  };

  intro.cloud = {
    name: "Cloud Computing",
    what: "Cloud computing is the on-demand delivery of computing resources — servers, storage, databases, networking, and software — over the internet with pay-as-you-go pricing.",
    usedFor: "Scalable web hosting, data backup and recovery, big data analytics, software delivery (SaaS), development and testing, and reducing capital expenditure on physical infrastructure.",
    creator: "The concept emerged in the 1960s (John McCarthy), but modern cloud computing started with Amazon AWS in 2006, followed by Google and Microsoft.",
    code: "# Common cloud concepts\n# IaaS: Virtual machines, storage, networking\n# PaaS: Managed databases, app hosting\n# SaaS: Email, CRM, office tools\n\n# Infrastructure as Code (Terraform)\nresource \"aws_instance\" \"web\" {\n  ami = \"ami-abc123\"\n  instance_type = \"t2.micro\"\n}"
  };

  intro.git = {
    name: "Git",
    what: "Git is a distributed version control system that tracks changes in source code during software development. It enables multiple developers to work simultaneously with branching and merging.",
    usedFor: "Source code management, collaboration in software teams, version tracking, CI/CD pipelines, and managing open-source contributions on platforms like GitHub and GitLab.",
    creator: "Linus Torvalds, created in 2005 to manage Linux kernel development. Git is now the most widely used version control system in the world.",
    code: "# Initialize a repository\ngit init\n\n# Stage and commit\ngit add .\ngit commit -m \"Initial commit\"\n\n# Branch and merge\ngit branch feature\ngit checkout feature\ngit merge feature"
  };

  // ── Mobile Platforms ──

  intro.android = {
    name: "Android",
    what: "Android is a mobile operating system based on a modified Linux kernel, designed primarily for touchscreen devices. It features a rich app ecosystem through Google Play.",
    usedFor: "Building Android mobile apps using Kotlin or Java, developing on the Android platform with its SDK, and creating tablet, TV, and wearable applications.",
    creator: "Andy Rubin, Rich Miner, Nick Sears, and Chris White at Android Inc., founded in 2003. Acquired by Google in 2005.",
    code: "// Android Activity\nclass MainActivity : AppCompatActivity() {\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        setContentView(R.layout.activity_main)\n    }\n}"
  };

  intro.ios = {
    name: "iOS",
    what: "iOS is Apple's mobile operating system for iPhone, iPad, and iPod Touch. It provides a secure, integrated ecosystem with the App Store and deep hardware-software optimization.",
    usedFor: "Building iPhone and iPad applications using Swift or Objective-C, developing for Apple's ecosystem with access to native APIs for camera, AR, health, and more.",
    creator: "Apple Inc., first released in 2007 alongside the original iPhone. Originally called iPhone OS, renamed to iOS in 2010.",
    code: "// iOS ViewController\nimport UIKit\n\nclass ViewController: UIViewController {\n    override func viewDidLoad() {\n        super.viewDidLoad()\n        view.backgroundColor = .white\n    }\n}"
  };

  // ── Game Development ──

  intro.gamedev = {
    name: "Game Development",
    what: "Game development is the art of creating video games involving game design, programming, art, sound design, and testing. It combines technical and creative disciplines.",
    usedFor: "Building video games for PC, consoles, mobile, and web platforms. Game development covers everything from indie pixel-art games to AAA 3D titles.",
    creator: "The first video games emerged in the 1950s-60s (Tennis for Two, Spacewar!). Modern game development has evolved into a multi-billion dollar industry.",
    code: "// Simple game loop concept\nfunction gameLoop() {\n    update();  // Update game state\n    render();  // Draw to screen\n    requestAnimationFrame(gameLoop);\n}\n\n// Start the loop\ngameLoop();"
  };

  intro.godot = {
    name: "Godot",
    what: "Godot is a free, open-source game engine with a node-based architecture. It uses its own scripting language (GDScript) plus C#, C++, and visual scripting for game logic.",
    usedFor: "Creating 2D and 3D games for desktop, mobile, and web platforms. Godot is popular for indie game development due to its lightweight editor and permissive MIT license.",
    creator: "Juan Linietsky and Ariel Manzur, first released in 2014. Godot is developed by the Godot Engine community under the Software Freedom Conservancy.",
    code: "# GDScript\nextends Node\n\nfunc _ready():\n    print(\"Hello, Godot!\")\n\nfunc _process(delta):\n    # Called every frame\n    pass"
  };

  intro.unity = {
    name: "Unity",
    what: "Unity is a cross-platform game engine known for its user-friendly editor and extensive asset store. It supports 2D and 3D game development with C# scripting and a component-based architecture.",
    usedFor: "Building games for mobile, PC, console, AR/VR, and web platforms. Unity is also used for architectural visualization, film, and simulation training.",
    creator: "David Helgason, Joachim Ante, and Nicholas Francis at Unity Technologies. First released in 2005 for macOS, later expanded to multiple platforms.",
    code: "using UnityEngine;\n\npublic class HelloWorld : MonoBehaviour {\n    void Start() {\n        Debug.Log(\"Hello, Unity!\");\n    }\n}"
  };

  intro.unreal = {
    name: "Unreal Engine",
    what: "Unreal Engine is a powerful game development engine known for its photorealistic graphics, Blueprint visual scripting, and C++ API. It is developed by Epic Games.",
    usedFor: "AAA game development, architectural visualization, film and broadcast production, automotive design, and virtual production. Unreal Engine powers Fortnite and countless AAA titles.",
    creator: "Epic Games, first released in 1998 with the game Unreal. Unreal Engine 5 was released in 2022, introducing Nanite and Lumen technologies.",
    code: "// C++ in Unreal Engine\n#include \"GameFramework/Actor.h\"\n\nclass AMyActor : public AActor {\n    void BeginPlay() override {\n        Super::BeginPlay();\n        UE_LOG(LogTemp, Warning, TEXT(\"Hello, Unreal!\"));\n    }\n};"
  };

  // ── Special Modes ──

  intro.mobile = {
    name: "Mobile Development",
    what: "Mobile development covers building applications for smartphones and tablets. It includes native development (Android/iOS), cross-platform frameworks (React Native, Flutter), and progressive web apps.",
    usedFor: "Building mobile apps for Android and iOS platforms, creating cross-platform apps with shared codebases, and developing mobile-first web experiences.",
    creator: "Mobile development evolved with the release of the iPhone SDK in 2008 and Android SDK in 2008. Cross-platform frameworks emerged in the 2010s.",
    code: "// React Native example\nimport { Text, View } from 'react-native';\n\nfunction App() {\n  return (\n    <View>\n      <Text>Hello, Mobile!</Text>\n    </View>\n  );\n}"
  };

  intro.cicd = {
    name: "CI/CD",
    what: "CI/CD (Continuous Integration/Continuous Delivery) is a set of practices automating the building, testing, and deployment of software. It enables teams to release code changes frequently and reliably.",
    usedFor: "Automating software build pipelines, running tests on every commit, deploying to production automatically, and maintaining code quality through automated checks.",
    creator: "CI/CD practices originated from extreme programming (XP) in the late 1990s. Popular tools include Jenkins (2005), GitHub Actions (2018), and GitLab CI.",
    code: "# GitHub Actions example\nname: CI\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - run: npm test"
  };

  intro.backend = {
    name: "Backend Development",
    what: "Backend development encompasses server-side logic, database interactions, authentication, APIs, and the infrastructure that powers frontend applications.",
    usedFor: "Building web APIs, handling user authentication, managing databases, processing server-side business logic, and ensuring application security and scalability.",
    creator: "Backend development has evolved since the early days of the web (CGI scripts in the 1990s) through modern frameworks like Express, Django, and Spring.",
    code: "// Node.js Express API\nconst express = require('express');\nconst app = express();\n\napp.get('/api/hello', (req, res) => {\n  res.json({ message: 'Hello, Backend!' });\n});\n\napp.listen(3000);"
  };

  // ── Reuse from techStackIntro for frameworks and tools ──
  var reuseKeys = ['react', 'vue', 'angular', 'dk', 'node', 'express', 'next', 'svelte', 'tailwind', 'redis', 'nuxt', 'sveltekit', 'remix', 'vite', 'webpack', 'graphql', 'prisma', 'rnative', 'flutter', 'cypress', 'playwright', 'k8s', 'terraform', 'bootstrap', 'django', 'flask', 'fastapi', 'spring'];

  for (var i = 0; i < reuseKeys.length; i++) {
    var key = reuseKeys[i];
    if (typeof techStackIntro !== 'undefined' && techStackIntro[key]) {
      intro[key] = techStackIntro[key];
    }
  }

  window.langIntro = intro;

  window.loadLangIntro = function loadLangIntro(lang) {
    const intro = window.langIntro[lang];
    if (!intro) {
      const langData = window.courseData && window.courseData[lang];
      if (langData) {
        const phases = Object.keys(langData);
        if (phases.length > 0) {
          const firstPhase = phases[0];
          const topics = Object.keys(langData[firstPhase]);
          if (topics.length > 0) {
            window.loadTopic(firstPhase, topics[0]);
            return;
          }
        }
      }
      return;
    }

    document.getElementById('explanation').innerHTML = `
        <div class="techstack-intro" onclick="loadFirstPlatformTopic('${lang}')" style="cursor:pointer;">
            <div class="techstack-intro-header">
                <img class="techstack-intro-logo" src="public/logos/${lang}.svg"
                     alt="${intro.name}"
                     onerror="this.style.display='none'">
                <h2>${intro.name}</h2>
            </div>
            <div class="techstack-intro-section">
                <h3>What is it?</h3>
                <p>${intro.what}</p>
            </div>
            <div class="techstack-intro-section">
                <h3>What is it used for?</h3>
                <p>${intro.usedFor}</p>
            </div>
            <div class="techstack-intro-section">
                <h3>Who created it?</h3>
                <p>${intro.creator}</p>
            </div>
            <p style="color:var(--accent);font-size:10px;margin-top:12px;opacity:0.7;">Click to start learning →</p>
        </div>
    `;

    document.getElementById('editor').value = intro.code;
    updateHighlight();
    document.getElementById('output').innerText = '// ' + intro.name + ' — explore the topics below to start learning';
  };
})();
