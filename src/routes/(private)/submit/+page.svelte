<script lang="ts">
  import { superForm } from "sveltekit-superforms";
  import type { DetailedCube } from "$lib/components/dbTableTypes.js";
  import SearchCubes, {
    type SearchCube,
  } from "$lib/components/cube/searchCubes.svelte";
  import AutofillCard from "$lib/components/submit/autofillCard.svelte";
  import type { AutofillResult } from "../../(api)/api/submit/autocomplete/+server.js";
  import {
    releaseDatePattern,
    sizePattern,
  } from "$lib/components/validation/cubeForm.js";
  import { onMount } from "svelte";
  import { m } from "$lib/paraglide/messages";

  let { data } = $props();
  const { brands, types, surfaces, subTypes } = data;
  const cubes: DetailedCube[] = $derived(data.cubes);

  const {
    form,
    allErrors,
    constraints,
    errors,
    message,
    enhance,
    isTainted,
    tainted,
  } = superForm(data.form, {
    dataType: "json",
    resetForm: false,
    onError({ result }) {
      $message = result.error.message || m.submit_error_unknown_text();
    },
  });

  const dirty = $derived(isTainted($tainted));

  let allCubes: SearchCube[] = $derived.by(() => {
    const uniqueBySlug = new Map(
      cubes.map((cube) => [
        cube.slug,
        {
          label: cube.name,
          value: cube.slug,
        },
      ]),
    );
    return Array.from(uniqueBySlug.values()).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  });

  let autofillCardOpen = $state(false);
  function toggleAutofillCard() {
    autofillCardOpen = !autofillCardOpen;
  }
  let autofillCardData = $state({
    storeUrl: "",
    errorMessage: "",
    loading: false,
    success: false,
  });
  let wakingUp = $state(false);
  const autofillButtonState = $derived.by(() => {
    if (wakingUp) return "starting";
    if (autofillCardData.success) return "success";
    if (autofillCardData.errorMessage) return "error";
    if (autofillCardData.loading) return "loading";
    return "idle";
  });
  $effect(() => {
    const { success, errorMessage } = autofillCardData;
    if (!success && !errorMessage) return;

    const resetTimeout = setTimeout(() => {
      autofillCardData.errorMessage = "";
      autofillCardData.loading = false;
      autofillCardData.success = false;
    }, 10000);

    return () => clearTimeout(resetTimeout);
  });

  function applyData(data: AutofillResult): void {
    $form = {
      ...$form,
      // top-level scalar fields
      brand: data.brand ?? $form.brand,
      type: data.type ?? $form.type,
      imageUrl: data.image_url ?? $form.imageUrl,
      surfaceFinish: data.surface_finish ?? $form.surfaceFinish,
      versionType: data.version_type ?? $form.versionType,
      discontinued: data.discontinued ?? $form.discontinued,
      weight: data.weight ?? $form.weight,
      size: data.size && sizePattern.test(data.size) ? data.size : $form.size,
      releaseDate:
        data.release_date && releaseDatePattern.test(data.release_date)
          ? data.release_date
          : $form.releaseDate,

      // features: merge old + new
      features: {
        ...$form.features,
        magnetic: data.magnetic ?? $form.features.magnetic,
        maglev: data.maglev ?? $form.features.maglev,
        smart: data.smart ?? $form.features.smart,
        stickered: data.stickered ?? $form.features.stickered,
        wcaLegal: data.wca_legal ?? $form.features.wcaLegal,
        modded: data.modded ?? $form.features.modded,
        ballCore: data.ball_core ?? $form.features.ballCore,
      },
    };
  }

  onMount(async () => {
    wakingUp = true;
    await fetch("/api/submit/warmup");
    wakingUp = false;
  });
</script>

