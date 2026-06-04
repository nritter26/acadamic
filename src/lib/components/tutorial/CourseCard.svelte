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
  .course-card { display: block; width: 100%; text-align: left; padding: 48px; border: 2px solid #334155; border-radius: 28px; background: #0f172a; cursor: pointer; transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s; }
  .course-card:hover { border-color: #f97316; transform: translateY(-6px); box-shadow: 0 12px 48px rgba(249,115,22,0.15); }
  .cc-header { display: flex; align-items: center; gap: 24px; margin-bottom: 24px; }
  .cc-icon { width: 72px; height: 72px; object-fit: contain; }
  .cc-title { margin: 0; font-size: 36px; color: #e2e8f0; }
  .cc-summary { margin: 0 0 28px; font-size: 18px; color: #94a3b8; line-height: 1.7; }
  .cc-footer { display: flex; justify-content: space-between; font-size: 16px; color: #64748b; margin-bottom: 20px; }
  .cc-bar { height: 10px; background: #1e293b; border-radius: 5px; overflow: hidden; }
  .cc-bar-fill { height: 100%; background: #22c55e; border-radius: 5px; transition: width 0.3s; }
</style>
