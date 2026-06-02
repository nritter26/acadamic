<script>
  import { getGameState, showToast, ACHIEVEMENT_DEFS } from '$lib/stores/game.svelte.js';
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

  let game = $derived(getGameState());

  let view = $state('hub');
  let selectedGame = $state(null);
  let soundToggleKey = $state(0);

  const components = {
    'api-arcade': APIArcade, 'binary-hex-blitz': BinaryHexBlitz,
    'code-golf': CodeGolf, 'code-scramble': CodeScramble,
    'crossword': Crossword, 'debug-the-bug': DebugTheBug,
    'errorpedia': Errorpedia, 'logic-ladder': LogicLadder,
    'memory-match': MemoryMatch, 'race-compiler': RaceCompiler,
    'regex-rally': RegexRally, 'speed-read': SpeedRead,
    'sql-join-match': SQLJOINMatch, 'syntax-sprint': SyntaxSprint,
    'syntax-swipe': SyntaxSwipe, 'typing-speed': TypingSpeed,
  };

  let SelectedGame = $derived(selectedGame ? components[selectedGame.id] || MiniGameCard : null);

  function launchGame(id) {
    const g = GAME_CATALOG.find(x => x.id === id);
    if (g) { selectedGame = g; view = 'game'; }
  }

  function backToHub() { view = 'hub'; selectedGame = null; }

  let xpPct = $derived(Math.min(100, game.xp % 100));
  let dailyDone = $derived(game.dailyDone);
  let achievements = $derived(game.getAchievements());
  let achUnlocked = $derived(achievements.length);

  let dailyChallengeId = $derived(game.getDailyChallenge());
  let lbEntries = $state([]);

  function refreshLeaderboard() {
    lbEntries = game.getLeaderboard();
  }

  function doToggleSound() {
    game.toggleSound();
    soundToggleKey++;
    showToast('Sound ' + (game.soundOn ? 'ON' : 'OFF'), '');
  }
</script>

