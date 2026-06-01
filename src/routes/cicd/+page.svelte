<script>
  import InfoRoute from '$lib/components/shared/InfoRoute.svelte';

  const items = [
    { title: 'Pipelines', description: 'Build, test, package, and deploy automation.' },
    { title: 'Quality Gates', description: 'Type checks, test suites, security scans, and approvals.' },
    { title: 'Release', description: 'Versioning, changelogs, artifacts, rollbacks, and observability.' },
  ];
</script>

<InfoRoute title="CI/CD" eyebrow="Delivery" description="A Svelte-native landing surface for continuous integration and delivery lessons." {items} />
