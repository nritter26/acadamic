<script>
  let { title, eyebrow = 'Kodex', description = '', items = [] } = $props();
</script>

<div class="info-route">
  <section>
    <div class="eyebrow">{eyebrow}</div>
    <h1>{title}</h1>
    <p>{description}</p>
    <div class="cards">
      {#each items as item}
        <article>
          <h2>{item.title}</h2>
          <p>{item.description}</p>
        </article>
      {/each}
    </div>
  </section>
</div>

<style>
  .info-route { min-height: 100%; overflow: auto; background: radial-gradient(circle at top left, rgba(56,189,248,0.18), transparent 32rem), #0f172a; color: #e2e8f0; }
  section { padding: clamp(24px, 5vw, 56px); }
  .eyebrow { color: #38bdf8; font-size: 12px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; }
  h1 { margin: 8px 0; font-size: clamp(36px, 7vw, 84px); line-height: 0.92; }
  p { max-width: 760px; color: #94a3b8; line-height: 1.65; }
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-top: 28px; }
  article { padding: 18px; border: 1px solid #1e293b; border-radius: 16px; background: rgba(15, 23, 42, 0.74); }
  article h2 { margin: 0 0 8px; font-size: 16px; }
</style>
