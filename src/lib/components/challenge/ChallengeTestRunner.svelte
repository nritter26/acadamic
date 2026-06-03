<script>
  import { saveChallengeSolved, isChallengeSolved, escapeHtml } from '$lib/lib/challenge.js';

  let {
    challengeLang = 'js',
    challengeIdx = -1,
    currentChallenge = null,
    onresult = () => {},
    hintLevel = 0,
    testRunning = $bindable(false),
  } = $props();

  let testOutput = $state('');
  let testPassed = $state(false);
  let showNextBtn = $state(false);

  $effect(() => {
    testOutput = '';
    testPassed = false;
    showNextBtn = false;
  });

  async function runTests() {
    if (!currentChallenge || challengeIdx < 0) return;
    testRunning = true;
    testOutput = '';
    testPassed = false;
    showNextBtn = false;

    const editor = document.querySelector('.challenge-editor-section .cm-editor .cm-content') ||
                   document.querySelector('#editor');
    const code = editor?.value || editor?.textContent || currentChallenge.bug;
    const test = currentChallenge.test || '';
    const out = [];

    try {
      if (challengeLang === 'js') {
        testJsChallenge(code, test, out);
      } else {
        await testApiChallenge(code, test, out);
      }
    } catch (e) {
      out.push(`<div class="challenge-result fail">Error: ${escapeHtml(e.message)}</div>`);
    }

    testOutput = out.join('\n');
    onresult({ html: testOutput, type: 'result' });
    testRunning = false;
  }

  function testJsChallenge(code, test, out) {
    const savedLog = console.log;
    let captured = '';

    try {
      console.log = (m) => captured += '> ' + (typeof m === 'object' ? JSON.stringify(m) : m) + '\n';
      eval(code);
      console.log = savedLog;

      if (captured) out.push(`<pre class="captured-output">${escapeHtml(captured.trim())}</pre>`);

      const testPassedVal = eval(test);
      if (testPassedVal) {
        saveChallengeSolved(challengeLang, challengeIdx);
        out.push(`<div class="challenge-result pass">✓ PASS: Challenge solved!</div>`);
        testPassed = true;
        showNextBtn = true;
      } else {
        out.push(`<div class="challenge-result fail">✗ FAIL: Solution doesn't pass the test.</div>`);
        out.push(`<div class="test-detail"><strong>Test:</strong> <code>${escapeHtml(test)}</code></div>`);
        try {
          const actualVal = eval(code + '\n' + test);
          out.push(`<div class="test-detail"><strong>Expected:</strong> <span class="expected">true</span></div>`);
          out.push(`<div class="test-detail"><strong>Got:</strong> <span class="actual">${escapeHtml(JSON.stringify(actualVal))}</span></div>`);
        } catch {}
      }
    } catch (e) {
      console.log = savedLog;
      out.push(`<div class="challenge-result fail">Error: ${escapeHtml(e.message)}</div>`);
    }
  }

  function nextChallenge() {
    const cards = document.querySelectorAll('.challenge-card:not(.solved):not(.active)');
    if (cards.length > 0) cards[0].click();
  }

  async function testApiChallenge(code, test, out) {
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: challengeLang, code }),
      });
      const data = await response.json();
      if (data.error) {
        out.push(`<div class="challenge-result fail">Error: ${escapeHtml(data.error)}</div>`);
        return;
      }
      if (data.output) {
        out.push(`<pre class="captured-output">${escapeHtml(data.output)}</pre>`);
      }
      if (test && !test.startsWith('//')) {
        out.push(`<div class="challenge-result info">⏳ Auto-test not available for ${challengeLang}. Check the output manually.</div>`);
      } else {
        out.push(`<div class="challenge-result info">⚠️ Preview mode — verify your solution manually.</div>`);
      }
    } catch (e) {
      out.push(`<div class="challenge-result fail">API Error: ${escapeHtml(e.message)}</div>`);
    }
  }
</script>

<div class="challenge-tests">
  <div class="test-controls">
    <button onclick={runTests} disabled={testRunning || challengeIdx < 0}>
      {testRunning ? 'Running...' : 'Run Tests ▶'}
    </button>
    {#if challengeIdx >= 0 && isChallengeSolved(challengeLang, challengeIdx)}
      <span class="solved-label">✓ Solved</span>
    {/if}
  </div>
  {#if testOutput}
    <div class="test-output">{@html testOutput}</div>
    {#if showNextBtn}
      <button class="challenge-next-btn" onclick={nextChallenge}>Next Challenge →</button>
    {/if}
  {/if}
</div>

<style>
  .challenge-tests { padding: 12px; border-left: 1px solid #1e293b; color: #cbd5e1; overflow-y: auto; display: flex; flex-direction: column; }
  .test-controls { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  button { padding: 8px 14px; background: #6366f1; color: #fff; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 11px; }
  button:disabled { opacity: 0.55; cursor: not-allowed; }
  .solved-label { color: #10b981; font-weight: 700; font-size: 11px; }
  .test-output { flex: 1; overflow-y: auto; }
  .captured-output { font-size: 10px; color: #94a3b8; margin: 0 0 8px 0; white-space: pre-wrap; }
  .challenge-result { padding: 8px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; margin-bottom: 6px; }
  .challenge-result.pass { background: #14532d; color: #86efac; }
  .challenge-result.fail { background: #7f1d1d; color: #fca5a5; }
  .challenge-result.info { background: #1e3a5f; color: #93c5fd; }
  .test-detail { font-size: 10px; color: #94a3b8; margin: 2px 0; }
  .test-detail code { color: #e2e8f0; background: #1e293b; padding: 1px 4px; border-radius: 3px; }
  .expected { color: #86efac; }
  .actual { color: #fca5a5; }
  .challenge-next-btn { padding: 6px 12px; margin-top: 6px; background: #a855f7; color: #fff; border: none; border-radius: 4px; font-weight: 700; font-size: 10px; cursor: pointer; }
  .challenge-next-btn:hover { background: #9333ea; }
</style>
