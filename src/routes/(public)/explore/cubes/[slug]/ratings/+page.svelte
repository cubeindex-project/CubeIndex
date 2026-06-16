<script lang="ts">
  import UserRatings from "$lib/components/rating/userRatings.svelte";
  import type { Tables } from "$lib/types/database.types";

  let { data } = $props();
  let {
    cube = {} as Tables<"v_detailed_cube_models">,
    user_cube_ratings = [] as any[],
  } = $derived(data);
</script>

<UserRatings {user_cube_ratings} {cube} />
