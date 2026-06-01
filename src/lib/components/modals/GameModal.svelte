<script>
  import Modal from '$lib/components/shared/Modal.svelte';
  import { GAME_CATALOG } from '$lib/lib/games.js';
  let { open = false, onclose = () => {} } = $props();
</script>

<Modal {open} {onclose}>
  <h2>Games</h2>
  <ul>{#each GAME_CATALOG as game}<li>{game.title}</li>{/each}</ul>
</Modal>
