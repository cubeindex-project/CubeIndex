<script lang="ts">
  import FilterSidebar from "$lib/components/misc/filterSidebar.svelte";
  import type { PageData } from "./$types";
  import UserCubeCard from "$lib/components/cube/userCubeCard.svelte";
  import Pagination from "$lib/components/misc/pagination.svelte";
  import SortSelector from "$lib/components/misc/sortSelector.svelte";
  import SearchBar from "$lib/components/misc/searchBar.svelte";
  import type { Cube, UserCubes, Vendors } from "$lib/components/dbTableTypes";

  let { data }: { data: PageData } = $props();
  const { profile, user } = data;

  export interface CubeAndDetails extends UserCubes {
    cube_model: Cube;
    vendor: Vendors;
  }

  const user_cubes: CubeAndDetails[] = $derived(data.user_cubes ?? []);
  const user_cube_ratings: any[] = $derived(data.user_cube_ratings ?? []);

  const total = $derived(user_cubes.length);

  // Filtering and pagination
  let searchTerm: string = $state("");
  let selectedType: string = $state("All");
  let selectedStatus: string = $state("All");
  let selectedCondition: string = $state("All");
  let currentPage: number = $state(1);
  let itemsPerPage: number = $state(9);
  let allTypes: string[] = $state([]);
  let allStatuses: string[] = $state([]);
  let allConditions: string[] = $state([]);
  let showFilters = $state(false);

  let edit = $state(false);

  // Sorting
  type SortKey = "recent" | "name" | "rating" | "type";
  let sortBy: SortKey = $state("recent");
  let sortDir: "asc" | "desc" = $state("desc");

  const sortFields = [
    { value: "recent", label: "Recent" },
    { value: "name", label: "Name" },
    { value: "rating", label: "Rating" },
    { value: "type", label: "Type" },
  ];

  $effect(() => {
    const _ = user_cubes;
    allTypes = Array.from(
      new Set(user_cubes.map((c) => c.cube_model.type).filter(Boolean))
    ).sort();
    allConditions = Array.from(
      new Set(user_cubes.map((uc) => uc.condition).filter(Boolean))
    ).sort();
    allStatuses = Array.from(
      new Set(user_cubes.map((uc) => uc.status).filter(Boolean))
    ).sort();
  });

  const filteredCubes = $derived.by(() => {
    const term = searchTerm.trim().toLowerCase();
    return user_cubes.filter((uc) => {
      const c = uc.cube_model ?? {};
      const name =
        `${c.series ?? ""} ${c.model ?? ""} ${c.version_name ?? ""}`.toLowerCase();
      const typeOk = selectedType === "All" || c.type === selectedType;
      const conditionOk =
        selectedCondition === "All" || uc.condition === selectedCondition;
      const statusOk = selectedStatus === "All" || uc.status === selectedStatus;
      return name.includes(term) && typeOk && statusOk && conditionOk;
    });
  });

  const sortedCubes = $derived.by(() => {
    const arr = [...filteredCubes];
    const cmp = (a: CubeAndDetails, b: CubeAndDetails) => {
      if (sortBy === "recent") {
        const ad = a.acquired_at ? new Date(a.acquired_at).getTime() : 0;
        const bd = b.acquired_at ? new Date(b.acquired_at).getTime() : 0;
        return bd - ad; // default desc
      }
      if (sortBy === "name") {
        const an =
          `${a.cube_model?.series ?? ""} ${a.cube_model?.model ?? ""} ${a.cube_model?.version_name ?? ""}`.trim();
        const bn =
          `${b.cube_model?.series ?? ""} ${b.cube_model?.model ?? ""} ${b.cube_model?.version_name ?? ""}`.trim();
        return an.localeCompare(bn);
      }
      if (sortBy === "type") {
        return (a.cube_model?.type ?? "").localeCompare(
          b.cube_model?.type ?? ""
        );
      }
      if (sortBy === "rating") {
        const ar =
          user_cube_ratings.find((r) => r.cube_slug === a.cube_model?.slug)
            ?.rating ?? 0;
        const br =
          user_cube_ratings.find((r) => r.cube_slug === b.cube_model?.slug)
            ?.rating ?? 0;
        return br - ar; // default desc
      }
      return 0;
    };
    arr.sort(cmp);
    if (sortDir === "asc") arr.reverse();
    return arr;
  });

  const totalPages = $derived.by(() => {
    const per = +itemsPerPage || 9;
    return Math.max(1, Math.ceil(filteredCubes.length / per));
  });

  const paginatedCubes = $derived.by(() => {
    const per = +itemsPerPage || 9;
    const pages = Math.max(1, Math.ceil(sortedCubes.length / per));
    const page = Math.min(Math.max(1, currentPage), pages);
    const start = (page - 1) * per;
    const end = start + per;
    return sortedCubes.slice(start, end);
  });

  function resetFilters() {
    selectedType = "All";
    selectedStatus = "All";
    selectedCondition = "All";
  }

  $effect(() => {
    const _ = filteredCubes;
    currentPage = 1;
  });
