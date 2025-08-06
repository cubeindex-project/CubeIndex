<script lang="ts">
  import type { PageData } from "./$types";
  import StaffRatingCard from "$lib/components/rating/staffRatingCard.svelte";
  import SearchBar from "$lib/components/misc/searchBar.svelte";

  let { data }: { data: PageData } = $props();
  let { user_cube_ratings } = data;

  let searchTerm: string = $state("");
  let filteredRatings: any[] = $state([]);

  $effect(() => {
    const _ = searchTerm;
    if (user_cube_ratings) {
      filteredRatings = user_cube_ratings.filter(
        (ur: {
          rating: number;
          comment: string;
          username: string;
          created_at: string;
        }) =>
          ur.rating.toString().includes(searchTerm.toLowerCase()) ||
          ur.comment.includes(searchTerm.toLowerCase()) ||
          ur.username.includes(searchTerm.toLowerCase()) ||
          ur.created_at.includes(searchTerm.toLowerCase())
      );
    }
  });
</script>

<div class="flex flex-col items-center mt-12">
  <div class="flex flex-col gap-4 justify-center max-w-2xl">
    <h1 class="text-4xl font-clash font-bold mb-6 text-center">
      Manage Ratings
    </h1>

    <SearchBar
      bind:searchTerm
      showFilter={false}
      placeholderLabel="Search Ratings"
    />

    {#if filteredRatings}
      {#each filteredRatings as user_rating}
        <StaffRatingCard {user_rating} cube={user_rating.cube_slug} />
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
