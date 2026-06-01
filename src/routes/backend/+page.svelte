<script>
  import APIClient from '$lib/components/workspace/APIClient.svelte';
</script>

<div class="backend-route">
  <section>
    <h2>Backend Lab</h2>
    <p>Inspect and call backend endpoints from the Svelte interface.</p>
  </section>
  <APIClient />
</div>

<style>
  .backend-route { height: 100%; overflow: auto; background: #0f172a; color: #e2e8f0; }
  section { padding: 18px 18px 0; }
  p { color: #94a3b8; }
</style>
