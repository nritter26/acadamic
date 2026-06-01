<script>
  import MiniGameCard from './MiniGameCard.svelte';
  const game = { id: 'code-golf', title: 'Code Golf', description: 'Solve tasks with fewer characters.' };
</script>
<MiniGameCard {game} />