<section class="relative min-h-screen overflow-hidden bg-base-200/80 py-16">
  <div
    class="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-base-200 to-secondary/5"
  ></div>
  <div class="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-6">
    <header class="flex flex-col items-center text-center gap-3">
      <h1
        class="text-4xl font-clash font-semibold text-base-content items-center flex gap-2"
      >
        {m.submit_page_title_h1()}
      </h1>
      <p class="max-w-2xl text-base-content/70">
        {m.submit_page_intro_text()}
      </p>
    </header>

    <div
      class="grid items-start gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
    >
      <div class="flex flex-col gap-8">
        <form
          method="POST"
          use:enhance
          class="card border border-base-200 bg-base-100 shadow-xl"
          id="manual-cube-form"
        >
          <div class="card-body space-y-10">
            <section class="space-y-6" aria-labelledby="cube-identity">
              <div class="space-y-2 flex justify-between">
                <div>
                  <h2
                    id="cube-identity"
                    class="text-xl font-semibold text-base-content"
                  >
                    {m.submit_identity_title()}
                  </h2>
                  <p class="text-sm text-base-content/70">
                    {m.submit_identity_intro_text()}
                  </p>
                </div>
                <div class="flex flex-col items-end align-center">
                  <button
                    onclick={toggleAutofillCard}
                    class="btn btn-md w-fit"
                    class:btn-success={autofillCardData.success}
                    class:btn-error={autofillCardData.errorMessage}
                    class:btn-primary={!autofillCardData.errorMessage &&
                      !autofillCardData.success}
                    type="button"
                    disabled={wakingUp}
                  >
                    {#if autofillButtonState === "starting" ||
                      autofillButtonState === "loading"}
                      <i class="fa-solid fa-spinner fa-spin"></i>
                    {:else if autofillButtonState === "error"}
                      <i class="fa-solid fa-exclamation-triangle"></i>
                    {:else if autofillButtonState === "idle"}
                      <i class="fa-solid fa-bolt"></i>
                    {/if}
                    {m.submit_autofill_button_label({
                      state: autofillButtonState,
                    })}
                  </button>
                  {#if wakingUp}
                    <p
                      class="mt-2 flex max-w-xs items-start gap-2 text-right text-xs text-base-content/70"
                      aria-live="polite"
                    >
                      <i class="fa-solid fa-clock mt-0.5"></i>
                      <span>
                        {m.submit_autofill_warmup_text()}
                      </span>
                    </p>
                  {/if}
                </div>
              </div>
              <div class="grid gap-6 md:grid-cols-2">
                <label
                  class="flex flex-col gap-2 text-sm font-medium text-base-content/80"
                >
                  {m.submit_field_series_label()}
                  <input
                    name="series"
                    type="text"
                    placeholder={m.submit_field_series_placeholder()}
                    bind:value={$form.series}
                    {...$constraints.series}
                    class="input input-lg w-full"
                  />
                  {#if $errors.series}
                    <span class="text-xs text-error">{$errors.series}</span>
                  {/if}
                </label>
                <label
                  class="flex flex-col gap-2 text-sm font-medium text-base-content/80"
                >
                  <span>
                    {m.submit_field_model_label()}
                    <span class="text-error">*</span>
                  </span>
                  <input
                    name="model"
                    type="text"
                    placeholder={m.submit_field_model_placeholder()}
                    bind:value={$form.model}
                    {...$constraints.model}
                    class="input input-lg w-full"
                    required
                  />
                  {#if $errors.model}
                    <span class="text-xs text-error">{$errors.model}</span>
                  {/if}
                </label>
              </div>

              <div class="grid gap-6 md:grid-cols-2">
                <label
                  class="flex flex-col gap-2 text-sm font-medium text-base-content/80"
                >
                  <span>
                    {m.submit_field_version_type_label()}
                    <span class="text-error">*</span>
                  </span>
                  <select
                    name="cubeVersion"
                    bind:value={$form.versionType}
                    {...$constraints.versionType}
                    class="select select-lg w-full"
                    required
                  >
                    <option value="Base">
                      {m.submit_field_version_type_base_label()}
                    </option>
                    <option value="Trim">
                      {m.submit_field_version_type_trim_label()}
                    </option>
                    <option value="Limited">
                      {m.submit_field_version_type_limited_label()}
                    </option>
                  </select>
                  {#if $errors.versionType}
                    <span class="text-xs text-error">{$errors.versionType}</span
                    >
                  {/if}
                </label>
                <label
                  class="flex flex-col gap-2 text-sm font-medium text-base-content/80"
                >
                  <span>
                    {m.submit_field_version_name_label()}
                    <span class="text-error">*</span>
                  </span>
                  <input
                    name="version"
                    type="text"
                    placeholder={m.submit_field_version_name_placeholder()}
                    bind:value={$form.versionName}
                    {...$constraints.versionName}
                    class="input input-lg w-full"
                    required
                    disabled={$form.versionType === "Base"}
                  />
                  {#if $errors.versionName}
                    <span class="text-xs text-error">{$errors.versionName}</span
                    >
                  {/if}
                </label>
              </div>

              <div class="grid gap-6 md:grid-cols-2">
                <label
                  class="flex flex-col gap-2 text-sm font-medium text-base-content/80"
                >
                  <span>
                    {m.submit_field_brand_label()}
                    <span class="text-error">*</span>
                  </span>
                  <select
                    name="brand"
                    bind:value={$form.brand}
                    {...$constraints.brand}
                    class="select select-lg w-full"
                    required
                  >
                    {#each brands as b (b.name)}
                      <option>{b.name}</option>
                    {/each}
                  </select>
                  {#if $errors.brand}
                    <span class="text-xs text-error">{$errors.brand}</span>
                  {/if}
                  <span class="text-xs text-base-content/60">
                    {m.submit_field_brand_helper_text()}
                  </span>
                </label>
                <label
                  class="flex flex-col gap-2 text-sm font-medium text-base-content/80"
                >
                  <span>
                    {m.submit_field_type_label()}
                    <span class="text-error">*</span>
                  </span>
                  <select
                    name="type"
                    bind:value={$form.type}
                    {...$constraints.type}
                    class="select select-lg w-full"
                    required
                  >
                    {#each types as t (t.name)}
                      <option>{t.name}</option>
                    {/each}
                  </select>
                  {#if $errors.type}
                    <span class="text-xs text-error">{$errors.type}</span>
                  {/if}
                  <span class="text-xs text-base-content/60">
                    {m.submit_field_type_helper_text()}
                  </span>
                </label>
              </div>

              <div
                class="flex flex-col gap-2 text-sm font-medium text-base-content/80"
              >
                {m.submit_field_subtype_label()}
                <select
                  name="subType"
                  bind:value={$form.sub_type}
                  {...$constraints.sub_type}
                  class="select select-lg w-full"
                  required
                >
                  <option value="auto">
                    {m.submit_field_subtype_auto_label()}
                  </option>
                  {#each subTypes as subType (subType)}
                    <option>{subType}</option>
                  {/each}
                </select>
                {#if $errors.sub_type}
                  <span class="text-xs text-error">{$errors.sub_type}</span>
                {/if}
              </div>

              <div class="space-y-3">
                <p class="text-sm font-medium text-base-content">
                  {m.submit_field_related_model_label()}
                </p>
                <div
                  class="rounded-xl border border-base-200 bg-base-200/40 p-4"
                >
                  <p class="mb-2 text-xs text-base-content/60">
                    {m.submit_field_related_model_helper_text()}
                  </p>
                  <SearchCubes
                    cubes={allCubes}
                    bind:outputVar={$form.relatedTo}
                    disabled={!$form.features.modded &&
                      $form.versionType === "Base"}
                  />
                </div>
                <input
                  type="hidden"
                  name="relatedTo"
                  bind:value={$form.relatedTo}
                  {...$constraints.relatedTo}
                  disabled={!$form.features.modded &&
                    $form.versionType === "Base"}
                />
                {#if $errors.relatedTo}
                  <span class="text-xs text-error">{$errors.relatedTo}</span>
                {/if}
              </div>
            </section>

            <section class="space-y-6" aria-labelledby="cube-specs">
              <div class="space-y-2">
                <h2
                  id="cube-specs"
                  class="text-xl font-semibold text-base-content"
                >
                  {m.submit_media_specs_title()}
                </h2>
                <p class="text-sm text-base-content/70">
                  {m.submit_media_specs_intro_text()}
                </p>
              </div>
              <div class="grid gap-6 md:grid-cols-2">
                <label
                  class="flex flex-col gap-2 text-sm font-medium text-base-content/80"
                >
                  <span>
                    {m.submit_field_release_date_label()}
                    <span class="text-error">*</span>
                  </span>
                  <input
                    name="releaseDate"
                    type="date"
                    bind:value={$form.releaseDate}
                    {...$constraints.releaseDate}
                    class="input input-lg w-full"
                    required
                  />
                  {#if $errors.releaseDate}
                    <span class="text-xs text-error">{$errors.releaseDate}</span
                    >
                  {/if}
                </label>
                <label
                  class="flex flex-col gap-2 text-sm font-medium text-base-content/80"
                >
                  <span>
                    {m.submit_field_image_url_label()}
                    <span class="text-error">*</span>
                  </span>
                  <input
                    name="imageUrl"
                    type="url"
                    bind:value={$form.imageUrl}
                    {...$constraints.imageUrl}
                    class="input input-lg w-full"
                    placeholder={m.submit_field_image_url_placeholder()}
                    required
                  />
                  {#if $errors.imageUrl}
                    <span class="text-xs text-error">{$errors.imageUrl}</span>
                  {/if}
                  <span class="text-xs text-base-content/60">
                    {m.submit_field_image_url_helper_text()}
                  </span>
                </label>
              </div>

              <div class="grid gap-6 md:grid-cols-3">
                <label
                  class="flex flex-col gap-2 text-sm font-medium text-base-content/80"
                >
                  <span>
                    {m.submit_field_surface_finish_label()}
                    <span class="text-error">*</span>
                  </span>
                  <select
                    name="surfaceFinish"
                    bind:value={$form.surfaceFinish}
                    {...$constraints.surfaceFinish}
                    class="select select-lg w-full"
                    required
                  >
                    {#each surfaces as surface (surface)}
                      <option>{surface}</option>
                    {/each}
                  </select>
                  {#if $errors.surfaceFinish}
                    <span class="text-xs text-error"
                      >{$errors.surfaceFinish}</span
                    >
                  {/if}
                </label>
                <label
                  class="flex flex-col gap-2 text-sm font-medium text-base-content/80"
                >
                  <span>
                    {m.submit_field_weight_label()}
                    <span class="text-error">*</span>
                  </span>
                  <input
                    name="weight"
                    type="number"
                    min="0"
                    step="0.1"
                    bind:value={$form.weight}
                    {...$constraints.weight}
                    class="input input-lg w-full"
                    required
                  />
                  {#if $errors.weight}
                    <span class="text-xs text-error">{$errors.weight}</span>
                  {/if}
                </label>
                <label
                  class="flex flex-col gap-2 text-sm font-medium text-base-content/80"
                >
                  <span>
                    {m.submit_field_size_label()}
                    <span class="text-error">*</span>
                  </span>
                  <input
                    name="size"
                    type="text"
                    placeholder={m.submit_field_size_placeholder()}
                    bind:value={$form.size}
                    {...$constraints.size}
                    class="input input-lg w-full"
                    required
                  />
                  {#if $errors.size}
                    <span class="text-xs text-error">{$errors.size}</span>
                  {/if}
                </label>
              </div>
            </section>

            <section class="space-y-6" aria-labelledby="cube-features">
              <div class="space-y-2">
                <h2
                  id="cube-features"
                  class="text-xl font-semibold text-base-content"
                >
                  {m.submit_features_title()}
                </h2>
                <p class="text-sm text-base-content/70">
                  {m.submit_features_intro_text()}
                </p>
              </div>
              <div class="grid gap-4 sm:grid-cols-2">
                <label
                  class="flex items-start gap-3 rounded-xl border border-base-200 bg-base-200/40 px-4 py-3 text-sm text-base-content/80"
                >
                  <input
                    name="wcaLegal"
                    type="checkbox"
                    bind:checked={$form.features.wcaLegal}
                    {...$constraints.features?.wcaLegal}
                    class="checkbox checkbox-primary mt-1"
                  />
                  <span>
                    <span class="block font-medium text-base-content"
                      >{m.submit_feature_wca_legal_label()}</span
                    >
                    <span class="text-xs text-base-content/70"
                      >{m.submit_feature_wca_legal_helper_text()}</span
                    >
                  </span>
                  {#if $errors.features?.wcaLegal}
                    <span class="text-xs text-error">
                      {$errors.features.wcaLegal}
                    </span>
                  {/if}
                </label>
                <label
                  class="flex items-start gap-3 rounded-xl border border-base-200 bg-base-200/40 px-4 py-3 text-sm text-base-content/80"
                >
                  <input
                    name="magnetic"
                    type="checkbox"
                    bind:checked={$form.features.magnetic}
                    {...$constraints.features?.magnetic}
                    class="checkbox checkbox-primary mt-1"
                  />
                  <span>
                    <span class="block font-medium text-base-content"
                      >{m.submit_feature_magnetic_label()}</span
                    >
                    <span class="text-xs text-base-content/70"
                      >{m.submit_feature_magnetic_helper_text()}</span
                    >
                  </span>
                </label>
                <label
                  class="flex items-start gap-3 rounded-xl border border-base-200 bg-base-200/40 px-4 py-3 text-sm text-base-content/80"
                >
                  <input
                    name="smart"
                    type="checkbox"
                    bind:checked={$form.features.smart}
                    {...$constraints.features?.smart}
                    class="checkbox checkbox-primary mt-1"
                  />
                  <span>
                    <span class="block font-medium text-base-content"
                      >{m.submit_feature_smart_label()}</span
                    >
                    <span class="text-xs text-base-content/70"
                      >{m.submit_feature_smart_helper_text()}</span
                    >
                  </span>
                </label>
                <label
                  class="flex items-start gap-3 rounded-xl border border-base-200 bg-base-200/40 px-4 py-3 text-sm text-base-content/80"
                >
                  <input
                    name="modded"
                    type="checkbox"
                    bind:checked={$form.features.modded}
                    {...$constraints.features?.modded}
                    class="checkbox checkbox-primary mt-1"
                  />
                  <span>
                    <span class="block font-medium text-base-content"
                      >{m.submit_feature_modded_label()}</span
                    >
                    <span class="text-xs text-base-content/70"
                      >{m.submit_feature_modded_helper_text()}</span
                    >
                  </span>
                </label>
                <label
                  class="flex items-start gap-3 rounded-xl border border-base-200 bg-base-200/40 px-4 py-3 text-sm text-base-content/80"
                >
                  <input
                    name="maglev"
                    type="checkbox"
                    bind:checked={$form.features.maglev}
                    {...$constraints.features?.maglev}
                    class="checkbox checkbox-primary mt-1"
                  />
                  <span>
                    <span class="block font-medium text-base-content"
                      >{m.submit_feature_maglev_label()}</span
                    >
                    <span class="text-xs text-base-content/70"
                      >{m.submit_feature_maglev_helper_text()}</span
                    >
                  </span>
                </label>
                <label
                  class="flex items-start gap-3 rounded-xl border border-base-200 bg-base-200/40 px-4 py-3 text-sm text-base-content/80"
                >
                  <input
                    name="ballCore"
                    type="checkbox"
                    bind:checked={$form.features.ballCore}
                    {...$constraints.features?.ballCore}
                    class="checkbox checkbox-primary mt-1"
                  />
                  <span>
                    <span class="block font-medium text-base-content"
                      >{m.submit_feature_ball_core_label()}</span
                    >
                    <span class="text-xs text-base-content/70"
                      >{m.submit_feature_ball_core_helper_text()}</span
                    >
                  </span>
                </label>
                <label
                  class="flex items-start gap-3 rounded-xl border border-base-200 bg-base-200/40 px-4 py-3 text-sm text-base-content/80"
                >
                  <input
                    name="stickered"
                    type="checkbox"
                    bind:checked={$form.features.stickered}
                    {...$constraints.features?.stickered}
                    class="checkbox checkbox-primary mt-1"
                  />
                  <span>
                    <span class="block font-medium text-base-content"
                      >{m.submit_feature_stickered_label()}</span
                    >
                    <span class="text-xs text-base-content/70"
                      >{m.submit_feature_stickered_helper_text()}</span
                    >
                  </span>
                </label>
                <label
                  class="flex items-start gap-3 rounded-xl border border-base-200 bg-base-200/40 px-4 py-3 text-sm text-base-content/80"
                >
                  <input
                    name="discontinued"
                    type="checkbox"
                    bind:checked={$form.discontinued}
                    {...$constraints.discontinued}
                    class="checkbox checkbox-primary mt-1"
                  />
                  <span>
                    <span class="block font-medium text-base-content"
                      >{m.submit_feature_discontinued_label()}</span
                    >
                    <span class="text-xs text-base-content/70"
                      >{m.submit_feature_discontinued_helper_text()}</span
                    >
                  </span>
                </label>
              </div>
            </section>

            <div class="flex flex-col gap-3">
              <button type="submit" class="btn btn-primary btn-lg w-full"
                >{m.submit_submit_cta()}</button
              >
              <p class="text-center text-xs text-base-content/60">
                {m.submit_submit_helper_text()}
              </p>
            </div>

            {#if $message}
              <div class="alert alert-success" role="status" aria-live="polite">
                <span>{@html $message}</span>
              </div>
            {/if}

            {#if $allErrors.length}
              <div class="alert alert-error" role="alert" aria-live="assertive">
                <div>
                  <h2 class="text-sm font-semibold uppercase tracking-wide">
                    {m.submit_error_title_text()}
                  </h2>
                  <ul class="mt-2 list-disc space-y-1 pl-4 text-sm">
                    {#each $allErrors as error (error)}
                      <li>
                        <span class="font-semibold text-base-content">
                          {error.path}:
                        </span>
                        {error.messages.join(". ")}
                      </li>
                    {/each}
                  </ul>
                </div>
              </div>
            {/if}
          </div>
        </form>
      </div>

      <aside class="space-y-4">
        <div class="card border border-base-200 bg-base-100/80 shadow-sm">
          <div class="card-body space-y-4">
            <h2 class="text-lg font-semibold text-base-content">
              {m.submit_checklist_title()}
            </h2>
            <ul class="space-y-3 text-sm text-base-content/70">
              <li class="flex items-start gap-3">
                <i class="fa-solid fa-circle-check text-primary mt-1"></i>
                <span>
                  {m.submit_checklist_item_one_text()}
                </span>
              </li>
              <li class="flex items-start gap-3">
                <i class="fa-solid fa-circle-check text-primary mt-1"></i>
                <span>
                  {m.submit_checklist_item_two_text()}
                </span>
              </li>
              <li class="flex items-start gap-3">
                <i class="fa-solid fa-circle-check text-primary mt-1"></i>
                <span>
                  {m.submit_checklist_item_three_text()}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div
          class="card border border-dashed border-base-200 bg-base-100/60 shadow-sm"
        >
          <div class="card-body space-y-4">
            <h2 class="text-lg font-semibold text-base-content">
              {m.submit_next_steps_title()}
            </h2>
            <ol class="space-y-3 text-sm text-base-content/70">
              <li class="flex gap-3">
                <span class="badge badge-sm badge-outline mt-0.5">1</span>
                <span>{m.submit_next_steps_item_one_text()}</span>
              </li>
              <li class="flex gap-3">
                <span class="badge badge-sm badge-outline mt-0.5">2</span>
                <span>{m.submit_next_steps_item_two_text()}</span>
              </li>
            </ol>
            <div
              class="rounded-xl bg-base-200/60 px-4 py-3 text-sm text-base-content/70"
            >
              {m.submit_help_prompt_text()}
              <a href="/discord" class="link"
                >{m.submit_help_discord_label()}</a
              >.
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</section>

{#if autofillCardOpen}
  <AutofillCard
    onCancel={() => toggleAutofillCard()}
    {applyData}
    bind:variables={autofillCardData}
    {dirty}
  />
{/if}
