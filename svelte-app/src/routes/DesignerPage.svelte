<script lang="ts">
  import { onMount } from 'svelte';
  import { setBreadcrumbs } from '../lib/stores/navigation';
  onMount(() => setBreadcrumbs([{ label: 'Schema Designer', section: 'designer' }]));
</script>
<div>
  <h1 class="text-lg font-bold text-white mb-2">Schema Designer</h1>
  <p class="text-sm text-gray-400">Visual database schema designer — coming soon in Svelte.</p>
</div>
