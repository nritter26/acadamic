<script>
  import Modal from '$lib/components/shared/Modal.svelte';
  let { open = false, onclose = () => {} } = $props();
</script>

<Modal {open} {onclose}>
  <h2>Roadmap</h2>
  <p>Follow fundamentals, practice, projects, systems, and specialization paths.</p>
</Modal>
