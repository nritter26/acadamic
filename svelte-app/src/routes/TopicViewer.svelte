<script lang="ts">
  import Card from '../lib/components/Card.svelte';

  let {
    phase = '',
    topic = '',
    data = { exp: '', code: '' },
  } = $props();
</script>

<div class="space-y-4">
  <div>
    <h2 class="text-lg font-bold text-white">{topic}</h2>
    <p class="text-xs text-gray-500">Phase: {phase}</p>
  </div>

  <Card>
    <div class="prose prose-invert max-w-none text-sm text-gray-300">
      {@html data.exp}
    </div>
  </Card>

  {#if data.code}
    <Card>
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-medium text-gray-400">Example Code</span>
        <button
          onclick={() => navigator.clipboard.writeText(data.code || '')}
          class="text-xs text-gray-500 hover:text-gray-300 transition"
        >
          Copy
        </button>
      </div>
      <pre class="text-sm font-mono text-gray-200 overflow-x-auto bg-surface-dark rounded p-3"><code>{data.code}</code></pre>
    </Card>
  {/if}
</div>
