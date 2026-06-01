<script>
  import '../app.css';
</script>

<div class="app-shell">
  <slot />
</div>

<style>
  .app-shell { display: flex; flex-direction: column; height: 100vh; background: #0f172a; color: #e2e8f0; }
</style>
