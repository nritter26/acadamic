<script lang="ts">
  import { onMount } from 'svelte';
  import { setBreadcrumbs } from '../lib/stores/navigation';
  import TabBar from '../lib/components/TabBar.svelte';
  import Card from '../lib/components/Card.svelte';

  let activeTab = $state('tokens');
  const tabs = [
    { id: 'tokens', label: 'Tokens' },
    { id: 'ast', label: 'AST' },
    { id: 'stats', label: 'Stats' },
  ];

  onMount(() => {
    setBreadcrumbs([{ label: 'Compiler', section: 'compiler' }]);
  });
</script>

<div>
  <h1 class="text-lg font-bold text-white mb-2">Compiler Pipeline Explorer</h1>
  <p class="text-sm text-gray-400 mb-4">Tokenize, parse, and analyze code — step through the compilation pipeline.</p>
  <TabBar {tabs} active={activeTab} onchange={(id: string) => activeTab = id} />
  <Card class="mt-4">
    {#if activeTab === 'tokens'}
      <p class="text-gray-500 text-sm">Token stream will display here</p>
    {:else if activeTab === 'ast'}
      <p class="text-gray-500 text-sm">AST tree will render here</p>
    {:else}
      <p class="text-gray-500 text-sm">Code statistics will show here</p>
    {/if}
  </Card>
</div>
