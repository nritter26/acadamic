<script>
  import MiniGameCard from './MiniGameCard.svelte';
  let { game, lang = 'js' } = $props();
</script>
<MiniGameCard {game} {lang} />
