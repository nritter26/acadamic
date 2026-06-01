<script>
  import MiniGameCard from './MiniGameCard.svelte';
  const game = { id: 'debug-the-bug', title: 'Debug The Bug', description: 'Find the broken line and fix it.' };
</script>
<MiniGameCard {game} />
