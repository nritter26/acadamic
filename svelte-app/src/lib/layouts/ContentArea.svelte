<script lang="ts">
  import { activeSection } from '../stores/global';
  import LearnPage from '../../routes/LearnPage.svelte';
  import WorkspacePage from '../../routes/WorkspacePage.svelte';
  import CompilerPage from '../../routes/CompilerPage.svelte';
  import DatabasePage from '../../routes/DatabasePage.svelte';
  import DesignerPage from '../../routes/DesignerPage.svelte';
  import QuizPage from '../../routes/QuizPage.svelte';
  import GamesPage from '../../routes/GamesPage.svelte';
  import GamingPage from '../../routes/GamingPage.svelte';
  import MobilePage from '../../routes/MobilePage.svelte';
  import CICDPage from '../../routes/CICDPage.svelte';
  import SettingsPage from '../../routes/SettingsPage.svelte';

  const pages: Record<string, typeof LearnPage> = {
    learn: LearnPage,
    workspace: WorkspacePage,
    compiler: CompilerPage,
    database: DatabasePage,
    designer: DesignerPage,
    quiz: QuizPage,
    games: GamesPage,
    gaming: GamingPage,
    mobile: MobilePage,
    cicd: CICDPage,
    settings: SettingsPage,
  };

  $: Page = pages[$activeSection] || pages.learn;
</script>

<div class="h-full p-4">
  <Page />
</div>
