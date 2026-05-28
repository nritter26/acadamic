<script lang="ts">
  import { onMount } from 'svelte';
  import { setBreadcrumbs } from '../lib/stores/navigation';
  import Button from '../lib/components/Button.svelte';
  import Card from '../lib/components/Card.svelte';

  let query = $state('');
  let results: unknown = $state(null);

  onMount(() => {
    setBreadcrumbs([{ label: 'Database', section: 'database' }]);
  });

  async function runQuery() {
    results = { message: 'SQL execution will be wired to /api/execute with lang=sqlite' };
  }
</script>

<div class="h-full flex flex-col gap-3">
  <h1 class="text-lg font-bold text-white">SQL Database Lab</h1>
  <textarea
    bind:value={query}
    class="w-full h-32 bg-surface border border-surface-light/50 rounded-md px-3 py-2 text-sm font-mono text-gray-200 focus:outline-none focus:border-blue-400"
    placeholder="SELECT * FROM employees LIMIT 10;"
  ></textarea>
  <div class="flex gap-2">
    <Button onclick={runQuery}>▶ Run Query</Button>
    <Button variant="secondary">Clear</Button>
  </div>
  <Card>
    {#if results}
      <pre class="text-sm text-gray-300">{JSON.stringify(results, null, 2)}</pre>
    {:else}
      <p class="text-gray-500 text-sm">Run a query to see results</p>
    {/if}
  </Card>
</div>
