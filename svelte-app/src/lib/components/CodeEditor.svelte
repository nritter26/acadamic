<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { EditorView, basicSetup } from 'codemirror';
  import { EditorState } from '@codemirror/state';
  import { oneDark } from '@codemirror/theme-one-dark';
  import { javascript } from '@codemirror/lang-javascript';
  import { python } from '@codemirror/lang-python';
  import { go } from '@codemirror/lang-go';
  import { rust } from '@codemirror/lang-rust';
  import { sql } from '@codemirror/lang-sql';
  import { xml } from '@codemirror/lang-xml';
  import { css } from '@codemirror/lang-css';
  import { html } from '@codemirror/lang-html';
  import { markdown } from '@codemirror/lang-markdown';

  let {
    value = '',
    language = 'javascript',
    onchange = (_v: string) => {},
    readonly = false,
  } = $props();

  let editorEl: HTMLDivElement;
  let view: EditorView;

  const langMap: Record<string, () => import('@codemirror/language').LanguageSupport> = {
    javascript: () => javascript(),
    typescript: () => javascript({ typescript: true }),
    python: () => python(),
    go: () => go(),
    rust: () => rust(),
    sql: () => sql(),
    xml: () => xml(),
    css: () => css(),
    html: () => html(),
    markdown: () => markdown(),
  };

  function getExtensions() {
    const langFn = langMap[language] || langMap.javascript;
    return [
      basicSetup,
      oneDark,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onchange(update.state.doc.toString());
        }
      }),
      EditorView.editable.of(!readonly),
      langFn(),
    ];
  }

  onMount(() => {
    const state = EditorState.create({
      doc: value,
      extensions: getExtensions(),
    });
    view = new EditorView({ state, parent: editorEl });
  });

  $effect(() => {
    if (view && value !== view.state.doc.toString()) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: value },
      });
    }
  });

  $effect(() => {
    if (view) {
      view.setState(
        EditorState.create({
          doc: view.state.doc.toString(),
          extensions: getExtensions(),
        })
      );
    }
  });

  onDestroy(() => {
    view?.destroy();
  });
</script>

<div bind:this={editorEl} class="h-full w-full overflow-hidden rounded-md border border-surface-light/30"></div>
