<script lang="ts">
  import { activeSection, navigateTo, sidebarOpen, toggleSidebar } from '../stores/global';
  import type { Section } from '../stores/global';

  interface NavGroup {
    label: string;
    items: Array<{ section: Section; label: string; icon: string }>;
  }

  const groups: NavGroup[] = [
    {
      label: 'Learn',
      items: [
        { section: 'learn', label: 'Curriculum', icon: '📚' },
        { section: 'workspace', label: 'Workspace', icon: '💻' },
        { section: 'quiz', label: 'Quiz', icon: '❓' },
        { section: 'roadmap', label: 'Roadmap', icon: '🗺️' },
      ],
    },
    {
      label: 'Tools',
      items: [
        { section: 'compiler', label: 'Compiler', icon: '⚙️' },
        { section: 'database', label: 'Database', icon: '🗄️' },
        { section: 'designer', label: 'Schema Designer', icon: '📐' },
        { section: 'api-client', label: 'API Client', icon: '🔌' },
        { section: 'git-viz', label: 'Git Visualizer', icon: '🔀' },
      ],
    },
    {
      label: 'Curriculum',
      items: [
        { section: 'gaming', label: 'Game Dev', icon: '🎮' },
        { section: 'mobile', label: 'Mobile Dev', icon: '📱' },
        { section: 'cicd', label: 'CI/CD', icon: '🔄' },
      ],
    },
    {
      label: 'Activities',
      items: [
        { section: 'games', label: 'Mini-Games', icon: '🎯' },
      ],
    },
    {
      label: 'System',
      items: [
        { section: 'settings', label: 'Settings', icon: '⚙️' },
      ],
    },
  ];
</script>

<aside class="h-full bg-surface-dark flex flex-col {$sidebarOpen ? '' : 'hidden'}">
  <div class="flex items-center justify-between px-4 py-3 border-b border-surface-light/30">
    <span class="font-bold text-sm text-blue-400">Kodex's Lab</span>
    <button
      onclick={toggleSidebar}
      class="text-gray-400 hover:text-white p-1 rounded hover:bg-surface-light/30 transition"
      title="Toggle sidebar"
    >
      ◀
    </button>
  </div>
  <nav class="flex-1 overflow-y-auto py-2 px-2 space-y-4">
    {#each groups as group}
      <div>
        <div class="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
          {group.label}
        </div>
        {#each group.items as item}
          <button
            onclick={() => navigateTo(item.section)}
            class="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors
              {$activeSection === item.section
                ? 'bg-blue-500/10 text-blue-400'
                : 'text-gray-300 hover:bg-surface-light/20 hover:text-white'}"
          >
            <span class="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        {/each}
      </div>
    {/each}
  </nav>
</aside>
