<script lang="ts">
  // Import necessary modules and types for Svelte component
  import { superForm } from "sveltekit-superforms";
  import type { CubeType } from "$lib/components/cube.svelte.js";
  import CubeVersionType from "$lib/components/cubeVersionType.svelte";
  import { blur, fly } from "svelte/transition";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { error } from "@sveltejs/kit";
  import { formatDate } from "$lib/components/formatDate.svelte";
  import ManageCubeStatus from "$lib/components/manageCubeStatus.svelte";

  // Destructure props passed to the component
  let { data } = $props();
  let { profiles, cubeTrims, relatedCube, sameSeries, vendors, types } = data;

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

  // Store the cube being edited
  const cube: CubeType = $state(data.cube);

  // UI toggle for expanding preview or edit mode
  let expanded: boolean = $state(false);

  let openModNotes = $state(false);
  let reason = $state<"Accept" | "Reject" | "Edit">("Accept");

  // Utility to get user profile URL from username or return # if not found
  function idOfUser(user: string) {
    const profile = profiles?.find(
      (p: { username: string }) => p.username === user
    );
    return profile ? `/user/${profile.id}` : "#";
  }

  function findBaseUrl(i: number): string {
    const vendorName = $form.vendorLinks[i]?.vendor_name;
    if (!vendorName || !vendors) return "";

    const vendor = vendors.find((v) => v.name === vendorName);
    return vendor?.base_url ?? "";
  }

  function toggleModNotes(r: typeof reason) {
    reason = r;
    openModNotes = !openModNotes;
  }

  // Define status toggles to bind to form fields dynamically in UI
  const statuses = [
    { label: "Smart", key: () => $form.smart },
    { label: "Magnetic", key: () => $form.magnetic },
    { label: "Modded", key: () => $form.modded },
    { label: "WCA Legal", key: () => $form.wcaLegal },
    { label: "Maglev", key: () => $form.maglev },
    { label: "Discontinued", key: () => $form.discontinued },
    { label: "Stickered", key: () => $form.stickered },
  ];

  let cubes: CubeType[] = $state([]);
  let allSubTypes: string[] = $state([]);
  let allSurfaces: string[] = $state([]);
  let allBrands: string[] = $state([]);
  let allCubes: () => {
    label: string;
    value: string;
  }[] = $state(() => []);

  $effect(() => {
    const _ = cubes;
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
    allBrands = Array.from(
      new Set(
        cubes
          .filter((c) => c.status === "Approved")
          .map((c: CubeType) => c.brand)
      )
    ).sort();

    let { data: SubTypes } = await supabase.rpc("get_types", {
      enum_type: "cubes_subtypes",
    });

    allSubTypes = SubTypes;

    let { data: surfaces } = await supabase.rpc("get_types", {
      enum_type: "cube_surface_finishes",
    });

    allSurfaces = surfaces;
  });
</script>

