<script lang="ts">
  import UserRatingCard from "$lib/components/rating/userRatingCard.svelte";
  import Pagination from "$lib/components/misc/pagination.svelte";
  import SearchBar from "$lib/components/misc/searchBar.svelte";
  import FilterSidebar from "$lib/components/misc/filterSidebar.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  let { user_cube_ratings = [], user, profile } = data;

  // Pagination
  let currentPage: number = $state(1);
  let itemsPerPage: number = $state(6);

  // Search & Filters
  let searchTerm: string = $state("");
  let showFilters = $state(false);
  let selectedType: string = $state("All");
  let selectedRating: string = $state("All"); // e.g. All, 5, 4+, 3+, <=2
  let onlyWithComments: boolean = $state(false);

  // Sorting
  type SortKey = "recent" | "rating" | "name";
  let sortBy: SortKey = $state("recent");
  let sortDir: "asc" | "desc" = $state("desc");

  // Derived
  const total = $derived(user_cube_ratings.length);
  const averageRating = $derived(
    total > 0
      ? Math.round(
          (user_cube_ratings.reduce((s, r) => s + (r.rating ?? 0), 0) / total) * 10
        ) / 10
      : 0
  );
  const withCommentsCount = $derived(
    user_cube_ratings.filter((r) => (r.comment ?? "").trim().length > 0).length
  );
  const allTypes: string[] = $derived(
    Array.from(
      new Set(
        user_cube_ratings.map((r) => r.cube_model?.type as string).filter(Boolean)
      )
    ).sort()
  );

  const filteredRatings = $derived.by(() => {
    const term = searchTerm.trim().toLowerCase();
    return user_cube_ratings.filter((r) => {
      const c = r.cube_model ?? {};
      const name = `${c.series ?? ""} ${c.model ?? ""} ${c.version_name ?? ""}`
        .trim()
        .toLowerCase();
      const typeOk = selectedType === "All" || c.type === selectedType;
      const hasCommentOk = !onlyWithComments || (r.comment ?? "").trim().length > 0;
      let ratingOk = true;
      const val = r.rating ?? 0;
      if (selectedRating === "5") ratingOk = val === 5;
      else if (selectedRating === "4+") ratingOk = val >= 4;
      else if (selectedRating === "3+") ratingOk = val >= 3;
      else if (selectedRating === "<=2") ratingOk = val <= 2;
      return name.includes(term) && typeOk && hasCommentOk && ratingOk;
    });
  });

  const sortedRatings = $derived.by(() => {
    const arr = [...filteredRatings];
    const cmp = (a: any, b: any) => {
      if (sortBy === "recent") {
        const ad = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bd = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bd - ad; // default desc
      }
      if (sortBy === "rating") {
        return (b.rating ?? 0) - (a.rating ?? 0); // default desc
      }
      if (sortBy === "name") {
        const an = `${a.cube_model?.series ?? ""} ${a.cube_model?.model ?? ""} ${a.cube_model?.version_name ?? ""}`.trim();
        const bn = `${b.cube_model?.series ?? ""} ${b.cube_model?.model ?? ""} ${b.cube_model?.version_name ?? ""}`.trim();
        return an.localeCompare(bn);
      }
      return 0;
    };
    arr.sort(cmp);
    if (sortDir === "asc") arr.reverse();
    return arr;
  });

  const paginatedRatings = $derived.by(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return sortedRatings.slice(start, end);
  });

  const totalPages = $derived.by(() => Math.max(1, Math.ceil(sortedRatings.length / itemsPerPage)));

  $effect(() => {
    const _ = filteredRatings;
    currentPage = 1;
  });
</script>

<svelte:head>
  <title>{profile.display_name}'s Ratings - CubeIndex</title>
</svelte:head>

