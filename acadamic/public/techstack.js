let techStackProvider = 'react';

const techStackProviderNames = {
    react: 'React', vue: 'Vue', angular: 'Angular', dk: 'Docker',
    node: 'Node.js', express: 'Express', next: 'Next.js', svelte: 'Svelte',
    tailwind: 'Tailwind', redis: 'Redis', nuxt: 'Nuxt', sveltekit: 'SvelteKit',
    remix: 'Remix', vite: 'Vite', webpack: 'Webpack', graphql: 'GraphQL',
    prisma: 'Prisma', rnative: 'React Native', flutter: 'Flutter',
    cypress: 'Cypress', playwright: 'Playwright', k8s: 'Kubernetes',
    terraform: 'Terraform',
};

const techStackProviderColors = {
    react: '#61DAFB', vue: '#4FC08D', angular: '#DD0031', dk: '#2496ED',
    node: '#339933', express: '#000000', next: '#000000', svelte: '#FF3E00',
    tailwind: '#06B6D4', redis: '#DC382D', nuxt: '#00DC82', sveltekit: '#FF3E00',
    remix: '#121212', vite: '#646CFF', webpack: '#8DD6F9', graphql: '#E10098',
    prisma: '#2D3748', rnative: '#61DAFB', flutter: '#02569B',
    cypress: '#17202C', playwright: '#2EAD33', k8s: '#326CE5',
    terraform: '#7B42BC',
};

