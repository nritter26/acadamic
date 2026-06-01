<script>
  import InfoRoute from '$lib/components/shared/InfoRoute.svelte';

  const items = [
    { title: 'Godot', description: 'Scenes, nodes, scripting, signals, and iteration loops.' },
    { title: 'Unity', description: 'Components, prefabs, physics, and gameplay programming.' },
    { title: 'Unreal', description: 'Blueprint concepts, C++ gameplay, and engine architecture.' },
  ];
</script>

<InfoRoute title="GameDev" eyebrow="Engine Lab" description="Game development now has a Svelte route ready for engine-specific curriculum and filters." {items} />
