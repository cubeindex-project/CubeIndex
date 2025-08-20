<script lang="ts">
  import UserRatingCard from "./userRatingCard.svelte";
  import Pagination from "../misc/pagination.svelte";
  import StarRating from "./starRating.svelte";
  import type { Cube } from "../dbTableTypes";
  import SearchBar from "../misc/searchBar.svelte";
  import { getContext } from "svelte";
  import type { User } from "@supabase/supabase-js";

  const { user_cube_ratings, cube }: { user_cube_ratings: any[]; cube: Cube } =
    $props();

  let user = getContext<User>("user");

  let searchTerm: string = $state("");

  let filterRating: number | undefined = $state();
  const ratings = [5, 4, 3, 2, 1, 0];
  let total = user_cube_ratings.length;
  let stats = ratings.map((r) => {
    const count = user_cube_ratings.filter(
      (u: { rating: number }) => u.rating >= r && u.rating < r + 1
    ).length;
    const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
    return { rating: r, count, pct };
  });

  const filteredRatings = $derived.by(() => {
    const filtered = user_cube_ratings.filter(
      (ur: {
        rating: number;
        comment: string;
        display_name: string;
        created_at: string;
      }) =>
        (filterRating === undefined ||
          (ur.rating >= filterRating && ur.rating < filterRating + 1)) &&
        (ur.comment.includes(searchTerm.toLowerCase()) ||
          ur.display_name.includes(searchTerm.toLowerCase()) ||
          ur.created_at.includes(searchTerm.toLowerCase()))
    );

    return filtered.sort((a, b) => b.rating - a.rating);
  });

  let currentPage: number = $state(1);
  let itemsPerPage: number = $state(4);

  const paginatedRatings = $derived.by(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredRatings.slice(start, end);
  });

  const totalPages = $derived(Math.ceil(filteredRatings.length / itemsPerPage));

  $effect(() => {
    const _ = filteredRatings;
    currentPage = 1;
  });

  function resetFilters() {
    filterRating = undefined;
    searchTerm = "";
  }
</script>

<div class="mb-8">
  <div class="flex flex-row justify-between w-full mb-5 items-center">
    <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
      <i class="fa-solid fa-star"></i>
      User Ratings
    </h2>
  </div>

  {#if user_cube_ratings.length}
    <div class="mb-5">
      <div class="flex items-center mb-2">
        <StarRating readOnly={true} rating={cube.rating ?? 0} />
      </div>
      <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
        {user_cube_ratings.length} total ratings
      </p>

      {#each stats as { rating, pct }}
        <div class="flex items-center mt-4">
          <button
            onclick={() => (filterRating = rating)}
            class="link link-primary link-hover"
          >
            {rating} star
          </button>

          <div class="w-2/4 h-5 mx-4 bg-gray-200 rounded-sm dark:bg-gray-700">
            <div
              class="h-5 bg-secondary rounded-sm"
              style="width: {pct}%"
            ></div>
          </div>

          <span class="text-sm font-medium text-gray-500 dark:text-gray-400">
            {pct}%
          </span>
        </div>
      {/each}
    </div>

    <SearchBar
      placeholderLabel="Search Ratings"
      showFilter={false}
      bind:searchTerm
    />

    {#if filterRating !== undefined}
      <div class="mb-2">
        You are only showing ratings between {filterRating} and {filterRating +
          1} stars.
        <button
          class="link link-primary link-hover"
          onclick={() => {
            resetFilters();
          }}
        >
          See all
        </button>
      </div>
    {/if}

    <div class="flex flex-col gap-4">
      {#each paginatedRatings as user_rating (user_rating.id)}
        <UserRatingCard
          {user_rating}
          {cube}
          isAuthor={user_rating.user_id === user?.id}
          showCubeDetails={false}
        />
      {:else}
        <div
          class="col-span-full flex flex-col items-center justify-center py-20"
        >
          <i class="fa-solid fa-ranking-star fa-3x mb-4"></i>
          <h2 class="text-2xl font-semibold mb-2">No ratings found</h2>
          <p class="mb-6 text-center max-w-xs">
            We couldn't find any ratings matching your filter. Try adjusting it
            or resetting to see everything.
          </p>
          <button
            class="btn btn-outline flex items-center"
            aria-label="Reset filters"
            onclick={() => {
              resetFilters();
            }}
          >
            <i class="fa-solid fa-arrow-rotate-left mr-2"></i>
            Reset
          </button>
        </div>
      {/each}
    </div>
    <div class="mt-5">
      <Pagination bind:currentPage {totalPages} />
    </div>
  {:else}
    <div class="text-center italic text-gray-500">
      No user ratings yet. Be the first to rate this cube!
    </div>
  {/if}
</div>
