<script lang="ts">
  import UserRatingCard from "$lib/components/rating/userRatingCard.svelte";
  import Pagination from "$lib/components/misc/pagination.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  let { user_cube_ratings = [], user, profile } = data;

  let currentPage: number = $state(1);
  let itemsPerPage: number = $state(4);

  const paginatedRatings = $derived.by(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return user_cube_ratings.slice(start, end);
  });

  const totalPages = $derived(
    Math.ceil(user_cube_ratings.length / itemsPerPage)
  );
</script>

<svelte:head>
  <title>{profile.display_name}'s Ratings - CubeIndex</title>
</svelte:head>

<div class="relative max-w-6xl mx-auto mt-12 px-4">
  <div class="flex flex-col gap-4">
    {#if paginatedRatings.length > 0}
      <h3 class="text-2xl font-bold mb-4">User Ratings</h3>
      {#each paginatedRatings as user_rating}
        {#key paginatedRatings}
          <UserRatingCard
            {user_rating}
            cube={user_rating.cube_model}
            isAuthor={user_rating.user_id === user?.id}
            showCubeDetails={true}
          />
        {/key}
      {/each}
      <Pagination bind:currentPage {totalPages} />
    {:else}
      <div
        class="col-span-full flex flex-col items-center justify-center py-20"
      >
        <i class="fa-solid fa-ranking-star fa-3x mb-4"></i>
        <h2 class="text-2xl font-semibold mb-2">
          This user didn't rate any cube.
        </h2>
      </div>
    {/if}
  </div>
</div>
