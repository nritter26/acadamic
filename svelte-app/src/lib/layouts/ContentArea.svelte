<script lang="ts">
  import { activeSection } from '../stores/global';
  import Router from 'svelte-spa-router';
  import LearnPage from '../../routes/LearnPage.svelte';
  import WorkspacePage from '../../routes/WorkspacePage.svelte';

  const routes = {
    '/': LearnPage,
    '/learn': LearnPage,
    '/workspace': WorkspacePage,
  };

  $: currentRoute = $activeSection === 'learn' ? '/learn' : `/${$activeSection}`;
</script>

<div class="h-full p-4">
  <Router {routes} url={currentRoute} />
</div>