</script>

<section class="relative max-w-6xl mx-auto mt-12 px-4">
  <header class="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 class="text-2xl font-extrabold tracking-tight">
        {profile.display_name}'s Cube Collection
      </h1>
      <p class="text-sm text-base-content/70">{total} cubes</p>
    </div>

    {#if user?.id === profile.user_id && user_cubes.length > 0}
      <div class="flex items-center gap-2">
        <!-- Sort controls -->
        <SortSelector
          bind:sortField={sortBy}
          bind:sortOrder={sortDir}
          fields={sortFields}
        />

        <div class="divider divider-horizontal m-0"></div>

        <button
          class="btn btn-outline {edit ? 'btn-error' : ''} btn-sm"
          onclick={() => {
            edit = !edit;
          }}
          type="button"
        >
          {#if edit}
            <i class="fa-solid fa-xmark"></i>
            Cancel
          {:else}
            <i class="fa-solid fa-pencil"></i>
            Edit
          {/if}
        </button>
      </div>
    {/if}
  </header>

  <SearchBar
    showFilter={true}
    bind:searchTerm
    placeholderLabel="Search cubes"
    filterAction={() => (showFilters = !showFilters)}
  />

  <div class="flex flex-col lg:flex-row gap-8">
    <FilterSidebar {showFilters}>
      <div>
        <label class="form-control w-full">
          <span class="label-text text-sm">Type</span>
          <select
            bind:value={selectedType}
            class="select select-bordered w-full"
          >
            <option>All</option>
            {#each allTypes as t}
              <option>{t}</option>
            {/each}
          </select>
        </label>
      </div>
      <div>
        <label class="form-control w-full">
          <span class="label-text text-sm">Condition</span>
          <select
            bind:value={selectedCondition}
            class="select select-bordered w-full"
          >
            <option>All</option>
            {#each allConditions as c}
              <option>{c}</option>
            {/each}
          </select>
        </label>
      </div>
      <div>
        <label class="form-control w-full">
          <span class="label-text text-sm">Status</span>
          <select
            bind:value={selectedStatus}
            class="select select-bordered w-full"
          >
            <option>All</option>
            {#each allStatuses as s}
              <option>{s}</option>
            {/each}
          </select>
        </label>
      </div>
      <div>
        <button
          class="btn btn-outline w-full mt-2"
          onclick={resetFilters}
          type="button"
        >
          <i class="fa-solid fa-arrow-rotate-left mr-2"></i>
          Reset Filters
        </button>
      </div>
    </FilterSidebar>

    <div class="flex-1">
      <div
        class="flex flex-row items-start sm:items-center justify-between mb-4 gap-4"
      >
        <div class="flex items-center gap-2">
          <label class="text-sm" for="itemsPerPage">Per page</label>
          <select
            id="itemsPerPage"
            bind:value={itemsPerPage}
            class="select select-bordered"
            style="width:auto"
            onchange={() => (itemsPerPage = +itemsPerPage)}
          >
            <option value={6}>6</option>
            <option value={9}>9</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
            <option value={96}>96</option>
          </select>
        </div>
      </div>

      <div class="mb-10">
        <Pagination bind:currentPage {totalPages} />
      </div>

      {#if user_cubes && user_cubes.length > 0}
        <ul class="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
          {#each paginatedCubes as row (row.cube_model?.slug)}
            <UserCubeCard
              mode={edit ? "edit" : "view"}
              cube={row.cube_model}
              user_details={row}
              user_rating={user_cube_ratings.find(
                (ucr) => ucr.cube_slug === row.cube_model?.slug
              )?.rating ?? 0}
            />
          {:else}
            <!-- No results state -->
            <div
              class="col-span-full flex flex-col items-center justify-center py-20"
            >
              <i class="fa-solid fa-cube fa-3x mb-4"></i>
              <h2 class="text-2xl font-semibold mb-2">No cubes found</h2>
              <p class="mb-6 text-center max-w-xs">
                We couldn't find any cubes matching your search or filters. Try
                adjusting them or resetting to see everything.
              </p>
              <button
                onclick={() => {
                  resetFilters;
                  searchTerm = "";
                }}
                class="btn btn-outline flex items-center"
                aria-label="Reset filters"
              >
                <i class="fa-solid fa-arrow-rotate-left mr-2"></i>
                Reset
              </button>
            </div>
          {/each}
        </ul>
      {:else}
        <div
          class="col-span-full flex flex-col items-center justify-center py-20"
        >
          <i class="fa-solid fa-cube fa-3x mb-4"></i>
          <h2 class="text-2xl font-semibold mb-2">
            This user doesn't have any cube in their collection.
          </h2>
          {#if user?.id === profile.user_id}
            <a href="/explore/cubes" class="btn btn-primary mt-3">
              Browse cubes
              <i class="fa-solid fa-arrow-right"></i>
            </a>
          {/if}
        </div>
      {/if}

      <div class="mt-10">
        <Pagination bind:currentPage {totalPages} />
      </div>
    </div>
  </div>
</section>
