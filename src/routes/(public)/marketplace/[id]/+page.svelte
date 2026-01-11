<script lang="ts">
	const { data } = $props();

	const displayName =
		data.listing.seller?.display_name ||
		data.listing.seller?.username ||
		"Seller";
	const displayImage =
		data.listing.image_url ||
		data.listing.cube?.image_url ||
		"/images/CubeIndex_Logo.webp";
	const displayLocation = data.listing.location_region
		? `${data.listing.location_region}, ${data.listing.location_country}`
		: data.listing.location_country;
	const priceFormatter = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: data.listing.price_currency,
	});
</script>

<svelte:head>
	<title>{data.listing.cube?.model ?? data.listing.cube_name} - Marketplace</title>
</svelte:head>

<section class="mx-auto w-full max-w-5xl px-4 pb-16 pt-10 md:px-6">
	<a href="/marketplace" class="text-sm text-primary hover:underline">
		<i class="fa-solid fa-arrow-left"></i>
		Back to marketplace
	</a>

	<div class="mt-6 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
		<div class="space-y-6">
			<div class="overflow-hidden rounded-2xl border border-base-300 bg-base-100">
				<img
					src={displayImage}
					alt={data.listing.cube?.model ?? data.listing.cube_name}
					class="h-full w-full object-cover"
					loading="lazy"
				/>
			</div>
			<div class="rounded-2xl border border-base-300 bg-base-100 p-6">
				<h1 class="text-3xl font-clash font-bold">
					{data.listing.cube?.model ?? data.listing.cube_name}
				</h1>
				{#if data.listing.cube?.brand}
					<p class="mt-1 text-sm text-base-content/70">
						{data.listing.cube.brand}
					</p>
				{/if}
				<p class="mt-4 text-lg font-semibold text-primary">
					{priceFormatter.format(data.listing.price_amount)}
				</p>
				<div class="mt-4 grid gap-3 text-sm text-base-content/80">
					<div class="flex items-center justify-between">
						<span class="font-semibold">Condition</span>
						<span>{data.listing.condition}</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="font-semibold">Location</span>
						<span>{displayLocation}</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="font-semibold">Listed by</span>
						<span>{displayName}</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="font-semibold">Posted</span>
						<span>{new Date(data.listing.created_at).toLocaleDateString()}</span>
					</div>
				</div>
				{#if data.listing.description}
					<p class="mt-5 whitespace-pre-line text-sm text-base-content/80">
						{data.listing.description}
					</p>
				{/if}
			</div>
		</div>

		<aside class="space-y-4">
			<div class="rounded-2xl border border-base-300 bg-base-100 p-5">
				<h2 class="text-lg font-semibold">Contact seller</h2>
				<p class="mt-2 text-sm text-base-content/70">
					Communication and transactions happen outside CubeIndex.
				</p>
				<div class="mt-4 rounded-xl border border-base-300 bg-base-200 p-4 text-sm">
					<p class="font-semibold uppercase text-xs text-base-content/60">
						{data.listing.contact_method}
					</p>
					<p class="mt-1 break-words text-base-content">
						{data.listing.contact_value}
					</p>
				</div>
			</div>

			<div class="rounded-2xl border border-base-300 bg-base-100 p-5">
				<h3 class="text-sm font-semibold uppercase text-base-content/60">
					Marketplace reminder
				</h3>
				<p class="mt-2 text-sm text-base-content/70">
					Verify details with the seller before paying. CubeIndex does not process
					payments or shipping.
				</p>
			</div>
		</aside>
	</div>
</section>
