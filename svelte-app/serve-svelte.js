// Helper: Serve the Svelte build from Express
// Usage: require this in server.ts when ready to swap
// const serveSvelte = require('./svelte-app/serve-svelte');
// app.use(serveSvelte());
//
// Or during development, just run: cd svelte-app && npm run dev
// The Vite dev server runs independently on its own port.

const path = require('path');
const express = require('express');

function serveSvelte() {
  const distPath = path.join(__dirname, 'svelte-app', 'dist');
  console.log(`[svelte] Serving Svelte app from ${distPath}`);
  return express.static(distPath);
}

module.exports = serveSvelte;
