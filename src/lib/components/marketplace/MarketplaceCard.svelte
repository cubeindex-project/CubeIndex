<script lang="ts">
  import type { ExpandedMarketplaceListing } from "../../../routes/(public)/marketplace/+page.server";
  import { formatDate } from "../helper_functions/formatDate.svelte";

  const { listing }: { listing: ExpandedMarketplaceListing } = $props();

  const displayLocation = listing.location_region
    ? `${listing.location_region}, ${listing.location_country}`
    : listing.location_country;

  const priceFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: listing.currency,
  });
</script>

<a
  href="/marketplace/{listing.id}"
  class="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm transition hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
>
  <div class="relative aspect-[4/3] bg-base-200">
    <img
      src={listing.image_url}
      alt={listing.cube}
      class="h-full w-full object-cover"
      loading="lazy"
    />
    <div
      class="absolute left-3 top-3 rounded-full bg-base-100/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-base-content shadow"
    >
      {listing.condition}
    </div>
  </div>

  <div class="flex flex-1 flex-col gap-3 p-4">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h3 class="text-lg font-semibold text-base-content">
          {listing.cube}
        </h3>
      </div>
      <span class="text-lg font-bold text-primary">
        {priceFormatter.format(listing.price)}
      </span>
    </div>

    <div class="text-sm text-base-content/70">
      <p class="line-clamp-1">{displayLocation}</p>
      <p class="line-clamp-1">Listed by {listing.seller.display_name}</p>
    </div>

    <div
      class="mt-auto flex items-center justify-between text-xs text-base-content/60"
    >
      <span>{formatDate(listing.created_at)}</span>
      <span class="inline-flex items-center gap-1">
        View listing
        <i class="fa-solid fa-arrow-right text-[10px]"></i>
      </span>
    </div>
  </div>
</a>
