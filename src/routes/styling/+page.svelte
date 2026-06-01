<script>
  let css = $state('body { font-family: sans-serif; background: linear-gradient(135deg, #0f172a, #155e75); color: white; display: grid; place-items: center; min-height: 100vh; }\\nh1 { font-size: 56px; }');
  let markup = $state('<h1>Style me</h1>');
  let srcdoc = $derived(`<style>${css}</style>${markup}`);
</script>

<div class="styling-route">
  <section>
    <h2>Styling Grounds</h2>
    <label>HTML<textarea bind:value={markup}></textarea></label>
    <label>CSS<textarea bind:value={css}></textarea></label>
  </section>
  <iframe title="Styling preview" {srcdoc}></iframe>
</div>

<style>
  .styling-route { display: grid; grid-template-columns: 420px 1fr; height: 100%; background: #0f172a; color: #e2e8f0; }
  section { padding: 18px; border-right: 1px solid #1e293b; overflow: auto; }
  label { display: grid; gap: 6px; margin-bottom: 14px; color: #94a3b8; font-size: 11px; font-weight: 800; text-transform: uppercase; }
  textarea { min-height: 160px; background: #0a0f1e; color: #e2e8f0; border: 1px solid #334155; border-radius: 8px; padding: 12px; font-family: 'JetBrains Mono', monospace; }
  iframe { width: 100%; height: 100%; border: none; background: white; }
</style>
