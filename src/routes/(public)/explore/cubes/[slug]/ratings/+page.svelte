<script lang="ts">
	import UserRatings from "$lib/components/rating/userRatings.svelte";
	import type { Cube } from "$lib/components/dbTableTypes";

	let { data } = $props();
	let {
		cube = {} as Cube,
		user_cube_ratings = [] as any[],
	} = $derived(data);

	const pageTitle = $derived(
		`${cube.series} ${cube.model}${
			cube.version_name ? ` ${cube.version_name}` : ""
		} - Ratings`
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
			<a href="/explore/cubes/{cube.slug}/price" class="btn btn-sm"
				>Price Tracking</a
			>
			<a
				href="/explore/cubes/{cube.slug}/ratings"
				class="btn btn-sm btn-primary"
				>Ratings</a
			>
		</nav>

		<UserRatings {user_cube_ratings} {cube} />
	</div>
</section>

