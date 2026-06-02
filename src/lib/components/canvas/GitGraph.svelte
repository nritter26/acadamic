<script>
  import { onMount } from 'svelte';
  import { createGitEngine, SCENARIOS } from '$lib/lib/git.js';

  let engine = $state(createGitEngine());
  let svgContent = $state('');
  let terminalHistory = $state([]);
  let terminalIdx = $state(-1);
  let cmdInput = $state('');
  let scenarioKeys = $state(Object.keys(SCENARIOS));
  let activeScenario = $state('branch');
  let selectedCommit = $state(null);
  let inputEl;

  onMount(() => {
    loadScenario('branch');
  });

  function loadScenario(name) {
    engine.loadScenario(name);
    activeScenario = name;
    terminalHistory = [];
    terminalIdx = -1;
    cmdInput = '';
    selectedCommit = null;
    appendTerminal('echo "Welcome to Git Mode"', false);
    appendTerminal('Welcome to Git Mode', true);
    appendTerminal('✓ Scenario: ' + SCENARIOS[name].name + ' — ' + SCENARIOS[name].desc, true);
    const initCmds = SCENARIOS[name].initCmds;
    if (initCmds && initCmds.length > 0) {
      for (const c of initCmds) {
        const result = engine.processCommand(c);
        engine.pushHistory();
        appendTerminal(c, false);
        if (result) appendTerminal(result, true);
      }
    }
    renderGraph();
  }

  function renderGraph() {
    svgContent = engine.generateSVG();
  }

  function appendTerminal(text, isResult) {
    terminalHistory = [...terminalHistory, { text, isResult }];
  }

  function handleCommand() {
    const cmd = cmdInput.trim();
    if (!cmd) return;
    const result = cmd.startsWith('git ')
      ? engine.processCommand(cmd)
      : '// Unknown command. Use "git <command>"';
    if (cmd.startsWith('git ')) engine.pushHistory();
    appendTerminal(cmd, false);
    if (result) appendTerminal(result, true);
    cmdInput = '';
    renderGraph();
    selectedCommit = null;
  }

  function handleKeydown(e) {
    if (e.key === 'Enter') {
      handleCommand();
    } else if (e.key === 'ArrowUp' && terminalHistory.length > 0) {
      let idx = terminalHistory.length - 1;
      for (let i = terminalHistory.length - 1; i >= 0; i--) {
        if (!terminalHistory[i].isResult && terminalHistory[i].text !== cmdInput) {
          idx = i; break;
        }
      }
      cmdInput = terminalHistory[idx]?.text || '';
      e.preventDefault();
    }
  }

  function handleCommitClick(e) {
    const target = e.target.closest('[data-id]');
    if (target) {
      const id = target.getAttribute('data-id');
      const state = engine.getState();
      const commit = state?.commits.find(c => c.id === id);
      selectedCommit = commit;
      document.querySelectorAll('.git-cn').forEach(c => c.style.filter = '');
      target.querySelectorAll('.git-cn').forEach(c => c.style.filter = 'url(#glow)');
    }
  }

  function handleCommitHover(e) {
    const circle = e.target.closest('[data-id]')?.querySelector('.git-cn');
    if (circle) circle.setAttribute('r', '16');
  }

  function handleCommitUnhover(e) {
    const circle = e.target.closest('[data-id]')?.querySelector('.git-cn');
    if (circle) {
      const g = circle.closest('[data-id]');
      const isMerge = g && engine.getState()?.commits.find(c => c.id === g.getAttribute('data-id'))?.parents?.length > 1;
      circle.setAttribute('r', isMerge ? '14' : '12');
    }
  }

  function clearTerminal() {
    terminalHistory = [];
  }
</script>