<div class="relative max-w-6xl mx-auto mt-12 px-4">
  <header class="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 class="text-2xl font-extrabold tracking-tight">
        {profile.display_name}'s Ratings
      </h1>
      <p class="text-sm text-base-content/70">{total} ratings</p>
    </div>

    {#if total > 0}
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-2">
          <label class="text-sm" for="sortBy">Sort</label>
          <select
            id="sortBy"
            class="select select-bordered"
            bind:value={sortBy}
          >
            <option value="recent">Recent</option>
            <option value="rating">Rating</option>
            <option value="name">Name</option>
          </select>
          <button
            type="button"
            class="btn btn-ghost btn-sm"
            title={sortDir === "desc" ? "Descending" : "Ascending"}
            aria-label="Toggle sort direction"
            onclick={() => (sortDir = sortDir === "desc" ? "asc" : "desc")}
          >
            {#if sortDir === "desc"}
              <i class="fa-solid fa-arrow-down-wide-short"></i>
            {:else}
              <i class="fa-solid fa-arrow-up-short-wide"></i>
            {/if}
          </button>
        </div>

        <div class="divider divider-horizontal m-0"></div>

        <div class="flex items-center gap-2">
          <label class="text-sm" for="itemsPerPage">Per page</label>
          <select
            id="itemsPerPage"
            bind:value={itemsPerPage}
            class="select select-bordered"
            onchange={() => (itemsPerPage = +itemsPerPage)}
          >
            <option value={3}>3</option>
            <option value={6}>6</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
          </select>
        </div>
      </div>
    {/if}
  </header>

  <!-- Quick stats -->
  {#if total > 0}
    <div class="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div class="stats shadow bg-base-200 border border-base-300">
        <div class="stat">
          <div class="stat-title">Total Ratings</div>
          <div class="stat-value">{total}</div>
        </div>
      </div>
      <div class="stats shadow bg-base-200 border border-base-300">
        <div class="stat">
          <div class="stat-title">Average</div>
          <div class="stat-value text-warning">{averageRating}</div>
        </div>
      </div>
      <div class="stats shadow bg-base-200 border border-base-300">
        <div class="stat">
          <div class="stat-title">With Comments</div>
          <div class="stat-value text-secondary">{withCommentsCount}</div>
        </div>
      </div>
    </div>
  {/if}

  <SearchBar
    showFilter={true}
    bind:searchTerm
    placeholderLabel="Search by cube name"
    filterAction={() => (showFilters = !showFilters)}
  />

  <div class="flex flex-col lg:flex-row gap-8">
    <FilterSidebar {showFilters}>
      <div>
        <label class="form-control w-full">
          <span class="label-text text-sm">Type</span>
          <select bind:value={selectedType} class="select select-bordered w-full">
            <option>All</option>
            {#each allTypes as t}
              <option>{t}</option>
            {/each}
          </select>
        </label>
      </div>
      <div>
        <label class="form-control w-full">
          <span class="label-text text-sm">Rating</span>
          <select bind:value={selectedRating} class="select select-bordered w-full">
            <option>All</option>
            <option value="5">5</option>
            <option value="4+">4+</option>
            <option value="3+">3+</option>
            <option value="<=2">≤2</option>
          </select>
        </label>
      </div>
      <div>
        <label class="cursor-pointer label justify-start gap-3">
          <input type="checkbox" class="checkbox" bind:checked={onlyWithComments} />
          <span class="label-text">Only with comments</span>
        </label>
      </div>
      <div>
        <button
          class="btn btn-outline w-full mt-2"
          type="button"
          onclick={() => {
            selectedType = "All";
            selectedRating = "All";
            onlyWithComments = false;
            searchTerm = "";
          }}
        >
          <i class="fa-solid fa-arrow-rotate-left mr-2"></i>
          Reset Filters
        </button>
      </div>
    </FilterSidebar>

    <div class="flex-1">
      {#if paginatedRatings.length > 0}
        <ul class="flex flex-col gap-4">
          {#each paginatedRatings as user_rating (user_rating.id)}
            <li>
              <UserRatingCard
                {user_rating}
                cube={user_rating.cube_model}
                isAuthor={user_rating.user_id === user?.id}
                showCubeDetails={true}
              />
            </li>
          {/each}
        </ul>

        <div class="mt-8">
          <Pagination bind:currentPage {totalPages} />
        </div>
      {:else}
        <div class="col-span-full flex flex-col items-center justify-center py-20">
          <i class="fa-solid fa-ranking-star fa-3x mb-4"></i>
          <h2 class="text-2xl font-semibold mb-2">This user didn't rate any cube.</h2>
          {#if user?.id === profile.user_id}
            <a href="/explore/cubes" class="btn btn-primary mt-3">
              Browse cubes to rate
              <i class="fa-solid fa-arrow-right"></i>
            </a>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>
