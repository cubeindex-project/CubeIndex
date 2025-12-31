<script lang="ts">
	import type { PageData } from "./$types";
	import { onMount, onDestroy } from "svelte";
	import { fade } from "svelte/transition";

	let { data }: { data: PageData } = $props();
	let { profile, stats } = $derived(data);

	const nf = new Intl.NumberFormat(undefined, {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 2,
	});

	function fmtCurrency(value: number) {
		return nf.format(value ?? 0);
	}

	function pct(value: number, total: number) {
		if (total === 0) return "0%";
		return `${((value / total) * 100).toFixed(1)}%`;
	}

	const hasData = $derived(Boolean(stats?.total_count));

	type ChartCtor = typeof import("chart.js/auto").default;
	let ChartClass: ChartCtor | null = $state(null);
	let chartRefs: {
		brands: HTMLCanvasElement | null;
		stores: HTMLCanvasElement | null;
		types: HTMLCanvasElement | null;
		conditions: HTMLCanvasElement | null;
		valueBrand: HTMLCanvasElement | null;
		valueType: HTMLCanvasElement | null;
		valueStore: HTMLCanvasElement | null;
		rated: HTMLCanvasElement | null;
		monthlyCounts: HTMLCanvasElement | null;
		monthlySpend: HTMLCanvasElement | null;
		cumulativeSpend: HTMLCanvasElement | null;
		ratingBrand: HTMLCanvasElement | null;
		ratingType: HTMLCanvasElement | null;
	} = $state({
		brands: null,
		stores: null,
		types: null,
		conditions: null,
		valueBrand: null,
		valueType: null,
		valueStore: null,
		rated: null,
		monthlyCounts: null,
		monthlySpend: null,
		cumulativeSpend: null,
		ratingBrand: null,
		ratingType: null,
	});
	let chartInstances: Record<string, any> = $state({});

	onMount(async () => {
		const mod = await import("chart.js/auto");
		ChartClass = mod.default;
	});

	onDestroy(() => {
		Object.values(chartInstances).forEach((chart) => chart?.destroy?.());
	});

	type PieDatum = { label: string; value: number };
	type LineDatum = { label: string; value: number };

	function buildPieSeries(entries: { count?: number; value?: number }[], key: string): PieDatum[] {
		return entries.map((entry) => ({
			label: (entry as any)[key] ?? "Unknown",
			value: entry.count ?? entry.value ?? 0,
		}));
	}

	function buildLineSeries(entries: { month_iso: string; count?: number; value?: number }[]) {
		return entries.map((entry) => ({
			label: entry.month_iso,
			value: entry.count ?? entry.value ?? 0,
		}));
	}

	function groupSmallSlices(series: PieDatum[], threshold = 0.03) {
		const total = series.reduce((sum, s) => sum + s.value, 0);
		if (total === 0) return series;
		const major = series.filter((s) => s.value / total >= threshold);
		const minorTotal = total - major.reduce((s, m) => s + m.value, 0);
		return minorTotal > 0 ? [...major, { label: "Other", value: minorTotal }] : major;
	}

	function renderPie(id: keyof typeof chartRefs, series: PieDatum[]) {
		if (!ChartClass) return;
		const ctx = chartRefs[id];
		if (!ctx) return;
		chartInstances[id]?.destroy();
		chartInstances[id] = new ChartClass(ctx, {
			type: "pie",
			data: {
				labels: series.map((s) => s.label),
				datasets: [
					{
						data: series.map((s) => s.value),
						borderWidth: 1,
					},
				],
			},
			options: {
				plugins: {
					legend: { position: "bottom" },
					title: { display: false },
				},
			},
		});
	}

	function renderLine(id: keyof typeof chartRefs, series: LineDatum[], label: string) {
		if (!ChartClass) return;
		const ctx = chartRefs[id];
		if (!ctx) return;
		chartInstances[id]?.destroy();
		chartInstances[id] = new ChartClass(ctx, {
			type: "line",
			data: {
				labels: series.map((d) => d.label),
				datasets: [
					{
						label,
						data: series.map((d) => d.value),
						borderWidth: 2,
						pointRadius: 2,
						tension: 0.25,
					},
				],
			},
			options: {
				plugins: {
					legend: { display: false },
				},
				scales: {
					y: { beginAtZero: true },
				},
			},
		});
	}

	function renderBar(id: keyof typeof chartRefs, series: { label: string; value: number }[], title: string) {
		if (!ChartClass) return;
		const ctx = chartRefs[id];
		if (!ctx) return;
		chartInstances[id]?.destroy();
		chartInstances[id] = new ChartClass(ctx, {
			type: "bar",
			data: {
				labels: series.map((d) => d.label),
				datasets: [
					{
						label: title,
						data: series.map((d) => d.value),
						borderWidth: 1,
						backgroundColor: "rgba(59,130,246,0.7)",
					},
				],
			},
			options: {
				indexAxis: "y",
				plugins: { legend: { display: false } },
				scales: { x: { beginAtZero: true, max: 5 } },
			},
		});
	}

	$effect(() => {
		if (!ChartClass || !hasData) return;
		renderPie(
			"brands",
			groupSmallSlices(buildPieSeries(stats.brand_counts ?? [], "brand"))
		);
		renderPie(
			"stores",
			groupSmallSlices(buildPieSeries(stats.store_counts ?? [], "store_name"))
		);
		renderPie(
			"types",
			groupSmallSlices(buildPieSeries(stats.type_counts ?? [], "cube_type"))
		);
		renderPie(
			"conditions",
			groupSmallSlices(buildPieSeries(stats.condition_counts ?? [], "condition"))
		);
		renderPie(
			"valueBrand",
			groupSmallSlices(buildPieSeries(stats.value_by_brand ?? [], "brand"))
		);
		renderPie(
			"valueType",
			groupSmallSlices(buildPieSeries(stats.value_by_type ?? [], "cube_type"))
		);
		renderPie(
			"valueStore",
			groupSmallSlices(buildPieSeries(stats.value_by_store ?? [], "store_name"))
		);
		renderPie(
			"rated",
			[
				{ label: "Rated", value: stats.rated_vs_unrated?.rated_count ?? 0 },
				{ label: "Unrated", value: stats.rated_vs_unrated?.unrated_count ?? 0 },
			]
		);
		renderLine(
			"monthlyCounts",
			buildLineSeries(stats.monthly_counts ?? []),
			"Cubes"
		);
		renderLine(
			"monthlySpend",
			buildLineSeries(stats.monthly_spend ?? []),
			"Spend"
		);
		renderLine(
			"cumulativeSpend",
			buildLineSeries(stats.cumulative_spend ?? []),
			"Cumulative"
		);
		renderBar(
			"ratingBrand",
			(stats.avg_rating_by_brand ?? []).map((b) => ({
				label: b.brand ?? "Unknown",
				value: b.avg_rating ?? 0,
			})),
			"Average rating"
		);
		renderBar(
			"ratingType",
			(stats.avg_rating_by_type ?? []).map((t) => ({
				label: t.cube_type ?? "Unknown",
				value: t.avg_rating ?? 0,
			})),
			"Average rating"
		);
	});

	const histogramBins = $derived(stats.rating_histogram ?? []);
	const cadence = $derived(stats.cadence_counts ?? []);

	const cadenceGrid = $derived(() => {
		const today = new Date();
		const days: { date: string; count: number }[] = [];
		const map = new Map<string, number>();
		for (const entry of cadence) {
			map.set(entry.day_iso, entry.count);
		}
		for (let i = 0; i < 210; i += 1) {
			const d = new Date(today);
			d.setDate(today.getDate() - i);
			const iso = d.toISOString().slice(0, 10);
			days.push({ date: iso, count: map.get(iso) ?? 0 });
		}
		return days.reverse();
	});

	const cadenceMax = $derived(
		cadenceGrid.reduce((max, d) => (d.count > max ? d.count : max), 0)
	);
