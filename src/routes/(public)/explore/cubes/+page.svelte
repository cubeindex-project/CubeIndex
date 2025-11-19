<script lang="ts">
  // Import the necessary components
  import CubeCard from "$lib/components/cube/cubeCard.svelte";
  import type { Cube } from "$lib/components/dbTableTypes.js";
  import Pagination from "$lib/components/misc/pagination.svelte";
  import TriStateCheckbox from "$lib/components/misc/triStateCheckbox.svelte";
  import SearchBar from "$lib/components/misc/searchBar.svelte";
  import FilterSidebar from "$lib/components/misc/filterSidebar.svelte";
  import ItemsPerPageSelector from "$lib/components/misc/itemsPerPageSelector.svelte";
  import SortSelector from "$lib/components/misc/sortSelector.svelte";
  import { page } from "$app/state";
  import { SsgoiTransition } from "@ssgoi/svelte";
  import type { SortFieldOption } from "$lib/components/misc/sortSelector.svelte";
  import { queryParameters, ssp } from "sveltekit-search-params";
  import Fuse from "fuse.js";

  // Extend Cube type with metadata for filtering and sorting
  type CubeWithMeta = Cube & {
    year: number; // Release year extracted from date
    name: string; // Combined name for search
    wca_legal: boolean; // WCA legal feature flag
    magnetic: boolean; // Magnetic feature flag
    modded: boolean; // Modded feature flag
    stickered: boolean; // Stickered feature flag
    smart: boolean; // Smart feature flag
    popularity: number; // Popularity count from user data
    avg_price: number; // Average price
  };

  const { data } = $props();
  const { user } = data;

  const cubes: CubeWithMeta[] = $state(data.cubes);

  let userCubes: any[] = $state([]);

  // Helper: tri-state codec (boolean | undefined)
  const tri = {
    encode: (v: boolean | undefined) =>
      v === true ? "1" : v === false ? "0" : undefined,
    decode: (s: string | null): boolean | undefined =>
      s === "1" ? true : s === "0" ? false : undefined,
  };

  // narrow types
  const SORT_FIELDS = [
    "name",
    "rating",
    "popularity",
    "date",
    "price",
  ] as const;
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
        defaultValue: "All",
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
      showDefaults: true, // don’t pollute URL with default values
    }
  );

  // 1) Sort fields (dropdown) — direction handled by SortSelector toggle
  const sortFields: SortFieldOption[] = [
    { value: "date", label: "Recent" },
    { value: "name", label: "Name" },
    { value: "rating", label: "Rating" },
    { value: "popularity", label: "Popularity" },
    { value: "price", label: "Price" },
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

  // 3) Reactive filtered list based on selected criteria
  const filteredCubes = $derived.by(() => {
    return cubes.filter(
      (c) =>
        // Type filter
        ($params.type === "All" || c.type === $params.type) &&
        // Sub-type filter
        ($params.sub === "All" || c.sub_type === $params.sub) &&
        // Brand filter
        ($params.brand === "All" || c.brand === $params.brand) &&
        // Year filter
        ($params.year === "All" || c.year === +$params.year) &&
        // Version type tri-state filters (base, trim, limited)
        ($params.base === undefined
          ? true
          : $params.base
            ? c.version_type === "Base"
            : c.version_type !== "Base") &&
        ($params.trim === undefined
          ? true
          : $params.trim
            ? c.version_type === "Trim"
            : c.version_type !== "Trim") &&
        ($params.limit === undefined
          ? true
          : $params.limit
            ? c.version_type === "Limited"
            : c.version_type !== "Limited") &&
        // Feature tri-state filters
        ($params.wca === undefined || c.wca_legal === $params.wca) &&
        ($params.mag === undefined || c.magnetic === $params.mag) &&
        ($params.mod === undefined || c.modded === $params.mod) &&
        ($params.stick === undefined || c.stickered === $params.stick) &&
        ($params.smart === undefined || c.smart === $params.smart)
    );
  });

  // Fuzzy search instance, derived from the currently filtered cubes
  const fuse = $derived.by(
    () =>
      new Fuse(filteredCubes, {
        keys: ["name"],
        threshold: 0.4,
        includeScore: true,
        ignoreLocation: true,
      })
  );

  let sortByRelevance = $state(false);
  let sortManuallySet = $state(false);

  // Optional: effect to set the default sort mode based on the query
  $effect(() => {
    const query = $params.q.trim();

    if (query && !sortManuallySet) {
      // Default to relevance when the user starts typing
      sortByRelevance = true;
    }

    if (!query) {
      // Reset when the query is cleared
      sortByRelevance = false;
      sortManuallySet = false;
    }
  });

  // Sort the filtered cubes based on selected field and order
  const sortedCubes = $derived.by(() => {
    const base = filteredCubes.slice();
    const query = $params.q.trim();

    const compare = (a: CubeWithMeta, b: CubeWithMeta) => {
      let av: any;
      let bv: any;

      switch ($params.sort) {
        case "rating":
          av = a.rating ?? 0;
          bv = b.rating ?? 0;
          break;
        case "popularity":
          av = a.popularity ?? 0;
          bv = b.popularity ?? 0;
          break;
        case "price":
          av = a.avg_price ?? 0;
          bv = b.avg_price ?? 0;
          break;
        case "name": {
          const an = a.name;
          const bn = b.name;
          return $params.dir === "asc"
            ? an.localeCompare(bn, undefined, {
                numeric: true,
                sensitivity: "base",
                ignorePunctuation: true,
              })
            : bn.localeCompare(an, undefined, {
                numeric: true,
                sensitivity: "base",
                ignorePunctuation: true,
              });
        }
        default:
          av = new Date(a.verified_at ?? a.created_at).getTime();
          bv = new Date(b.verified_at ?? b.created_at).getTime();
      }

      if (av < bv) return $params.dir === "asc" ? -1 : 1;
      if (av > bv) return $params.dir === "asc" ? 1 : -1;
      return 0;
    };

    // No query => just sort the filtered cubes
    if (!query) {
      return base.sort(compare);
    }

    const results = fuse.search(query);

    // Base set of slugs for the current filters
    const baseSlugs = new Set(base.map((c) => c.slug));

    if (sortByRelevance && !sortManuallySet) {
      // Relevance-first: keep Fuse order, but only for cubes that are in the filtered set
      return results
        .map((r) => r.item)
        .filter((cube) => baseSlugs.has(cube.slug));
    }

    // Manual sort selected: keep only matching cubes, then sort with the selected compare
    const resultSlugs = new Set(results.map((r) => r.item.slug));
    const matches = base.filter((cube) => resultSlugs.has(cube.slug));

    return matches.sort(compare);
  });

  // Paginate the sorted list
  const paginatedCubes = $derived.by(() => {
    const start = ($params.page - 1) * $params.size;
    const end = start + $params.size;
    return sortedCubes.slice(start, end);
  });

  // Calculate total pages for pagination
  const totalPages = $derived(
    Math.max(Math.ceil(sortedCubes.length / $params.size), 1)
  );

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
      q: $params.q,
      type: $params.type,
      sub: $params.sub,
      brand: $params.brand,
      year: $params.year,
      wca: $params.wca,
      mag: $params.mag,
      smart: $params.smart,
      modded: $params.mod,
      stick: $params.stick,
      base: $params.base,
      trim: $params.trim,
      limit: $params.limit,
      sort: $params.sort,
      dir: $params.dir,
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
    const _ = sortedCubes;
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
        placeholderLabel="Search Cubes"
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
                bind:value={$params.year}
                onchange={() => {
                  _userChangedFilters = true;
                  $params.year = $params.year === "All" ? "All" : $params.year;
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
                onchange={() => {
                  _userChangedFilters = true;
                  sortManuallySet = true;
                  sortByRelevance = false;
                }}
              />
              <SortSelector
                bind:sortField={$params.sort}
                bind:sortOrder={$params.dir}
                fields={sortFields}
                label="Sort"
                useronchange={() => {
                  _userChangedFilters = true;
                  sortManuallySet = true;
                  sortByRelevance = false;
                }}
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

          <!-- Display paginated cubes -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  We couldn't find any cubes matching your search or filters;
                  try adjusting them or resetting to see everything. If the cube
                  you're looking for isn't listed, consider submitting it to
                  help grow our database.
                </p>
                <div class="flex flex-col justify-center gap-4">
                  <a href="/submit" class="btn btn-primary flex items-center">
                    <i class="fa-solid fa-plus mr-2"></i>
                    Submit a New Cube
                  </a>
                  <button
                    onclick={() => {
                      resetFilters();
                      $params.q = "";
                    }}
                    class="btn btn-outline flex items-center"
                    aria-label="Reset filters"
                  >
                    <i class="fa-solid fa-arrow-rotate-left mr-2"></i>
                    Reset Filters
                  </button>
                </div>
              </div>
            {/if}
          </div>

          <!-- Pagination at bottom -->
          <div class="mt-10">
            <Pagination bind:currentPage={$params.page} {totalPages} />
          </div>
        </div>
      </div>
    </div>
  </section>
</SsgoiTransition>
