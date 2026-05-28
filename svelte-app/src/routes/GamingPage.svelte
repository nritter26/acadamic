<script lang="ts">
  import { onMount } from 'svelte';
  import { setBreadcrumbs } from '../lib/stores/navigation';
  onMount(() => setBreadcrumbs([{ label: 'Game Dev', section: 'gaming' }]));
</script>
<div>
  <h1 class="text-lg font-bold text-white mb-2">Game Development Curriculum</h1>
  <p class="text-sm text-gray-400">Learn Godot, Unity, and Unreal Engine.</p>
</div>
