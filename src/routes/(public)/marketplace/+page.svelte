<script lang="ts">
  import MarketplaceCard from "$lib/components/marketplace/MarketplaceCard.svelte";
  import Pagination from "$lib/components/misc/pagination.svelte";
  import SearchBar from "$lib/components/misc/searchBar.svelte";
  import Fuse from "fuse.js";
  import type { ExpandedMarketplaceListing } from "./+page.server.js";
  import FilterSidebar from "$lib/components/misc/filterSidebar.svelte";
  import ItemsPerPageSelector from "$lib/components/misc/itemsPerPageSelector.svelte";

  const { data } = $props();

  const listings: ExpandedMarketplaceListing[] = $derived(data.listings);

  const allConditions = $derived(
    Array.from(
      new Set(
        listings.filter((l) => l.condition !== null).map((l) => l.condition),
      ),
    ).sort(),
  );
  const allCurrencies = $derived(
    Array.from(
      new Set(
        listings.filter((l) => l.currency !== null).map((l) => l.currency),
      ),
    ).sort(),
  );

  let search = $state("");
  let condition = $state("All");
  let currency = $state("All");

  let showFilter = $state(false);
  function toggleFilter() {
    showFilter = !showFilter;
  }
  function resetFilters() {
    condition = "All";
    currency = "All";
  }

  const fuse = $derived(
    new Fuse(listings, {
      keys: ["cube", "description"],
      ignoreLocation: true,
    }),
  );

  const filteredListings = $derived.by(() => {
    let fused = listings;
    if (search.trim() !== "") fused = fuse.search(search).map((r) => r.item);

    return fused.filter(
      (l) =>
        (condition === "All" || condition === l.condition) &&
        (currency === "All" || currency === l.currency),
    );
  });

  let perPage = $state(8);
  const totalPages = $derived(
    Math.max(Math.ceil(filteredListings.length / perPage), 1),
  );
  let page = $state(1);

  const paginatedListings = $derived.by(() => {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return filteredListings.slice(start, end);
  });

  $effect(() => {
    const _ = paginatedListings;
    page = 1;
  });
</script>

<section class="min-h-screen px-6 py-16">
  <div class="max-w-7xl mx-auto">
    <h1 class="text-4xl font-clash font-bold mb-6 text-center">
      Explore Marketplace
    </h1>
    <p class="mb-12 text-center">
      <!-- To-do -->
    </p>
    <SearchBar
      showFilter={true}
      bind:searchTerm={search}
      placeholderLabel="Search listings"
      filterAction={toggleFilter}
    />

    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Filters sidebar -->
      <FilterSidebar showFilters={showFilter}>
        <div>
          <label class="block text-sm mb-1">
            Condition:
            <select
              bind:value={condition}
              class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border"
            >
              <option>All</option>
              {#each allConditions as ac}
                <option>{ac}</option>
              {/each}
            </select>
          </label>
        </div>
        <div>
          <label class="block text-sm mb-1">
            Currency:
            <select
              bind:value={currency}
              class="w-full px-4 py-2 mt-1 rounded-lg bg-base-200 border"
            >
              <option>All</option>
              {#each allCurrencies as t}
                <option>{t}</option>
              {/each}
            </select>
          </label>
        </div>
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

      <div class="flex-1">
        <!-- Controls: items per page & sorting -->
        <div
          class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4"
        >
          <div class="flex flex-wrap items-center gap-4">
            <ItemsPerPageSelector
              bind:itemsPerPage={perPage}
              label="Listings per page"
              options={[4, 8, 12, 16, 20]}
            />
          </div>
          <!-- Link to compare page -->
          <div>
            <a
              href="/marketplace/new"
              class="btn bg-primary text-primary-content"
            >
              <i class="fa-solid fa-plus sm:mr-2"></i>
              New listing
            </a>
          </div>
        </div>

        <!-- Pagination at top -->
        <div class="mb-10">
          <Pagination bind:currentPage={page} {totalPages} />
        </div>

        <!-- Display paginated cubes -->
        <div
          class="grid [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))] gap-8"
        >
          {#if paginatedListings.length > 0}
            {#each paginatedListings as listing}
              <MarketplaceCard {listing} />
            {/each}
          {:else}
            <!-- No results state -->
            <div
              class="col-span-full flex flex-col items-center justify-center py-20"
            >
              <i class="fa-solid fa-shop fa-3x mb-4"></i>
              <h2 class="text-2xl font-semibold mb-2">No listings found</h2>
              <p class="mb-6 text-center max-w-xs">
                We couldn't find any listings matching your search or filters;
                try adjusting them or resetting to see everything.
              </p>
              <button
                onclick={() => {
                  resetFilters();
                  search = "";
                }}
                class="btn btn-outline flex items-center"
                aria-label="Reset filters"
              >
                <i class="fa-solid fa-arrow-rotate-left mr-2"></i>
                Reset Filters
              </button>
            </div>
          {/if}
        </div>

        <!-- Pagination at bottom -->
        <div class="mt-10">
          <Pagination bind:currentPage={page} {totalPages} />
        </div>
      </div>
    </div>
  </div>
</section>
