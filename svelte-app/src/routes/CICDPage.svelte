<script lang="ts">
  import { onMount } from 'svelte';
  import { setBreadcrumbs } from '../lib/stores/navigation';
  onMount(() => setBreadcrumbs([{ label: 'CI/CD', section: 'cicd' }]));
</script>
<div>
  <h1 class="text-lg font-bold text-white mb-2">CI/CD Curriculum</h1>
  <p class="text-sm text-gray-400">Learn CI/CD fundamentals, tools, and deployment strategies.</p>
</div>
