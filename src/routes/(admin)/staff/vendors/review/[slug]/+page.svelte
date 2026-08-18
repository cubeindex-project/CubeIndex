<script lang="ts">
	import SubmissionStatusManager from "$lib/components/staff/SubmissionStatusManager.svelte";
	import { formatDate } from "$lib/utils/formatDate";

	const { data } = $props();
	const { vendor } = $derived(data);
</script>

<section class="mx-auto max-w-6xl space-y-8 px-6 py-12">
	<header class="space-y-3">
		<h1 class="font-clash text-4xl font-semibold">{vendor.name}</h1>
	</header>

	<div class="grid items-start gap-8 lg:grid-cols-[minmax(0,2fr)_20rem]">
		<main class="space-y-6">
			{#if vendor.logo_url}
				<figure class="rounded-2xl border border-base-300 bg-base-200 p-6">
					<img
						src={vendor.logo_url}
						alt={`${vendor.name} logo`}
						class="mx-auto max-h-72 w-full object-contain"
					/>
				</figure>
			{/if}

			<section class="rounded-2xl border border-base-300 p-6">
				<h2 class="mb-5 text-xl font-semibold">Vendor details</h2>
				<dl class="grid gap-5 sm:grid-cols-2">
					<div>
						<dt class="text-sm text-base-content/60">Homepage</dt>
						<dd>
							<a
								class="link"
								href={vendor.base_url}
								target="_blank"
								rel="noreferrer"
							>
								{vendor.base_url}
							</a>
						</dd>
					</div>
					<div>
						<dt class="text-sm text-base-content/60">Country</dt>
						<dd class="font-medium">{vendor.country_iso}</dd>
					</div>
					<div>
						<dt class="text-sm text-base-content/60">Currency</dt>
						<dd class="font-medium">{vendor.currency}</dd>
					</div>
				</dl>
			</section>
		</main>

		<aside class="space-y-6 lg:sticky lg:top-24">
			<section class="rounded-2xl border border-base-300 bg-base-200 p-6">
				<h2 class="mb-4 text-xl font-semibold">Submission</h2>
				<dl class="space-y-4">
					<div>
						<dt class="text-sm text-base-content/60">Submitted by</dt>
						<dd>{vendor.submitter?.display_name ?? "Unknown user"}</dd>
					</div>
					<div>
						<dt class="text-sm text-base-content/60">Submitted at</dt>
						<dd>{formatDate(vendor.created_at)}</dd>
					</div>
					<div>
						<dt class="text-sm text-base-content/60">Status</dt>
						<dd class="badge">{vendor.status}</dd>
					</div>
				</dl>
			</section>

			{#if vendor.status === "Pending"}
				<section class="rounded-2xl border border-base-300 p-6">
					<h2 class="mb-4 text-xl font-semibold">Decision</h2>
					<SubmissionStatusManager submission={vendor} entityLabel="vendor" />
				</section>
			{/if}
		</aside>
	</div>
</section>