const techStackIntro = {
    react: {
        name: 'React',
        what: 'React is a JavaScript library for building user interfaces using a component-based architecture with a virtual DOM for efficient rendering. It enforces a unidirectional data flow and allows developers to compose complex UIs from small, reusable pieces.',
        usedFor: 'Building single-page applications, complex interactive UIs, mobile apps via React Native, and server-rendered applications through frameworks like Next.js.',
        creator: 'Jordan Walke, a software engineer at Meta (Facebook). First deployed on Facebook\'s newsfeed in 2011 and open-sourced at JSConf US in May 2013.',
        code: 'function Welcome({ name }) {\n  return <h1>Hello, {name}!</h1>;\n}\n\nfunction App() {\n  return <Welcome name="React" />;\n}\n\n// React renders components,\n// not templates — UI is a function of state.'
    },
    vue: {
        name: 'Vue',
        what: 'Vue is a progressive JavaScript framework for building user interfaces with a reactive, declarative approach. It features a gentle learning curve, a component-based architecture, and a reactive data system that automatically tracks dependencies.',
        usedFor: 'Building SPAs, interactive web interfaces, and progressively enhancing existing pages. Vue scales from a simple library to a full-featured framework with Vue Router and Pinia.',
        creator: 'Evan You, a former Google engineer who worked on AngularJS. First released in February 2014, with the goal of extracting the best parts of Angular in a more lightweight package.',
        code: 'const { createApp, ref } = Vue;\n\ncreateApp({\n  setup() {\n    const count = ref(0);\n    return { count };\n  },\n  template: `<button @click="count++">\n    Clicked {{ count }} times\n  </button>`\n}).mount(\'#app\');'
    },
    angular: {
        name: 'Angular',
        what: 'Angular is a comprehensive TypeScript-based web application framework that provides a complete solution for building client-side apps. It includes a powerful template system, dependency injection, routing, forms handling, and HTTP client out of the box.',
        usedFor: 'Building large-scale enterprise applications, SPAs, and progressive web apps. Angular\'s all-in-one approach is popular in corporate environments requiring structured development processes.',
        creator: 'Misko Hevery and the Angular team at Google. Originally released as AngularJS in 2010, then completely rewritten as Angular 2+ in 2016.',
        code: 'import { Component } from \'@angular/core\';\n\n@Component({\n  selector: \'app-root\',\n  template: `<h1>{{ title }}</h1>`\n})\nexport class AppComponent {\n  title = \'Hello, Angular!\';\n}'
    },
    dk: {
        name: 'Docker',
        what: 'Docker is a containerization platform that packages applications and their dependencies into lightweight, portable containers. Containers run consistently across any environment, eliminating "it works on my machine" problems.',
        usedFor: 'Application deployment, microservices architecture, CI/CD pipelines, development environment standardization, and scaling applications across cloud providers.',
        creator: 'Solomon Hykes, who started Docker as an internal project at dotCloud (a PaaS company) in 2013. It was open-sourced in March 2013.',
        code: '# Dockerfile\nFROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD ["node", "server.js"]\n\n# Build: docker build -t myapp .\n# Run:   docker run -p 3000:3000 myapp'
    },
    node: {
        name: 'Node.js',
        what: 'Node.js is a JavaScript runtime built on Chrome\'s V8 engine that allows JavaScript to run on the server. It uses an event-driven, non-blocking I/O model that makes it lightweight and efficient for data-intensive applications.',
        usedFor: 'Building web servers, REST APIs, real-time applications (chat, gaming), CLI tools, microservices, and back-end services. Node.js has the largest ecosystem of open-source packages (npm).',
        creator: 'Ryan Dahl, who created Node.js in 2009. Originally sponsored by Joyent, it is now maintained by the OpenJS Foundation under the Node.js Foundation.',
        code: 'const http = require(\'http\');\n\nconst server = http.createServer((req, res) => {\n  res.statusCode = 200;\n  res.setHeader(\'Content-Type\', \'text/plain\');\n  res.end(\'Hello, Node.js!\\n\');\n});\n\nserver.listen(3000, () => {\n  console.log(\'Server running on port 3000\');\n});'
    },
    express: {
        name: 'Express',
        what: 'Express is a minimal and flexible Node.js web application framework that provides a robust set of features for building web and mobile applications. It is the de facto standard server framework for Node.js.',
        usedFor: 'Building web servers, REST APIs, middleware-based request handling, and as the foundation for many Node.js frameworks (Next.js, NestJS, etc.).',
        creator: 'TJ Holowaychuk, first released in 2010. Initially created as a side project, it quickly became the most popular Node.js framework. Now maintained by the Node.js Foundation.',
        code: 'const express = require(\'express\');\nconst app = express();\nconst port = 3000;\n\napp.get(\'/\', (req, res) => {\n  res.send(\'Hello, Express!\');\n});\n\napp.listen(port, () => {\n  console.log(`App listening on port ${port}`);\n});'
    },
    next: {
        name: 'Next.js',
        what: 'Next.js is a React framework that provides server-side rendering, static site generation, file-based routing, API routes, and built-in optimizations. It abstracts away the complex tooling so developers can focus on building features.',
        usedFor: 'Building production-grade React applications with SSR, SSG, ISR, and full-stack capabilities. Ideal for content sites, e-commerce, dashboards, and any app needing SEO and performance.',
        creator: 'Guillermo Rauch, CEO of Vercel (formerly ZEIT). First released in October 2016 as an open-source React framework.',
        code: '// pages/index.js\nimport Head from \'next/head\';\n\nexport default function Home() {\n  return (\n    <>\n      <Head>\n        <title>Next.js App</title>\n      </Head>\n      <h1>Hello, Next.js!</h1>\n    </>\n  );\n}'
    },
    svelte: {
        name: 'Svelte',
        what: 'Svelte is a radical new approach to building user interfaces — it shifts the work from the browser to the compile step. Instead of using a virtual DOM, Svelte compiles components into highly efficient imperative code that directly manipulates the DOM.',
        usedFor: 'Building fast, reactive web applications with less code. Svelte is great for SPAs, interactive widgets, and tiny bundle-sized apps. Its compile-time approach eliminates the need for a framework runtime.',
        creator: 'Rich Harris, a graphics editor at The New York Times. First released in November 2016 as an open-source compiler.',
        code: '<script>\n  let count = 0;\n  function increment() {\n    count += 1;\n  }\n</script>\n\n<button on:click={increment}>\n  Clicked {count} times\n</button>\n\n<style>\n  button { color: #FF3E00; }\n</style>'
    },
    tailwind: {
        name: 'Tailwind CSS',
        what: 'Tailwind CSS is a utility-first CSS framework that provides low-level, composable utility classes for building custom designs directly in your markup. Instead of pre-built components, it gives you building blocks to create any design.',
        usedFor: 'Rapidly building modern, responsive user interfaces with consistent design systems. Tailwind is framework-agnostic and works with React, Vue, Angular, and plain HTML projects.',
        creator: 'Adam Wathan, first released in November 2017. Inspired by the utility-first approach from projects like Tachyons and Functional CSS.',
        code: '<div class="bg-blue-500 hover:bg-blue-700 text-white\n            font-bold py-2 px-4 rounded">\n  Hover me\n</div>\n\n<!-- Utility classes compose directly\n     in your HTML — no custom CSS needed -->'
    },
    redis: {
        name: 'Redis',
        what: 'Redis (Remote Dictionary Server) is an open-source, in-memory data structure store that can be used as a database, cache, and message broker. It supports data structures like strings, hashes, lists, sets, and sorted sets with range queries.',
        usedFor: 'Caching, session management, real-time analytics, message queues, rate limiting, and as a primary database for high-throughput applications that need sub-millisecond response times.',
        creator: 'Salvatore Sanfilippo (known as antirez), first released in 2009. Sponsored by Redis Labs (now Redis Inc.) since 2015.',
        code: 'import { createClient } from \'redis\';\n\nconst client = createClient();\nawait client.connect();\n\nawait client.set(\'key\', \'Hello, Redis!\');\nconst value = await client.get(\'key\');\nconsole.log(value); // Hello, Redis!\n\nawait client.disconnect();'
    },
    nuxt: {
        name: 'Nuxt',
        what: 'Nuxt is a Vue.js framework that provides server-side rendering, static site generation, file-based routing, auto-imports, and a modular architecture through its module system. It bridges the gap between Vue and production-grade applications.',
        usedFor: 'Building universal Vue applications with SSR and SSG, SEO-friendly websites, dashboards, and full-stack applications with built-in server routes and middleware.',
        creator: 'Sebastien Chopin, first released in October 2016. Nuxt 3, released in 2022, was rewritten from the ground up using Vue 3, Vite, and Nitro.',
        code: '// app.vue — Nuxt 3\n<template>\n  <div>\n    <h1>{{ message }}</h1>\n  </div>\n</template>\n\n<script setup>\nconst message = ref(\'Hello, Nuxt!\');\n</script>\n\n<!-- File-based routing: pages/index.vue\n     becomes / automatically -->'
    },
    sveltekit: {
        name: 'SvelteKit',
        what: 'SvelteKit is a framework for building Svelte applications with server-side rendering, file-based routing, API endpoints, form actions, and deployment adapters. It is the official successor to Sapper.',
        usedFor: 'Building full-stack Svelte applications with SSR, SSG, and server-side logic. SvelteKit is ideal for production-grade apps that need SEO, fast load times, and seamless data fetching.',
        creator: 'Rich Harris, the creator of Svelte, at Vercel. First released in public beta in March 2021, with a stable 1.0 release in December 2022.',
        code: '// src/routes/+page.svelte\n<script>\n  let count = 0;\n</script>\n\n<h1>Hello, SvelteKit!</h1>\n<button on:click={() => count++}>\n  Count: {count}\n</button>\n\n<!-- File-based routing:\n     src/routes/about/+page.svelte\n     becomes /about -->'
    },
    remix: {
        name: 'Remix',
        what: 'Remix is a full-stack web framework built on top of React Router that embraces the web platform fundamentals — HTML forms, HTTP methods, and progressive enhancement. It treats the server as a first-class citizen.',
        usedFor: 'Building full-stack React applications with server-side rendering, form handling, nested routes, and progressive enhancement. Remix is designed for the modern web with a focus on user experience.',
        creator: 'Ryan Florence and Michael Jackson (creators of React Router). First released in public beta in 2021, acquired by Shopify in 2022, and open-sourced in 2023.',
        code: '// app/routes/_index.jsx\nexport default function Index() {\n  return (\n    <div>\n      <h1>Hello, Remix!</h1>\n      <form method="post">\n        <input name="name" />\n        <button type="submit">Submit</button>\n      </form>\n    </div>\n  );\n}'
    },
    vite: {
        name: 'Vite',
        what: 'Vite (French for "quick") is a modern build tool that leverages native ES modules for instant server start and fast Hot Module Replacement. It uses Rollup for production builds with pre-configured optimizations.',
        usedFor: 'As a build tool and dev server for JavaScript/TypeScript projects. Vite supports React, Vue, Svelte, vanilla JS, and many other frameworks through plugins.',
        creator: 'Evan You, the creator of Vue.js. First released in April 2020 as a faster alternative to webpack for Vue projects, later expanded to support all frameworks.',
        code: '// vite.config.js\nimport { defineConfig } from \'vite\';\nimport react from \'@vitejs/plugin-react\';\n\nexport default defineConfig({\n  plugins: [react()],\n  server: {\n    port: 3000\n  }\n});\n\n// Run: npx vite\n// Build: npx vite build'
    },
    webpack: {
        name: 'Webpack',
        what: 'Webpack is a static module bundler that takes modules with dependencies and generates static assets representing those modules. It supports loaders and plugins for transforming and optimizing assets.',
        usedFor: 'Bundling JavaScript applications with dependency management, code splitting, asset processing (CSS, images, fonts), and build optimization for production deployments.',
        creator: 'Tobias Koppers, first released in March 2012. Webpack became the dominant bundler in the React ecosystem and is maintained by the webpack contributors and OpenJS Foundation.',
        code: '// webpack.config.js\nconst path = require(\'path\');\n\nmodule.exports = {\n  entry: \'./src/index.js\',\n  output: {\n    path: path.resolve(__dirname, \'dist\'),\n    filename: \'bundle.js\'\n  },\n  module: {\n    rules: [\n      { test: /\\.css$/, use: [\'style-loader\', \'css-loader\'] }\n    ]\n  }\n};'
    },
    graphql: {
        name: 'GraphQL',
        what: 'GraphQL is a query language for APIs and a runtime for executing those queries with your existing data. Clients request exactly the data they need, eliminating over-fetching and under-fetching common in REST APIs.',
        usedFor: 'Building flexible, efficient APIs where clients control the response shape. Popular for complex data requirements, mobile APIs, and modern web applications needing precise data fetching.',
        creator: 'Lee Byron and others at Meta (Facebook). Internally developed since 2012, open-sourced in 2015. Now governed by the GraphQL Foundation under the Linux Foundation.',
        code: 'type Query {\n  user(id: ID!): User\n}\n\ntype User {\n  id: ID!\n  name: String\n  posts: [Post]\n}\n\n// Query:\n// {\n//   user(id: "1") {\n//     name\n//     posts { title }\n//   }\n// }'
    },
    prisma: {
        name: 'Prisma',
        what: 'Prisma is a next-generation ORM (Object-Relational Mapper) for Node.js and TypeScript that provides a type-safe database client, auto-generated queries, and a declarative data modeling language.',
        usedFor: 'Database access in Node.js/TypeScript applications — querying, migrating, and seeding databases. Prisma supports PostgreSQL, MySQL, SQLite, SQL Server, and MongoDB.',
        creator: 'Johannes Schickling and Nikolas Burk, first released in 2016. Originally a GraphQL database tool, it evolved into a general-purpose ORM. Backed by Prisma Data Platform.',
        code: '// Schema (schema.prisma)\nmodel User {\n  id    Int     @id @default(autoincrement())\n  name  String\n  email String  @unique\n  posts Post[]\n}\n\n// Query in code\nconst users = await prisma.user.findMany({\n  where: { email: { contains: \'example\' } },\n  include: { posts: true }\n});'
    },
    rnative: {
        name: 'React Native',
        what: 'React Native is a framework for building native mobile applications using JavaScript and React. It compiles to native platform code, giving apps the look, feel, and performance of truly native apps.',
        usedFor: 'Building cross-platform iOS and Android apps with a single React codebase. Popular for mobile apps that need native performance without writing platform-specific code.',
        creator: 'Meta (Facebook). First released as an open-source project on GitHub in 2015. Built on the same principles as React but targeting mobile platforms instead of the web.',
        code: 'import { Text, View } from \'react-native\';\n\nfunction App() {\n  return (\n    <View style={{ flex: 1 }}>\n      <Text>Hello, React Native!</Text>\n    </View>\n  );\n}\n\n// Runs on iOS and Android\n// with native components'
    },
    flutter: {
        name: 'Flutter',
        what: 'Flutter is an open-source UI toolkit for building natively compiled applications for mobile, web, and desktop from a single Dart codebase. It uses the Skia graphics engine to render its own widgets, bypassing platform UI components.',
        usedFor: 'Building cross-platform apps for iOS, Android, web, Windows, macOS, and Linux with a single codebase. Popular for MVPs, design-centric apps, and products needing consistent branding.',
        creator: 'Google, first announced in 2015 at the Dart Developer Summit. The first stable version was released in December 2018.',
        code: 'import \'package:flutter/material.dart\';\n\nvoid main() {\n  runApp(\n    MaterialApp(\n      home: Scaffold(\n        body: Center(\n          child: Text(\'Hello, Flutter!\'),\n        ),\n      ),\n    ),\n  );\n}'
    },
    cypress: {
        name: 'Cypress',
        what: 'Cypress is a developer-friendly end-to-end testing framework built for the modern web. It runs tests inside the browser, providing real-time reloading, time-travel debugging, and automatic waiting.',
        usedFor: 'End-to-end testing, integration testing, and component testing for web applications. Cypress excels at debugging with its interactive test runner and detailed error messages.',
        creator: 'Brian Mann, first released in 2016. Cypress was built from the ground up to solve the pain points developers faced with traditional Selenium-based testing.',
        code: "describe('My App', () => {\n  it('loads the homepage', () => {\n    cy.visit('/');\n    cy.contains('Welcome');\n    cy.get('button').click();\n    cy.url().should('include', '/dashboard');\n  });\n});\n\n// Runs in real browser — \n// debugs like DevTools"
    },
    playwright: {
        name: 'Playwright',
        what: 'Playwright is a cross-browser automation framework that enables reliable end-to-end testing across Chromium, Firefox, and WebKit with a single API. It auto-waits for elements and generates tests via codegen.',
        usedFor: 'Cross-browser testing, web scraping, automation, and performance testing. Playwright supports modern web features like network interception, mobile emulation, and parallel execution.',
        creator: 'Microsoft, first released in January 2019. Built by the same team that created Puppeteer at Google, bringing cross-browser support and improved reliability.',
        code: "import { test, expect } from '@playwright/test';\n\ntest('homepage works', async ({ page }) => {\n  await page.goto('https://example.com');\n  const title = await page.title();\n  expect(title).toContain('Example');\n  await page.screenshot({ path: 'home.png' });\n});"
    },
    k8s: {
        name: 'Kubernetes',
        what: 'Kubernetes (K8s) is an open-source container orchestration platform that automates the deployment, scaling, and management of containerized applications. It groups containers into pods and manages them across clusters of nodes.',
        usedFor: 'Container orchestration in production — deploying, scaling, load-balancing, rolling updates, and self-healing of containerized microservices across cloud and on-premise environments.',
        creator: 'Joe Beda, Brendan Burns, and Craig McLuckie at Google. Based on Google\'s internal Borg system, first open-sourced in 2014. Now governed by the Cloud Native Computing Foundation (CNCF).',
        code: '# deployment.yaml\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: my-app\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: my-app\n  template:\n    metadata:\n      labels:\n        app: my-app\n    spec:\n      containers:\n      - name: app\n        image: myapp:latest\n        ports:\n        - containerPort: 3000'
    },
    terraform: {
        name: 'Terraform',
        what: 'Terraform is an Infrastructure as Code (IaC) tool that lets you define and provision infrastructure using a declarative configuration language called HCL (HashiCorp Configuration Language). It manages cloud resources across multiple providers.',
        usedFor: 'Provisioning and managing cloud infrastructure (AWS, Azure, GCP), version-controlling infrastructure state, automating multi-cloud deployments, and managing infrastructure lifecycles.',
        creator: 'Mitchell Hashimoto at HashiCorp, first released in July 2014. Terraform pioneered the "infrastructure as code" approach and is now an industry standard for cloud provisioning.',
        code: '# main.tf\nprovider "aws" {\n  region = "us-west-2"\n}\n\nresource "aws_s3_bucket" "my_bucket" {\n  bucket = "my-tf-bucket"\n  tags = {\n    Name = "My bucket"\n  }\n}\n\n# Run: terraform init && terraform apply'
    }
};

