export function markCodeAsNotranslate(root = document) {
  root.querySelectorAll('code, pre, textarea').forEach((node) => node.classList.add('notranslate'));
}
