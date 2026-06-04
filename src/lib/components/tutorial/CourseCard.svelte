<script>
  let { course = null, progress = 0, onselect = () => {} } = $props();
</script>

<button class="course-card" onclick={() => onselect(course.id)}>
  <div class="cc-header">
    <img class="cc-icon" src={course.icon} alt={course.title} onerror={e => e.target.style.display = 'none'}>
    <h2 class="cc-title">{course.title}</h2>
  </div>
  <p class="cc-summary">{course.summary}</p>
  <div class="cc-footer">
    <span class="cc-count">{course.phases.length} phases · {course.phases.reduce((s, p) => s + p.topics.length, 0)} topics</span>
    <span class="cc-progress">{progress}% complete</span>
  </div>
  <div class="cc-bar"><div class="cc-bar-fill" style="width: {progress}%"></div></div>
</button>

<style>
  .course-card { display: block; width: 100%; text-align: left; padding: 16px; border: 1px solid #334155; border-radius: 12px; background: #0f172a; cursor: pointer; transition: border-color 0.15s; }
  .course-card:hover { border-color: #f97316; }
  .cc-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .cc-icon { width: 28px; height: 28px; object-fit: contain; }
  .cc-title { margin: 0; font-size: 16px; color: #e2e8f0; }
  .cc-summary { margin: 0 0 12px; font-size: 12px; color: #94a3b8; line-height: 1.5; }
  .cc-footer { display: flex; justify-content: space-between; font-size: 10px; color: #64748b; margin-bottom: 8px; }
  .cc-bar { height: 4px; background: #1e293b; border-radius: 2px; overflow: hidden; }
  .cc-bar-fill { height: 100%; background: #22c55e; border-radius: 2px; transition: width 0.3s; }
</style>