function initTechStack() {
    currentLevel = 'all';
    document.getElementById('app').className = 'techstack-mode';
    document.getElementById('header-title').innerText = 'TECH STACK';
    document.getElementById('level-bar').style.display = 'none';
    document.querySelectorAll('.selector button').forEach(b => b.classList.remove('active'));
    document.getElementById('nav-techstack').classList.add('active');
    switchTechStackProvider('react');
}

function switchTechStackProvider(provider) {
    techStackProvider = provider;
    currentLang = provider;
    roadmapRendered = false;
    const rBtn = document.getElementById('roadmap-btn');
    if (rBtn) rBtn.title = 'View ' + (techStackProviderNames[provider] || provider) + ' Roadmap';
    if (!courseData[provider]) {
        document.getElementById('topic-list').innerHTML = '<div class="skeleton-title"></div><div class="skeleton-line"></div><div class="skeleton-line short"></div><div class="skeleton-line"></div>';
        document.getElementById('explanation').innerHTML = '<div class="skeleton-title"></div><div class="skeleton-line"></div><div class="skeleton-line med"></div><div class="skeleton-line"></div>';
        document.getElementById('editor').value = '';
        document.getElementById('output').innerText = '// Loading...';
        loadLangData(provider, function () {
            renderTechStackTopics();
            loadTechStackIntro(provider);
        });
        return;
    }
    renderTechStackTopics();
    loadTechStackIntro(provider);
}

