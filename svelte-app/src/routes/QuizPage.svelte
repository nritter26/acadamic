<script lang="ts">
  import { onMount } from 'svelte';
  import { setBreadcrumbs } from '../lib/stores/navigation';
  onMount(() => setBreadcrumbs([{ label: 'Quiz', section: 'quiz' }]));
</script>
<div>
  <h1 class="text-lg font-bold text-white mb-2">Quiz Mode</h1>
  <p class="text-sm text-gray-400">Test your knowledge with language-specific quizzes.</p>
</div>
