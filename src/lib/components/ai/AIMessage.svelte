<script>
  import { escapeHtml } from '$lib/lib/syntax.js';

  let { text, role } = $props();
  let formatted = $derived(
    escapeHtml(text)
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="inline">$1</code>')
      .replace(/\n/g, '<br>')
  );
</script>

<div class="ai-message {role}">
  <div class="label">{role === 'user' ? 'You' : 'Devin'}</div>
  <div class="content">{@html formatted}</div>
</div>

<style>
  .ai-message { padding: 8px 12px; margin-bottom: 6px; border-radius: 8px; }
  .ai-message.bot { background: #0f172a; border: 1px solid #1e293b; }
  .ai-message.user { background: #172554; border: 1px solid #1d4ed8; }
  .label { font-size: 10px; font-weight: 700; color: #64748b; margin-bottom: 4px; text-transform: uppercase; }
  .content { font-size: 13px; line-height: 1.5; color: #e2e8f0; overflow-wrap: anywhere; }
  .content :global(code.inline) { background: #1e293b; padding: 1px 4px; border-radius: 3px; font-size: 12px; color: #f472b6; }
  .content :global(pre) { background: #0a0f1e; padding: 8px; border-radius: 6px; overflow-x: auto; margin: 8px 0; }
  .content :global(code) { font-family: 'JetBrains Mono', monospace; font-size: 12px; }
</style>
