<script lang="ts">
	type MarketplaceListingCard = {
		id: string;
		cube_name: string;
		cube_slug: string | null;
		condition: string;
		price_amount: number;
		price_currency: string;
		location_country: string;
		location_region: string | null;
		image_url: string | null;
		created_at: string;
		cube?: {
			model: string;
			brand: string;
			image_url: string;
			slug: string;
		} | null;
		seller?: {
			username: string;
			display_name: string;
			profile_picture: string | null;
		} | null;
	};

	const { listing }: { listing: MarketplaceListingCard } = $props();

	const displayName =
		listing.seller?.display_name || listing.seller?.username || "Seller";
	const displayLocation = listing.location_region
		? `${listing.location_region}, ${listing.location_country}`
		: listing.location_country;
	const displayImage =
		listing.image_url || listing.cube?.image_url || "/images/CubeIndex_Logo.webp";

	const priceFormatter = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: listing.price_currency,
	});
</script>

<a
	href={`/marketplace/${listing.id}`}
	class="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
>
	<div class="relative aspect-[4/3] bg-base-200">
		<img
			src={displayImage}
			alt={listing.cube?.model ?? listing.cube_name}
			class="h-full w-full object-cover"
			loading="lazy"
		/>
		<div class="absolute left-3 top-3 rounded-full bg-base-100/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-base-content shadow">
			{listing.condition}
		</div>
	</div>

	<div class="flex flex-1 flex-col gap-3 p-4">
		<div class="flex items-start justify-between gap-3">
			<div>
				<h3 class="text-lg font-semibold text-base-content">
					{listing.cube?.model ?? listing.cube_name}
				</h3>
				{#if listing.cube?.brand}
					<p class="text-sm text-base-content/70">
						{listing.cube.brand}
					</p>
				{/if}
			</div>
			<span class="text-lg font-bold text-primary">
				{priceFormatter.format(listing.price_amount)}
			</span>
		</div>

		<div class="text-sm text-base-content/70">
			<p class="line-clamp-1">{displayLocation}</p>
			<p class="line-clamp-1">Listed by {displayName}</p>
		</div>

		<div class="mt-auto flex items-center justify-between text-xs text-base-content/60">
			<span>{new Date(listing.created_at).toLocaleDateString()}</span>
			<span class="inline-flex items-center gap-1">
				View listing
				<i class="fa-solid fa-arrow-right text-[10px]"></i>
			</span>
		</div>
	</div>
</a>
