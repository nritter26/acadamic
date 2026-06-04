<script>
  import TutorialPlayer from '$lib/components/tutorial/TutorialPlayer.svelte';
  import PhaseNav from '$lib/components/tutorial/PhaseNav.svelte';
  import CourseCard from '$lib/components/tutorial/CourseCard.svelte';
  import TutorialResumePrompt from '$lib/components/tutorial/TutorialResumePrompt.svelte';
  import { TUTORIAL_COURSES, getCourseById, getPhaseById, getTotalProgress } from '$lib/lib/tutorial.js';
  import { getTutorialState } from '$lib/stores/tutorial.svelte.js';
  import { onMount } from 'svelte';

  let tutorial = $derived(getTutorialState());
  let showResume = $state(false);

  let currentCourse = $derived(getCourseById(tutorial.state.currentCourse, TUTORIAL_COURSES));
  let currentPhase = $derived(currentCourse ? getPhaseById(currentCourse, tutorial.state.currentPhase) : null);
  let currentTopicName = $derived(currentPhase?.topics[tutorial.state.currentTopic] || '');

  onMount(() => {
    tutorial.load();
    if (tutorial.state.currentCourse && tutorial.state.currentTopic > 0) {
      showResume = true;
    }
  });

  function handleResume() {
    showResume = false;
  }

  function handleCourseSelect(courseId) {
    tutorial.setCourse(courseId);
    const course = getCourseById(courseId, TUTORIAL_COURSES);
    if (course) {
      tutorial.setPhase(course.phases[0].id);
      tutorial.setTopic(0);
    }
  }

  function handleNavClick(phaseId, topicIndex) {
    tutorial.setPhase(phaseId);
    tutorial.setTopic(topicIndex);
  }
</script>

<div class="tutorial-layout" class:has-course={!!tutorial.state.currentCourse}>
  {#if tutorial.state.currentCourse}
    <aside class="tutorial-sidebar">
      <div class="sidebar-header">
        <button class="back-btn" onclick={() => tutorial.setCourse(null)}>← All Courses</button>
        <h3>{currentCourse?.title || ''}</h3>
      </div>
      <PhaseNav
        course={currentCourse}
        state={tutorial.state}
        ontopicclick={handleNavClick}
      />
    </aside>
    <main class="tutorial-main">
      <TutorialPlayer />
    </main>
  {:else}
    <div class="tutorial-hub">
      <div class="eyebrow">Guided Path</div>
      <h1>Learn Code</h1>
      <p>Choose a language to start learning. Follow structured lessons with live code editing, execution, and checkpoint quizzes.</p>
      <div class="hub-courses">
        {#each TUTORIAL_COURSES as course}
          <CourseCard
            course={course}
            progress={getTotalProgress(course, tutorial.state.completedTopics.filter(t => t.startsWith(`${course.id}:`)).map(t => t.split(':')[1]))}
            onselect={handleCourseSelect}
          />
        {/each}
      </div>
    </div>
  {/if}
</div>

<TutorialResumePrompt
  courseTitle={currentCourse?.title}
  phaseTitle={currentPhase?.title}
  topicName={currentTopicName}
  onresume={handleResume}
/>

<style>
  .tutorial-layout { display: flex; min-height: 100vh; }
  .tutorial-layout.has-course { display: grid; grid-template-columns: 260px 1fr; }
  .tutorial-sidebar { background: #0f172a; border-right: 1px solid #1e293b; overflow-y: auto; display: flex; flex-direction: column; }
  .sidebar-header { padding: 16px; border-bottom: 1px solid #1e293b; }
  .back-btn { background: none; border: none; color: #f97316; cursor: pointer; font-size: 12px; padding: 0; margin-bottom: 8px; }
  .back-btn:hover { text-decoration: underline; }
  .sidebar-header h3 { margin: 0; font-size: 14px; color: #e2e8f0; }
  .tutorial-main { overflow: auto; }
  .tutorial-hub { flex: 1; overflow: auto; background: linear-gradient(135deg, #111827, #431407); color: #e2e8f0; padding: clamp(24px, 5vw, 56px); }
  .eyebrow { color: #fb923c; font-size: 12px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; }
  h1 { margin: 8px 0; font-size: clamp(42px, 9vw, 96px); line-height: 0.9; }
  .tutorial-hub p { max-width: 600px; color: #fed7aa; line-height: 1.6; margin-bottom: 24px; }
  .hub-courses { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
</style>
