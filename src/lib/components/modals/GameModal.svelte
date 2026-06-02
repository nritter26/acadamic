<script>
  import Modal from '$lib/components/shared/Modal.svelte';
  import { GAME_CATALOG } from '$lib/lib/games.js';
  import { goto } from '$app/navigation';

  let { open = false, onclose = () => {} } = $props();

  function launchGame(gameId) {
    onclose();
    goto('/game');
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('launch-game', { detail: { gameId } }));
    }, 100);
  }
</script>

<Modal {open} {onclose}>
  <h2>Gaming Arcade</h2>
  <div class="game-grid">
    {#each GAME_CATALOG as game}
      <button class="game-card" onclick={() => launchGame(game.id)}>
        <strong>{game.title}</strong>
        <span>{game.description}</span>
      </button>
    {/each}
  </div>
</Modal>

<style>
  .game-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; margin-top: 12px; }
  .game-card { display: grid; gap: 4px; padding: 12px; background: #111827; border: 1px solid #1e293b; border-radius: 8px; color: #e2e8f0; text-align: left; cursor: pointer; }
  .game-card:hover { border-color: #f59e0b; background: #29200b; }
  .game-card span { font-size: 11px; color: #94a3b8; }
</style>
