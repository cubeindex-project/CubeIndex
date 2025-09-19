<script lang="ts">
  import type { PageData } from "./$types";
  import StaffRatingCard from "$lib/components/rating/staffRatingCard.svelte";
  import SearchBar from "$lib/components/misc/searchBar.svelte";

  type RatingFilter = "all" | "5" | "4plus" | "3plus" | "2plus" | "1plus";
  type SortOrder = "newest" | "oldest" | "highest" | "lowest";

  type StaffRating = {
    id: number;
    rating: number | null;
    comment: string | null;
    created_at: string;
    cube_slug: {
      slug: string;
      series?: string | null;
      model?: string | null;
      version_type?: string | null;
      version_name?: string | null;
    };
    user_id: {
      username?: string | null;
      display_name?: string | null;
    };
  };

  let { data }: { data: PageData } = $props();
  let { user_cube_ratings }: { user_cube_ratings: StaffRating[] | null } = data;

  let searchTerm: string = $state("");
  let ratingFilter: RatingFilter = $state("all");
  let sortOrder: SortOrder = $state("newest");

  const normalizedSearch = $derived.by(() => searchTerm.trim().toLowerCase());

  const filteredRatings = $derived.by(() => {
    if (!user_cube_ratings) {
      return [] satisfies StaffRating[];
    }

    const filtered = user_cube_ratings.filter((rating: StaffRating) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          rating.comment,
          rating.user_id?.display_name,
          rating.user_id?.username,
          rating.cube_slug?.series,
          rating.cube_slug?.model,
          rating.cube_slug?.version_name,
          rating.cube_slug?.version_type,
          rating.rating?.toString(),
          rating.created_at,
        ]
          .filter((value): value is string => typeof value === "string")
          .some((value) => value.toLowerCase().includes(normalizedSearch));

      const matchesRating = (() => {
        if (rating.rating === null || rating.rating === undefined) {
          return false;
        }

        switch (ratingFilter) {
          case "all":
            return true;
          case "5":
            return rating.rating >= 5;
          case "4plus":
            return rating.rating >= 4;
          case "3plus":
            return rating.rating >= 3;
          case "2plus":
            return rating.rating >= 2;
          case "1plus":
            return rating.rating >= 1;
          default:
            return true;
        }
      })();

      return matchesSearch && matchesRating;
    });

    const sorted = filtered.sort((a, b) => {
      const ratingA = a.rating ?? 0;
      const ratingB = b.rating ?? 0;
      const createdA = new Date(a.created_at).getTime();
      const createdB = new Date(b.created_at).getTime();

      switch (sortOrder) {
        case "oldest":
          return createdA - createdB;
        case "highest":
          return ratingB - ratingA || createdB - createdA;
        case "lowest":
          return ratingA - ratingB || createdA - createdB;
        case "newest":
        default:
          return createdB - createdA;
      }
    });

    return sorted;
  });

  const totalRatings = $derived(user_cube_ratings?.length ?? 0);

  const matchingRatings = $derived(filteredRatings.length);

  const averageRating = $derived.by(() => {
    if (!user_cube_ratings || user_cube_ratings.length === 0) {
      return 0;
    }

    const total = user_cube_ratings.reduce(
      (sum: number, rating: StaffRating) => sum + (rating.rating ?? 0),
      0
    );

    return total / user_cube_ratings.length;
  });

  const distinctCubes = $derived.by(() => {
    if (!user_cube_ratings) {
      return 0;
    }

    const seen = new Set(
      user_cube_ratings
        .map((rating: StaffRating) => rating.cube_slug?.slug)
        .filter((slug): slug is string => typeof slug === "string")
    );

    return seen.size;
  });

  const hasRatings = $derived(totalRatings > 0);

  const hasActiveFilters = $derived(
    normalizedSearch.length > 0 || ratingFilter !== "all" || sortOrder !== "newest"
  );

  function resetFilters() {
    searchTerm = "";
    ratingFilter = "all";
    sortOrder = "newest";
  }
</script>

