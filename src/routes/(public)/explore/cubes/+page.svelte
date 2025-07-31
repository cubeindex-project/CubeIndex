<script lang="ts">
  import FeatureDisabled from "$lib/components/misc/featureDisabled.svelte";
  import CubeCard from "$lib/components/cube/cubeCard.svelte";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { blur } from "svelte/transition";
  import type { Cube } from "$lib/components/types/cube";
  import Pagination from "$lib/components/misc/pagination.svelte";
  import TriStateCheckbox from "$lib/components/misc/triStateCheckbox.svelte";
  import SearchBar from "$lib/components/misc/searchBar.svelte";
  import { page } from "$app/state";
  import { SsgoiTransition } from "@ssgoi/svelte";

  type CubeWithMeta = Cube & {
    _year: number;
    _name: string;
    _wcaLegal: boolean;
    _magnetic: boolean;
    _modded: boolean;
    _stickered: boolean;
    _smart: boolean;
  };

  const { data } = $props();
  const { databaseAvailability, cubesAvailability } = data;

  let loading = $state(true);

  async function fetch() {
    loading = true;
    const BATCH = 2000;
    let start = 0;
    const featureMap = new Map<string, Set<string>>();

    const { data: features, error: featErr } = await supabase
      .from("cubes_model_features")
      .select("*");

    if (featErr) {
      console.error("A 500 status code error occured:", featErr.message);
      return;
    }

    for (const { cube, feature } of features) {
      if (!featureMap.has(cube)) {
        featureMap.set(cube, new Set());
      }
      featureMap.get(cube)!.add(feature);
    }
    while (true) {
      const { data, error } = await supabase
        .from("cube_models")
        .select("*")
        .eq("status", "Approved")
        .range(start, start + BATCH - 1);

      if (error) throw error;
      loading = false;
      if (data.length === 0) {
        break;
      }

      const cubesWithMeta = data.map((c) => {
        const feats = featureMap.get(c.slug) ?? new Set<string>();
        return {
          ...c,
          _year: new Date(c.release_date ?? "").getFullYear(),
          _name:
            `${c.series ?? ""} ${c.model ?? ""} ${c.version_type ?? ""}`.toLowerCase(),
          _wcaLegal: feats.has("wca_legal"),
          _magnetic: feats.has("magnetic"),
          _modded: feats.has("modded"),
          _stickered: feats.has("stickered"),
          _smart: feats.has("smart"),
        };
      });

      cubes = cubes.concat(cubesWithMeta);
      start += BATCH;
    }
  }

  // 1) Filter state (year is string 'All' or a year text)
  let cubes: CubeWithMeta[] = $state([]);
  let selectedType: string = $state("All");
  let selectedSubType: string = $state("All");
  let selectedBrand: string = $state("All");
  let WCALegal: boolean | undefined = $state(undefined);
  let magnetic: boolean | undefined = $state(undefined);
  let smart: boolean | undefined = $state(undefined);
  let selectedYear: string = $state("All");
  let modded: boolean | undefined = $state(undefined);
  let stickered: boolean | undefined = $state(undefined);
  let base: boolean | undefined = $state(undefined);
  let trim: boolean | undefined = $state(undefined);
  let limited: boolean | undefined = $state(undefined);

  let searchTerm: string = $state("");
  let currentPage: number = $state(1);
  let itemsPerPage: number = $state(12);

  // 2) Options

  let allTypes: string[] = $state([]);
  let allBrands: string[] = $state([]);
  let allYears: number[] = $state([]);
  let allSubTypes: string[] = $state([]);
  let allCubeTypes: string[] = $state([]);

  function calcAll() {
    const Types = Array.from(new Set(cubes.map((c: Cube) => c.type))).sort();
    const Brands = Array.from(new Set(cubes.map((c: Cube) => c.brand))).sort();
    const Years = Array.from(
      new Set(cubes.map((c: Cube) => new Date(c.release_date!).getFullYear()))
    ).sort((a, b) => b - a);
    const SubType = Array.from(
      new Set(cubes.map((c: Cube) => c.sub_type ?? ""))
    ).sort();
    const CubeTypes = Array.from(
      new Set(cubes.map((c: Cube) => c.version_type))
    ).sort();

    allBrands = Brands;
    allTypes = Types;
    allYears = Years;
    allSubTypes = SubType;
    allCubeTypes = CubeTypes;
  }

  onMount(() => {
    fetch();
  });

  // 3) Reactive filtered list
  const filteredCubes = $derived.by(() => {
    return cubes.filter(
      (c) =>
        // Type
        (selectedType === "All" || c.type === selectedType) &&
        // Sub Type
        (selectedSubType === "All" || c.sub_type === selectedSubType) &&
        // Brand
        (selectedBrand === "All" || c.brand === selectedBrand) &&
        // Release Year
        (selectedYear === "All" || c._year === +selectedYear) &&
        // Cube Type
        (base === undefined // show everything ➜ always true
          ? true
          : base === true // ✓ “Only Base”
            ? c.version_type === "Base"
            : c.version_type !== "Base") &&
        (trim === undefined // show everything ➜ always true
          ? true
          : trim === true // ✓ “Only Base”
            ? c.version_type === "Trim"
            : c.version_type !== "Trim") &&
        (limited === undefined // show everything ➜ always true
          ? true
          : limited === true // ✓ “Only Base”
            ? c.version_type === "Limited"
            : c.version_type !== "Limited") &&
        // Features
        (WCALegal === undefined || c._wcaLegal === WCALegal) &&
        (magnetic === undefined || c._magnetic === magnetic) &&
        (modded === undefined || c._modded === modded) &&
        (stickered === undefined || c._stickered === stickered) &&
        (smart === undefined || c._smart === smart) &&
        // Search
        c._name.includes(searchTerm.toLowerCase())
    );
  });

  const paginatedCubes = $derived.by(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredCubes.slice(start, end);
  });

  const totalPages = $derived(Math.ceil(filteredCubes.length / itemsPerPage));

  function resetFilters() {
    selectedType = "All";
    selectedBrand = "All";
    WCALegal = undefined;
    magnetic = undefined;
    smart = undefined;
    selectedYear = "All";
    modded = undefined;
    stickered = undefined;
    base = undefined;
    trim = undefined;
    limited = undefined;
  }

  $effect(() => {
    const _ = filteredCubes;
    currentPage = 1;
  });

  $effect(() => {
    const _ = loading;
    calcAll();
  });

  let showFilters = $state(false);
