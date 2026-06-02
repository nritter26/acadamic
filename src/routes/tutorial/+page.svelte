<script>
  import TutorialPlayer from '$lib/components/tutorial/TutorialPlayer.svelte';
  import TutorialResumePrompt from '$lib/components/tutorial/TutorialResumePrompt.svelte';
  import { getTutorialState } from '$lib/stores/tutorial.svelte.js';
  import { onMount } from 'svelte';
  import TutorialQuizOverlay from '$lib/components/tutorial/TutorialQuizOverlay.svelte';

  let tutorial = $derived(getTutorialState());
  let showResume = $state(false);
  let showQuiz = $state(false);

  onMount(() => {
    if (tutorial.state.currentLesson >= 0 && tutorial.state.currentStep > 0) {
      showResume = true;
    }
    window.addEventListener('tutorial-quiz', () => showQuiz = true);
    return () => window.removeEventListener('tutorial-quiz', () => showQuiz = true);
  });

  function handleResume() {
    showResume = false;
    tutorial.load();
  }
</script>

<TutorialPlayer />
<TutorialResumePrompt lesson={tutorial.state.currentLesson >= 0 ? `Lesson ${tutorial.state.currentLesson + 1}` : null} onresume={handleResume} />
<TutorialQuizOverlay open={showQuiz} onclose={() => showQuiz = false} />
