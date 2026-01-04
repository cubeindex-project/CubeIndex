<script lang="ts">
  import type { PageData } from "./$types";
  import SearchBar from "$lib/components/misc/searchBar.svelte";
  import Pagination from "$lib/components/misc/pagination.svelte";
  import ItemsPerPageSelector from "$lib/components/misc/itemsPerPageSelector.svelte";
  import { getCurrencySymbol } from "$lib/components/helper_functions/getCurrencySymbol";

  let { data }: { data: PageData } = $props();
  const { vendors, cubesSold, user_cubes } = $derived(data);

  let searchTerm: string = $state("");
  let currentPage: number = $state(1);
  let itemsPerPage: number = $state(12);

  const totalPages = $derived(Math.max(Math.ceil(vendors.length / itemsPerPage), 1));

  const filteredVendors = $derived.by(() => {
    return vendors.filter((vendor) =>
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const paginatedVendors = $derived.by(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredVendors.slice(start, end);
  });

  const vendorBuyerCounts = $derived.by(() => {
    const buyersByVendor = new Map<string, Set<string>>();

    user_cubes.forEach((userCube) => {
      if (!userCube.bought_from) return;

      const userIdentifier = userCube.user_id ?? userCube.username;

      if (!userIdentifier) return;

      const buyers = buyersByVendor.get(userCube.bought_from) ?? new Set<string>();

      buyers.add(userIdentifier);
      buyersByVendor.set(userCube.bought_from, buyers);
    });

    return buyersByVendor;
  });

  // Function to convert ISO country code to flag emoji
  function getFlagEmoji(countryCode: string): string {
    return String.fromCodePoint(
      ...countryCode
        .toUpperCase()
        .split("")
        .map((char) => 127397 + char.charCodeAt(0))
    );
  }
</script>

<svelte:head>
  <title>Explore Vendors - CubeIndex</title>
</svelte:head>
  <section class="min-h-screen bg-base-100 px-6 py-16">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-4xl sm:text-5xl font-clash font-bold mb-10 text-center">
        Explore Vendors
      </h1>
      <p class="text-center text-gray-400 mb-12">
        Find the best shops and trusted vendors in the cubing world.
      </p>

      <!-- Search bar with filter toggle button -->
      <SearchBar
        showFilter={false}
        bind:searchTerm
        placeholderLabel="Search Vendors"
      />

      <div
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4"
      >
        <div class="flex flex-wrap items-center gap-4">
          <ItemsPerPageSelector bind:itemsPerPage label="Vendors per page" />
          <!-- <SortSelector bind:sortField bind:sortOrder {sortOptions} /> -->
        </div>
      </div>

      <div class="mb-10">
        <Pagination bind:currentPage {totalPages} />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each paginatedVendors as vendor}
          {#key paginatedVendors}
            {@const stock_count =
              cubesSold.filter((cs) => cs.vendor_name === vendor.name).length ??
              0}
            {@const buyers =
              vendorBuyerCounts.get(vendor.slug) ?? new Set<string>()}
            {@const uniqueBuyerCount = buyers.size}

            <!-- Card -->
            <section
              class="group relative grid rounded-2xl border border-base-300 bg-base-200 shadow-sm transition focus-within:shadow-md"
              role="group"
            >
              <!-- Header -->
              <header class="flex items-start gap-4 p-6 pb-4">
                <!-- Logo -->
                {#if vendor.logo_url}
                  <img
                    src={vendor.logo_url}
                    alt={`${vendor.name} logo`}
                    class="h-16 w-16 shrink-0 rounded-xl p-2 object-contain bg-white"
                    loading="lazy"
                    decoding="async"
                  />
                {:else}
                  <div
                    class="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-base-300/60 text-lg font-semibold"
                    aria-label={`${vendor.name} placeholder logo`}
                    title={vendor.name}
                  >
                    {vendor.name?.charAt(0)}
                  </div>
                {/if}

                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="text-base/none" aria-hidden="true"
                      >{getFlagEmoji(vendor.country_iso)}</span
                    >
                    <h2
                      class="truncate text-lg font-semibold"
                      title={vendor.name}
                    >
                      {vendor.name}
                    </h2>

                    {#if vendor.verified}
                      <span
                        class="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700"
                      >
                        <i class="fa-solid fa-check"></i>
                        Verified
                      </span>
                    {/if}

                    {#if vendor.sponsored}
                      <span
                        class="inline-flex items-center gap-1 rounded-full border border-yellow-200 bg-yellow-100 px-2 py-0.5 text-[11px] font-semibold text-yellow-900"
                      >
                        <i class="fa-solid fa-star"></i>
                        Sponsored
                      </span>
                    {/if}
                  </div>

                  {#if vendor.description}
                    <p class="mt-1 line-clamp-2 text-sm text-base-content/70">
                      {vendor.description}
                    </p>
                  {/if}
                </div>
              </header>

              <hr class="mx-6 border-base-300/60" />

              <!-- Body (badges/info) -->
              <div class="p-6 pt-4">
                <div class="grid gap-2 sm:grid-cols-2">
                  <!-- Price tracking -->
                  {#if vendor.supports_price_tracking}
                    <div class="inline-flex items-center gap-2 text-sm">
                      <span
                        class="grid h-6 w-8 place-items-center rounded-md border border-green-200 bg-green-50"
                      >
                        <i class="fa-solid fa-chart-column text-green-700"></i>
                      </span>
                      <div class="min-w-0">
                        <div class="font-medium">Supports price tracking</div>
                        <div class="text-xs text-base-content/60">
                          Historical pricing available
                        </div>
                      </div>
                    </div>
                  {/if}

                  <!-- Currency -->
                  <div class="inline-flex items-center gap-2 text-sm">
                    <span
                      class="grid h-6 w-6 place-items-center rounded-md border border-base-300 bg-base-300/60"
                    >
                      <i class="fa-solid fa-dollar-sign"></i>
                    </span>
                    <div class="min-w-0">
                      <div class="font-medium">
                        {getCurrencySymbol(vendor.currency)}
                        <span class="text-base-content/60 ml-1"
                          >{vendor.currency}</span
                        >
                      </div>
                      <div class="text-xs text-base-content/60">
                        Default currency
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <hr class="mx-6 border-base-300/60" />

              <!-- Meta -->
              <div
                class="flex justify-between items-center gap-6 p-6 pt-4 text-xs text-base-content/70"
              >
                <!-- Stock Count -->
                <div class="flex items-center gap-2">
                  {#if stock_count === 1}
                    <i class="fa-solid fa-cube" aria-hidden="true"></i>
                    <span>{stock_count} cube listed</span>
                  {:else}
                    <i class="fa-solid fa-cubes" aria-hidden="true"></i>
                    <span>{stock_count} cubes listed</span>
                  {/if}
                </div>

                <!-- Buyers -->
                <div class="flex items-center gap-2">
                  <i class="fa-solid fa-user-check" aria-hidden="true"></i>
                  <span>
                    {uniqueBuyerCount}
                    user{uniqueBuyerCount === 1 ? "" : "s"} purchased here
                  </span>
                </div>
              </div>

              <hr class="mx-6 border-base-300/60" />

              <!-- Footer -->
              <footer class="p-6 pt-4">
                <a
                  href={vendor.base_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn-primary w-full"
                >
                  Visit Store
                </a>
              </footer>
            </section>
          {/key}
        {:else}
          <!-- No results state -->
          <div
            class="col-span-full flex flex-col items-center justify-center py-20"
          >
            <i class="fa-solid fa-shop fa-3x mb-4"></i>
            <h2 class="text-2xl font-semibold mb-2">No vendors found</h2>
            <p class="mb-6 text-center max-w-xs">
              We couldn't find any vendors matching your search or filters. Try
              adjusting them or resetting to see everything.
            </p>
            <button
              onclick={() => (searchTerm = "")}
              class="btn btn-outline flex items-center"
              aria-label="Reset filters"
            >
              <i class="fa-solid fa-arrow-rotate-left mr-2"></i>
              Reset
            </button>
          </div>
        {/each}
      </div>

      <div class="mt-10">
        <Pagination bind:currentPage {totalPages} />
      </div>
    </div>
  </section>