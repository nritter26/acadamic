<script>
  import { GAME_CATALOG } from '$lib/lib/games.js';
  import APIArcade from './APIArcade.svelte';
  import BinaryHexBlitz from './BinaryHexBlitz.svelte';
  import CodeGolf from './CodeGolf.svelte';
  import CodeScramble from './CodeScramble.svelte';
  import Crossword from './Crossword.svelte';
  import DebugTheBug from './DebugTheBug.svelte';
  import Errorpedia from './Errorpedia.svelte';
  import LogicLadder from './LogicLadder.svelte';
  import MemoryMatch from './MemoryMatch.svelte';
  import RaceCompiler from './RaceCompiler.svelte';
  import RegexRally from './RegexRally.svelte';
  import SpeedRead from './SpeedRead.svelte';
  import SQLJOINMatch from './SQLJOINMatch.svelte';
  import SyntaxSprint from './SyntaxSprint.svelte';
  import SyntaxSwipe from './SyntaxSwipe.svelte';
  import TypingSpeed from './TypingSpeed.svelte';
  import MiniGameCard from './MiniGameCard.svelte';

  let selected = $state(GAME_CATALOG[0]);
  const components = {
    'api-arcade': APIArcade,
    'binary-hex-blitz': BinaryHexBlitz,
    'code-golf': CodeGolf,
    'code-scramble': CodeScramble,
    crossword: Crossword,
    'debug-the-bug': DebugTheBug,
    errorpedia: Errorpedia,
    'logic-ladder': LogicLadder,
    'memory-match': MemoryMatch,
    'race-compiler': RaceCompiler,
    'regex-rally': RegexRally,
    'speed-read': SpeedRead,
    'sql-join-match': SQLJOINMatch,
    'syntax-sprint': SyntaxSprint,
    'syntax-swipe': SyntaxSwipe,
    'typing-speed': TypingSpeed,
  };
  let SelectedGame = $derived(components[selected.id] || MiniGameCard);
</script>

<div class="game-launcher">
  <aside>
    <h2>Gaming</h2>
    {#each GAME_CATALOG as game}
      <button class:active={selected.id === game.id} onclick={() => selected = game}>
        <strong>{game.title}</strong>
        <span>{game.description}</span>
      </button>
    {/each}
  </aside>
  <main>
    <SelectedGame game={selected} />
  </main>
</div>

<style>
  .game-launcher { display: grid; grid-template-columns: 360px 1fr; height: 100%; background: #0f172a; color: #e2e8f0; }
  aside { padding: 18px; border-right: 1px solid #1e293b; overflow: auto; }
  aside button { display: grid; gap: 4px; width: 100%; margin-bottom: 8px; padding: 12px; text-align: left; background: #111827; border: 1px solid #1e293b; border-radius: 10px; color: #cbd5e1; cursor: pointer; }
  aside button.active, aside button:hover { border-color: #f59e0b; background: #29200b; }
  aside span { color: #94a3b8; font-size: 12px; }
  main { display: grid; place-items: center; padding: 24px; }
</style>
