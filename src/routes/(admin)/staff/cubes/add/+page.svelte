<script lang="ts">
  import { superForm } from "sveltekit-superforms";
  import { blur } from "svelte/transition";
  import { onMount } from "svelte";
  import { error } from "@sveltejs/kit";
  import { supabase } from "$lib/supabaseClient.js";
  import type { CubeType } from "$lib/components/cube.svelte.js";

  const { data } = $props();

  // Initialize form handling with options for JSON data and custom error handling
  const { form, allErrors, errors, constraints, message, enhance } = superForm(
    data.form,
    {
      resetForm: false,
      onError({ result }) {
        // Handle server validation errors gracefully
        $message = result.error.message || "Unknown error";
      },
    }
  );

  let cubes: CubeType[] = $state([]);
  let allTypes: () => string[] = $state(() => []);
  let allBrands: () => string[] = $state(() => []);
  let allCubes: () => {
    label: string;
    value: string;
  }[] = $state(() => []);

  // Example: These could come from a load function or API
  $effect(() => {
    const _ = cubes;
    allTypes = () => Array.from(new Set(cubes.map((c) => c.type))).sort();
    allBrands = () => Array.from(new Set(cubes.map((c) => c.brand))).sort();
    allCubes = () =>
      Array.from(
        new Set(
          cubes
            .filter((c) => c.version_type === "Base")
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
    <h1 class="text-3xl font-clash font-bold text-center mb-6">
      Submit a Cube
    </h1>
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
              <option value="disabled" selected>Select Brand</option>
              {#each allBrands() as b}
                <option value={b}>{b}</option>
              {/each}
              <option value="___other">Other...</option>
            </select>
          </label>
        </div>
        {#if $form.brand === "___other"}
          <div transition:blur>
            <label class="block text-sm mb-1"
              >Other Brand <span class="text-red-500">*</span>
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
            >Type <span class="text-red-500">*</span> (If the type you need
            isn't listed, please contact the staff.)
            <select
              name="type"
              bind:value={$form.type}
              class="select select-lg w-full"
              required
            >
              <option value="disabled" selected>Select Type</option>
              {#each allTypes() as t}
                <option value={t}>{t}</option>
              {/each}
            </select>
          </label>
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
            <input
              name="surfaceFinish"
              type="text"
              placeholder="Frosted"
              bind:value={$form.surfaceFinish}
              class="input w-full input-lg"
              required
            />
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
              type="number"
              min="0"
              step="0.1"
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
              <option value="disabled" selected>Select Cube Type</option>
              <option value="Base">Base</option>
              <option value="Trim">Trim</option>
              <option value="Limited">Limited Edition</option>
            </select>
          </label>
        </div>
        {#if $form.modded || $form.versionType === "Trim" || $form.versionType === "Limited"}
          <div transition:blur>
            <label class="block text-sm mb-1"
              >Related To <span class="text-red-500">*</span>
              <select
                name="relatedTo"
                bind:value={$form.relatedTo}
                class="select select-lg w-full"
                required
              >
                <option value="disabled" selected>Select Model</option>
                {#each allCubes() as c}
                  <option value={c.value}>{c.label}</option>
                {/each}
              </select>
            </label>
          </div>
        {/if}
      </div>

      <!-- Toggles and rating -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div class="flex items-center gap-3">
          <input
            name="wcaLegal"
            type="checkbox"
            bind:checked={$form.wcaLegal}
            class="checkbox checkbox-md bg-base-100"
          />
          <label for="wca_legal" class="text-sm">WCA Legal</label>
        </div>
        <div class="flex items-center gap-3">
          <input
            name="magnetic"
            type="checkbox"
            bind:checked={$form.magnetic}
            class="checkbox checkbox-md bg-base-100"
          />
          <label for="magnetic" class="text-sm">Magnetic</label>
        </div>
        <div class="flex items-center gap-3">
          <input
            name="smart"
            type="checkbox"
            bind:checked={$form.smart}
            class="checkbox checkbox-md bg-base-100"
          />
          <label for="smart" class="text-sm">Smart</label>
        </div>
        <div class="flex items-center gap-3">
          <input
            name="modded"
            type="checkbox"
            bind:checked={$form.modded}
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
            bind:checked={$form.maglev}
            class="checkbox checkbox-md bg-base-100"
          />
          <label for="maglev" class="text-sm">Maglev</label>
        </div>
        <div class="flex items-center gap-3">
          <input
            name="stickered"
            type="checkbox"
            bind:checked={$form.stickered}
            class="checkbox checkbox-md bg-base-100"
          />
          <label for="maglev" class="text-sm">Stickered</label>
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