</script>

<svelte:head>
	<title>{profile.display_name}'s Statistics - CubeIndex</title>
</svelte:head>

<div class="space-y-8">
	<header class="space-y-1">
		<h1 class="text-2xl font-extrabold">
			{profile.display_name}'s Collection Stats
		</h1>
		<p class="text-sm text-base-content/70">
			Powered by historical vendor snapshots. Wishlisted cubes are excluded.
		</p>
	</header>

	{#if !hasData}
		<section class="rounded-2xl border border-dashed border-base-300 bg-base-200/60 p-10 text-center" transition:fade>
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
				<i class="fa-solid fa-chart-simple fa-2x"></i>
			</div>
			<h2 class="text-xl font-semibold">No cubes to show yet</h2>
			<p class="text-sm text-base-content/70">Add cubes to your collection to unlock rich stats and insights.</p>
		</section>
	{:else}
		<section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
			<div class="stat bg-base-200 rounded-xl shadow-sm">
				<div class="stat-title">Total cubes</div>
				<div class="stat-value text-3xl">{stats.total_count ?? 0}</div>
				<div class="stat-desc">Non-wishlisted only</div>
			</div>
			<div class="stat bg-base-200 rounded-xl shadow-sm">
				<div class="stat-title">Collection value</div>
				<div class="stat-value text-3xl">{fmtCurrency(stats.total_value ?? 0)}</div>
				<div class="stat-desc">Based on vendor snapshots</div>
			</div>
			<div class="stat bg-base-200 rounded-xl shadow-sm">
				<div class="stat-title">Average rating</div>
				<div class="stat-value text-3xl">
					{stats.avg_rating?.toFixed(2) ?? "0.00"}
				</div>
				<div class="stat-desc">From {stats.rated_count ?? 0} ratings</div>
			</div>
			<div class="stat bg-base-200 rounded-xl shadow-sm">
				<div class="stat-title">Net change since acquisition</div>
				<div class="stat-value text-3xl">{fmtCurrency(stats.total_net_change ?? 0)}</div>
				<div class="stat-desc">Across {stats.net_change_count ?? 0} cubes</div>
			</div>
		</section>

		<section class="grid gap-6 lg:grid-cols-3">
			<article class="card bg-base-200 shadow-sm" aria-label="Cubes per brand">
					<div class="card-body">
						<h2 class="card-title text-lg">Cubes per brand</h2>
					<canvas bind:this={chartRefs.brands}></canvas>
					<ul class="text-sm space-y-1">
						{#each stats.brand_counts ?? [] as b}
							<li class="flex justify-between"><span>{b.brand ?? "Unknown"}</span><span>{b.count}</span></li>
						{/each}
					</ul>
				</div>
			</article>
			<article class="card bg-base-200 shadow-sm" aria-label="Stores most used">
					<div class="card-body">
						<h2 class="card-title text-lg">Stores</h2>
					<canvas bind:this={chartRefs.stores}></canvas>
					<ul class="text-sm space-y-1">
						{#each stats.store_counts ?? [] as s}
							<li class="flex justify-between"><span>{s.store_name ?? "Unknown"}</span><span>{s.count}</span></li>
						{/each}
					</ul>
				</div>
			</article>
			<article class="card bg-base-200 shadow-sm" aria-label="Cubes by type">
					<div class="card-body">
						<h2 class="card-title text-lg">Types</h2>
					<canvas bind:this={chartRefs.types}></canvas>
					<ul class="text-sm space-y-1">
						{#each stats.type_counts ?? [] as t}
							<li class="flex justify-between"><span>{t.cube_type ?? "Unknown"}</span><span>{t.count}</span></li>
						{/each}
					</ul>
				</div>
			</article>
		</section>

		<section class="grid gap-6 lg:grid-cols-2">
			<article class="card bg-base-200 shadow-sm" aria-label="Cubes added over time">
					<div class="card-body">
						<h2 class="card-title text-lg">Cubes over time</h2>
					<canvas bind:this={chartRefs.monthlyCounts}></canvas>
					</div>
				</article>
				<article class="card bg-base-200 shadow-sm" aria-label="Condition breakdown">
					<div class="card-body">
						<h2 class="card-title text-lg">Condition</h2>
					<canvas bind:this={chartRefs.conditions}></canvas>
					<ul class="text-sm space-y-1">
						{#each stats.condition_counts ?? [] as c}
							<li class="flex justify-between"><span>{c.condition ?? "Unknown"}</span><span>{c.count}</span></li>
						{/each}
					</ul>
				</div>
			</article>
		</section>

		<section class="grid gap-6 lg:grid-cols-2">
			<article class="card bg-base-200 shadow-sm" aria-label="Collection value by brand">
					<div class="card-body">
						<h2 class="card-title text-lg">Value by brand</h2>
					<canvas bind:this={chartRefs.valueBrand}></canvas>
					</div>
				</article>
				<article class="card bg-base-200 shadow-sm" aria-label="Value by type">
					<div class="card-body">
						<h2 class="card-title text-lg">Value by type</h2>
					<canvas bind:this={chartRefs.valueType}></canvas>
					</div>
				</article>
			</section>

			<section class="grid gap-6 lg:grid-cols-2">
				<article class="card bg-base-200 shadow-sm" aria-label="Value by store">
					<div class="card-body">
						<h2 class="card-title text-lg">Value by store</h2>
					<canvas bind:this={chartRefs.valueStore}></canvas>
					</div>
				</article>
				<article class="card bg-base-200 shadow-sm" aria-label="Ratings distribution">
					<div class="card-body space-y-3">
						<h2 class="card-title text-lg">Ratings distribution</h2>
					<div class="grid grid-cols-6 gap-2 text-xs">
						{#each histogramBins as bin}
							<div class="space-y-1">
								<div class="h-20 bg-primary/30 rounded flex items-end justify-center">
									<div class="w-full bg-primary" style={`height:${bin.count * 14}px`} aria-label={`Rating ${bin.rating}: ${bin.count}`}></div>
								</div>
								<div class="text-center">{bin.rating}</div>
							</div>
						{/each}
						<div class="space-y-1">
							<div class="h-20 bg-base-300 rounded flex items-center justify-center text-xs">{stats.unrated_count ?? 0}</div>
							<div class="text-center">Unrated</div>
						</div>
					</div>
					<canvas bind:this={chartRefs.rated}></canvas>
					</div>
				</article>
			</section>

			<section class="grid gap-6 lg:grid-cols-2">
				<article class="card bg-base-200 shadow-sm" aria-label="Monthly spend">
					<div class="card-body">
						<h2 class="card-title text-lg">Monthly spend</h2>
					<canvas bind:this={chartRefs.monthlySpend}></canvas>
					</div>
				</article>
				<article class="card bg-base-200 shadow-sm" aria-label="Cumulative spend">
					<div class="card-body">
						<h2 class="card-title text-lg">Cumulative spend</h2>
					<canvas bind:this={chartRefs.cumulativeSpend}></canvas>
					</div>
				</article>
			</section>

			<section class="grid gap-6 lg:grid-cols-2">
				<article class="card bg-base-200 shadow-sm" aria-label="Average rating by brand">
					<div class="card-body">
						<h2 class="card-title text-lg">Average rating by brand</h2>
					<canvas bind:this={chartRefs.ratingBrand}></canvas>
					</div>
				</article>
				<article class="card bg-base-200 shadow-sm" aria-label="Average rating by cube type">
					<div class="card-body">
						<h2 class="card-title text-lg">Average rating by type</h2>
					<canvas bind:this={chartRefs.ratingType}></canvas>
					</div>
				</article>
			</section>

		<section class="card bg-base-200 shadow-sm" aria-label="New additions cadence">
			<div class="card-body space-y-3">
				<h2 class="card-title text-lg">New additions cadence</h2>
				<div class="grid grid-cols-7 sm:grid-cols-14 lg:grid-cols-21 xl:grid-cols-30 gap-1 text-[10px] sm:text-xs">
					{#each cadenceGrid as day, idx}
						{@const intensity = cadenceMax ? Math.min(1, day.count / cadenceMax) : 0}
						<div
							class="h-4 w-4 rounded"
							style={`background-color: rgba(59,130,246,${0.15 + intensity * 0.75});`}
							title={`${day.date}: ${day.count} added`}
							aria-label={`${day.date}: ${day.count} added`}
						></div>
					{/each}
				</div>
				<p class="text-xs text-base-content/70">Last 210 days • darker cells = more additions (acquired or added).</p>
			</div>
		</section>

		<section class="card bg-base-200 shadow-sm">
			<div class="card-body">
				<h2 class="card-title text-lg">Top lists</h2>
				<div class="grid gap-6 lg:grid-cols-2">
					<div>
						<h3 class="font-semibold mb-2">Most valuable</h3>
						<div class="overflow-x-auto">
							<table class="table table-sm">
								<thead>
									<tr>
										<th>Cube</th>
										<th>Brand</th>
										<th>Type</th>
										<th>Value</th>
									</tr>
								</thead>
								<tbody>
									{#each stats.top_most_valuable ?? [] as item}
										<tr>
											<td>{item.cube_name}</td>
											<td>{item.brand}</td>
											<td>{item.cube_type}</td>
											<td>{fmtCurrency(item.current_value)}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
					<div>
						<h3 class="font-semibold mb-2">Highest rated</h3>
						<div class="overflow-x-auto">
							<table class="table table-sm">
								<thead>
									<tr>
										<th>Cube</th>
										<th>Brand</th>
										<th>Type</th>
										<th>Rating</th>
									</tr>
								</thead>
								<tbody>
									{#each stats.top_highest_rated ?? [] as item}
										<tr>
											<td>{item.cube_name}</td>
											<td>{item.brand}</td>
											<td>{item.cube_type}</td>
											<td>{item.rating.toFixed(2)}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
					<div>
						<h3 class="font-semibold mb-2">Top brands</h3>
						<ul class="divide-y divide-base-300">
							{#each stats.top_brands ?? [] as b}
								<li class="flex justify-between py-1"><span>{b.brand}</span><span>{b.count}</span></li>
							{/each}
						</ul>
					</div>
					<div>
						<h3 class="font-semibold mb-2">Top stores</h3>
						<ul class="divide-y divide-base-300">
							{#each stats.top_stores ?? [] as s}
								<li class="flex justify-between py-1"><span>{s.store_name}</span><span>{s.count}</span></li>
							{/each}
						</ul>
					</div>
					<div>
						<h3 class="font-semibold mb-2">Top gainers</h3>
						<div class="overflow-x-auto">
							<table class="table table-sm">
								<thead>
									<tr>
										<th>Cube</th>
										<th>Net</th>
									</tr>
								</thead>
								<tbody>
									{#each stats.top_gainers ?? [] as g}
										<tr>
											<td>{g.cube_name}</td>
											<td class="text-success">{fmtCurrency(g.net_change)}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
					<div>
						<h3 class="font-semibold mb-2">Top losers</h3>
						<div class="overflow-x-auto">
							<table class="table table-sm">
								<thead>
									<tr>
										<th>Cube</th>
										<th>Net</th>
									</tr>
								</thead>
								<tbody>
									{#each stats.top_losers ?? [] as l}
										<tr>
											<td>{l.cube_name}</td>
											<td class="text-error">{fmtCurrency(l.net_change)}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</section>
	{/if}
</div>