<section class="min-h-screen px-6 py-16">
  <div class="flex">
    {#if !expanded && cube.status !== "Rejected"}
      <div class="flex-1" transition:fly={{ x: -200 }}>
        <h1 class="mb-4 font-clash text-5xl flex items-center gap-3">Edit:</h1>
        <form class="space-y-6" method="POST" use:enhance>
          <div>
            <label class="block mb-1 font-medium"
              >Version Type
              <select
                bind:value={$form.versionType}
                class="select w-full"
                name="cubeVersion"
              >
                <option value="Base">Base</option>
                <option value="Trim">Trim</option>
                <option value="Limited">Limited Edition</option>
              </select>
            </label>
            {#if $errors.versionType}
              <span class="text-error">{$errors.versionType}</span>
            {/if}
          </div>
          <div>
            <label class="block mb-1 font-medium">
              Image URL
              <input
                name="imageUrl"
                type="url"
                bind:value={$form.imageUrl}
                class="input input-bordered w-full"
                required
                {...$constraints.imageUrl}
              />
            </label>
            {#if $errors.imageUrl}
              <span class="text-error">{$errors.imageUrl}</span>
            {/if}
          </div>
          <div>
            <label class="block mb-1 font-medium">
              Series
              <input
                name="series"
                type="text"
                class="input input-bordered w-full"
                bind:value={$form.series}
              />
            </label>
            {#if $errors.series}
              <span class="text-error">{$errors.series}</span>
            {/if}
          </div>
          <div>
            <label class="block mb-1 font-medium" for="model">Model</label>
            <input
              name="model"
              type="text"
              class="input input-bordered w-full"
              bind:value={$form.model}
            />
            {#if $errors.model}
              <span class="text-error">{$errors.model}</span>
            {/if}
          </div>
          {#if $form.versionType !== "Base"}
            <div transition:blur>
              <label class="block mb-1 font-medium"
                >Version Name
                <input
                  name="versionName"
                  type="text"
                  class="input input-bordered w-full"
                  bind:value={$form.versionName}
                />
              </label>
              {#if $errors.versionName}
                <span class="text-error">{$errors.versionName}</span>
              {/if}
            </div>
          {/if}
          <div>
            <label class="block mb-1 font-medium">
              Brand (Only shows brands of approved cubes)
              <select
                name="brand"
                bind:value={$form.brand}
                class="select w-full"
                required
              >
                <option value="___other">+ Add Brand</option>
                {#each allBrands as brand}
                  <option value={brand}>{brand}</option>
                {/each}
              </select>
            </label>
            {#if $errors.brand}
              <span class="text-error">{$errors.brand}</span>
            {/if}
          </div>
          {#if $form.brand === "___other"}
            <div transition:blur>
              <label class="block mb-1 font-medium">
                Add Brand (To see the added brand in the list above, approve this cube)
                <input
                  name="brand"
                  type="text"
                  class="input input-bordered w-full"
                  bind:value={$form.otherBrand}
                />
              </label>
              {#if $errors.otherBrand}
                <span class="text-error">{$errors.otherBrand}</span>
              {/if}
            </div>
          {/if}
          <div>
            <label class="block mb-1 font-medium">
              Type
              <select
                name="type"
                bind:value={$form.type}
                class="select w-full"
                required
              >
                <option value="___other">+ Create Type</option>
                {#each types as type}
                  <option value={type.type}>{type.type}</option>
                {/each}
              </select>
            </label>
            {#if $errors.type}
              <span class="text-error">{$errors.type}</span>
            {/if}
          </div>
          {#if $form.type === "___other"}
            <div transition:blur>
              <label class="block mb-1 font-medium">
                Create Type
                <input
                  name="type"
                  type="text"
                  class="input input-bordered w-full"
                  bind:value={$form.otherType}
                />
              </label>
              {#if $errors.otherType}
                <span class="text-error">{$errors.otherType}</span>
              {/if}
            </div>
          {/if}
          <div>
            <label class="block mb-1 font-medium">
              Sub Type
              <select
                name="subType"
                bind:value={$form.sub_type}
                class="select w-full"
                required
              >
                {#if allSubTypes.length === 0}
                  <option>Loading...</option>
                {/if}
                <option value="auto">Handle Automatically</option>
                {#each allSubTypes as subType}
                  <option value={subType}>{subType}</option>
                {/each}
              </select>
            </label>
            {#if $errors.sub_type}
              <span class="text-error">{$errors.sub_type}</span>
            {/if}
          </div>
          <div>
            <label class="block mb-1 font-medium"
              >Weight (g)
              <input
                name="weight"
                type="number"
                step="0.1"
                min="0"
                class="input input-bordered w-full"
                bind:value={$form.weight}
              />
            </label>
            {#if $errors.weight}
              <span class="text-error">{$errors.weight}</span>
            {/if}
          </div>
          <div>
            <label class="block mb-1 font-medium"
              >Size (mm3)
              <input
                name="size"
                type="number"
                step="0.1"
                min="0"
                class="input input-bordered w-full"
                bind:value={$form.size}
              />
            </label>
            {#if $errors.size}
              <span class="text-error">{$errors.size}</span>
            {/if}
          </div>
          <div>
            <label class="block mb-1 font-medium"
              >Surface Finish
              <select
                name="surfaceFinish"
                bind:value={$form.surfaceFinish}
                class="select w-full"
                required
              >
                {#if allSurfaces.length === 0}
                  <option>Loading...</option>
                {/if}
                {#each allSurfaces as surface}
                  <option value={surface}>{surface}</option>
                {/each}
              </select>
            </label>
            {#if $errors.surfaceFinish}
              <span class="text-error">{$errors.surfaceFinish}</span>
            {/if}
          </div>
          <div>
            <label class="block mb-1 font-medium"
              >Release Date
              <input
                id="releaseDate"
                type="date"
                class="input input-bordered w-full"
                bind:value={$form.releaseDate}
              />
            </label>
            {#if $errors.releaseDate}
              <span class="text-error">{$errors.releaseDate}</span>
            {/if}
          </div>
          {#if $form.modded || $form.versionType !== "Base"}
            <div transition:blur>
              <label class="block mb-1 font-medium">
                Related To
                <select
                  name="relatedTo"
                  bind:value={$form.relatedTo}
                  class="select w-full"
                  required
                >
                  {#each allCubes() as c}
                    <option value={c.value}>{c.label}</option>
                  {/each}
                </select>
              </label>
              {#if $errors.relatedTo}
                <span class="text-error">{$errors.relatedTo}</span>
              {/if}
            </div>
          {/if}
          <div class="divider"></div>
          <div class="grid grid-cols-2 gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="smart"
                bind:checked={$form.smart}
                class="checkbox"
              />
              <span>Smart</span>
              {#if $errors.smart}
                <span class="text-error">{$errors.smart}</span>
              {/if}
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="magnetic"
                bind:checked={$form.magnetic}
                class="checkbox"
              />
              <span>Magnetic</span>
              {#if $errors.magnetic}
                <span class="text-error">{$errors.magnetic}</span>
              {/if}
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="modded"
                bind:checked={$form.modded}
                class="checkbox"
              />
              <span>Modded</span>
              {#if $errors.modded}
                <span class="text-error">{$errors.modded}</span>
              {/if}
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="wcaLegal"
                bind:checked={$form.wcaLegal}
                class="checkbox"
              />
              <span>WCA Legal</span>
              {#if $errors.wcaLegal}
                <span class="text-error">{$errors.wcaLegal}</span>
              {/if}
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="maglev"
                bind:checked={$form.maglev}
                class="checkbox"
              />
              <span>Maglev</span>
              {#if $errors.maglev}
                <span class="text-error">{$errors.maglev}</span>
              {/if}
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="discontinued"
                bind:checked={$form.discontinued}
                class="checkbox"
              />
              <span>Discontinued</span>
              {#if $errors.discontinued}
                <span class="text-error">{$errors.discontinued}</span>
              {/if}
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="stickered"
                bind:checked={$form.stickered}
                class="checkbox"
              />
              <span>Stickered</span>
              {#if $errors.stickered}
                <span class="text-error">{$errors.stickered}</span>
              {/if}
            </label>
          </div>
          <div class="divider"></div>
          <div>
            <table class="table w-full mb-4">
              <thead>
                <tr>
                  <th>Vendor Name</th>
                  <th>URL</th>
                  <th>Price ($)</th>
                  <th>Available</th>
                  <th>Remove</th>
                </tr>
              </thead>
              <tbody>
                {#each $form.vendorLinks as link, i}
                  <tr>
                    <td>
                      <select
                        name="vendorLinks"
                        bind:value={$form.vendorLinks[i].vendor_name}
                        class="select w-full"
                        required
                      >
                        {#each vendors as v}
                          <option value={v.name}>{v.name}</option>
                        {/each}
                      </select>
                      {#if $errors.vendorLinks}
                        <span class="text-error"
                          >{$errors.vendorLinks[i].vendor_name}</span
                        >
                      {/if}
                    </td>
                    <td>
                      <input
                        name="vendorLinks"
                        type="url"
                        class="input input-bordered w-full"
                        bind:value={$form.vendorLinks[i].url}
                        placeholder={findBaseUrl(i)}
                      />
                      {#if $errors.vendorLinks}
                        <span class="text-error"
                          >{$errors.vendorLinks[i].url}</span
                        >
                      {/if}
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        class="input input-bordered w-full"
                        name="vendorLinks"
                        bind:value={$form.vendorLinks[i].price}
                      />
                      {#if $errors.vendorLinks}
                        <span class="text-error"
                          >{$errors.vendorLinks[i].price}</span
                        >
                      {/if}
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        class="checkbox"
                        name="vendorLinks"
                        bind:checked={$form.vendorLinks[i].available}
                      />
                      {#if $errors.vendorLinks}
                        <span class="text-error"
                          >{$errors.vendorLinks[i].available}</span
                        >
                      {/if}
                    </td>
                    <td>
                      <button
                        type="button"
                        class="btn btn-error btn-sm"
                        aria-label="Remove Vendor Link"
                        onclick={() => {
                          $form.vendorLinks = $form.vendorLinks.filter(
                            (_, idx) => idx !== i
                          );
                        }}
                      >
                        <i class="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
            <button
              type="button"
              class="btn btn-primary btn-sm"
              onclick={() => {
                $form.vendorLinks = [
                  ...$form.vendorLinks,
                  { vendor_name: "", url: "", price: 0, available: false },
                ];
              }}
            >
              <i class="fa-solid fa-plus"></i> Add Vendor
            </button>
          </div>
          <div class="divider"></div>
          <div class="flex flex-col">
            <button class="btn btn-primary btn-xl" type="submit"> Save </button>
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
        </form>
      </div>

      <div
        class="divider divider-horizontal"
        transition:fly={{ x: -100 }}
      ></div>
    {/if}
    <div class="max-w-4xl mx-auto flex-1">
      <h1 class="mb-4 font-clash text-5xl flex items-center gap-3">
        {#if !expanded && cube.status !== "Rejected"}
          <span transition:fly={{ x: -100 }}>Preview:</span>
        {/if}
        {#if cube.status !== "Rejected"}
          <button
            class="btn"
            aria-label="Expand"
            onclick={() => {
              expanded = !expanded;
            }}
          >
            {#if expanded}
              <i class="fa-solid fa-down-left-and-up-right-to-center fa-2x"></i>
            {:else}
              <i class="fa-solid fa-up-right-and-down-left-from-center fa-2x"
              ></i>
            {/if}
          </button>
        {/if}
      </h1>
      {#if cube.status === "Approved"}
        <div
          class="flex items-center gap-3 p-4 my-4 rounded-xl bg-success font-semibold shadow-sm"
        >
          <i class="fa-solid fa-check"></i>
          This submission has been approved.
        </div>
      {:else if cube.status === "Rejected"}
        <div
          class="flex items-center gap-3 p-4 my-4 rounded-xl bg-error font-semibold shadow-sm"
        >
          <i class="fa-solid fa-triangle-exclamation"></i>
          This submission has been rejected.
        </div>
      {:else if cube.status === "Pending"}
        <div
          class="flex items-center gap-3 p-4 my-4 rounded-xl bg-warning font-semibold shadow-sm"
        >
          <i class="fa-solid fa-hourglass-half"></i>
          This submission is pending.
        </div>

        <div class="mt-4 flex gap-2">
          <button
            class="btn btn-success flex-1"
            onclick={() => toggleModNotes("Accept")}
          >
            <i class="fa-solid fa-check mr-2"></i>Accept
          </button>
          <button
            class="btn btn-error flex-1"
            onclick={() => toggleModNotes("Reject")}
          >
            <i class="fa-solid fa-xmark mr-2"></i>Reject
          </button>
        </div>
      {/if}

      <div class="my-6 flex flex-col sm:flex-row items-center gap-6">
        <img
          src={$form.imageUrl}
          alt="{$form.series} {$form.model} {$form.versionName}"
          class="rounded-2xl bg-base-200 p-4 my-4 border border-base-300 object-contain w-full max-w-md max-h-96"
        />
      </div>
      <h1 class="text-4xl font-bold mb-4 flex items-center gap-3">
        <span class="font-clash">
          {$form.series}
          {$form.model}
          {#if $form.versionType !== "Base"}
            <span class="text-secondary">{$form.versionName}</span>
          {/if}
          <CubeVersionType version_type={$form.versionType} moreInfo={true} />
        </span>
      </h1>

      <div
        class="mb-4 p-4 bg-base-200 rounded-xl border border-base-300 shadow-sm"
      >
        <p class="leading-relaxed">
          Description:
          <span class="block mt-2">
            The <span class="font-bold text-primary"
              >{`${$form.series} ${$form.model} ${$form.versionType !== "Base" ? $form.versionName : ""}`}</span
            >
            is a
            <span class="font-bold text-primary"
              >{$form.type !== "___other"
                ? $form.type?.trim()
                : $form.otherType}</span
            >
            twisty puzzle released on
            <span class="font-bold text-primary"
              >{formatDate($form.releaseDate)}</span
            >. It is
            <span class="font-bold text-primary"
              >{$form.magnetic ? "magnetic" : "non-magnetic"}</span
            >,
            <span class="font-bold text-primary"
              >{$form.smart ? "smart" : "non-smart"}</span
            >, and
            <span class="font-bold text-primary"
              >{$form.wcaLegal ? "WCA-legal" : "not WCA-legal"}</span
            >. Currently, it is
            <span class="font-bold text-primary"
              >{$form.discontinued ? "discontinued" : "available"}</span
            >, has a community rating of
            <span class="font-bold text-primary">{cube.rating}/5</span>, and is
            <span class="font-bold text-primary"
              >{$form.modded ? "modded" : "original"}</span
            >.
          </span>
        </p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 mb-4">
        <div
          class="bg-base-200 rounded-xl p-4 flex flex-col gap-2 border border-base-300"
        >
          <div class="flex items-center justify-between">
            <span>Brand:</span>
            <span class="font-medium"
              >{$form.brand !== "___other"
                ? $form.brand
                : $form.otherBrand}</span
            >
          </div>
          <div class="flex items-center justify-between">
            <span>Type:</span>
            <span class="font-medium">
              {$form.type !== "___other" ? $form.type : $form.otherType}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span>Weight:</span>
            <span class="font-medium">{$form.weight} g</span>
          </div>
          <div class="flex items-center justify-between">
            <span>Size:</span>
            <span class="font-medium">{$form.size} mm3</span>
          </div>
          <div class="flex items-center justify-between">
            <span>Surface Finish:</span>
            <span class="font-medium"
              >{$form.surfaceFinish !== "Loading..."
                ? $form.surfaceFinish
                : ""}</span
            >
          </div>
          <div class="flex items-center justify-between">
            <span>Release Date:</span>
            <span class="font-medium">{formatDate($form.releaseDate)}</span>
          </div>
        </div>
        <div
          class="bg-base-200 rounded-xl p-4 flex flex-col gap-2 border border-base-300"
        >
          {#each statuses as status}
            <div class="flex items-center justify-between">
              <span class="font-medium text-sm">{status.label}</span>
              <span class="text-xl">
                {status.key() ? "✅" : "❌"}
              </span>
            </div>
          {/each}
        </div>
      </div>
      {#if $form.vendorLinks.length > 0}
        <div class="my-8">
          <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
            <i class="fa-solid fa-cart-shopping"></i>
            Available at:
          </h2>
          <div class="flex flex-wrap gap-3">
            {#each $form.vendorLinks as shop}
              <a
                href={shop.url}
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-outline {shop.available
                  ? 'btn-primary'
                  : 'btn-error'}"
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
      {/if}

      <div class="my-8">
        <div class="bg-base-200 rounded-xl p-4 border border-base-300">
          <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
            <i class="fa-regular fa-clock"></i>
            Database Info:
          </h2>
          <div class="flex flex-col sm:flex-row gap-6">
            <div class="flex items-center gap-2">
              <span>ID:</span>{cube.id}
            </div>
            <div class="flex items-center gap-2">
              <span>Added:</span>
              <span class="font-medium">
                {formatDate(cube.created_at)}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span>Last Updated:</span>
              <span class="font-medium">
                {formatDate(cube.updated_at)}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span>Verified by:</span>
              <a
                class="font-medium underline"
                href={idOfUser(cube.verified_by)}
              >
                {cube.verified_by || "Unknown"}
              </a>
            </div>
            <div class="flex items-center gap-2">
              <span>Submitted by:</span>
              <a
                class="font-medium underline"
                href={idOfUser(cube.submitted_by)}
              >
                {cube.submitted_by || "Unknown"}
              </a>
            </div>
          </div>
        </div>
      </div>
      {#if $form.versionType === "Base" && cubeTrims && cubeTrims.length > 0}
        <div class="mb-8">
          <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
            <i class="fa-solid fa-palette"></i>
            Select Trim:
          </h2>
          <div class="flex gap-4">
            {#each cubeTrims ?? [] as trim}
              <a
                class="flex flex-col items-center border rounded-xl px-4 py-2 transition duration-200 focus:outline-none border-base-300 bg-base-200 hover:bg-base-300"
                href="/staff/cubes/edit/{trim.slug}"
              >
                <img
                  src={trim.image_url}
                  alt={trim.version_name}
                  class="h-16 object-contain mb-2 rounded"
                />
                <span class="font-medium">{trim.version_name}</span>
                <span class="mt-2 text-xs flex items-center gap-1">
                  Status : {trim.status}
                </span>
              </a>
            {/each}
          </div>
        </div>
      {/if}
      {#if relatedCube && ($form.versionType !== "Base" || $form.modded === true)}
        <div class="mb-8">
          <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
            <i class="fa-solid fa-palette"></i>
            Related To:
          </h2>
          <div class="flex gap-4">
            <a
              class="flex flex-col items-center border rounded-xl px-4 py-2 transition duration-200 focus:outline-none border-base-300 bg-base-200 hover:bg-base-300"
              href="/staff/cubes/edit/{relatedCube.slug}"
            >
              <img
                src={relatedCube.image_url}
                alt={relatedCube.version_name}
                class="h-16 object-contain mb-2 rounded"
              />
              <span class="font-medium"
                >{relatedCube.series}
                {relatedCube.model}</span
              >
              <span class="mt-2 text-xs flex items-center gap-1">
                Status : {relatedCube.status}
              </span>
            </a>
          </div>
        </div>
      {/if}
      {#if sameSeries && sameSeries.length > 0 && cube.series !== ""}
        <div class="mb-8">
          <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
            <i class="fa-solid fa-layer-group"></i>
            In the Same Series:
          </h2>
          <div class="flex flex-wrap gap-4">
            {#each sameSeries as seriesCube}
              <a
                class="flex flex-col items-center border rounded-xl px-4 py-2 transition duration-200 focus:outline-none border-base-300 bg-base-200 hover:bg-base-300 w-36"
                href="/staff/cubes/edit/{seriesCube.slug}"
              >
                <img
                  src={seriesCube.image_url}
                  alt={seriesCube.version_name}
                  class="h-24 object-contain mb-2 rounded"
                />
                <span class="font-medium text-center">
                  {seriesCube.series}
                  {seriesCube.model}
                </span>
                <span class="mt-2 text-xs flex items-center gap-1">
                  Status : {seriesCube.status}
                </span>
              </a>
            {/each}
          </div>
        </div>
      {/if}

      <a href="/staff/cubes" class="btn btn-lg btn-primary mt-6">
        ← Back to Manage
      </a>
    </div>
  </div>
</section>

{#if openModNotes}
  <ManageCubeStatus
    cube_name={`${cube.series} ${cube.model} ${cube.version_name}`}
    cube_id={cube.id}
    existingNote={cube.notes ?? ""}
    {reason}
    onCancel={() => (openModNotes = false)}
  />
{/if}
