<script lang="ts">
  import StaffCubeCard from "$lib/components/staffCubeCard.svelte";
  import { writable, derived } from "svelte/store";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { blur } from "svelte/transition";
  import type { CubeType } from "$lib/components/cube.svelte";

  let loading = $state(true);

  async function fetchCubes() {
    const { data, error: err } = await supabase
      .from("cube_models")
      .select("*")
      .order("model", { ascending: true })
      .order("series", { ascending: true });

    if (err) {
      console.error("A 500 status code error occured:", err.message);
      return;
    }

    cubes.set(data);
    loading = false;
  }

  // 1) Filter state (year is string 'All' or a year text)
  const cubes = writable<CubeType[]>([]);
  const selectedType = writable<string>("All");
  const selectedBrand = writable<string>("All");
  const WCALegal = writable<boolean | undefined>(undefined);
  const magnetic = writable<boolean | undefined>(undefined);
  const smart = writable<boolean | undefined>(undefined);
  const selectedYear = writable<string>("All");
  const modded = writable<boolean | undefined>(undefined);
  const stickered = writable<boolean | undefined>(undefined);
  const selectedCubeType = writable<string>("All");
  const selectedCubeStatus = writable<string>("All");

  const searchTerm = writable("");
  const currentPage = writable(1);
  const itemsPerPage = writable(12);

  // 2) Options

  let allTypes: string[] = $state([]);
  let allBrands: string[] = $state([]);
  let allYears: number[] = $state([]);
  let allSubType: string[] = $state([]);
  let allCubeTypes: string[] = $state([]);
  let allCubeStatus: string[] = $state([]);

  function fetchAll() {
    const Types = Array.from(
      new Set($cubes.map((c: CubeType) => c.type))
    ).sort();
    const Brands = Array.from(
      new Set($cubes.map((c: CubeType) => c.brand))
    ).sort();
    const Years = Array.from(
      new Set(
        $cubes.map((c: CubeType) => new Date(c.release_date).getFullYear())
      )
    ).sort((a, b) => b - a);
    const SubType = Array.from(
      new Set($cubes.map((c: CubeType) => c.sub_type))
    ).sort();
    const CubeTypes = Array.from(
      new Set($cubes.map((c: CubeType) => c.version_type))
    ).sort();
    const CubeStatus = Array.from(
      new Set($cubes.map((c: CubeType) => c.status))
    ).sort();

    allBrands = Brands;
    allTypes = Types;
    allYears = Years;
    allSubType = SubType;
    allCubeTypes = CubeTypes;
    allCubeStatus = CubeStatus;
  }

  onMount(() => {
    fetchCubes();
  });

  // 3) Reactive filtered list
  const filteredCubes = derived(
    [
      cubes,
      selectedType,
      selectedBrand,
      WCALegal,
      magnetic,
      smart,
      selectedYear,
      modded,
      stickered,
      searchTerm,
      selectedCubeType,
      selectedCubeStatus,
    ],
    ([
      $cubes,
      $type,
      $brand,
      $wca,
      $mag,
      $smart,
      $year,
      $modded,
      $stickered,
      $searchTerm,
      $cubeType,
      $cubeStatus,
    ]) => {
      return $cubes
        .filter((c) => {
          const cubeYear = new Date(c.release_date).getFullYear();
          return (
            ($type === "All" || c.type === $type) &&
            ($brand === "All" || c.brand === $brand) &&
            ($wca === undefined || c.wca_legal === $wca) &&
            ($mag === undefined || c.magnetic === $mag) &&
            ($modded === undefined || c.modded === $modded) &&
            ($stickered === undefined || c.stickered === $stickered) &&
            ($smart === undefined || c.smart === $smart) &&
            ($year === "All" || cubeYear === +$year) &&
            ($cubeType === "All" || c.version_type === $cubeType) &&
            ($cubeStatus === "All" || c.status === $cubeStatus)
          );
        })
        .filter((c) => {
          const name =
            `${c.series ?? ""} ${c.model ?? ""} ${c.version_type ?? ""}`.toLowerCase();
          return name.includes($searchTerm.toLowerCase());
        });
    }
  );

  const paginatedCubes = derived(
    [filteredCubes, currentPage, itemsPerPage],
    ([$filteredCubes, $currentPage, $itemsPerPage]) => {
      const start = ($currentPage - 1) * $itemsPerPage;
      const end = start + $itemsPerPage;
      return $filteredCubes.slice(start, end);
    }
  );

  const totalPages = derived(
    [filteredCubes, itemsPerPage],
    ([$filteredCubes, $itemsPerPage]) =>
      Math.ceil($filteredCubes.length / $itemsPerPage)
  );

  function resetFilters() {
    selectedType.set("All");
    selectedBrand.set("All");
    WCALegal.set(undefined);
    magnetic.set(undefined);
    smart.set(undefined);
    selectedYear.set("All");
    modded.set(undefined);
    stickered.set(undefined);
    selectedCubeType.set("All");
  }

  function goToPreviousPage() {
    if ($currentPage > 1) {
      currentPage.update((n) => n - 1);
    }
  }

  function goToNextPage() {
    if ($currentPage < $totalPages) {
      currentPage.update((n) => n + 1);
    }
  }

  $effect(() => {
    const _ = $filteredCubes;
    currentPage.set(1);
  });

  $effect(() => {
    const _ = loading;
    fetchAll();
  });

  let showFilters = $state(false);
