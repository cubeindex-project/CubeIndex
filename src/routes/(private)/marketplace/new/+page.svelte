<script lang="ts">
	import { superForm } from "sveltekit-superforms";

	const { data } = $props();

	const { form, errors, enhance, message } = superForm(data.form, {
		delayMs: 400,
		timeoutMs: 8000,
	});

	const currencies = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD"];
	const contactMethods = [
		{ value: "external", label: "External link" },
		{ value: "email", label: "Email" },
		{ value: "discord", label: "Discord" },
		{ value: "other", label: "Other" },
	];
</script>

<svelte:head>
	<title>Post a listing - Cube Marketplace</title>
</svelte:head>

<section class="mx-auto w-full max-w-3xl px-4 pb-16 pt-10 md:px-6">
	<div class="mb-6">
		<a href="/marketplace" class="text-sm text-primary hover:underline">
			<i class="fa-solid fa-arrow-left"></i>
			Back to marketplace
		</a>
	</div>

	<div class="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
		<h1 class="text-3xl font-clash font-bold">Post a listing</h1>
		<p class="mt-2 text-sm text-base-content/70">
			Provide accurate details so buyers can reach you off-platform.
		</p>

		<form method="POST" class="mt-6 grid gap-5" use:enhance>
			<label class="form-control">
				<span class="label-text text-sm font-medium">Cube name</span>
				<input
					name="cubeName"
					bind:value={$form.cubeName}
					placeholder="Gan 12 Maglev"
					class="input input-bordered"
					required
				/>
				{#if $errors.cubeName}
					<span class="text-sm text-error">{$errors.cubeName}</span>
				{/if}
			</label>

			<label class="form-control">
				<span class="label-text text-sm font-medium">Cube slug (optional)</span>
				<input
					name="cubeSlug"
					bind:value={$form.cubeSlug}
					placeholder="gan-12-maglev"
					class="input input-bordered"
				/>
			</label>

			<div class="grid gap-4 md:grid-cols-2">
				<label class="form-control">
					<span class="label-text text-sm font-medium">Condition</span>
					<select
						name="condition"
						bind:value={$form.condition}
						class="select select-bordered"
						required
					>
						{#each data.conditions as option}
							<option value={option}>{option}</option>
						{/each}
					</select>
					{#if $errors.condition}
						<span class="text-sm text-error">{$errors.condition}</span>
					{/if}
				</label>

				<label class="form-control">
					<span class="label-text text-sm font-medium">Price</span>
					<div class="flex gap-2">
						<input
							name="priceAmount"
							type="number"
							step="0.01"
							min="0"
							bind:value={$form.priceAmount}
							class="input input-bordered w-full"
							required
						/>
						<select
							name="priceCurrency"
							bind:value={$form.priceCurrency}
							class="select select-bordered"
							required
						>
							{#each currencies as currency}
								<option value={currency}>{currency}</option>
							{/each}
						</select>
					</div>
					{#if $errors.priceAmount}
						<span class="text-sm text-error">{$errors.priceAmount}</span>
					{/if}
					{#if $errors.priceCurrency}
						<span class="text-sm text-error">{$errors.priceCurrency}</span>
					{/if}
				</label>
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				<label class="form-control">
					<span class="label-text text-sm font-medium">Country</span>
					<input
						name="locationCountry"
						bind:value={$form.locationCountry}
						maxlength="2"
						placeholder="US"
						class="input input-bordered"
						required
					/>
					{#if $errors.locationCountry}
						<span class="text-sm text-error">{$errors.locationCountry}</span>
					{/if}
				</label>
				<label class="form-control">
					<span class="label-text text-sm font-medium">Region (optional)</span>
					<input
						name="locationRegion"
						bind:value={$form.locationRegion}
						placeholder="California"
						class="input input-bordered"
					/>
				</label>
			</div>

			<label class="form-control">
				<span class="label-text text-sm font-medium">Description (optional)</span>
				<textarea
					name="description"
					bind:value={$form.description}
					rows={4}
					class="textarea textarea-bordered"
					placeholder="Mention magnets, mods, or included accessories"
				></textarea>
				{#if $errors.description}
					<span class="text-sm text-error">{$errors.description}</span>
				{/if}
			</label>

			<label class="form-control">
				<span class="label-text text-sm font-medium">Listing image URL (optional)</span>
				<input
					name="imageUrl"
					bind:value={$form.imageUrl}
					placeholder="https://"
					class="input input-bordered"
				/>
				{#if $errors.imageUrl}
					<span class="text-sm text-error">{$errors.imageUrl}</span>
				{/if}
			</label>

			<div class="grid gap-4 md:grid-cols-2">
				<label class="form-control">
					<span class="label-text text-sm font-medium">Contact method</span>
					<select
						name="contactMethod"
						bind:value={$form.contactMethod}
						class="select select-bordered"
						required
					>
						{#each contactMethods as method}
							<option value={method.value}>{method.label}</option>
						{/each}
					</select>
					{#if $errors.contactMethod}
						<span class="text-sm text-error">{$errors.contactMethod}</span>
					{/if}
				</label>
				<label class="form-control">
					<span class="label-text text-sm font-medium">Contact details</span>
					<input
						name="contactValue"
						bind:value={$form.contactValue}
						placeholder="https://... or username"
						class="input input-bordered"
						required
					/>
					{#if $errors.contactValue}
						<span class="text-sm text-error">{$errors.contactValue}</span>
					{/if}
				</label>
			</div>

			<div class="rounded-xl border border-base-300 bg-base-200 p-4 text-sm text-base-content/70">
				Your listing will be visible publicly. CubeIndex does not handle payments or
				shipping.
			</div>

			{#if $message}
				<p class="text-sm text-error">{$message}</p>
			{/if}

			<button class="btn btn-primary" type="submit">Post listing</button>
		</form>
	</div>
</section>
