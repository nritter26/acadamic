export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function formatInlineCode(value) {
  return escapeHtml(value).replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
}