</script>

<section class="min-h-screenpx-6 py-16">
  <div class="max-w-7xl mx-auto">
    <h1 class="text-4xl font-clash font-bold mb-6 text-center">Manage Cubes</h1>
    <p class="mb-12 text-center">
      Browse all your favorite cubes by type, brand, or rating.
    </p>

    <!-- Search Bar + Toggle -->
    <div class="flex items-center mb-6">
      <button
        class="flex-shrink-0 h-12.5 px-4 rounded-l-xl cursor-pointer bg-base-200 border border-base-300 border-r-0 transition flex items-center"
        aria-label="Toggle Filters"
        onclick={() => (showFilters = !showFilters)}
        type="button"
        style="border-top-right-radius:0; border-bottom-right-radius:0;"
      >
        <i class="fa-solid fa-sliders"></i>
      </button>
      <div class="relative flex-1">
        <input
          type="text"
          placeholder="Search Your Cube"
          bind:value={$searchTerm}
          class="input w-full h-12.5 rounded-l-none border-base-300"
        />
        {#if $searchTerm.length}
          <button
            type="button"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-neutral cursor-pointer"
            onclick={() => ($searchTerm = "")}
            aria-label="Clear"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        {/if}
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Filters Sidebar -->
      {#if showFilters}
        <aside class="w-full lg:w-64">
          <div
            class="bg-base-200 border border-base-300 rounded-2xl p-6 sticky top-0 max-h-full overflow-x-scroll"
            transition:blur
          >
            <div class="flex items-center justify-between mb-4">
              <span class="font-semibold text-lg">Filters</span>
            </div>
            <div class="flex flex-col gap-4">
              <!-- Type -->
              <div>
                <label class="block text-sm mb-1"
                  >Type:
                  <select
                    bind:value={$selectedType}
                    class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border"
                  >
                    <option>All</option>
                    {#each allTypes as t}
                      <option>{t}</option>
                    {/each}
                  </select>
                </label>
              </div>
              <!-- Brand -->
              <div>
                <label class="block text-sm mb-1"
                  >Brand:
                  <select
                    bind:value={$selectedBrand}
                    class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border"
                  >
                    <option>All</option>
                    {#each allBrands as b}
                      <option>{b}</option>
                    {/each}
                  </select></label
                >
              </div>
              <!-- WCA Legal -->
              <div>
                <label class="block text-sm mb-1"
                  >WCA Legal:
                  <select
                    bind:value={$WCALegal}
                    class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border"
                  >
                    <option value={undefined}>All</option>
                    <option value={true}>True</option>
                    <option value={false}>False</option>
                  </select>
                </label>
              </div>
              <!-- Magnetic -->
              <div>
                <label class="block text-sm mb-1"
                  >Magnetic:
                  <select
                    bind:value={$magnetic}
                    class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border"
                  >
                    <option value={undefined}>All</option>
                    <option value={true}>True</option>
                    <option value={false}>False</option>
                  </select>
                </label>
              </div>
              <!-- Smart -->
              <div>
                <label class="block text-sm mb-1"
                  >Smart:
                  <select
                    bind:value={$smart}
                    class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border"
                  >
                    <option value={undefined}>All</option>
                    <option value={true}>True</option>
                    <option value={false}>False</option>
                  </select>
                </label>
              </div>
              <!-- Modded -->
              <div>
                <label class="block text-sm mb-1"
                  >Modded:
                  <select
                    bind:value={$modded}
                    class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border"
                  >
                    <option value={undefined}>All</option>
                    <option value={true}>True</option>
                    <option value={false}>False</option>
                  </select>
                </label>
              </div>
              <!-- Release Year -->
              <div>
                <label class="block text-sm mb-1"
                  >Release Year:
                  <select
                    bind:value={$selectedYear}
                    class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border"
                  >
                    <option>All</option>
                    {#each allYears as year}
                      <option value={year}>{year}</option>
                    {/each}
                  </select>
                </label>
              </div>
              <!-- Cube Type -->
              <div>
                <label class="block text-sm mb-1"
                  >Cube Type:
                  <select
                    bind:value={$selectedCubeType}
                    class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border"
                  >
                    <option>All</option>
                    {#each allCubeTypes as cubeType}
                      <option value={cubeType}>{cubeType}</option>
                    {/each}
                  </select>
                </label>
              </div>
              <!-- Cube Status -->
              <div>
                <label class="block text-sm mb-1"
                  >Cube Status:
                  <select
                    bind:value={$selectedCubeStatus}
                    class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border"
                  >
                    <option>All</option>
                    {#each allCubeStatus as cubeStatus}
                      <option value={cubeStatus}>{cubeStatus}</option>
                    {/each}
                  </select>
                </label>
              </div>
              <!-- Reset -->
              <div>
                <button
                  class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border cursor-pointer hover:bg-neutral hover:text-neutral-content"
                  onclick={resetFilters}
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

      <!-- Cube Cards Grid -->
      <div class="flex-1">
        <div
          class="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4"
        >
          <div class="flex items-center">
            <label class="text-sm mr-2" for="itemsPerPage"
              >Cubes per page:</label
            >
            <select
              id="itemsPerPage"
              bind:value={$itemsPerPage}
              class="px-7 py-2 rounded-lg bg-base-200 border border-base-300"
              style="width:auto"
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
              <option value={96}>96</option>
            </select>
          </div>

          <div>
            <a href="cubes/add" class="btn bg-primary text-primary-content">
              <i class="fa-solid fa-plus mr-2"></i>
              Add Cube
            </a>
          </div>
        </div>

        <div class="flex items-center justify-center gap-4 mb-10">
          <div class="join">
            <button
              class="join-item btn btn-lg"
              onclick={goToPreviousPage}
              disabled={$currentPage === 1}
              aria-label="Previous page"
            >
              <i class="fa-solid fa-chevron-left mr-2"></i>
              Previous
            </button>
            <button class="join-item btn btn-lg">
              Page {$currentPage} of {$totalPages}
            </button>
            <button
              onclick={goToNextPage}
              class="join-item btn btn-lg"
              disabled={$currentPage === $totalPages}
              aria-label="Next page"
            >
              Next
              <i class="fa-solid fa-chevron-right ml-2"></i>
            </button>
          </div>
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
        {:else}
          <div
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            transition:blur
          >
            {#if $paginatedCubes.length > 0}
              {#each $paginatedCubes as cube}
                <StaffCubeCard {cube} />
              {/each}
            {:else}
              <div
                class="col-span-full flex flex-col items-center justify-center py-20"
              >
                <i class="fa-solid fa-cube fa-3x mb-4"></i>
                <h2 class="text-2xl font-semibold mb-2">No cubes found</h2>
                <p class="mb-6 text-center max-w-xs">
                  We couldn't find any cubes matching your search or filters.
                  Try adjusting them or resetting to see everything.
                </p>
                <button
                  onclick={() => {
                    resetFilters();
                    $searchTerm = "";
                  }}
                  class="btn btn-outline flex items-center"
                  aria-label="Reset filters"
                >
                  <i class="fa-solid fa-arrow-rotate-left mr-2"></i>
                  Reset
                </button>
              </div>
            {/if}
          </div>
        {/if}

        <div class="flex items-center justify-center gap-4 mt-10">
          <div class="join">
            <button
              class="join-item btn btn-lg"
              onclick={goToPreviousPage}
              disabled={$currentPage === 1}
              aria-label="Previous page"
            >
              <i class="fa-solid fa-chevron-left mr-2"></i>
              Previous
            </button>
            <button class="join-item btn btn-lg">
              Page {$currentPage} of {$totalPages}
            </button>
            <button
              onclick={goToNextPage}
              class="join-item btn btn-lg"
              disabled={$currentPage === $totalPages}
              aria-label="Next page"
            >
              Next
              <i class="fa-solid fa-chevron-right ml-2"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
