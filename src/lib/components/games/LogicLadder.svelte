<script>
  import MiniGameCard from './MiniGameCard.svelte';
  const game = { id: 'logic-ladder', title: 'Logic Ladder', description: 'Step through branching logic puzzles.', mode: 'choice' };
</script>
<MiniGameCard {game} />