function loadTechStackIntro(provider) {
    const intro = techStackIntro[provider];
    if (!intro) {
        loadFirstTechStackTopic(provider);
        return;
    }

    const displayName = techStackProviderNames[provider] || provider;
    const color = techStackProviderColors[provider] || '#94a3b8';

    document.getElementById('explanation').innerHTML = `
        <div class="techstack-intro">
            <div class="techstack-intro-header">
                <img class="techstack-intro-logo" src="public/logos/${provider}.svg"
                     alt="${displayName}" style="border-color:${color};"
                     onerror="this.style.display='none'">
                <h2>${displayName}</h2>
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
        </div>
    `;

    document.getElementById('editor').value = intro.code;
    updateHighlight();
    document.getElementById('output').innerText = `// ${displayName} — explore the topics below to learn more`;
}

function loadFirstTechStackTopic(provider) {
    const langData = courseData[provider];
    if (langData) {
        const phases = Object.keys(langData);
        if (phases.length > 0) {
            const firstPhase = phases[0];
            const topics = Object.keys(langData[firstPhase]);
            if (topics.length > 0) {
                loadTopic(firstPhase, topics[0]);
                return;
            }
        }
    }
    document.getElementById('explanation').innerHTML = '<div style="color:#64748b;padding:20px;text-align:center;font-size:11px;">Select a tech stack topic</div>';
    document.getElementById('editor').value = '';
    updateHighlight();
    document.getElementById('output').innerText = '// Select a tech stack topic';
}

