export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function formatInlineCode(value) {
  const str = String(value);
  // Content with HTML tags skips escapeHtml to avoid double-escaping
  if (/<[a-z][\s\S]*?>/i.test(str)) {
    return str.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  }
  return escapeHtml(str).replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
}
