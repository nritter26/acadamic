<script lang="ts">
  import { toggleSidebar, sidebarOpen } from '../stores/global';
  import { breadcrumbs } from '../stores/navigation';
  import { currentLanguage, setLanguage, LANGUAGES } from '../stores/language';
</script>

<header class="h-10 bg-surface-dark border-b border-surface-light/30 flex items-center px-3 gap-3 flex-shrink-0">
  <button
    onclick={toggleSidebar}
    class="text-gray-400 hover:text-white p-1 rounded hover:bg-surface-light/30 transition text-sm"
    title={$sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
  >
    {$sidebarOpen ? '◀' : '▶'}
  </button>

  <div class="flex items-center gap-2 text-sm text-gray-400">
    {#each $breadcrumbs as bc, i}
      {#if i > 0}<span class="text-gray-600">/</span>{/if}
      <span class="{bc.section ? 'hover:text-white cursor-pointer' : 'text-gray-200'}">
        {bc.label}
      </span>
    {/each}
  </div>

  <div class="flex-1"></div>

  <select
    onchange={(e) => setLanguage(e.currentTarget.value as typeof LANGUAGES[number])}
    value={$currentLanguage}
    class="bg-surface text-gray-200 text-xs border border-surface-light/50 rounded px-2 py-1 focus:outline-none focus:border-blue-400"
  >
    {#each LANGUAGES as lang}
      <option value={lang}>{lang}</option>
    {/each}
  </select>

  <button class="text-gray-400 hover:text-white p-1 rounded hover:bg-surface-light/30 transition text-sm" title="Profile">
    👤
  </button>
</header>