function renderTechStackTopics() {
    const list = document.getElementById('topic-list');
    let html = `<div class="techstack-bar">`;
    const tsKeys = Object.keys(techStackProviderNames);
    for (const key of tsKeys) {
        const active = key === techStackProvider ? ' active' : '';
        const color = techStackProviderColors[key] || '#94a3b8';
        html += `<button class="techstack-btn${active}" onclick="switchTechStackProvider('${key}')">${techStackProviderNames[key]}</button>`;
    }
    html += `</div><div style="height:6px"></div>`;
    const langData = courseData[currentLang];
    if (langData) {
        html += `<div class="phase-header" onclick="loadTechStackIntro('${techStackProvider}')" style="cursor:pointer;">
            <span class="phase-toggle">▼</span>
            <span class="phase-label-text" style="font-style:italic;">About ${techStackProviderNames[techStackProvider] || techStackProvider}</span>
        </div>`;
        for (const phase in langData) {
            html += `<span class="phase-label">${phase}</span>`;
            for (const topic in langData[phase]) {
                const btnId = 'btn-ts-' + topic.replace(/\s/g, '').replace(/[&,]/g, '');
                html += `<button class="item-btn" id="${btnId}" onclick="loadTopic('${phase.replace(/'/g, "\\'")}', '${topic.replace(/'/g, "\\'")}')">${topic}</button>`;
            }
        }
    } else {
        html += '<div style="color:#64748b;font-size:11px;padding:10px;">No topics yet for this provider</div>';
    }
    list.innerHTML = html;
}
