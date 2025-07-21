<script lang="ts">
  import UserRatingCard from "$lib/components/rating/userRatingCard.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  let { user_ratings, user, cubes = [] } = data;

  function findCube(user_rating: { cube_slug: string }) {
    return cubes.find((c) => user_rating.cube_slug === c.slug);
  }
</script>

<div class="flex flex-col items-center justify-center min-h-[200px] mt-12">
  <div class="flex flex-col gap-4">
    {#if user_ratings}
      {#each user_ratings as user_rating}
        <UserRatingCard
          {user_rating}
          cube={findCube(user_rating)}
          {user}
          showCubeDetails={true}
        />
      {/each}
    {:else}
      <div
        class="col-span-full flex flex-col items-center justify-center py-20"
      >
        <i class="fa-solid fa-ranking-star fa-3x mb-4"></i>
        <h2 class="text-2xl font-semibold mb-2">No ratings found</h2>
        <p class="mb-6 text-center max-w-xs">
          We couldn't find any ratings matching your filter. Try adjusting it or
          resetting to see everything.
        </p>
        <button
          class="btn btn-outline flex items-center"
          aria-label="Reset filters"
          onclick={() => {}}
        >
          <i class="fa-solid fa-arrow-rotate-left mr-2"></i>
          Reset
        </button>
      </div>
    {/if}
  </div>
</div>