<div class="git-grounds">
  <div class="git-tabs">
    {#each scenarioKeys as key}
      <button class="git-tab" class:active={activeScenario === key} onclick={() => loadScenario(key)}>
        {SCENARIOS[key].name}
      </button>
    {/each}
  </div>

  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="git-graph" onclick={handleCommitClick} onmouseover={handleCommitHover} onmouseout={handleCommitUnhover}>
    {@html svgContent}
  </div>

  {#if selectedCommit}
    <div class="git-commit-detail">
      <div class="gcd-header">
        <strong>{selectedCommit.id}</strong>
        <span class="gcd-meta">{selectedCommit.author} · branch: {selectedCommit.branch}</span>
        <button class="gcd-close" onclick={() => selectedCommit = null}>✕</button>
      </div>
      <div class="gcd-msg">{selectedCommit.msg}</div>
      {#if selectedCommit.parents?.length}
        <div class="gcd-parents">Parents: {selectedCommit.parents.join(', ')}</div>
      {/if}
      {#if selectedCommit.diff?.files?.length}
        <div class="gcd-files">
          <div class="gcd-files-label">Files changed</div>
          {#each selectedCommit.diff.files as file}
            <div class="gcd-file">
              <div class="gcd-file-name">{file.file}</div>
              {#each file.added as line}
                <div class="gcd-line added">+ {line}</div>
              {/each}
              {#each file.removed as line}
                <div class="gcd-line removed">- {line}</div>
              {/each}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  <div class="git-terminal">
    <div class="git-terminal-output">
      {#each terminalHistory as entry}
        <div class="git-terminal-line" class:git-result={entry.isResult}>
          {#if !entry.isResult}<span class="git-prompt">$ </span>{/if}
          {entry.text}
        </div>
      {/each}
    </div>
    <div class="git-terminal-input-line">
      <span class="git-prompt">$ </span>
      <input
        bind:this={inputEl}
        bind:value={cmdInput}
        onkeydown={handleKeydown}
        class="git-terminal-input"
        placeholder="Type a git command..."
        spellcheck="false"
        autocomplete="off"
      />
    </div>
  </div>
</div>

<style>
  .git-grounds { display: flex; flex-direction: column; height: 100%; background: #0f172a; color: #e2e8f0; }
  .git-tabs { display: flex; gap: 2px; padding: 8px 12px; border-bottom: 1px solid #1e293b; overflow-x: auto; }
  .git-tab { padding: 5px 12px; font-size: 10px; font-weight: 700; background: transparent; border: 1px solid transparent; border-radius: 4px; color: #64748b; cursor: pointer; white-space: nowrap; }
  .git-tab.active { background: #1e293b; border-color: #f1502f; color: #fca5a5; }
  .git-tab:hover { color: #e2e8f0; }
  .git-graph { flex: 1; overflow: auto; min-height: 0; border-bottom: 1px solid #1e293b; cursor: pointer; }
  .git-terminal { flex: 0 0 180px; display: flex; flex-direction: column; min-height: 0; }
  .git-terminal-output { flex: 1; overflow-y: auto; padding: 6px 12px; font-family: 'JetBrains Mono', monospace; font-size: 11px; line-height: 1.5; }
  .git-terminal-line { white-space: pre-wrap; color: #e2e8f0; }
  .git-terminal-line.git-result { color: #94a3b8; }
  .git-prompt { color: #22c55e; font-weight: 700; }
  .git-terminal-input-line { display: flex; align-items: center; gap: 4px; padding: 6px 12px; border-top: 1px solid #1e293b; background: #0a0f1e; }
  .git-terminal-input { flex: 1; background: transparent; border: none; outline: none; color: #e2e8f0; font-family: 'JetBrains Mono', monospace; font-size: 11px; }
  .git-commit-detail { padding: 12px; border-bottom: 1px solid #1e293b; background: #0a0f1e; }
  .gcd-header { display: flex; align-items: center; gap: 12px; margin-bottom: 6px; }
  .gcd-meta { font-size: 10px; color: #64748b; }
  .gcd-close { margin-left: auto; background: transparent; border: none; color: #64748b; cursor: pointer; font-size: 12px; }
  .gcd-msg { padding: 6px 10px; background: #1e293b; border-radius: 4px; font-size: 11px; color: #cbd5e1; margin-bottom: 6px; }
  .gcd-parents { font-size: 9px; color: #64748b; margin-bottom: 6px; }
  .gcd-files-label { font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
  .gcd-file { padding: 4px 6px; margin-bottom: 4px; background: #1e293b; border-radius: 4px; }
  .gcd-file-name { font-size: 9px; font-weight: 600; color: #cbd5e1; margin-bottom: 2px; }
  .gcd-line { font-size: 10px; font-family: 'JetBrains Mono', monospace; padding: 1px 0; }
  .gcd-line.added { color: #2ea043; }
  .gcd-line.removed { color: #f1502f; }
</style>
