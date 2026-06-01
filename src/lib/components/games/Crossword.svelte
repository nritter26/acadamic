<script>
  import MiniGameCard from './MiniGameCard.svelte';
  const game = { id: 'crossword', title: 'Crossword', description: 'Solve programming clue grids.' };
</script>
<MiniGameCard {game} />
