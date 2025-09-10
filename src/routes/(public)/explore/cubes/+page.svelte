<script lang="ts">
  // Import the necessary components
  import CubeCard from "$lib/components/cube/cubeCard.svelte";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { blur } from "svelte/transition";
  import type { Cube } from "$lib/components/dbTableTypes.js";
  import Pagination from "$lib/components/misc/pagination.svelte";
  import TriStateCheckbox from "$lib/components/misc/triStateCheckbox.svelte";
  import SearchBar from "$lib/components/misc/searchBar.svelte";
  import FilterSidebar from "$lib/components/misc/filterSidebar.svelte";
  import ItemsPerPageSelector from "$lib/components/misc/itemsPerPageSelector.svelte";
  import SortSelector from "$lib/components/misc/sortSelector.svelte";
  import { page } from "$app/state";
  import { SsgoiTransition } from "@ssgoi/svelte";
  import type { SortOption } from "$lib/components/misc/sortSelector.svelte";
  import { queryParameters, ssp } from "sveltekit-search-params";

  // Extend Cube type with metadata for filtering and sorting
  type CubeWithMeta = Cube & {
    _year: number; // Release year extracted from date
    _name: string; // Combined name for search
    _wcaLegal: boolean; // WCA legal feature flag
    _magnetic: boolean; // Magnetic feature flag
    _modded: boolean; // Modded feature flag
    _stickered: boolean; // Stickered feature flag
    _smart: boolean; // Smart feature flag
    _popularity: number; // Popularity count from user data
  };

  const { data } = $props();
  const { user } = data;

  // Loading indicator state
  let loading = $state(true);

  let userCubes: any[] = $state([]);

  // Fetch cubes and feature data from Supabase
  async function fetch() {
    loading = true;
    const BATCH = 2000; // Batch size for pagination
    let start = 0; // Offset for pagination
    const featureMap = new Map<string, Set<string>>(); // Map cube slug to features

    // Retrieve all feature relations
    const { data: features, error: featErr } = await supabase
      .from("cubes_model_features")
      .select("*");

    if (featErr) {
      throw new Error("A 500 status code error occurred:" + featErr.message);
    }

    // Build feature lookup map
    for (const { cube, feature } of features) {
      if (!featureMap.has(cube)) {
        featureMap.set(cube, new Set());
      }
      featureMap.get(cube)!.add(feature);
    }

    // Fetch approved cubes in batches
    while (true) {
      const { data, error } = await supabase
        .from("cube_models")
        .select("*")
        .eq("status", "Approved")
        .range(start, start + BATCH - 1);

      if (error) throw error;
      loading = false;
      if (data.length === 0) break; // Exit loop when no more data

      // Map each cube to include metadata fields
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
          _popularity: 0,
        };
      });

      cubes = cubes.concat(cubesWithMeta);
      start += BATCH;
    }

    // Fetch user-cube relationships to calculate popularity
    const { data, error: ucErr } = await supabase
      .from("user_cubes")
      .select("*");

    if (ucErr) {
      throw new Error("Failed to fetch cube popularity:" + ucErr.message);
    } else {
      userCubes = data;
      const countMap = new Map<string, number>();
      // Count occurrences of each cube slug
      for (const { cube } of userCubes) {
        countMap.set(cube, (countMap.get(cube) ?? 0) + 1);
      }
      // Assign counts to cube metadata
      cubes = cubes.map((c) => ({
        ...c,
        _popularity: countMap.get(c.slug) ?? 0,
      }));
    }
  }

  // Helper: tri-state codec (boolean | undefined)
  const tri = {
    encode: (v: boolean | undefined) =>
      v === true ? "1" : v === false ? "0" : undefined,
    decode: (s: string | null): boolean | undefined =>
      s === "1" ? true : s === "0" ? false : undefined,
  };

  // narrow types
  const SORT_FIELDS = ["name", "rating", "popularity", "date"] as const;
  type SortField = (typeof SORT_FIELDS)[number];
  type SortDir = "asc" | "desc";

  // codecs
  const dirCodec = {
    encode: (v: SortDir | null | undefined) => v ?? "asc",
    decode: (s: string | null): SortDir => (s === "desc" ? "desc" : "asc"),
    defaultValue: "asc" as const,
  };

  const sortCodec = {
    encode: (v: SortField | null | undefined) => v ?? "name",
    decode: (s: string | null): SortField =>
      (SORT_FIELDS as readonly string[]).includes(s ?? "")
        ? (s as SortField)
        : "name",
    defaultValue: "name" as const,
  };

  // Build the params object (with types & sensible defaults)
  const params = queryParameters(
    {
      q: ssp.string(""), // string | null
      page: ssp.number(1), // number (default 1)
      size: ssp.number(12), // number (default 12)
      sort: sortCodec, // "name" | "rating" | "popularity" | "date"
      dir: dirCodec, // "asc" | "desc"

      type: ssp.string("All"),
      sub: ssp.string("All"),
      brand: ssp.string("All"),
      year: {
        // allow empty, otherwise number
        encode: (n: number | null) => (n == null ? undefined : String(n)),
        decode: (s: string | null) => (s ? s : null),
        defaultValue: null,
      },

      // tri-state feature flags
      wca: tri,
      mag: tri,
      smart: tri,
      mod: tri,
      stick: tri,

      // tri-state version flags
      base: tri,
      trim: tri,
      limit: tri,
    },
    {
      // Tuning:
      pushHistory: false, // replaceState instead of pushState
      showDefaults: false, // don’t pollute URL with default values
    }
  );

  let searchTerm: string = $state(""); // Text input for search bar
  let currentPage: number = $state(1); // Current pagination page
  let itemsPerPage: number = $state(12); // Items shown per page
  let sortField: string = $state("name"); // Field to sort by
  let sortOrder: "asc" | "desc" = $state("asc"); // Sort direction
  let selectedType: string = $state("All");
  let selectedSubType: string = $state("All");
  let selectedBrand: string = $state("All");
  let selectedYear: string = $state("All");
  let WCALegal: boolean | undefined = $state(undefined);
  let magnetic: boolean | undefined = $state(undefined);
  let smart: boolean | undefined = $state(undefined);
  let modded: boolean | undefined = $state(undefined);
  let stickered: boolean | undefined = $state(undefined);
  let base: boolean | undefined = $state(undefined);
  let trim: boolean | undefined = $state(undefined);
  let limited: boolean | undefined = $state(undefined);

  $effect(() => {
    searchTerm = $params.q ?? "";
    currentPage = $params.page;
    itemsPerPage = $params.size;
    sortField = $params.sort;
    sortOrder = $params.dir;
    selectedType = $params.type;
    selectedSubType = $params.sub;
    selectedBrand = $params.brand;
    selectedYear = $params.year === null ? "All" : $params.year;

    // tri-states
    WCALegal = $params.wca ?? undefined;
    magnetic = $params.mag ?? undefined;
    smart = $params.smart ?? undefined;
    modded = $params.mod ?? undefined;
    stickered = $params.stick ?? undefined;
    base = $params.base ?? undefined;
    trim = $params.trim ?? undefined;
    limited = $params.limit ?? undefined;
  });

  // 1) State for filters and controls
  let cubes: CubeWithMeta[] = $state([]);
  const sortOptions: SortOption[] = [
    { id: "name-asc", field: "name", order: "asc", label: "Name - A to Z" },
    {
      id: "name-desc",
      field: "name",
      order: "desc",
      label: "Name - Z to A",
    },
    { id: "rating-desc", field: "rating", order: "desc", label: "Rating" },
    {
      id: "popularity-desc",
      field: "popularity",
      order: "desc",
      label: "Popularity",
    },
    { id: "date-desc", field: "date", order: "desc", label: "Date Added" },
  ];

  // 2) Options for filter dropdowns
  let allTypes: string[] = $state([]);
  let allBrands: string[] = $state([]);
  let allYears: number[] = $state([]);
  let allSubTypes: string[] = $state([]);

  /** Calculate unique sets for dropdown filters whenever cubes change */
  function calcAll() {
    const Types = Array.from(new Set(cubes.map((c) => c.type))).sort();
    const Brands = Array.from(new Set(cubes.map((c) => c.brand))).sort();
    const Years = Array.from(
      new Set(cubes.map((c) => new Date(c.release_date!).getFullYear()))
    ).sort((a, b) => b - a); // Descending order
    const SubType = Array.from(
      new Set(cubes.map((c) => c.sub_type ?? ""))
    ).sort();

    allBrands = Brands;
    allTypes = Types;
    allYears = Years;
    allSubTypes = SubType;
  }

  // Load data on component mount
  onMount(() => {
    fetch();
  });

  // 3) Reactive filtered list based on selected criteria
  const filteredCubes = $derived.by(() => {
    return cubes.filter(
      (c) =>
        // Type filter
        (selectedType === "All" || c.type === selectedType) &&
        // Sub-type filter
        (selectedSubType === "All" || c.sub_type === selectedSubType) &&
        // Brand filter
        (selectedBrand === "All" || c.brand === selectedBrand) &&
        // Year filter
        (selectedYear === "All" || c._year === +selectedYear) &&
        // Version type tri-state filters (base, trim, limited)
        (base === undefined
          ? true
          : base
            ? c.version_type === "Base"
            : c.version_type !== "Base") &&
        (trim === undefined
          ? true
          : trim
            ? c.version_type === "Trim"
            : c.version_type !== "Trim") &&
        (limited === undefined
          ? true
          : limited
            ? c.version_type === "Limited"
            : c.version_type !== "Limited") &&
        // Feature tri-state filters
        (WCALegal === undefined || c._wcaLegal === WCALegal) &&
        (magnetic === undefined || c._magnetic === magnetic) &&
        (modded === undefined || c._modded === modded) &&
        (stickered === undefined || c._stickered === stickered) &&
        (smart === undefined || c._smart === smart) &&
        // Text search on combined name
        c._name.includes(searchTerm.toLowerCase())
    );
  });

  // Sort the filtered cubes based on selected field and order
  const sortedCubes = $derived.by(() => {
    const arr = filteredCubes.slice();
    arr.sort((a, b) => {
      let av: any;
      let bv: any;
      switch (sortField) {
        case "rating":
          av = a.rating ?? 0;
          bv = b.rating ?? 0;
          break;
        case "popularity":
          av = a._popularity ?? 0;
          bv = b._popularity ?? 0;
          break;
        case "name":
          av = a._name;
          bv = b._name;
          return sortOrder === "asc"
            ? av.localeCompare(bv, undefined, {
                numeric: true,
                sensitivity: "base",
                ignorePunctuation: true,
              })
            : bv.localeCompare(av, undefined, {
                numeric: true,
                sensitivity: "base",
                ignorePunctuation: true,
              });
        default:
          av = new Date(a.verified_at ?? a.created_at).getTime();
          bv = new Date(b.verified_at ?? b.created_at).getTime();
      }
      if (av < bv) return sortOrder === "asc" ? -1 : 1;
      if (av > bv) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  });

  // Paginate the sorted list
  const paginatedCubes = $derived.by(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return sortedCubes.slice(start, end);
  });

  // Calculate total pages for pagination
  const totalPages = $derived(Math.ceil(sortedCubes.length / itemsPerPage));

  // Reset all filters to default state
  function resetFilters() {
    $params.type = "All";
    $params.sub = "All";
    $params.brand = "All";
    $params.year = "All";

    $params.wca = undefined;
    $params.mag = undefined;
    $params.smart = undefined;
    $params.mod = undefined;
    $params.stick = undefined;
    $params.base = undefined;
    $params.trim = undefined;
    $params.limit = undefined;

    $params.q = "";
    $params.page = 1;
  }

  let _hydrated = $state(false);
  let _userChangedFilters = $state(false);

  // --- track only filters/sort/search (exclude page/size)
  const filterKey = $derived.by(() =>
    JSON.stringify({
      q: searchTerm,
      type: selectedType,
      sub: selectedSubType,
      brand: selectedBrand,
      year: selectedYear,
      wca: WCALegal,
      mag: magnetic,
      smart,
      modded,
      stick: stickered,
      base,
      trim,
      limit: limited,
      sort: sortField,
      dir: sortOrder,
    })
  );

  // --- reset page ONLY on user-driven changes (and never on first run)
  $effect(() => {
    const _ = filterKey;
    if (!_hydrated) {
      _hydrated = true; // first run after load/reload/back ⇒ do nothing
      return;
    }
    if (_userChangedFilters) {
      $params.page = 1; // jump back to first page
      _userChangedFilters = false;
    }
  });

  // Recalculate filter options when loading state changes (i.e., new data arrives)
  $effect(() => {
    const _ = loading;
    const __ = sortedCubes;
    calcAll();
  });

  // State for toggling filter sidebar
  let showFilters = $state(false);
</script>

<svelte:head>
  <title>Explore Cubes - CubeIndex</title>
</svelte:head>

<SsgoiTransition id={page.url.pathname}>
  <section class="min-h-screen px-6 py-16">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-4xl font-clash font-bold mb-6 text-center">
        Explore Cubes
      </h1>
      <p class="mb-12 text-center">
        Browse all your favorite cubes by type, brand, or rating.
      </p>

      <!-- Search bar with filter toggle button -->
      <SearchBar
        showFilter={true}
        oninput={() => (_userChangedFilters = true)}
        bind:searchTerm={$params.q}
        filterAction={() => (showFilters = !showFilters)}
      />

      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Filters sidebar -->
        <FilterSidebar {showFilters}>
          <!-- Type dropdown -->
          <div>
            <label class="block text-sm mb-1">
              Type:
              <select
                bind:value={$params.type}
                onchange={() => (_userChangedFilters = true)}
                class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border"
              >
                <option>All</option>
                {#each allTypes as t}
                  <option>{t}</option>
                {/each}
              </select>
            </label>
          </div>
          <!-- Sub-type dropdown -->
          <div>
            <label class="block text-sm mb-1">
              Sub Type:
              <select
                bind:value={$params.sub}
                onchange={() => (_userChangedFilters = true)}
                class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border"
              >
                <option>All</option>
                {#each allSubTypes as st}
                  <option>{st}</option>
                {/each}
              </select>
            </label>
          </div>
          <!-- Brand dropdown -->
          <div>
            <label class="block text-sm mb-1">
              Brand:
              <select
                bind:value={$params.brand}
                onchange={() => (_userChangedFilters = true)}
                class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border"
              >
                <option>All</option>
                {#each allBrands as b}
                  <option>{b}</option>
                {/each}
              </select>
            </label>
          </div>
          <!-- Year dropdown -->
          <div>
            <label class="block text-sm mb-1">
              Release Year:
              <select
                bind:value={selectedYear}
                onchange={() => {
                  _userChangedFilters = true;
                  $params.year = selectedYear === "All" ? "All" : selectedYear;
                }}
                class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border"
              >
                <option>All</option>
                {#each allYears as year}
                  <option value={year}>{year}</option>
                {/each}
              </select>
            </label>
          </div>
          <!-- Tri-state feature filters -->
          <div class="grid grid-cols-2 gap-2">
            <TriStateCheckbox
              bind:value={$params.wca}
              onchange={() => (_userChangedFilters = true)}
              label="WCA Legal"
            />
            <TriStateCheckbox
              bind:value={$params.mag}
              onchange={() => (_userChangedFilters = true)}
              label="Magnetic"
            />
            <TriStateCheckbox
              bind:value={$params.smart}
              onchange={() => (_userChangedFilters = true)}
              label="Smart"
            />
            <TriStateCheckbox
              bind:value={$params.stick}
              onchange={() => (_userChangedFilters = true)}
              label="Stickered"
            />
            <TriStateCheckbox
              bind:value={$params.mod}
              onchange={() => (_userChangedFilters = true)}
              label="Modded"
            />
            <TriStateCheckbox
              bind:value={$params.base}
              onchange={() => (_userChangedFilters = true)}
              label="Base"
            />
            <TriStateCheckbox
              bind:value={$params.trim}
              onchange={() => (_userChangedFilters = true)}
              label="Trim"
            />
            <TriStateCheckbox
              bind:value={$params.limit}
              onchange={() => (_userChangedFilters = true)}
              label="Limited"
            />
          </div>
          <!-- Reset filters button -->
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
        </FilterSidebar>

        <!-- Main content: cube cards -->
        <div class="flex-1">
          <!-- Controls: items per page & sorting -->
          <div
            class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4"
          >
            <div class="flex flex-wrap items-center gap-4">
              <ItemsPerPageSelector
                bind:itemsPerPage={$params.size}
                label="Cubes per page"
                onchange={() => (_userChangedFilters = true)}
              />
              <SortSelector
                bind:sortField={$params.sort}
                bind:sortOrder={$params.dir}
                {sortOptions}
                useronchange={() => (_userChangedFilters = true)}
              />
            </div>
            <!-- Link to compare page -->
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

          <!-- Pagination at top -->
          <div class="mb-10">
            <Pagination bind:currentPage={$params.page} {totalPages} />
          </div>

          <!-- Loading state: skeleton cards -->
          {#if loading}
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
            <!-- Display paginated cubes -->
            <div
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              transition:blur
            >
              {#if paginatedCubes.length > 0}
                {#each paginatedCubes as cube}
                  {#key paginatedCubes}
                    {@const userCubeDetail = userCubes.find(
                      (uc) => uc.user_id === user?.id && uc.cube === cube.slug
                    )}
                    {@const alreadyAdded = userCubeDetail !== undefined}
                    <CubeCard
                      {cube}
                      add={true}
                      rate={true}
                      details={true}
                      badges={true}
                      image={true}
                      {alreadyAdded}
                      {userCubeDetail}
                    />
                  {/key}
                {/each}
              {:else}
                <!-- No results state -->
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

          <!-- Pagination at bottom -->
          <div class="mt-10">
            <Pagination bind:currentPage={$params.page} {totalPages} />
          </div>
        </div>
      </div>
    </div>
  </section>
</SsgoiTransition>
