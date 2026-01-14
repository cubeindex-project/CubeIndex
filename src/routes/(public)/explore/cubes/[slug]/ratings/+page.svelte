<script lang="ts">
  import UserRatings from "$lib/components/rating/userRatings.svelte";
  import type { DetailedCube } from "$lib/components/dbTableTypes";

  let { data } = $props();
  let { cube = {} as DetailedCube, user_cube_ratings = [] as any[] } =
    $derived(data);
</script>

<UserRatings {user_cube_ratings} {cube} />
