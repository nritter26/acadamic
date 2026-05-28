<script lang="ts">
  import { onMount } from 'svelte';
  import { setBreadcrumbs } from '../lib/stores/navigation';
  onMount(() => setBreadcrumbs([{ label: 'Mobile Dev', section: 'mobile' }]));
</script>
<div>
  <h1 class="text-lg font-bold text-white mb-2">Mobile Development</h1>
  <p class="text-sm text-gray-400">Android and iOS development curriculum.</p>
</div>