{#if view === 'game' && SelectedGame}
  <div class="game-view">
    <div class="game-view-header">
      <button class="back-btn" onclick={backToHub}>← Back</button>
      <div class="game-view-xp">
        <div class="gv-xp-bar"><div class="gv-xp-fill" style="width:{xpPct}%"></div></div>
        <span class="gv-xp-label">{game.xp} XP</span>
      </div>
    </div>
    <div class="game-view-body">
      <SelectedGame game={selectedGame} />
    </div>
  </div>
{:else if view === 'leaderboard'}
  <div class="game-view">
    <div class="game-view-header">
      <button class="back-btn" onclick={() => { view = 'hub'; }}>← Back</button>
      <span class="gv-title">Leaderboard</span>
    </div>
    <div class="game-view-body">
      {#each lbEntries as [id, data]}
        {@const g = GAME_CATALOG.find(x => x.id === id)}
        <div class="lb-row">
          <span class="lb-icon">{g ? g.icon : '🎮'}</span>
          <span class="lb-name">{g ? g.title : id}</span>
          <span class="lb-plays">{data.plays} plays</span>
          <span class="lb-best">Best: {data.best}</span>
        </div>
      {:else}
        <div class="lb-empty">No games played yet. Start playing!</div>
      {/each}
    </div>
  </div>
{:else if view === 'achievements'}
  <div class="game-view">
    <div class="game-view-header">
      <button class="back-btn" onclick={() => { view = 'hub'; }}>← Back</button>
      <span class="gv-title">Achievements</span>
    </div>
    <div class="game-view-body">
      <div class="ach-grid">
        {#each ACHIEVEMENT_DEFS as def}
          {@const unlocked = achievements.find(a => a.id === def.id)}
          <div class="ach-card" class:ach-unlocked={unlocked} class:ach-locked={!unlocked}>
            <div class="ach-icon">{unlocked ? def.icon : '🔒'}</div>
            <div class="ach-name">{def.name}</div>
            <div class="ach-desc">{def.desc}</div>
          </div>
        {/each}
      </div>
    </div>
  </div>
{:else}
  <div class="game-hub">
    <div class="hub-header">
      <div class="hub-title">Game Lab</div>
      <div class="hub-level">Lv {game.level}</div>
    </div>
    <div class="hub-xp-bar">
      <div class="hub-xp-fill" style="width:{xpPct}%"></div>
      <span class="hub-xp-label">{game.xp} XP</span>
    </div>

    {#if !dailyDone}
      <div class="daily-banner" onclick={() => launchGame('code-golf')}>
        <span class="daily-icon"> Daily Challenge available!</span>
        <span class="daily-arrow">→</span>
      </div>
    {/if}

    <div class="hub-grid">
      {#each GAME_CATALOG as g}
        {@const lbs = game.getLeaderboardStats(g.id)}
        <button class="hub-card" onclick={() => launchGame(g.id)}>
          <div class="hub-card-icon">{g.icon}</div>
          <div class="hub-card-name">{g.title}</div>
          <div class="hub-card-desc">{g.description}</div>
          {#if lbs.best > 0}
            <div class="hub-card-best">Best: {lbs.best}</div>
          {/if}
          {#if lbs.plays > 0}
            <div class="hub-card-plays">{lbs.plays} played</div>
          {/if}
        </button>
      {/each}
    </div>

    <div class="hub-bar">
      <button class="hub-bar-btn" onclick={() => { refreshLeaderboard(); view = 'leaderboard'; }}>Leaderboard ({lbEntries.length})</button>
      <button class="hub-bar-btn" onclick={() => view = 'achievements'}>Achievements ({achUnlocked})</button>
      <button class="hub-bar-btn" onclick={doToggleSound}>Sound {game.soundOn ? 'ON' : 'OFF'}</button>
    </div>
  </div>
{/if}

<style>
  .game-view { display: flex; flex-direction: column; height: 100%; background: #0f172a; color: #e2e8f0; }
  .game-view-header { display: flex; align-items: center; gap: 12px; padding: 8px 16px; border-bottom: 1px solid #1e293b; }
  .back-btn { background: transparent; border: 1px solid #334155; color: #94a3b8; padding: 4px 12px; border-radius: 4px; font-size: 11px; cursor: pointer; }
  .back-btn:hover { background: #1e293b; color: #e2e8f0; }
  .gv-title { font-size: 14px; font-weight: 700; color: #e2e8f0; }
  .game-view-xp { margin-left: auto; display: flex; align-items: center; gap: 8px; }
  .gv-xp-bar { width: 100px; height: 6px; background: #1e293b; border-radius: 999px; overflow: hidden; }
  .gv-xp-fill { height: 100%; background: linear-gradient(90deg, #f59e0b, #f97316); border-radius: 999px; transition: width 0.3s; }
  .gv-xp-label { font-size: 10px; font-weight: 700; color: #f59e0b; }
  .game-view-body { flex: 1; overflow: auto; padding: 16px; }

  .game-hub { display: flex; flex-direction: column; height: 100%; background: #0f172a; color: #e2e8f0; overflow: auto; }
  .hub-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px 8px; }
  .hub-title { font-size: 22px; font-weight: 900; color: #e2e8f0; }
  .hub-level { font-size: 12px; font-weight: 700; color: #64748b; background: #1e293b; padding: 2px 10px; border-radius: 999px; }

  .hub-xp-bar { margin: 0 24px 12px; position: relative; height: 12px; background: #1e293b; border-radius: 999px; overflow: hidden; }
  .hub-xp-fill { height: 100%; background: linear-gradient(90deg, #f59e0b, #f97316); border-radius: 999px; transition: width 0.3s; }
  .hub-xp-label { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); font-size: 8px; font-weight: 800; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }

  .daily-banner { margin: 0 24px 12px; display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; background: linear-gradient(135deg, rgba(236,72,153,0.15), rgba(236,72,153,0.05)); border: 1px solid rgba(236,72,153,0.3); border-radius: 10px; cursor: pointer; }
  .daily-banner:hover { background: linear-gradient(135deg, rgba(236,72,153,0.25), rgba(236,72,153,0.1)); }
  .daily-icon { font-size: 13px; font-weight: 700; color: #e2e8f0; }
  .daily-arrow { font-size: 16px; color: #ec4899; }

  .hub-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px; padding: 0 24px 12px; }
  .hub-card { display: grid; gap: 4px; text-align: left; padding: 14px; background: #111827; border: 1px solid #1e293b; border-radius: 10px; color: #cbd5e1; cursor: pointer; }
  .hub-card:hover { border-color: #f59e0b; background: #1c1917; }
  .hub-card-icon { font-size: 24px; }
  .hub-card-name { font-weight: 800; color: #e2e8f0; font-size: 12px; }
  .hub-card-desc { font-size: 10px; color: #64748b; line-height: 1.4; }
  .hub-card-best { font-size: 10px; color: #f59e0b; font-weight: 700; }
  .hub-card-plays { font-size: 10px; color: #64748b; }

  .hub-bar { display: flex; gap: 8px; padding: 12px 24px; border-top: 1px solid #1e293b; flex-wrap: wrap; }
  .hub-bar-btn { padding: 6px 14px; font-size: 11px; font-weight: 700; background: #1e293b; border: 1px solid #334155; border-radius: 6px; color: #94a3b8; cursor: pointer; }
  .hub-bar-btn:hover { background: #334155; color: #e2e8f0; }

  .lb-row { display: flex; align-items: center; gap: 10px; padding: 10px; margin-bottom: 6px; background: #111827; border: 1px solid #1e293b; border-radius: 8px; }
  .lb-icon { font-size: 20px; }
  .lb-name { font-weight: 700; color: #e2e8f0; flex: 1; font-size: 13px; }
  .lb-plays { font-size: 10px; color: #64748b; }
  .lb-best { font-size: 11px; color: #f59e0b; font-weight: 700; }
  .lb-empty { text-align: center; padding: 40px; color: #64748b; font-size: 13px; }

  .ach-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px; }
  .ach-card { display: grid; gap: 4px; text-align: center; padding: 14px; border-radius: 10px; border: 1px solid #1e293b; }
  .ach-unlocked { background: rgba(16,185,129,0.06); border-color: rgba(16,185,129,0.3); }
  .ach-locked { background: #0f172a; opacity: 0.5; }
  .ach-icon { font-size: 24px; }
  .ach-name { font-size: 11px; font-weight: 700; color: #e2e8f0; }
  .ach-desc { font-size: 9px; color: #64748b; line-height: 1.3; }
</style>
