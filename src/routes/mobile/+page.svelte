<script>
  import InfoRoute from '$lib/components/shared/InfoRoute.svelte';

  const items = [
    { title: 'iOS', description: 'Swift fundamentals, app architecture, and platform workflows.' },
    { title: 'Android', description: 'Kotlin, lifecycle, Compose-style UI thinking, and APIs.' },
    { title: 'Cross Platform', description: 'React Native and Flutter concepts for shared app delivery.' },
  ];
</script>

<InfoRoute title="Mobile" eyebrow="App Lab" description="Mobile development topics now have a Svelte route and can be expanded into full curriculum views." {items} />
