<script lang="ts">
  import UserRatings from "$lib/components/rating/userRatings.svelte";

  let { data } = $props();
  let { cube, user_cube_ratings } = $derived(data);
</script>

<UserRatings {user_cube_ratings} {cube} />
