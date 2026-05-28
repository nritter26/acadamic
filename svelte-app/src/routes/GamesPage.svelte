<script lang="ts">
  import { onMount } from 'svelte';
  import { setBreadcrumbs } from '../lib/stores/navigation';
  import Card from '../lib/components/Card.svelte';

  const games = ['Typing Speed', 'Code Scramble', 'Debug the Bug', 'Syntax Sprint',
    'Memory Match', 'Speed Read', 'Race Compiler', 'Syntax Swipe',
    'Code Golf', 'Binary/Hex Blitz', 'Crossword', 'Regex Rally',
    'SQL JOIN Match', 'Errorpedia', 'API Arcade', 'Daily Challenge'];

  onMount(() => setBreadcrumbs([{ label: 'Mini-Games', section: 'games' }]));
</script>
<div>
  <h1 class="text-lg font-bold text-white mb-4">Mini-Games</h1>
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
    {#each games as game}
      <Card class="hover:border-blue-400/30 cursor-pointer transition-colors">
        <p class="text-sm font-medium text-gray-200">{game}</p>
      </Card>
    {/each}
  </div>
</div>