</script>

<SsgoiTransition id={page.url.pathname}>
    {#if databaseAvailability && cubesAvailability}
      <section class="min-h-screen px-6 py-16">
        <div class="max-w-7xl mx-auto">
          <h1 class="text-4xl font-clash font-bold mb-6 text-center">
            Explore Cubes
          </h1>
          <p class="mb-12 text-center">
            Browse all your favorite cubes by type, brand, or rating.
          </p>

          <!-- Search Bar + Toggle -->
          <SearchBar
            showFilter={true}
            bind:searchTerm
            filterAction={() => (showFilters = !showFilters)}
          />

          <div class="flex flex-col lg:flex-row gap-8">
            <!-- Filters Sidebar -->
            {#if showFilters}
              <aside class="w-full lg:w-70">
                <div
                  class="bg-base-200 border border-base-300 rounded-2xl p-6 sticky top-7"
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
                        >Sub Type:
                        <select
                          bind:value={selectedSubType}
                          class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border"
                        >
                          <option>All</option>
                          {#each allSubTypes as st}
                            <option>{st}</option>
                          {/each}
                        </select>
                      </label>
                    </div>
                    <!-- Brand -->
                    <div>
                      <label class="block text-sm mb-1"
                        >Brand:
                        <select
                          bind:value={selectedBrand}
                          class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border"
                        >
                          <option>All</option>
                          {#each allBrands as b}
                            <option>{b}</option>
                          {/each}
                        </select></label
                      >
                    </div>
                    <!-- Release Year -->
                    <div>
                      <label class="block text-sm mb-1"
                        >Release Year:
                        <select
                          bind:value={selectedYear}
                          class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border"
                        >
                          <option>All</option>
                          {#each allYears as year}
                            <option value={year}>{year}</option>
                          {/each}
                        </select>
                      </label>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <!-- WCA Legal -->
                      <TriStateCheckbox
                        bind:value={WCALegal}
                        label="WCA Legal"
                      />
                      <!-- Magnetic -->
                      <TriStateCheckbox
                        bind:value={magnetic}
                        label="Magnetic"
                      />
                      <!-- Smart -->
                      <TriStateCheckbox bind:value={smart} label="Smart" />
                      <!-- Modded -->
                      <TriStateCheckbox bind:value={modded} label="Modded" />
                      <!-- Cube Type -->
                      <TriStateCheckbox bind:value={base} label="Base" />
                      <TriStateCheckbox bind:value={trim} label="Trim" />
                      <TriStateCheckbox bind:value={limited} label="Limited" />
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
                class="flex flex-row items-start sm:items-center justify-between mb-4 gap-4"
              >
                <div class="flex items-center">
                  <label class="text-sm mr-2" for="itemsPerPage"
                    >Cubes per page:</label
                  >
                  <select
                    id="itemsPerPage"
                    bind:value={itemsPerPage}
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
                  <a
                    href="/explore/cubes/compare"
                    class="btn bg-primary text-primary-content"
                  >
                    <i class="fa-solid fa-code-compare sm:mr-2"></i>
                    Compare <span class="hidden sm:block">Cubes</span>
                  </a>
                </div>
              </div>

              <div class="mb-10">
                <Pagination bind:currentPage {totalPages} />
              </div>

              {#if loading}
                <div
                  class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {#each Array(6) as i}
                    <div
                      class="bg-neutral rounded-2xl overflow-hidden animate-pulse"
                    >
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
                  {#if paginatedCubes.length > 0}
                    {#each paginatedCubes as cube}
                      <CubeCard
                        {cube}
                        add={true}
                        rate={true}
                        details={true}
                        badges={true}
                        image={true}
                      />
                    {/each}
                  {:else}
                    <div
                      class="col-span-full flex flex-col items-center justify-center py-20"
                    >
                      <i class="fa-solid fa-cube fa-3x mb-4"></i>
                      <h2 class="text-2xl font-semibold mb-2">
                        No cubes found
                      </h2>
                      <p class="mb-6 text-center max-w-xs">
                        We couldn't find any cubes matching your search or
                        filters. Try adjusting them or resetting to see
                        everything.
                      </p>
                      <button
                        onclick={() => {
                          resetFilters();
                          searchTerm = "";
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

              <div class="mt-10">
                <Pagination bind:currentPage {totalPages} />
              </div>
            </div>
          </div>
        </div>
      </section>
    {:else if !cubesAvailability}
      <FeatureDisabled featureName="The cubes explore page is" />
    {:else if !databaseAvailability}
      <FeatureDisabled featureName="The database is" />
    {/if}
</SsgoiTransition>
