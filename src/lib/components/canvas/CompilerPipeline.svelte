<script>
  import { summarizeTokens, tokenizeSource } from '$lib/lib/compiler.js';

  let source = $state('let x = 1;');
  let tokens = $derived(tokenizeSource(source));
  let summary = $derived(summarizeTokens(tokens));
</script>

<div class="compiler-pipeline">
  <section>
    <h2>Compiler Pipeline</h2>
    <textarea bind:value={source}></textarea>
  </section>
  <section>
    <h3>Tokens</h3>
    <div class="tokens">
      {#each tokens as token}
        <span>{token.type}: {token.value}</span>
      {/each}
    </div>
    <h3>Stats</h3>
    <pre>{JSON.stringify(summary, null, 2)}</pre>
  </section>
</div>

<style>
  .compiler-pipeline { display: grid; grid-template-columns: 1fr 1fr; height: 100%; background: #0f172a; color: #e2e8f0; }
  section { padding: 18px; overflow: auto; border-right: 1px solid #1e293b; }
  textarea { width: 100%; min-height: 320px; box-sizing: border-box; background: #0a0f1e; color: #e2e8f0; border: 1px solid #334155; border-radius: 8px; padding: 12px; font-family: 'JetBrains Mono', monospace; }
  .tokens { display: flex; flex-wrap: wrap; gap: 8px; }
  .tokens span { padding: 4px 8px; border-radius: 999px; background: #1e293b; color: #cbd5e1; font-size: 12px; }
  pre { background: #0a0f1e; border: 1px solid #1e293b; border-radius: 8px; padding: 12px; }
</style>
