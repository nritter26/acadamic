<script>
  import Modal from '$lib/components/shared/Modal.svelte';
  let { open = false, onclose = () => {}, title = 'Cheatsheet' } = $props();
</script>

<Modal {open} {onclose}>
  <h2>{title}</h2>
  <p>Cheatsheet content is loaded from curriculum data as each topic is selected.</p>
</Modal>
