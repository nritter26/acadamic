<script lang="ts">
  import Badge from '$lib/components/ui/badge/badge.svelte';

  let { level = 'beginner' }: { level?: string } = $props();

  const variantMap: Record<string, string> = {
    beginner: 'secondary',
    intermediate: 'default',
    expert: 'destructive',
  };
</script>

<Badge variant={variantMap[level] || 'secondary'}>
  {level}
</Badge>
