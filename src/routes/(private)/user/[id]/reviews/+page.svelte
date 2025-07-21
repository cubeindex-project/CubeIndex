<script lang="ts">
  import UserRatingCard from "$lib/components/rating/userRatingCard.svelte";
  import Pagination from "$lib/components/misc/pagination.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  let { user_ratings = [], user, cubes = [] } = data;

  function findCube(user_rating: { cube_slug: string }) {
    return cubes.find((c) => user_rating.cube_slug === c.slug);
  }

  let currentPage: number = $state(1);
  let itemsPerPage: number = $state(4);

  const paginatedRatings = $derived.by(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return user_ratings.slice(start, end);
  });

  const totalPages = $derived(Math.ceil(user_ratings.length / itemsPerPage));
</script>

<div class="relative max-w-6xl mx-auto mt-12 px-4">
  <div class="flex flex-col gap-4">
    {#if paginatedRatings.length > 0}
      <h3 class="text-2xl font-bold mb-4">User Reviews</h3>
      {#each paginatedRatings as user_rating}
        <UserRatingCard
          {user_rating}
          cube={findCube(user_rating)}
          {user}
          showCubeDetails={true}
        />
      {/each}
      <Pagination {currentPage} {totalPages} />
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
