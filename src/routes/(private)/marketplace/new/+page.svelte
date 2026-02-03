<script lang="ts">
  import { superForm } from "sveltekit-superforms";

  const { data } = $props();

  const { form, errors, enhance, message, constraints } = superForm(data.form, {
    delayMs: 400,
    timeoutMs: 8000,
  });
</script>

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
      <label class="fieldset">
        <span class="label text-sm font-medium">Cube</span>
        <input
          name="cube"
          bind:value={$form.cube}
          placeholder="Gan 12 Maglev"
          class="input input-bordered w-full"
          {...$constraints.cube}
        />
        {#if $errors.cube}
          <span class="text-sm text-error">{$errors.cube}</span>
        {/if}
      </label>

      <div class="grid gap-4 md:grid-cols-2">
        <label class="fieldset">
          <span class="label text-sm font-medium">Condition</span>
          <select
            name="condition"
            bind:value={$form.condition}
            class="select select-bordered w-full"
            {...$constraints.condition}
          >
            {#each data.conditions as option}
              <option value={option}>{option}</option>
            {/each}
          </select>
          {#if $errors.condition}
            <span class="text-sm text-error">{$errors.condition}</span>
          {/if}
        </label>

        <label class="fieldset">
          <span class="label text-sm font-medium">Price</span>
          <div class="flex gap-2">
            <input
              name="priceAmount"
              type="number"
              step="0.01"
              min="0"
              bind:value={$form.priceAmount}
              class="input input-bordered w-full"
              {...$constraints.priceAmount}
            />
            <select
              name="priceCurrency"
              bind:value={$form.priceCurrency}
              class="select select-bordered"
              {...$constraints.priceCurrency}
            >
              {#each data.currencies as currency}
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
        <label class="fieldset">
          <span class="label text-sm font-medium">Country</span>
          <input
            name="locationCountry"
            bind:value={$form.locationCountry}
            placeholder="United States"
            class="input input-bordered w-full"
            {...$constraints.locationCountry}
          />
          {#if $errors.locationCountry}
            <span class="text-sm text-error">{$errors.locationCountry}</span>
          {/if}
        </label>
        <label class="fieldset">
          <span class="label text-sm font-medium">Region (optional)</span>
          <input
            name="locationRegion"
            bind:value={$form.locationRegion}
            placeholder="California"
            class="input input-bordered w-full"
            {...$constraints.locationRegion}
          />
        </label>
      </div>

      <div class="flex flex-col md:flex-row w-full gap-4">
        <label class="fieldset flex-1">
          <span class="label text-sm font-medium">Description (optional)</span>
          <textarea
            name="description"
            bind:value={$form.description}
            rows={4}
            class="textarea textarea-bordered w-full"
            placeholder="Mention magnets, mods, or included accessories"
            {...$constraints.description}
          ></textarea>
          {#if $errors.description}
            <span class="text-sm text-error">{$errors.description}</span>
          {/if}
        </label>
        <div class="flex-col flex-1">
          <label class="fieldset">
            <span class="label text-sm font-medium"
              >Listing image URL (optional)</span
            >
            <input
              name="imageUrl"
              bind:value={$form.imageUrl}
              placeholder="https://"
              class="input input-bordered w-full"
              {...$constraints.imageUrl}
            />
            {#if $errors.imageUrl}
              <span class="text-sm text-error">{$errors.imageUrl}</span>
            {/if}
          </label>
          <label class="fieldset">
            <span class="label text-sm font-medium">Contact details</span>
            <input
              name="contactDetails"
              bind:value={$form.contactDetails}
              placeholder="https://... or username"
              class="input input-bordered w-full"
              {...$constraints.contactDetails}
            />
            {#if $errors.contactDetails}
              <span class="text-sm text-error">{$errors.contactDetails}</span>
            {/if}
          </label>
        </div>
      </div>

      <div class="rounded-xl border border-base-300 bg-base-100 p-4">
        <h2 class="text-sm font-semibold uppercase text-base-content/60">
          Listing rules
        </h2>
        <p class="mt-2 text-sm text-base-content/70">
          You must accept each rule before posting.
        </p>
        <div class="mt-4 grid gap-3 text-sm">
          <label class="flex items-start gap-3">
            <input
              name="acceptAccurateListing"
              type="checkbox"
              bind:checked={$form.acceptAccurateListing}
              class="checkbox checkbox-sm"
              {...$constraints.acceptAccurateListing}
            />
            <span>
              I confirm the listing details and photos are accurate and current.
            </span>
          </label>
          {#if $errors.acceptAccurateListing}
            <span class="text-sm text-error">
              {$errors.acceptAccurateListing}
            </span>
          {/if}

          <label class="flex items-start gap-3">
            <input
              name="acceptOwnership"
              type="checkbox"
              bind:checked={$form.acceptOwnership}
              class="checkbox checkbox-sm"
              {...$constraints.acceptOwnership}
            />
            <span>
              I own this cube and have the right to sell it.
            </span>
          </label>
          {#if $errors.acceptOwnership}
            <span class="text-sm text-error">{$errors.acceptOwnership}</span>
          {/if}

          <label class="flex items-start gap-3">
            <input
              name="acceptSafeTransactions"
              type="checkbox"
              bind:checked={$form.acceptSafeTransactions}
              class="checkbox checkbox-sm"
              {...$constraints.acceptSafeTransactions}
            />
            <span>
              I will verify buyers and use safe payment and shipping methods.
            </span>
          </label>
          {#if $errors.acceptSafeTransactions}
            <span class="text-sm text-error">
              {$errors.acceptSafeTransactions}
            </span>
          {/if}

          <label class="flex items-start gap-3">
            <input
              name="acceptNoProhibitedItems"
              type="checkbox"
              bind:checked={$form.acceptNoProhibitedItems}
              class="checkbox checkbox-sm"
              {...$constraints.acceptNoProhibitedItems}
            />
            <span>
              My listing does not include prohibited items or illegal content.
            </span>
          </label>
          {#if $errors.acceptNoProhibitedItems}
            <span class="text-sm text-error">
              {$errors.acceptNoProhibitedItems}
            </span>
          {/if}

          <label class="flex items-start gap-3">
            <input
              name="acceptCommunication"
              type="checkbox"
              bind:checked={$form.acceptCommunication}
              class="checkbox checkbox-sm"
              {...$constraints.acceptCommunication}
            />
            <span>
              I will communicate respectfully and respond promptly to buyers.
            </span>
          </label>
          {#if $errors.acceptCommunication}
            <span class="text-sm text-error">
              {$errors.acceptCommunication}
            </span>
          {/if}
        </div>
      </div>

      <div
        class="rounded-xl border border-base-300 bg-base-200 p-4 text-sm text-base-content/70"
      >
        Your listing will be visible publicly. CubeIndex does not handle
        payments or shipping.
      </div>

      {#if $message}
        <p class="text-sm text-error">{$message}</p>
      {/if}

      <button class="btn btn-primary" type="submit">Post listing</button>
    </form>
  </div>
</section>
