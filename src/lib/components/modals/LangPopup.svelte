<script>
  import Modal from '$lib/components/shared/Modal.svelte';
  let { open = false, onclose = () => {} } = $props();
</script>

<Modal {open} {onclose}>
  <h2>Language</h2>
  <p>Translation integration is isolated for Svelte and can be wired to Google Translate loading.</p>
</Modal>
