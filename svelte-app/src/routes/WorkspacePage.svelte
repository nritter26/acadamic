<script lang="ts">
  import { onMount } from 'svelte';
  import { code, executeCode, setCode, setStdin } from '../lib/stores/workspace';
  import { currentLanguage } from '../lib/stores/language';
  import { setBreadcrumbs } from '../lib/stores/navigation';
  import Button from '../lib/components/Button.svelte';
  import CodeEditor from '../lib/components/CodeEditor.svelte';
  import OutputPanel from './OutputPanel.svelte';

  let input = $state('');

  onMount(() => {
    setBreadcrumbs([{ label: 'Workspace', section: 'workspace' }]);
  });

  function handleRun() {
    executeCode($currentLanguage);
  }

  function handleCodeChange(v: string) {
    setCode(v);
  }

  function handleStdinChange() {
    setStdin(input);
  }
</script>

<div class="h-full flex flex-col gap-3">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-lg font-bold text-white">Workspace</h1>
      <p class="text-xs text-gray-500">Write and execute code in {$currentLanguage}</p>
    </div>
    <div class="flex items-center gap-2">
      <Button variant="primary" size="md" onclick={handleRun}>
        ▶ Run
      </Button>
    </div>
  </div>

  <div class="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 min-h-0">
    <div class="flex flex-col min-h-0">
      <div class="flex-1 rounded-lg overflow-hidden border border-surface-light/30">
        <CodeEditor
          value={$code}
          language={$currentLanguage}
          onchange={handleCodeChange}
        />
      </div>
    </div>
    <div class="min-h-0">
      <OutputPanel />
    </div>
  </div>

  <details class="text-sm text-gray-400">
    <summary class="cursor-pointer hover:text-gray-200">Standard Input</summary>
    <textarea
      bind:value={input}
      oninput={handleStdinChange}
      class="w-full mt-2 bg-surface border border-surface-light/50 rounded-md px-3 py-2 text-sm font-mono text-gray-200 focus:outline-none focus:border-blue-400"
      rows="3"
      placeholder="Optional stdin input..."
    ></textarea>
  </details>
</div>
