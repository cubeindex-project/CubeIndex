<script lang="ts">
	import type { PageData } from "./$types";

	const { data } = $props<{ data: PageData }>();
	const runs = $derived(data.runs ?? []);

	const dtFormatter = new Intl.DateTimeFormat(undefined, {
		dateStyle: "medium",
		timeStyle: "short",
	});

	const formatDateTime = (value: string | null) =>
		value ? dtFormatter.format(new Date(value)) : "—";

	const formatStatus = (status: string) =>
		status
			.split("_")
			.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
			.join(" ");

	const statusBadge = (status: string) => {
		const normalized = status.toLowerCase();
		if (normalized === "completed" || normalized === "done") return "badge-success";
		if (normalized === "running" || normalized === "in_progress") return "badge-info";
		if (normalized === "failed" || normalized === "error") return "badge-error";
		return "badge-warning";
	};

	const safeName = (name: string | null, id: number) => name?.trim() || `Run #${id}`;

	const shorten = (value: string, length = 96) =>
		value.length > length ? `${value.slice(0, length - 1)}…` : value;

	let expandedErrorId: number | null = $state(null);
	const toggleError = (id: number) => {
		expandedErrorId = expandedErrorId === id ? null : id;
	};
</script>

<svelte:head>
	<title>Import Jobs Monitor - CubeIndex</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
	<header class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
		<div class="space-y-1">
			<h1 class="text-3xl font-clash tracking-tight text-base-content">Import Jobs Monitor</h1>
			<p class="text-sm text-base-content/70">
				Review all queued import jobs across CubeIndex. Failed jobs surface their error message
				for quick follow-up.
			</p>
		</div>
		<a href="/staff/dashboard" class="btn btn-outline btn-sm">
			<i class="fa-solid fa-gauge" aria-hidden="true"></i>
			<span>Back to staff hub</span>
		</a>
	</header>

	<section class="rounded-3xl border border-base-200 bg-base-100/80 shadow-sm">
		<div class="flex items-center justify-between gap-4 border-b border-base-200 px-6 py-4">
			<h2 class="text-lg font-semibold text-base-content">Recent activity</h2>
			<p class="text-xs text-base-content/60">
				Displaying the {runs.length} most recent jobs (latest first)
			</p>
		</div>
		<div class="overflow-x-auto">
			<table class="table table-zebra">
				<thead class="text-xs uppercase text-base-content/70">
					<tr>
						<th class="whitespace-nowrap">Run</th>
						<th class="whitespace-nowrap">Status</th>
						<th class="whitespace-nowrap">URLs</th>
						<th class="whitespace-nowrap">Requested by</th>
						<th class="whitespace-nowrap">Queued</th>
						<th class="whitespace-nowrap">Finished</th>
						<th class="whitespace-nowrap">Error</th>
					</tr>
				</thead>
				<tbody class="text-sm">
					{#if runs.length === 0}
						<tr>
							<td colspan="7" class="py-10 text-center text-base-content/60">
								No jobs have been queued yet.
							</td>
						</tr>
					{:else}
						{#each runs as run (run.id)}
							<tr class={run.error_message ? "align-top bg-error/10" : "align-top"}>
								<td class="font-medium text-base-content">
									{safeName(run.name, run.id)}
									<div class="text-[0.7rem] text-base-content/60">
										ID {run.id.toString()}
									</div>
								</td>
								<td>
									<span class={`badge badge-sm ${statusBadge(run.status)}`}>
										{formatStatus(run.status)}
									</span>
								</td>
								<td>
									<span class="badge badge-outline badge-sm">
										{run.urls.length}
										<span class="sr-only"> queued URLs</span>
									</span>
								</td>
								<td>
									{#if run.user}
										<div class="flex flex-col leading-tight">
											<span class="font-medium">
												{run.user.display_name ?? run.user.username ?? "Unknown user"}
											</span>
											{#if run.user.username}
												<span class="text-[0.7rem] text-base-content/60">
													@{run.user.username}
												</span>
											{/if}
										</div>
									{:else}
										<span class="text-base-content/50">Unknown</span>
									{/if}
								</td>
								<td>{formatDateTime(run.created_at)}</td>
								<td>{formatDateTime(run.finished_at)}</td>
								<td class="max-w-xs">
									{#if run.error_message}
										<button
											class="w-full rounded-xl border border-error/40 bg-error/10 px-3 py-2 text-left text-xs text-error transition hover:bg-error/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
											type="button"
											onclick={() => toggleError(run.id)}
											aria-expanded={expandedErrorId === run.id}
											aria-controls={`run-error-${run.id}`}
										>
											<span id={`run-error-${run.id}`}>
												{expandedErrorId === run.id
													? run.error_message
													: shorten(run.error_message)}
											</span>
										</button>
									{:else}
										<span class="text-base-content/40">—</span>
									{/if}
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</section>
</div>
