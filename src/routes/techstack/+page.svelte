<script>
  import InfoRoute from '$lib/components/shared/InfoRoute.svelte';

  const items = [
    { title: 'Frontend', description: 'SvelteKit, Vite, component state, scoped styles.' },
    { title: 'Backend', description: 'Express APIs, execution routes, progress, projects, and AI endpoints.' },
    { title: 'Data', description: 'Runtime curriculum JSON and project challenge files.' },
  ];
</script>

<InfoRoute title="Tech Stack" eyebrow="Stack Browser" description="Explore the technologies behind the Kodex learning environment." {items} />
