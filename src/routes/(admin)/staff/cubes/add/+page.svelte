<script lang="ts">
  import { superForm } from "sveltekit-superforms";
  import { blur } from "svelte/transition";
  import { onMount } from "svelte";
  import { error } from "@sveltejs/kit";
  import { supabase } from "$lib/supabaseClient.js";
  import type { Cube } from "$lib/components/types/cube.js";
  import SearchCubes from "$lib/components/cube/searchCubes.svelte";

  const { data } = $props();
  const { brands, types, surfaces, subTypes } = data;

  let search = $state("");
  let searchCubes: {
    label: string;
    value: string;
  }[] = $state([]);

  $effect(() => {
    const _ = search;
    searchCubes = allCubes.filter((c) =>
      c.label.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Initialize form handling with options for JSON data and custom error handling
  const { form, allErrors, errors, constraints, message, enhance } = superForm(
    data.form,
    {
      dataType: "json",
      resetForm: false,
      onError({ result }) {
        // Handle server validation errors gracefully
        $message = result.error.message || "Unknown error";
      },
    }
  );

  let cubes: Cube[] = $state([]);
  let allCubes: {
    label: string;
    value: string;
  }[] = $state([]);

  // Example: These could come from a load function or API
  $effect(() => {
    const _ = cubes;
    allCubes = Array.from(
      new Set(
        cubes
          .filter((c) => c.version_type === "Base" && c.status === "Approved")
          .map((c) => ({
            label: `${c.series} ${c.model} ${c.version_name}`,
            value: c.slug,
          }))
      )
    ).sort();
  });

  onMount(async () => {
    const { data, error: cubesErr } = await supabase
      .from("cube_models")
      .select("*")
      .neq("status", "Rejected");
    if (cubesErr) throw error(500, cubesErr.message);
    cubes = data;
  });
</script>

<section
  class="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden py-10"
>
  <div class="w-full p-8 z-10">
    <h1 class="text-3xl font-clash font-bold text-center mb-6">Add a Cube</h1>
    <form method="POST" use:enhance class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm mb-1"
            >Series
            <input
              name="series"
              type="text"
              placeholder="GAN356"
              bind:value={$form.series}
              class="input w-full input-lg"
            />
          </label>
        </div>
        <div>
          <label class="block text-sm mb-1"
            >Model <span class="text-red-500">*</span>
            <input
              name="model"
              type="text"
              placeholder="Maglev"
              bind:value={$form.model}
              class="input w-full input-lg"
              required
            />
          </label>
        </div>
        {#if $form.versionType === "Trim" || $form.versionType === "Limited"}
          <div transition:blur>
            <label class="block text-sm mb-1"
              >Version <span class="text-red-500">*</span>
              <input
                name="version"
                type="text"
                placeholder="UV / 10 Year Edition"
                bind:value={$form.versionName}
                class="input w-full input-lg"
                required
              />
            </label>
          </div>
        {/if}
        <div>
          <label class="block text-sm mb-1"
            >Brand <span class="text-red-500">*</span>
            <select
              name="brand"
              bind:value={$form.brand}
              class="select select-lg w-full"
              required
            >
              <option value="___other">+ Add Brand</option>
              {#each brands as b}
                <option>{b.name}</option>
              {/each}
            </select>
          </label>
        </div>
        {#if $form.brand === "___other"}
          <div transition:blur>
            <label class="block text-sm mb-1"
              >Add Brand <span class="text-red-500">*</span>
              <input
                name="otherBrand"
                type="text"
                bind:value={$form.otherBrand}
                class="input w-full input-lg"
                required
              />
            </label>
          </div>
        {/if}
        <div>
          <label class="block text-sm mb-1"
            >Type <span class="text-red-500">*</span>
            <select
              name="type"
              bind:value={$form.type}
              class="select select-lg w-full"
              required
            >
              <option value="___other">+ Create Type</option>
              {#each types as t}
                <option>{t.name}</option>
              {/each}
            </select>
          </label>
        </div>
        {#if $form.type === "___other"}
          <div transition:blur>
            <label class="block text-sm mb-1"
              >Create Type <span class="text-red-500">*</span>
              <input
                name="otherType"
                type="text"
                bind:value={$form.otherType}
                class="input w-full input-lg"
                required
              />
            </label>
          </div>
        {/if}
        <div>
          <label class="block mb-1 text-sm">
            Sub Type
            <select
              name="subType"
              bind:value={$form.sub_type}
              class="select select-lg w-full"
              required
            >
              {#if subTypes.length === 0}
                <option>Loading...</option>
              {/if}
              <option value="auto">Handle Automatically</option>
              {#each subTypes as subType}
                <option value={subType}>{subType}</option>
              {/each}
            </select>
          </label>
          {#if $errors.sub_type}
            <span class="text-error">{$errors.sub_type}</span>
          {/if}
        </div>
        <div>
          <label class="block text-sm mb-1"
            >Release Date <span class="text-red-500">*</span>
            <input
              name="releaseDate"
              type="date"
              bind:value={$form.releaseDate}
              class="input w-full input-lg"
              required
            />
          </label>
        </div>
        <div>
          <label class="block text-sm mb-1"
            >Image URL <span class="text-red-500">*</span>
            <input
              name="imageUrl"
              type="url"
              bind:value={$form.imageUrl}
              class="input w-full input-lg"
              placeholder="https://..."
              required
            />
          </label>
        </div>
        <div>
          <label class="block text-sm mb-1"
            >Surface Finish <span class="text-red-500">*</span>
            <select
              name="surfaceFinish"
              bind:value={$form.surfaceFinish}
              class="select select-lg w-full"
              required
            >
              {#each surfaces as surface}
                <option>{surface}</option>
              {/each}
            </select>
          </label>
        </div>
        <div>
          <label class="block text-sm mb-1"
            >Weight <span class="text-red-500">*</span>
            <input
              name="weight"
              type="number"
              min="0"
              step="0.1"
              bind:value={$form.weight}
              class="input w-full input-lg"
              required
            />
          </label>
        </div>
        <div>
          <label class="block text-sm mb-1"
            >Size <span class="text-red-500">*</span>
            <input
              name="size"
              type="text"
              bind:value={$form.size}
              class="input w-full input-lg"
              required
            />
          </label>
        </div>
        <div>
          <label class="block text-sm mb-1"
            >Cube Type <span class="text-red-500">*</span>
            <select
              name="cubeVersion"
              bind:value={$form.versionType}
              class="select select-lg w-full"
              required
            >
              <option value="Base">Base</option>
              <option value="Trim">Trim</option>
              <option value="Limited">Limited Edition</option>
            </select>
          </label>
        </div>
        {#if $form.features.modded || $form.versionType !== "Base"}
          <div transition:blur>
            <label class="block mb-1 font-medium">
              Related To (Only approved cubes are shown)
              <SearchCubes cubes={allCubes} bind:outputVar={$form.relatedTo} />

              <input
                type="hidden"
                name="relatedTo"
                bind:value={$form.relatedTo}
              />
            </label>

            {#if $errors.relatedTo}
              <span class="text-error">{$errors.relatedTo}</span>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Toggles and rating -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div class="flex items-center gap-3">
          <input
            name="wcaLegal"
            type="checkbox"
            bind:checked={$form.features.wcaLegal}
            class="checkbox checkbox-md bg-base-100"
          />
          <label for="wca_legal" class="text-sm">WCA Legal</label>
        </div>
        <div class="flex items-center gap-3">
          <input
            name="magnetic"
            type="checkbox"
            bind:checked={$form.features.magnetic}
            class="checkbox checkbox-md bg-base-100"
          />
          <label for="magnetic" class="text-sm">Magnetic</label>
        </div>
        <div class="flex items-center gap-3">
          <input
            name="smart"
            type="checkbox"
            bind:checked={$form.features.smart}
            class="checkbox checkbox-md bg-base-100"
          />
          <label for="smart" class="text-sm">Smart</label>
        </div>
        <div class="flex items-center gap-3">
          <input
            name="modded"
            type="checkbox"
            bind:checked={$form.features.modded}
            class="checkbox checkbox-md bg-base-100"
          />
          <label for="modded" class="text-sm">Modded</label>
        </div>
        <div class="flex items-center gap-3">
          <input
            name="discontinued"
            type="checkbox"
            bind:checked={$form.discontinued}
            class="checkbox checkbox-md bg-base-100"
          />
          <label for="discontinued" class="text-sm">Discontinued</label>
        </div>
        <div class="flex items-center gap-3">
          <input
            name="maglev"
            type="checkbox"
            bind:checked={$form.features.maglev}
            class="checkbox checkbox-md bg-base-100"
          />
          <label for="maglev" class="text-sm">Maglev</label>
        </div>
        <div class="flex items-center gap-3">
          <input
            name="stickered"
            type="checkbox"
            bind:checked={$form.features.stickered}
            class="checkbox checkbox-md bg-base-100"
          />
          <label for="maglev" class="text-sm">Stickered</label>
        </div>
        <div class="flex items-center gap-3">
          <input
            name="ballCore"
            type="checkbox"
            bind:checked={$form.features.ballCore}
            class="checkbox checkbox-md bg-base-100"
          />
          <label class="text-sm" for="ballCore">Ball Core</label>
        </div>
      </div>

      <button type="submit" class="btn btn-primary btn-lg w-full">
        Submit Cube
      </button>
    </form>
    {#if $allErrors.length}
      <ul>
        {#each $allErrors as error}
          <li class="text-error">
            <b>{error.path}:</b>
            {error.messages.join(". ")}
          </li>
        {/each}
      </ul>
    {/if}
    {#if $message}
      <span class="flex {'text-success'} justify-center p-4"
        >{@html $message}</span
      >
    {/if}
  </div>
</section>
