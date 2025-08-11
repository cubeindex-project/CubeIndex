<script lang="ts">
  import FilterSidebar from "$lib/components/misc/filterSidebar.svelte";
  import type { PageData } from "./$types";
  import UserCubeCard from "$lib/components/cube/userCubeCard.svelte";
  import { supabase } from "$lib/supabaseClient";
  import { onMount } from "svelte";
  import Pagination from "$lib/components/misc/pagination.svelte";
  import SearchBar from "$lib/components/misc/searchBar.svelte";
  import type { Cube, UserCubes } from "$lib/components/dbTableTypes";

  let { data }: { data: PageData } = $props();
  const { profile, user } = data;

  export interface CubeAndDetails extends UserCubes {
    cube_model: Cube;
  }

  let user_cubes: CubeAndDetails[] = $state([]);
  let user_cube_ratings: any[] = $state([]);

  let loading = $state(true);

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

  async function fetchUserCubes() {
    const { data, error } = await supabase
      .from("user_cubes")
      .select("*, cube_model:cube(*)")
      .eq("user_id", profile.user_id);

    if (error) {
      throw new Error(`500, Failed to fetch the user cubes: ${error.message}`);
    }

    user_cubes = data;
  }

  async function fetchUserRatings() {
    const { data, error: urErr } = await supabase
      .from("user_cube_ratings")
      .select("*")
      .eq("user_id", profile.user_id);

    if (urErr) {
      throw new Error(`Failed to fetch user ratings: ${urErr.message}`);
    }
    user_cube_ratings = data ?? [];
  }

  onMount(async () => {
    try {
      await Promise.all([fetchUserCubes(), fetchUserRatings()]);
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  });

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

  const totalPages = $derived.by(() => {
    const per = +itemsPerPage || 9;
    return Math.max(1, Math.ceil(filteredCubes.length / per));
  });

  const paginatedCubes = $derived.by(() => {
    const per = +itemsPerPage || 9;
    const pages = Math.max(1, Math.ceil(filteredCubes.length / per));
    const page = Math.min(Math.max(1, currentPage), pages);
    const start = (page - 1) * per;
    const end = start + per;
    return filteredCubes.slice(start, end);
  });

  $effect(() => {
    const _ = filteredCubes;
    currentPage = 1;
  });
</script>

<section class="relative max-w-6xl mx-auto mt-12 px-4">
  <div class="flex justify-between">
    <h3 class="text-2xl font-bold mb-4">Cube Collection</h3>
    {#if user?.id === profile.user_id && user_cubes.length > 0}
      <a href="/user/{profile.username}/cubes/manage" class="btn btn-info text-info-content">
        <i class="fa-solid fa-gear"></i>
        Manage
      </a>
    {/if}
  </div>

  <SearchBar
    showFilter={true}
    bind:searchTerm
    placeholderLabel="Search cubes"
    filterAction={() => (showFilters = !showFilters)}
  />

  <div class="flex flex-col lg:flex-row gap-8">
    <FilterSidebar {showFilters}>
      <div>
        <label class="block text-sm mb-1">
          Type:
          <select
            bind:value={selectedType}
            class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border"
          >
            <option>All</option>
            {#each allTypes as t}
              <option>{t}</option>
            {/each}
          </select>
        </label>
      </div>
      <div>
        <label class="block text-sm mb-1">
          Condition:
          <select
            bind:value={selectedCondition}
            class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border"
          >
            <option>All</option>
            {#each allConditions as c}
              <option>{c}</option>
            {/each}
          </select>
        </label>
      </div>
      <div>
        <label class="block text-sm mb-1">
          Status:
          <select
            bind:value={selectedStatus}
            class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border"
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
          class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border cursor-pointer hover:bg-neutral hover:text-neutral-content"
          onclick={() => {
            selectedType = "All";
            selectedStatus = "All";
          }}
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
        <div class="flex items-center">
          <label class="text-sm mr-2" for="itemsPerPage">Cubes per page:</label>
          <select
            id="itemsPerPage"
            bind:value={itemsPerPage}
            class="px-7 py-2 rounded-lg bg-base-200 border border-base-300"
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

      {#if loading}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {#each Array(6) as i}
            <div class="bg-neutral rounded-2xl overflow-hidden animate-pulse">
              <div class="h-48 bg-neutral-content"></div>
              <div class="p-5 space-y-4">
                <div class="h-6 bg-neutral-content rounded w-3/4"></div>
                <div class="h-4 bg-neutral-content rounded w-1/2"></div>
                <div class="h-4 bg-neutral-content rounded w-1/4"></div>
              </div>
            </div>
          {/each}
        </div>
      {:else if user_cubes && user_cubes.length > 0}
        <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {#each paginatedCubes as row}
            <UserCubeCard
              mode="view"
              cube={row.cube_model}
              user_details={row}
              user_rating={
                user_cube_ratings.find(
                  (ucr) => ucr.cube_slug === row.cube_model?.slug
                )?.rating ?? 0
              }
            />
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
        </div>
      {/if}

      <div class="mt-10">
        <Pagination bind:currentPage {totalPages} />
      </div>
    </div>
  </div>
</section>
