<script lang="ts">
  import UserRatings from "$lib/components/rating/userRatings.svelte";
  import type { Cube } from "$lib/components/dbTableTypes";

  let { data } = $props();
  let { cube = {} as Cube, user_cube_ratings = [] as any[] } = $derived(data);

  const pageTitle = $derived(
    `${cube.series} ${cube.model}${
      cube.version_name ? ` ${cube.version_name}` : ""
    } - Ratings`
  );
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<UserRatings {user_cube_ratings} {cube} />
