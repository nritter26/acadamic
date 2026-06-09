export const PROJECT_IDS = [
  'hello-world','simple-calculator','even-or-odd','fizzbuzz','password-strength',
  'temperature-converter','tip-calculator','rock-paper-scissors','number-guessing','palindrome-checker',
  'vowel-counter','multiplication-table','bmi-calculator','factorial','string-reverser',
  'leap-year-checker','max-of-three','simple-interest','dice-roller','unit-converter',
  'word-counter','sum-of-natural','positive-negative','area-calculator','grade-calculator',
  'todo-list','memory-card','quiz-app','weather-dashboard','expense-tracker',
  'countdown-timer','image-carousel','tab-accordion','form-validator','modal-dialog',
  'color-picker','stopwatch','pomodoro-timer','recipe-finder','movie-search',
  'github-profile','notes-app','flashcard-app','currency-converter','random-color-generator',
  'progress-steps','character-counter','password-generator','age-calculator','loan-calculator',
  'real-time-chat','markdown-previewer','kanban-board','typing-speed-test','ecommerce-filter',
  'music-player','calendar-app','paint-app','habit-tracker','budget-app',
  'news-aggregator','tic-tac-toe','snake-game','sort-visualizer','poll-app',
  'code-snippet-manager','bookmark-manager','text-editor','url-shortener','chart-renderer',
  'maze-generator','chess-validator','sudoku-solver','data-table','recipe-finder-app',
  'authentication-system','rate-limiter','state-machine','pub-sub-broker','data-pipeline',
  'cache-layer','middleware-system','schema-validator','dependency-injection','task-queue',
  'observable-stream','state-management','query-builder','immutable-collections','template-engine',
  'testing-framework','diff-engine','markdown-parser','semver-system','crdt-counter',
  'distributed-lock','circuit-breaker','feature-flags','task-orchestrator','api-gateway',
  'go-hello-world','go-variables','go-data-types','go-functions','go-conditionals',
  'go-loops','go-arrays','go-maps','go-structs','go-methods',
  'go-interfaces','go-pointers','go-strings','go-errors','go-defer',
  'go-variadic','go-closures','go-recursion','go-range','go-type-switch',
  'go-goroutines','go-channels','go-buffered-channels','go-select','go-mutex',
  'go-waitgroup','go-worker-pool','go-file-io','go-json','go-http-server',
  'go-http-client','go-testing','go-benchmarking','go-embedding','go-generics',
  'go-contexts','go-time','go-sorting','go-env-config','go-logging',
  'go-reflection','go-plugin-system','go-middleware','go-web-router','go-database-sql',
  'go-graceful-shutdown','go-rate-limiting','go-tcp-server','go-websocket',
  'go-grpc','go-template-html','go-testing-advanced','go-coverage','go-race-detection',
  'go-pprof','go-tracing','go-microservice','go-event-bus','go-command-pattern',
  'go-authentication-system','go-rate-limiter','go-state-machine','go-pub-sub-broker','go-data-pipeline',
  'go-cache-layer','go-middleware-system','go-schema-validator','go-dependency-injection','go-task-queue',
  'go-observable-stream','go-state-management','go-query-builder','go-immutable-collections','go-template-engine',
  'go-testing-framework','go-diff-engine','go-markdown-parser','go-semver-system','go-crdt-counter',
  'go-distributed-lock','go-circuit-breaker','go-feature-flags','go-task-orchestrator','go-api-gateway',
  'react-counter','react-todo','react-api-fetcher','vue-counter','vue-todo','vue-api-fetcher',
  // Backend API projects
  'express-hello-api', 'express-notes-crud', 'express-task-manager', 'express-blog-api',
  'express-ecommerce-api', 'express-social-api', 'express-hateoas',
  'express-auth-apikey', 'express-auth-basic', 'express-auth-jwt', 'express-auth-rbac',
  'express-rate-limiting', 'express-oauth2-sim', 'express-multi-auth',
  'express-db-sqlite', 'express-db-migrations', 'express-db-relations', 'express-db-search',
  'express-db-transactions', 'express-db-pooling', 'express-db-sharding',
  'express-upload-single', 'express-upload-metadata', 'express-upload-multi',
  'express-upload-image', 'express-upload-stream', 'express-upload-chunked', 'express-upload-cdn',
  'express-ws-echo', 'express-ws-chat', 'express-ws-notify', 'express-ws-collab',
  'express-ws-game', 'express-ws-hybrid',
  'express-test-validation', 'express-test-integration', 'express-test-swagger',
  'express-test-contract', 'express-test-property', 'express-test-e2e',
  'express-ms-two-service', 'express-ms-discovery', 'express-ms-http',
  'express-ms-queue', 'express-ms-circuit', 'express-ms-tracing',
  'express-gql-hello', 'express-gql-relations', 'express-gql-mutations',
  'express-gql-pagination', 'express-gql-subscriptions', 'express-gql-dataloader', 'express-gql-federation',
  // New advanced/expert projects
  'build-tool-config', 'deployment-pipeline', 'advanced-react-patterns',
];

export const PROJECT_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];

export function groupProjectsByDifficulty(projects, filters = {}) {
  const grouped = Object.fromEntries(PROJECT_LEVELS.map(level => [level, []]));

  for (const project of projects) {
    if (filters.difficulty && filters.difficulty !== 'all' && project.difficulty !== filters.difficulty) continue;
    if (filters.language && filters.language !== 'all' && !project.languages?.includes(filters.language)) continue;
    if (filters.framework && filters.framework !== 'all' && project.framework !== filters.framework) continue;
    if (grouped[project.difficulty]) grouped[project.difficulty].push(project);
  }

  return grouped;
}

export async function loadProjectCatalog(fetcher = fetch) {
  const loaded = [];
  await Promise.all(PROJECT_IDS.map(async (id) => {
    try {
      const response = await fetcher(`/api/content/projects/${id}`);
      if (response.ok === false) return;
      loaded.push(await response.json());
    } catch {
      // Missing project files should not break the route; the legacy app behaved the same way.
    }
  }));
  return loaded.sort((a, b) => PROJECT_IDS.indexOf(a.id) - PROJECT_IDS.indexOf(b.id));
}
