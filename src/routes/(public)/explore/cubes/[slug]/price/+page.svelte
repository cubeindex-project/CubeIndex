<script lang="ts">
	import type { Cube, CubeVendorLinks } from "$lib/components/dbTableTypes";

	let { data } = $props();
	let {
		cube = {} as Cube,
		vendor_links = [] as CubeVendorLinks[],
	} = $derived(data);

	const pageTitle = $derived(
		`${cube.series} ${cube.model}${
			cube.version_name ? ` ${cube.version_name}` : ""
		} - Price Tracking`
	);
</script>

<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

<section class="min-h-screen px-6 py-16">
	<div class="max-w-4xl mx-auto">
		<h1 class="text-3xl font-bold mb-4">
			{cube.series} {cube.model}
			{#if cube.version_type !== "Base"}
				<span class="text-secondary"> {cube.version_name}</span>
			{/if}
		</h1>

		<nav class="mb-6 flex flex-wrap gap-2">
			<a href="/explore/cubes/{cube.slug}" class="btn btn-sm">Details</a>
			<a
				href="/explore/cubes/{cube.slug}/price"
				class="btn btn-sm btn-primary"
				>Price Tracking</a
			>
			<a href="/explore/cubes/{cube.slug}/ratings" class="btn btn-sm"
				>Ratings</a
			>
		</nav>

		{#if vendor_links.length > 0}
			<div class="my-8">
				<h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
					<i class="fa-solid fa-cart-shopping"></i>
					Available at:
				</h2>
				<div class="flex flex-wrap gap-3">
					{#each vendor_links as shop}
						<a
							href={shop.url}
							target="_blank"
							rel="noopener noreferrer"
							class="btn btn-outline {shop.available ? 'btn-primary' : 'btn-error'}"
						>
							{#if shop.available}
								<i class="fa-solid fa-check"></i>
							{:else}
								<i class="fa-solid fa-xmark"></i>
							{/if}
							{shop.vendor_name} ・ ≃ {shop.price} $
						</a>
					{/each}
				</div>
			</div>
		{:else}
			<p>No vendor information available.</p>
		{/if}
	</div>
</section>

