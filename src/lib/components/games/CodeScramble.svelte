<script>
  import MiniGameCard from './MiniGameCard.svelte';
  const game = { id: 'code-scramble', title: 'Code Scramble', description: 'Reorder scrambled code into a working solution.' };
</script>
<MiniGameCard {game} />
