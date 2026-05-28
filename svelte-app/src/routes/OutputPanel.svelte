<script lang="ts">
  import { output, isRunning } from '../lib/stores/workspace';
  import TabBar from '../lib/components/TabBar.svelte';
  import Badge from '../lib/components/Badge.svelte';

  let activeTab = $state('output');

  const tabs = [
    { id: 'output', label: 'Output' },
    { id: 'errors', label: 'Errors' },
    { id: 'analysis', label: 'Analysis' },
  ];
</script>

<div class="h-full flex flex-col bg-surface rounded-lg border border-surface-light/30">
  <div class="flex items-center justify-between px-3">
    <TabBar {tabs} active={activeTab} onchange={(id: string) => activeTab = id} />
    {#if $isRunning}
      <Badge variant="info">Running...</Badge>
    {/if}
  </div>
  <div class="flex-1 p-3 overflow-auto font-mono text-sm">
    {#if activeTab === 'output'}
      <pre class="text-gray-200 whitespace-pre-wrap">{@html $output || '<span class="text-gray-500">No output yet — run your code</span>'}</pre>
    {:else if activeTab === 'errors'}
      <pre class="text-red-400 whitespace-pre-wrap"></pre>
    {:else}
      <pre class="text-gray-400">Analysis results will appear here</pre>
    {/if}
  </div>
</div>
