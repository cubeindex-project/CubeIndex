<script lang="ts">
	import { formatDate } from '$lib/components/helper_functions/formatDate.svelte.js';

	const { data } = $props();

	const listing = $derived(data.listing);

	const displayLocation = $derived(listing.location_region
		? `${listing.location_region}, ${listing.location_country}`
		: listing.location_country);

	const priceFormatter = $derived(new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: listing.currency,
	}));
</script>

<section class="mx-auto w-full max-w-5xl px-4 pb-16 pt-10 md:px-6">
	<div class="flex flex-wrap items-center gap-3 text-sm">
		<a href="/marketplace" class="text-primary hover:underline">
			<i class="fa-solid fa-arrow-left"></i>
			Back to marketplace
		</a>
	</div>

	<div class="mt-6 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
		<div class="space-y-6">
			<div
				class="overflow-hidden rounded-2xl border border-base-300 bg-base-100"
			>
				<div class="relative aspect-[4/3] w-full bg-base-200">
					<img
						src={listing.image_url}
						alt={listing.cube}
						class="h-full w-full object-cover"
						loading="lazy"
					/>
					<div
						class="absolute inset-0 bg-gradient-to-t from-base-100/70 via-transparent to-transparent"
					></div>
				</div>
			</div>
			<div class="rounded-2xl border border-base-300 bg-base-100 p-6">
				<div class="flex flex-wrap items-start justify-between gap-4">
					<div>
						<h1 class="text-3xl font-clash font-bold">
							{listing.cube}
						</h1>
						<p class="mt-2 text-sm text-base-content/70">
							Listed by
							<a class="link" href="/user/{listing.seller.username}">
								{listing.seller.display_name}
							</a>
						</p>
					</div>
					<div class="rounded-xl bg-base-200 px-4 py-3 text-right">
						<p class="text-xs font-semibold uppercase text-base-content/60">
							Price
						</p>
						<p class="text-2xl font-bold text-primary">
							{priceFormatter.format(listing.price)}
						</p>
					</div>
				</div>
				<div
					class="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase text-base-content/70"
				>
					<span class="badge badge-outline">{listing.condition}</span>
					<span class="badge badge-outline">{displayLocation}</span>
					<span class="badge badge-outline">
						Posted {formatDate(listing.created_at)}
					</span>
				</div>
				<div class="mt-6 grid gap-4 rounded-xl bg-base-200/60 p-4 text-sm">
					<div class="flex items-center justify-between">
						<span class="font-semibold text-base-content/70">Condition</span>
						<span>{listing.condition}</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="font-semibold text-base-content/70">Location</span>
						<span>{displayLocation}</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="font-semibold text-base-content/70">Posted</span>
						<span>{formatDate(listing.created_at)}</span>
					</div>
				</div>
				{#if listing.description}
					<div class="mt-6 border-t border-base-300 pt-5">
						<h2 class="text-sm font-semibold uppercase text-base-content/60">
							Description
						</h2>
						<p class="mt-2 whitespace-pre-line text-sm text-base-content/80">
							{listing.description}
						</p>
					</div>
				{/if}
			</div>
		</div>

		<aside class="space-y-4">
			<div class="rounded-2xl border border-base-300 bg-base-100 p-5">
				<div class="flex items-start justify-between gap-3">
					<div class="flex items-center gap-3">
						<div
							class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"
						>
							<i class="fa-solid fa-message text-sm"></i>
						</div>
						<div>
							<h2 class="text-lg font-semibold">Contact seller</h2>
							<p class="text-xs text-base-content/60">
								Use the details below to reach out.
							</p>
						</div>
					</div>
				</div>
				<p class="mt-4 text-sm text-base-content/70">
					Communication and transactions happen outside CubeIndex.
				</p>
				<div
					class="mt-4 rounded-xl border border-base-300 bg-base-200 p-4 text-sm"
				>
					<p class="text-xs font-semibold uppercase text-base-content/60">
						Contact details
					</p>
					<p class="mt-2 font-semibold text-base-content">
						{listing.contact_details}
					</p>
				</div>
			</div>

			<div class="rounded-2xl border border-base-300 bg-base-100 p-5">
				<h3 class="text-sm font-semibold uppercase text-base-content/60">
					Marketplace reminder
				</h3>
				<p class="mt-2 text-sm text-base-content/70">
					Verify details with the seller before paying. CubeIndex does not
					process payments or shipping. CubeIndex is not responsible for
					anything that happens outside this platform.
				</p>
			</div>
		</aside>
	</div>
</section>
