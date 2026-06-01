<script>
  let { commits = [
    { id: 'a1', label: 'init', branch: 'main' },
    { id: 'b2', label: 'curriculum', branch: 'main' },
    { id: 'c3', label: 'svelte migration', branch: 'svelte-conversion' },
  ] } = $props();
</script>

<div class="graph">
  {#each commits as commit}
    <div class="commit">
      <span class="node"></span>
      <div>
        <strong>{commit.id}</strong>
        <p>{commit.label} · {commit.branch}</p>
      </div>
    </div>
  {/each}
</div>

<style>
  .graph { position: relative; margin-top: 24px; max-width: 720px; }
  .graph::before { content: ''; position: absolute; left: 15px; top: 16px; bottom: 16px; width: 2px; background: #334155; }
  .commit { display: flex; gap: 18px; align-items: center; margin-bottom: 28px; }
  .node { width: 32px; height: 32px; border-radius: 50%; background: #f1502f; box-shadow: 0 0 0 6px rgba(241, 80, 47, 0.15); z-index: 1; }
  p { margin: 4px 0 0; color: #94a3b8; }
</style>
