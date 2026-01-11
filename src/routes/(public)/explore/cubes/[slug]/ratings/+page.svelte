<script lang="ts">
  import UserRatings from "$lib/components/rating/userRatings.svelte";
  import type { DetailedCube } from "$lib/components/dbTableTypes";
  import { m } from "$lib/paraglide/messages";

  let { data } = $props();
  let { cube = {} as DetailedCube, user_cube_ratings = [] as any[] } =
    $derived(data);

  const pageTitle = $derived(m.explore_ratings_meta_title({ name: cube.name }));
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<UserRatings {user_cube_ratings} {cube} />