<div class="flex flex-col items-center mt-12 px-4">
  <div class="flex flex-col gap-8 justify-center w-full max-w-5xl">
    <div class="text-center">
      <h1 class="text-4xl font-clash font-bold">Manage Ratings</h1>
      <p class="mt-2 text-base-content/70">
        Review, filter, and moderate every rating submitted by the community.
      </p>
    </div>

    {#if hasRatings}
      <div class="grid gap-4 sm:grid-cols-3">
        <div class="rounded-xl bg-base-200 p-5 border border-base-300">
          <p class="text-sm text-base-content/60">Total ratings</p>
          <p class="mt-2 text-3xl font-bold">{totalRatings}</p>
        </div>
        <div class="rounded-xl bg-base-200 p-5 border border-base-300">
          <p class="text-sm text-base-content/60">Average score</p>
          <p class="mt-2 text-3xl font-bold">
            {averageRating === 0 ? "–" : averageRating.toFixed(1)}
          </p>
        </div>
        <div class="rounded-xl bg-base-200 p-5 border border-base-300">
          <p class="text-sm text-base-content/60">Cubes represented</p>
          <p class="mt-2 text-3xl font-bold">{distinctCubes}</p>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        <SearchBar
          bind:searchTerm
          showFilter={false}
          placeholderLabel="Search by user, cube, or comment"
        />

        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div class="flex flex-col gap-4 sm:flex-row">
            <label class="form-control w-full sm:w-56">
              <span class="label-text">Rating filter</span>
              <select
                class="select select-bordered"
                bind:value={ratingFilter}
                aria-label="Filter by rating"
              >
                <option value="all">All ratings</option>
                <option value="5">Only 5 stars</option>
                <option value="4plus">4 stars &amp; up</option>
                <option value="3plus">3 stars &amp; up</option>
                <option value="2plus">2 stars &amp; up</option>
                <option value="1plus">1 star &amp; up</option>
              </select>
            </label>

            <label class="form-control w-full sm:w-56">
              <span class="label-text">Sort results</span>
              <select
                class="select select-bordered"
                bind:value={sortOrder}
                aria-label="Sort ratings"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="highest">Highest rating</option>
                <option value="lowest">Lowest rating</option>
              </select>
            </label>
          </div>

          {#if hasActiveFilters}
            <button
              class="btn btn-ghost w-full sm:w-auto"
              onclick={resetFilters}
              type="button"
            >
              <i class="fa-solid fa-arrow-rotate-left mr-2"></i>
              Reset filters
            </button>
          {/if}
        </div>

        <div class="flex items-center justify-between text-sm text-base-content/60">
          <span>
            Showing {matchingRatings} of {totalRatings} rating{totalRatings === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {#if matchingRatings > 0}
        <div class="flex flex-col gap-4">
          {#each filteredRatings as user_rating (user_rating.id)}
            <StaffRatingCard {user_rating} cube={user_rating.cube_slug} />
          {/each}
        </div>
      {:else}
        <div class="col-span-full flex flex-col items-center justify-center py-20">
          <i class="fa-solid fa-ranking-star fa-3x mb-4"></i>
          <h2 class="text-2xl font-semibold mb-2">No ratings found</h2>
          <p class="mb-6 text-center max-w-xs">
            We couldn't find any ratings matching your filter. Try adjusting it or
            resetting to see everything.
          </p>
          <button
            class="btn btn-outline flex items-center"
            aria-label="Reset filters"
            onclick={resetFilters}
            type="button"
          >
            <i class="fa-solid fa-arrow-rotate-left mr-2"></i>
            Reset
          </button>
        </div>
      {/if}
    {:else}
      <div class="rounded-xl bg-base-200 border border-base-300 p-10 text-center">
        <i class="fa-solid fa-ranking-star fa-3x mb-4"></i>
        <h2 class="text-2xl font-semibold mb-2">No ratings yet</h2>
        <p class="text-base-content/70">
          Once users start rating cubes you'll be able to manage them from here.
        </p>
      </div>
    {/if}
  </div>
</div>
