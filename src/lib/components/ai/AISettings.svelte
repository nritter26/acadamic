<script>
  import { getAIState } from '$lib/stores/ai.svelte.js';

  let ai = $derived(getAIState());
</script>

<div class="ai-settings">
  <label>
    Provider
    <select bind:value={ai.provider}>
      <option value="hybrid">Hybrid</option>
      <option value="local">Ollama</option>
      <option value="openai">OpenAI</option>
    </select>
  </label>
  <label>
    Model
    <input bind:value={ai.model} placeholder="optional" />
  </label>
</div>

<style>
  .ai-settings { display: grid; gap: 8px; padding: 12px; }
  label { display: grid; gap: 4px; color: #94a3b8; font-size: 11px; font-weight: 700; }
  select, input { background: #0a0f1e; color: #e2e8f0; border: 1px solid #334155; border-radius: 6px; padding: 6px; }
</style>
