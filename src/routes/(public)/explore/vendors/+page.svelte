<script lang="ts">
  import ExploreHeader from "$lib/components/explore/ExploreHeader.svelte";
  import ExplorePage from "$lib/components/explore/ExplorePage.svelte";
  import { getCurrencySymbol } from "$lib/components/helper_functions/getCurrencySymbol";
  import {
    parseAsInteger,
    parseAsString,
    parseAsStringLiteral,
  } from "nuqs-svelte";

  const SORT_FIELDS = ["name", "buyers"] as const;

  const { data } = $props();
  const { vendors } = $derived(data);

  function getFlagEmoji(countryCode: string): string {
    return String.fromCodePoint(
      ...countryCode
        .toUpperCase()
        .split("")
        .map((character) => 127397 + character.charCodeAt(0)),
    );
  }
</script>

<ExplorePage
  searchPlaceholder="Search Vendors"
  itemsPerPageLabel="Vendors per page"
  items={vendors}
  queryStateKeyMap={{
    q: parseAsString.withDefault(""),
    page: parseAsInteger.withDefault(1),
    size: parseAsInteger.withDefault(12),
    sort: parseAsStringLiteral(SORT_FIELDS),
    dir: parseAsStringLiteral(["asc", "desc"]).withDefault("asc"),
  }}
  fuseOptions={{
    keys: ["name"],
    threshold: 0.4,
    includeScore: true,
    ignoreLocation: true,
  }}
  showFilterDrawer={false}
  sortFunc={(vendors, sortField, sortDirection) =>
    [...vendors].sort((a, b) => {
      if (sortField === "buyers") {
        const buyerDifference = (a.buyer_count ?? 0) - (b.buyer_count ?? 0);
        if (buyerDifference !== 0) {
          return sortDirection === "asc" ? buyerDifference : -buyerDifference;
        }
      }

      return sortDirection === "asc"
        ? a.name.localeCompare(b.name, undefined, {
            numeric: true,
            sensitivity: "base",
            ignorePunctuation: true,
          })
        : b.name.localeCompare(a.name, undefined, {
            numeric: true,
            sensitivity: "base",
            ignorePunctuation: true,
          });
    })}
  sortFields={[
    { value: "name", label: "Name" },
    { value: "buyers", label: "Buyers" },
  ]}
  defaultSortField="name"
  noResultsTitle="No vendors found"
  noResultsMessage="We couldn't find any vendors matching your search. Try adjusting it or resetting to see everything."
  noResultsIcon="fa-solid fa-shop"
>
  {#snippet header()}
    <ExploreHeader
      title="Explore Vendors"
      subtitle="Find the best shops and trusted vendors in the cubing world."
    />
  {/snippet}
  {#snippet renderItem(vendor)}
    <section
      class="group relative grid rounded-2xl border border-base-300 bg-base-200 shadow-sm transition focus-within:shadow-md"
      role="group"
    >
      <header class="flex items-start gap-4 p-6 pb-4">
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
            {vendor.name.charAt(0)}
          </div>
        {/if}

        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-base/none" aria-hidden="true">
              {getFlagEmoji(vendor.country_iso)}
            </span>
            <h2 class="truncate text-lg font-semibold" title={vendor.name}>
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
        </div>
      </header>

      <hr class="mx-6 border-base-300/60" />

      <div class="p-6 pt-4">
        <div class="grid gap-2 sm:grid-cols-2">
          <div class="inline-flex items-center gap-2 text-sm">
            <span
              class="grid h-6 w-6 place-items-center rounded-md border border-base-300 bg-base-300/60"
            >
              <i class="fa-solid fa-dollar-sign"></i>
            </span>
            <div class="min-w-0">
              <div class="font-medium">
                {getCurrencySymbol(vendor.currency)}
                <span class="text-base-content/60 ml-1">{vendor.currency}</span>
              </div>
              <div class="text-xs text-base-content/60">Default currency</div>
            </div>
          </div>
        </div>
      </div>

      <hr class="mx-6 border-base-300/60" />

      <div
        class="flex justify-between items-center gap-6 p-6 pt-4 text-xs text-base-content/70"
      >
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-user-check" aria-hidden="true"></i>
          <span>
            {vendor.buyer_count}
            user{vendor.buyer_count === 1 ? "" : "s"} purchased here
          </span>
        </div>
      </div>

      <hr class="mx-6 border-base-300/60" />

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
  {/snippet}
  {#snippet noResultsAction()}{/snippet}
</ExplorePage>
