<script lang="ts">
	import MarketplaceCard from "$lib/components/marketplace/MarketplaceCard.svelte";

	const { data } = $props();

	const totalPages = Math.max(1, Math.ceil(data.count / data.size));
	const previousPage = Math.max(1, data.page - 1);
	const nextPage = Math.min(totalPages, data.page + 1);

	const conditions = [
		"",
		"New in box",
		"New",
		"Good",
		"Fair",
		"Worn",
		"Poor",
		"Broken",
	];

	const buildPageUrl = (page: number) => {
		const params = new URLSearchParams();
		params.set("page", String(page));
		params.set("size", String(data.size));
		if (data.query) params.set("q", data.query);
		if (data.condition) params.set("condition", data.condition);
		if (data.country) params.set("country", data.country);
		return `/marketplace?${params.toString()}`;
	};
</script>

<svelte:head>
	<title>Cube Marketplace - CubeIndex</title>
</svelte:head>

<section class="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-16 pt-10 md:px-6">
	<div class="flex flex-col gap-4">
		<div class="flex flex-wrap items-start justify-between gap-4">
			<div>
				<h1 class="text-3xl font-clash font-bold">Cube Marketplace</h1>
				<p class="text-sm text-base-content/70">
					Browse listings from the community. All communication and transactions happen off-platform.
				</p>
			</div>
			{#if data.user}
				<a class="btn btn-primary" href="/marketplace/new">
					<i class="fa-solid fa-tag"></i>
					Post a listing
				</a>
			{:else}
				<a class="btn btn-outline" href="/auth/login">
					Log in to post
				</a>
			{/if}
		</div>

		<form method="GET" class="grid gap-4 rounded-2xl border border-base-300 bg-base-100 p-4 md:grid-cols-4">
			<label class="form-control">
				<span class="label-text text-sm font-medium">Search</span>
				<input
					name="q"
					type="text"
					value={data.query}
					placeholder="Cube name"
					class="input input-bordered"
				/>
			</label>
			<label class="form-control">
				<span class="label-text text-sm font-medium">Condition</span>
				<select name="condition" class="select select-bordered">
					{#each conditions as option}
						<option value={option} selected={option === data.condition}>
							{option || "Any condition"}
						</option>
					{/each}
				</select>
			</label>
			<label class="form-control">
				<span class="label-text text-sm font-medium">Country</span>
				<input
					name="country"
					type="text"
					value={data.country}
					maxlength="2"
					placeholder="US"
					class="input input-bordered"
				/>
			</label>
			<div class="flex items-end">
				<button class="btn btn-primary w-full" type="submit">
					Apply filters
				</button>
			</div>
		</form>
	</div>

	{#if data.listings.length === 0}
		<div class="rounded-2xl border border-dashed border-base-300 bg-base-100 p-10 text-center">
			<p class="text-lg font-semibold">No listings yet</p>
			<p class="text-sm text-base-content/70">
				Try adjusting your filters or be the first to post a cube for sale.
			</p>
		</div>
	{:else}
		<div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
			{#each data.listings as listing}
				<MarketplaceCard {listing} />
			{/each}
		</div>
	{/if}

	<div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-base-300 bg-base-100 px-4 py-3 text-sm">
		<span>Page {data.page} of {totalPages}</span>
		<div class="flex gap-2">
			<a
				class="btn btn-sm btn-outline"
				class:btn-disabled={data.page <= 1}
				aria-disabled={data.page <= 1}
				href={buildPageUrl(previousPage)}
				tabindex={data.page <= 1 ? -1 : 0}
			>
				Previous
			</a>
			<a
				class="btn btn-sm btn-outline"
				class:btn-disabled={data.page >= totalPages}
				aria-disabled={data.page >= totalPages}
				href={buildPageUrl(nextPage)}
				tabindex={data.page >= totalPages ? -1 : 0}
			>
				Next
			</a>
		</div>
	</div>
</section>
