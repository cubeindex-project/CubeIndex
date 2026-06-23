<script lang="ts">
  // Import the necessary components
  import CubeCard from "$lib/components/cube/cubeCard.svelte";
  import Pagination from "$lib/components/misc/pagination.svelte";
  import TriStateCheckbox from "$lib/components/misc/triStateCheckbox.svelte";
  import SearchBar from "$lib/components/misc/searchBar.svelte";
  import FilterSidebar from "$lib/components/misc/filterSidebar.svelte";
  import ItemsPerPageSelector from "$lib/components/misc/itemsPerPageSelector.svelte";
  import SortSelector from "$lib/components/misc/sortSelector.svelte";
  import type { SortFieldOption } from "$lib/components/misc/sortSelector.svelte";
  import Fuse from "fuse.js";
  import type { Tables } from "$lib/types/database.types.js";
  import { resolve } from "$app/paths";
  import {
    createParser,
    parseAsString,
    parseAsInteger,
    useQueryStates,
    parseAsStringLiteral,
  } from "nuqs-svelte";

  // narrow types
  const SORT_FIELDS = [
    "name",
    "rating",
    "popularity",
    "date",
    "price",
  ] as const;

  const { data } = $props();
  const { cubes, userCubes } = $derived(data);

  const triParser = createParser({
    parse: (query: string): boolean => (query === "1" ? true : false),
    serialize: (value: boolean) => (value === true ? "1" : "0"),
  });

  const yearParser = createParser({
    parse: (query: string): number | "All" | null => {
      if (query === "All") return "All";
      const num = parseInt(query, 10);
      return isNaN(num) ? null : num;
    },
    serialize: (value: number | "All") => {
      return String(value);
    },
  });

  const params = useQueryStates(
    {
      q: parseAsString.withDefault(""),
      page: parseAsInteger.withDefault(1),
      size: parseAsInteger.withDefault(12),
      sort: parseAsStringLiteral(SORT_FIELDS).withDefault("name"),
      dir: parseAsStringLiteral(["asc", "desc"]).withDefault("asc"),

      type: parseAsString.withDefault("All"),
      sub: parseAsString.withDefault("All"),
      brand: parseAsString.withDefault("All"),
      year: yearParser.withDefault("All"),

      // tri-state feature flags
      wca: triParser,
      mag: triParser,
      smart: triParser,
      mod: triParser,
      stick: triParser,

      // tri-state version flags
      base: triParser,
      trim: triParser,
      limit: triParser,
    },
    {
      history: "replace",
      clearOnDefault: false,
    },
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
  function uniqueSorted<T>(
    values: (T | null | undefined)[],
    compareFn?: (a: T, b: T) => number,
  ): T[] {
    return Array.from(new Set(values.filter((v): v is T => v != null))).sort(
      compareFn,
    );
  }

  let allTypes: string[] = $derived(uniqueSorted(cubes.map((c) => c.type)));

  let allBrands: string[] = $derived(uniqueSorted(cubes.map((c) => c.brand)));

  let allYears: number[] = $derived(
    uniqueSorted(
      cubes.map((c) => c.year),
      (a, b) => b - a,
    ),
  );

  let allSubTypes: string[] = $derived(
    uniqueSorted(cubes.map((c) => c.sub_type)),
  );

  // 3) Reactive filtered list based on selected criteria
  const filteredCubes = $derived.by(() => {
    return cubes.filter(
      (c) =>
        // Type filter
        (params.type.current === "All" || c.type === params.type.current) &&
        // Sub-type filter
        (params.sub.current === "All" || c.sub_type === params.sub.current) &&
        // Brand filter
        (params.brand.current === "All" || c.brand === params.brand.current) &&
        // Year filter
        (params.year.current === "All" || c.year === +params.year.current) &&
        // Version type tri-state filters (base, trim, limited)
        (params.base.current === null
          ? true
          : params.base.current
            ? c.version_type === "Base"
            : c.version_type !== "Base") &&
        (params.trim.current === null
          ? true
          : params.trim.current
            ? c.version_type === "Trim"
            : c.version_type !== "Trim") &&
        (params.limit.current === null
          ? true
          : params.limit.current
            ? c.version_type === "Limited"
            : c.version_type !== "Limited") &&
        // Feature tri-state filters
        (params.wca.current === null || c.wca_legal === params.wca.current) &&
        (params.mag.current === null || c.magnetic === params.mag.current) &&
        (params.mod.current === null || c.modded === params.mod.current) &&
        (params.stick.current === null ||
          c.stickered === params.stick.current) &&
        (params.smart.current === null || c.smart === params.smart.current),
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
      }),
  );

  let sortByRelevance = $state(false);
  let sortManuallySet = $state(false);

  // Optional: effect to set the default sort mode based on the query
  $effect(() => {
    const query = params.q.current.trim();

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
    const query = params.q.current.trim();

    const compare = (
      a: Tables<"v_detailed_cube_models">,
      b: Tables<"v_detailed_cube_models">,
    ) => {
      let av;
      let bv;

      switch (params.sort.current) {
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
          const an = a.name ?? "";
          const bn = b.name ?? "";
          return params.dir.current === "asc"
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
          av = new Date(a.verified_at ?? a.created_at ?? 0).getTime();
          bv = new Date(b.verified_at ?? b.created_at ?? 0).getTime();
      }

      if (av < bv) return params.dir.current === "asc" ? -1 : 1;
      if (av > bv) return params.dir.current === "asc" ? 1 : -1;
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
    const start = (params.page.current - 1) * params.size.current;
    const end = start + params.size.current;
    return sortedCubes.slice(start, end);
  });

  // Calculate total pages for pagination
  const totalPages = $derived(
    Math.max(Math.ceil(sortedCubes.length / params.size.current), 1),
  );

  // Reset all filters to default state
  function resetFilters() {
    params.set(null);
  }

  let _hydrated = $state(false);
  let _userChangedFilters = $state(false);

  // --- track only filters/sort/search (exclude page/size)
  const filterKey = $derived.by(() =>
    JSON.stringify({
      q: params.q,
      type: params.type,
      sub: params.sub,
      brand: params.brand,
      year: params.year,
      wca: params.wca,
      mag: params.mag,
      smart: params.smart,
      modded: params.mod,
      stick: params.stick,
      base: params.base,
      trim: params.trim,
      limit: params.limit,
      sort: params.sort,
      dir: params.dir,
    }),
  );

  // --- reset page ONLY on user-driven changes (and never on first run)
  $effect(() => {
    if (filterKey) {
      if (!_hydrated) {
        _hydrated = true; // first run after load/reload/back ⇒ do nothing
        return;
      }
      if (_userChangedFilters) {
        params.set({ page: 1 }); // jump back to first page
        _userChangedFilters = false;
      }
    }
  });

  // State for toggling filter sidebar
  let showFilters = $state(false);
</script>

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
      bind:searchTerm={params.q.current}
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
              bind:value={params.type.current}
              onchange={() => (_userChangedFilters = true)}
              class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border"
            >
              <option>All</option>
              {#each allTypes as t, index (index)}
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
              bind:value={params.sub.current}
              onchange={() => (_userChangedFilters = true)}
              class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border"
            >
              <option>All</option>
              {#each allSubTypes as st, index (index)}
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
              bind:value={params.brand.current}
              onchange={() => (_userChangedFilters = true)}
              class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border"
            >
              <option>All</option>
              {#each allBrands as b, index (index)}
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
              bind:value={params.year.current}
              onchange={() => {
                _userChangedFilters = true;
                params.set({
                  year:
                    params.year.current === "All" ? "All" : params.year.current,
                });
              }}
              class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border"
            >
              <option>All</option>
              {#each allYears as year, index (index)}
                <option value={year}>{year}</option>
              {/each}
            </select>
          </label>
        </div>
        <!-- Tri-state feature filters -->
        <div class="grid grid-cols-2 gap-2">
          <TriStateCheckbox
            bind:value={params.wca.current}
            onchange={() => (_userChangedFilters = true)}
            label="WCA Legal"
          />
          <TriStateCheckbox
            bind:value={params.mag.current}
            onchange={() => (_userChangedFilters = true)}
            label="Magnetic"
          />
          <TriStateCheckbox
            bind:value={params.smart.current}
            onchange={() => (_userChangedFilters = true)}
            label="Smart"
          />
          <TriStateCheckbox
            bind:value={params.stick.current}
            onchange={() => (_userChangedFilters = true)}
            label="Stickered"
          />
          <TriStateCheckbox
            bind:value={params.mod.current}
            onchange={() => (_userChangedFilters = true)}
            label="Modded"
          />
          <TriStateCheckbox
            bind:value={params.base.current}
            onchange={() => (_userChangedFilters = true)}
            label="Base"
          />
          <TriStateCheckbox
            bind:value={params.trim.current}
            onchange={() => (_userChangedFilters = true)}
            label="Trim"
          />
          <TriStateCheckbox
            bind:value={params.limit.current}
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
              bind:itemsPerPage={params.size.current}
              label="Cubes per page"
              onchange={() => {
                _userChangedFilters = true;
                sortManuallySet = true;
                sortByRelevance = false;
              }}
            />
            <SortSelector
              bind:sortField={params.sort.current}
              bind:sortOrder={params.dir.current}
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
              href={resolve("/explore/cubes/compare")}
              class="btn bg-primary text-primary-content"
            >
              <i class="fa-solid fa-code-compare sm:mr-2"></i>
              Compare <span class="hidden sm:block">Cubes</span>
            </a>
          </div>
        </div>

        <!-- Pagination at top -->
        <div class="mb-10">
          <Pagination bind:currentPage={params.page.current} {totalPages} />
        </div>

        <!-- Display paginated cubes -->
        <div class="grid grid-cols-[repeat(auto-fill,minmax(310px,1fr))] gap-8">
          {#if paginatedCubes.length > 0}
            {#each paginatedCubes as cube, index (index)}
              {#key paginatedCubes}
                {@const userCubeDetail = userCubes?.find(
                  (uc) => uc.cube === cube.slug,
                )}
                <CubeCard
                  {cube}
                  showAddButton={true}
                  showRateButton={true}
                  showDetailsButton={true}
                  alreadyAdded={userCubeDetail !== undefined}
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
                We couldn't find any cubes matching your search or filters; try
                adjusting them or resetting to see everything. If the cube
                you're looking for isn't listed, consider submitting it to help
                grow our database.
              </p>
              <div class="flex flex-col justify-center gap-4">
                <a
                  href={resolve("/submit")}
                  class="btn btn-primary flex items-center"
                >
                  <i class="fa-solid fa-plus mr-2"></i>
                  Submit a New Cube
                </a>
                <button
                  onclick={() => resetFilters()}
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
          <Pagination bind:currentPage={params.page.current} {totalPages} />
        </div>
      </div>
    </div>
  </div>
</section>
