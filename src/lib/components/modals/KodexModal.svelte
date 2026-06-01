<script>
  import Modal from '$lib/components/shared/Modal.svelte';
  let { open = false, onclose = () => {} } = $props();
</script>

<Modal {open} {onclose}>
  <h2>About Kodex</h2>
  <p>Kodex is an interactive programming textbook with execution, projects, AI tutoring, and visual labs.</p>
</Modal>
