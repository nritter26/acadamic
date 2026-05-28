<script lang="ts">
  import { onMount } from 'svelte';
  import { setBreadcrumbs } from '../lib/stores/navigation';
  import { theme, setTheme } from '../lib/stores/global';
  import { currentLanguage } from '../lib/stores/language';
  import Card from '../lib/components/Card.svelte';

  onMount(() => setBreadcrumbs([{ label: 'Settings', section: 'settings' }]));
</script>
<div class="max-w-lg">
  <h1 class="text-lg font-bold text-white mb-4">Settings</h1>
  <Card class="space-y-4">
    <div class="flex items-center justify-between">
      <span class="text-sm text-gray-200">Theme</span>
      <select
        value={$theme}
        onchange={(e) => setTheme(e.currentTarget.value as 'dark' | 'light')}
        class="bg-surface text-gray-200 text-sm border border-surface-light/50 rounded px-2 py-1"
      >
        <option value="dark">Dark</option>
        <option value="light">Light</option>
      </select>
    </div>
    <div class="flex items-center justify-between">
      <span class="text-sm text-gray-400">Default Language</span>
      <span class="text-sm text-gray-400">{$currentLanguage}</span>
    </div>
  </Card>
</div>
