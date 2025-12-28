<script lang="ts">
  import UserRatings from "$lib/components/rating/userRatings.svelte";
  import type { DetailedCube } from "$lib/components/dbTableTypes";

  let { data } = $props();
  let { cube = {} as DetailedCube, user_cube_ratings = [] as any[] } = $derived(data);

  const cubeDisplayName = $derived(() => {
    const parts = [
      cube.series,
      cube.model,
      cube.version_type && cube.version_type !== "Base" ? cube.version_name : undefined,
    ].filter(Boolean);

    const fallback = parts.join(" ").trim() || cube.slug;
    return cube.name || fallback;
  });

  const pageTitle = $derived(
    `${cubeDisplayName} - Ratings`
  );
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<UserRatings {user_cube_ratings} {cube} />
