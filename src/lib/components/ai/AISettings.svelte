<script>
  import { getAIState } from '$lib/stores/ai.svelte.js';

  let ai = $derived(getAIState());

  const MODEL_PRESETS = {
    local: [
      { value: 'qwen2.5-coder:1.5b-instruct-q5_K_M', label: 'Qwen 2.5 Coder 1.5B' },
      { value: 'qwen2.5-coder:7b', label: 'Qwen 2.5 Coder 7B' },
    ],
    openai: [
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
      { value: 'gpt-4o', label: 'GPT-4o' },
    ],
  };

  let selectedPreset = $state('');
  let customModel = $state(false);

  $effect(() => {
    const presets = MODEL_PRESETS[ai.provider];
    if (!presets) { selectedPreset = ''; customModel = true; return; }
    const match = presets.find(p => p.value === ai.model);
    if (match) { selectedPreset = match.value; customModel = false; }
    else if (ai.model) { selectedPreset = ''; customModel = true; }
    else { selectedPreset = presets[0].value; customModel = false; ai.model = presets[0].value; }
  });

  function onPresetChange() {
    customModel = selectedPreset === '__custom__';
    if (!customModel) ai.model = selectedPreset;
  }
</script>

<div class="ai-settings">
  <label class="ai-toggle-row">
    <span>Use AI tutor</span>
    <input type="checkbox" bind:checked={ai.useAI} />
  </label>
  <label>
    Provider
    <select bind:value={ai.provider}>
      <option value="hybrid">Hybrid</option>
      <option value="local">Ollama</option>
      <option value="openai">OpenAI</option>
    </select>
  </label>
  {#if MODEL_PRESETS[ai.provider]}
    <label>
      Model
      <select bind:value={selectedPreset} onchange={onPresetChange}>
        {#each MODEL_PRESETS[ai.provider] as preset}
          <option value={preset.value}>{preset.label}</option>
        {/each}
        <option value="__custom__">Custom...</option>
      </select>
    </label>
    {#if customModel}
      <label>
        Custom model
        <input bind:value={ai.model} placeholder="e.g. llama3.2" />
      </label>
    {/if}
  {:else}
    <label>
      Model
      <input bind:value={ai.model} placeholder="optional" />
    </label>
  {/if}
</div>

<style>
  .ai-settings { display: grid; gap: 8px; padding: 12px; }
  label { display: grid; gap: 4px; color: #94a3b8; font-size: 11px; font-weight: 700; }
  select, input:not([type="checkbox"]) { background: #0a0f1e; color: #e2e8f0; border: 1px solid #334155; border-radius: 6px; padding: 6px; }
  .ai-toggle-row { display: flex; justify-content: space-between; align-items: center; }
  .ai-toggle-row input[type="checkbox"] { width: 36px; height: 20px; accent-color: #6366f1; cursor: pointer; }
</style>
