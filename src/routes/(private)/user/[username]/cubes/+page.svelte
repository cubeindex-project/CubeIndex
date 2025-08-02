<script lang="ts">
  import type { PageData } from "./$types";
  import UserCubeCard from "$lib/components/cube/userCubeCard.svelte";
  import EditUserCubeCard from "$lib/components/cube/editUserCubeCard.svelte";
  import { supabase } from "$lib/supabaseClient";
  import { onMount } from "svelte";
  import type { Cube } from "$lib/components/types/cube";
  import Pagination from "$lib/components/misc/pagination.svelte";
  import SearchBar from "$lib/components/misc/searchBar.svelte";

  let { data }: { data: PageData } = $props();
  const { profile, user } = data;

  let user_cubes: any[] = $state([]);
  let cubes: Cube[] = $state([]);
  let user_cube_ratings: any[] = $state([]);

  let userCubesFromAll: Cube[] = $state([]);

  let loading = $state(true);

  // Filtering and pagination
  let searchTerm: string = $state("");
  let selectedType: string = $state("All");
  let selectedStatus: string = $state("All");
  let currentPage: number = $state(1);
  let itemsPerPage: number = $state(9);
  let allTypes: string[] = $state([]);
  let allStatuses: string[] = $state([]);
  let showFilters = $state(false);

  async function fetchUserCubes() {
    const { data, error } = await supabase
      .from("user_cubes")
      .select("*")
      .eq("user_id", profile.user_id);

    if (error) {
      throw new Error(`500, Failed to fetch the user cubes: ${error.message}`);
    }

    user_cubes = data;
    loading = false;
  }

  async function fetchCubes() {
    const { data, error } = await supabase
      .from("cube_models")
      .select("*")
      .eq("status", "Approved")
      .order("model", { ascending: true })
      .order("series", { ascending: true });

    if (error) {
      throw new Error("500, Failed to fetch cubes" + error.message);
      return;
    }

    cubes = data;
  }

  async function fetchUserRatings() {
    const { data, error: urErr } = await supabase
      .from("user_cube_ratings")
      .select("*")
      .eq("user_id", profile.user_id);

    if (urErr) {
      throw new Error(`Failed to fetch user ratings: ${urErr.message}`);
    }

    user_cube_ratings = data;
  }

  onMount(() => {
    fetchUserCubes();
    fetchCubes();
    fetchUserRatings();
  });

  let edit = $state(false);

  $effect(() => {
    if (loading || !user_cubes.length) return;

    const userCubeName = new Set(user_cubes.map((uc) => uc.cube));

    userCubesFromAll = cubes.filter((cube) => userCubeName.has(cube.slug));
  });

  // Compute filter options when cube data changes
  $effect(() => {
    const _ = userCubesFromAll;
    allTypes = Array.from(new Set(userCubesFromAll.map((c) => c.type))).sort();
    allStatuses = Array.from(new Set(user_cubes.map((uc) => uc.status))).sort();
  });

  const filteredCubes = $derived.by(() => {
    return userCubesFromAll.filter((cube) => {
      const details = user_cubes.find((uc) => uc.cube === cube.slug);
      const status = details ? details.status : "";
      const name = `${cube.series ?? ""} ${cube.model ?? ""} ${cube.version_name ?? ""}`.toLowerCase();
      return (
        name.includes(searchTerm.toLowerCase()) &&
        (selectedType === "All" || cube.type === selectedType) &&
        (selectedStatus === "All" || status === selectedStatus)
      );
    });
  });

  const paginatedCubes = $derived.by(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredCubes.slice(start, end);
  });

  const totalPages = $derived(Math.ceil(filteredCubes.length / itemsPerPage));

  $effect(() => {
    const _ = filteredCubes;
    currentPage = 1;
  });
</script>

<div class="relative max-w-6xl mx-auto mt-12 px-4">
  <div class="flex justify-between">
    <h3 class="text-2xl font-bold mb-4">Cube Collection</h3>
    {#if user?.id === profile.user_id && userCubesFromAll.length > 0}
      <button
        class="btn {edit
          ? 'btn-error text-error-content'
          : 'btn-info text-info-content'}"
        onclick={() => {
          edit = !edit;
        }}
      >
        {#if edit}
          <i class="fa-solid fa-xmark"></i>
          Cancel
        {:else}
          <i class="fa-solid fa-pencil"></i>
          Edit
        {/if}
      </button>
    {/if}
  </div>

  <SearchBar
    showFilter={true}
    bind:searchTerm
    placeholderLabel="Search cubes"
    filterAction={() => (showFilters = !showFilters)}
  />

  <div class="flex flex-col lg:flex-row gap-8">
    {#if showFilters}
      <aside class="w-full lg:w-70">
        <div class="bg-base-200 border border-base-300 rounded-2xl p-6 sticky top-7">
          <div class="flex items-center justify-between mb-4">
            <span class="font-semibold text-lg">Filters</span>
          </div>
          <div class="flex flex-col gap-4">
            <div>
              <label class="block text-sm mb-1"
                >Type:
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
              <label class="block text-sm mb-1"
                >Status:
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
                  selectedType = 'All';
                  selectedStatus = 'All';
                }}
                type="button"
              >
                <i class="fa-solid fa-arrow-rotate-left mr-2"></i>
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </aside>
    {/if}

    <div class="flex-1">
      <div class="flex flex-row items-start sm:items-center justify-between mb-4 gap-4">
        <div class="flex items-center">
          <label class="text-sm mr-2" for="itemsPerPage">Cubes per page:</label>
          <select
            id="itemsPerPage"
            bind:value={itemsPerPage}
            class="px-7 py-2 rounded-lg bg-base-200 border border-base-300"
            style="width:auto"
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
      {:else if user_cubes && user_cubes.length > 0 && user_cube_ratings && user_cube_ratings.length > 0}
        <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {#each paginatedCubes as cube}
            {#if edit}
              <EditUserCubeCard {cube} user_details={user_cubes} image={true} />
            {:else}
              <UserCubeCard
                {cube}
                user_details={user_cubes}
                user_rating={user_cube_ratings.find(
                  (ucr) => ucr.cube_slug === cube.slug
                )?.rating ?? 0}
              />
            {/if}
          {/each}
        </ul>
      {:else}
        <div class="col-span-full flex flex-col items-center justify-center py-20">
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
</div>
