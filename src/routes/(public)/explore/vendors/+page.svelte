<script lang="ts">
  import ExploreHeader from "$lib/components/explore/ExploreHeader.svelte";
  import ExplorePage from "$lib/components/explore/ExplorePage.svelte";
  import {
    parseAsInteger,
    parseAsString,
    parseAsStringLiteral,
  } from "nuqs-svelte";
  import VendorCard from "$lib/components/vendors/VendorCard.svelte";

  const SORT_FIELDS = ["name", "buyers"] as const;

  const { data } = $props();
  const { vendors } = $derived(data);
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
    <VendorCard {vendor} />
  {/snippet}
</ExplorePage>
