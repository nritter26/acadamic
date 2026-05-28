<script lang="ts">
  import Sidebar from './Sidebar.svelte';
  import TopBar from './TopBar.svelte';
  import ContentArea from './ContentArea.svelte';
  import { sidebarOpen } from '../stores/global';
</script>

<div class="h-screen flex flex-col bg-surface-deeper">
  <TopBar />
  <div class="flex flex-1 overflow-hidden">
    <div class="flex-shrink-0 transition-all duration-200 {$sidebarOpen ? 'w-56' : 'w-0'} overflow-hidden border-r border-surface-light/30">
      <Sidebar />
    </div>
    <main class="flex-1 overflow-auto">
      <ContentArea />
    </main>
  </div>
</div>
