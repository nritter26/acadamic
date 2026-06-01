<script>
  import { onMount } from 'svelte';

  let { tables = [] } = $props();
  let canvas;

  function draw() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const scale = window.devicePixelRatio || 1;
    const width = canvas.clientWidth || 800;
    const height = canvas.clientHeight || 420;
    canvas.width = width * scale;
    canvas.height = height * scale;
    ctx.scale(scale, scale);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#0a0f1e';
    ctx.fillRect(0, 0, width, height);
    ctx.font = '13px JetBrains Mono, monospace';

    tables.forEach((table, index) => {
      const x = 24 + (index % 3) * 240;
      const y = 24 + Math.floor(index / 3) * 170;
      ctx.fillStyle = '#111827';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x, y, 200, 120, 10);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(table.name, x + 14, y + 24);
      ctx.fillStyle = '#cbd5e1';
      (table.columns || []).slice(0, 5).forEach((column, colIndex) => {
        ctx.fillText(`${column.name}: ${column.type || 'TEXT'}`, x + 14, y + 50 + colIndex * 16);
      });
    });
  }

  onMount(() => {
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  });

  $effect(() => {
    tables;
    draw();
  });
</script>

<canvas bind:this={canvas} class="schema-canvas" aria-label="Schema designer canvas"></canvas>

<style>
  .schema-canvas { width: 100%; min-height: 420px; height: 100%; display: block; background: #0a0f1e; }
</style>
