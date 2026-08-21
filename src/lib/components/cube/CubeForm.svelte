<script lang="ts">
  import { resolve } from "$app/paths";
  import {
    superForm,
    type Infer,
    type SuperValidated,
  } from "sveltekit-superforms";
  import {
    normalizeReleaseDate,
    sizePattern,
    type CubeFormSchema,
  } from "$lib/schemas/cubeForm.js";
  import { onMount, untrack } from "svelte";
  import SearchValues, {
    type SearchValue,
  } from "$lib/components/ui/SearchValues.svelte";
  import type { Tables } from "$lib/types/database.types";
  import { getCurrencySymbol } from "$lib/utils/getCurrencySymbol";
  import type {
    AutofillState,
    CubeDetailsAutofillResult,
  } from "$lib/types/autofill.types";
  import CubeDetailsAutofillDialog from "$lib/components/autofill/CubeDetailsAutofillDialog.svelte";
  // import { autofillVendorOffer } from "$lib/api/autofill";
  import { goto } from "$app/navigation";
  import type { ResolvedPathname } from "$app/types";
    import FormField from "../form/FormField.svelte";
    import FormFooter from "../form/FormFooter.svelte";
    import FormHelpLink from "../form/FormHelpLink.svelte";
    import FormHeader from "../form/FormHeader.svelte";

  interface Props {
    cubes: Pick<
      Tables<"v_detailed_cube_models">,
      "id" | "name" | "slug" | "image_url"
    >[];
    brands: Pick<Tables<"brands">, "id" | "name">[];
    types: Pick<Tables<"cube_types">, "id" | "name">[];
    series: Pick<Tables<"cube_series">, "id" | "name">[];
    features: Pick<Tables<"cube_features">, "label" | "code">[];
    surfaces: string[];
    subTypes: string[];
    cubeVersions: string[];

    vendors: Pick<Tables<"vendors">, "id" | "name" | "base_url" | "currency">[];

    initialForm: SuperValidated<Infer<CubeFormSchema>>;
    submitLabel: string;
    formTitle: string;
    formDescription: string;
    submissionNote?: string;
    enableAutofill?: boolean;
    formAction?: string;
  }

  type PageLabel = "Cube" | "Vendor links" | "Sources & notes";
  type PageKey = "cube" | "vendor-links" | "sources";
  const featureFormKeys: Partial<
    Record<string, keyof Infer<CubeFormSchema>["features"]>
  > = {
    wca_legal: "wcaLegal",
    magnetic: "magnetic",
    smart: "smart",
    modded: "modded",
    maglev: "maglev",
    stickered: "stickered",
    ball_core: "ballCore",
  };
  interface Page {
    key: PageKey;
    label: PageLabel;
  }

  interface VendorAutofillState {
    status: "idle" | "loading" | "success" | "error";
    errorMessage: string;
  }

  let {
    cubes,
    brands,
    types,
    series,
    features,
    surfaces,
    subTypes,
    cubeVersions,

    vendors,

    initialForm,
    formAction,

    submitLabel,
    formTitle,
    formDescription,
    submissionNote,
    enableAutofill,
  }: Props = $props();

  let currentPage: PageKey = $state("cube");
  const pages: Page[] = [
    { key: "cube", label: "Cube" },
    { key: "vendor-links", label: "Vendor links" },
    { key: "sources", label: "Sources & notes" },
  ];

  const cubeSubmissionManualPath = "/docs/submission-manual/cubes";

  const {
    form,
    allErrors,
    constraints,
    errors,
    message,
    enhance,
    isTainted,
    tainted,
  } = superForm(
    untrack(() => initialForm),
    {
      dataType: "json",
      resetForm: false,
      onError({ result }) {
        $message = result.error.message || "Unknown error";
      },
      async onResult({ result, cancel }) {
        if (result.type === "redirect") {
          cancel();
          await goto(result.location as ResolvedPathname, {
            replaceState: true,
            invalidateAll: true,
          });
        }
      },
    },
  );
  let isAddingSeries = $state(
    untrack(() => Boolean(initialForm.data.otherSeries)),
  );

  let allCubes: SearchValue<number>[] = $derived.by(() => {
    const uniqueBySlug = new Map(
      cubes.map((cube) => [
        cube.slug,
        {
          label: cube.name,
          value: cube.id,
          image_url: cube.image_url,
        },
      ]),
    );
    return Array.from(uniqueBySlug.values()).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  });
  let allSeries: SearchValue<string>[] = $derived.by(() => {
    const uniqueById = new Map(
      series.map((series) => [
        series.name,
        {
          label: series.name,
          value: String(series.id),
        },
      ]),
    );
    return Array.from(uniqueById.values()).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  });

  let isAutofillCardOpen = $state(false);
  function openAutofillCard() {
    isAutofillCardOpen = true;
  }
  let autofill: AutofillState = $state({
    storeURL: "",
    errorMessage: "",
    loading: false,
    success: false,
    reset() {
      this.errorMessage = "";
      this.loading = false;
      this.success = false;
    },
  });
  let vendorAutofillStates: VendorAutofillState[] = $state(
    untrack(() =>
      initialForm.data.vendorLinks.map(() => ({
        status: "idle",
        errorMessage: "",
      })),
    ),
  );
  $effect(() => {
    const { success, errorMessage } = autofill;
    if (!success && errorMessage) return;

    const resetTimeout = setTimeout(() => autofill.reset(), 10000);

    return () => clearTimeout(resetTimeout);
  });

  // async function autofillVendorPrice(index: number) {
  //   const state = vendorAutofillStates[index];
  //   const vendorLink = $form.vendorLinks[index];
  //   if (!state || !vendorLink) return;

  //   state.status = "loading";
  //   state.errorMessage = "";

  //   try {
  //     const { price, availability } = await autofillVendorOffer(vendorLink.url);

  //     if (price !== undefined) vendorLink.price = price;
  //     if (availability !== undefined) vendorLink.available = availability;
  //     state.status = "success";
  //   } catch (error) {
  //     state.status = "error";
  //     state.errorMessage =
  //       error instanceof Error
  //         ? error.message
  //         : "Something went wrong while contacting the autofill service.";
  //   }
  // }

  function applyData(data: CubeDetailsAutofillResult): void {
    $form = {
      ...$form,
      name: data.name ?? $form.name,
      brandID: data.brand_id ? String(data.brand_id) : $form.brandID,
      typeID: data.type_id ? String(data.type_id) : $form.typeID,
      imageUrl: data.image_url ?? $form.imageUrl,
      surfaceFinish: data.surface_finish ?? $form.surfaceFinish,
      versionType: data.version_type ?? $form.versionType,
      discontinued: data.discontinued ?? $form.discontinued,
      weight: data.weight ?? $form.weight,
      size: data.size && sizePattern.test(data.size) ? data.size : $form.size,
      releaseDate:
        data.release_date && normalizeReleaseDate(data.release_date)
          ? data.release_date
          : $form.releaseDate,

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

  let wakingUp = $state(false);
  const warmUpController = new AbortController();
  const warmUpTimeout = setTimeout(() => warmUpController.abort(), 15_000);

  async function warmUpService() {
    wakingUp = true;
    try {
      const response = await fetch("/api/autofill/warmup", {
        signal: warmUpController.signal,
      });

      if (!response.ok || response.headers.get("x-upstream-status") !== "200") {
        throw new Error("The autofill service is unreachable");
      }
    } catch (err) {
      autofill.errorMessage =
        err instanceof Error
          ? err.message
          : "The autofill service failed to start";
    } finally {
      clearTimeout(warmUpTimeout);
      wakingUp = false;
    }
  }

  onMount(async () => {
    if (enableAutofill) {
      await warmUpService();
    }
  });
</script>

<section class="relative min-h-screen py-16">
  <div class="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-6">
    <FormHeader title={formTitle} description={formDescription} />

    <div class="flex gap-3 flex-wrap sm:items-center justify-between">
      <div class="overflow-x-auto">
        <div role="tablist" class="tabs tabs-box w-max flex-nowrap">
          {#each pages as page, index (index)}
            <button
              role="tab"
              class="tab"
              class:tab-active={page.key === currentPage}
              onclick={() => (currentPage = page.key)}
            >
              {page.label}
            </button>
          {/each}
        </div>
      </div>
      <a href={resolve(cubeSubmissionManualPath)} class="btn btn-ghost btn-sm">
        <i class="fa-solid fa-book-open" aria-hidden="true"></i>
        Submission manual
      </a>
    </div>

    <div class="flex flex-col gap-8">
      <form method="POST" action={formAction} use:enhance>
        <div class="space-y-10">
          {#if currentPage === "cube"}
            <section class="space-y-6" aria-labelledby="cube-identity-heading">
              <div
                class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div class="space-y-1">
                  <h2
                    id="cube-identity-heading"
                    class="flex items-center gap-2 text-xl font-semibold"
                  >
                    <i class="fa-solid fa-cube text-primary" aria-hidden="true"
                    ></i>
                    Cube identity
                  </h2>
                  <p class="text-sm text-base-content/60">
                    Identify the model, manufacturer, and its place in the
                    CubeIndex catalog.
                  </p>
                </div>
                <div class="flex flex-wrap items-start gap-2 sm:justify-end">
                  {#if enableAutofill}
                    <div class="flex flex-col items-start sm:items-end">
                      <button
                        onclick={openAutofillCard}
                        class="btn btn-sm w-fit sm:btn-md"
                        class:btn-success={autofill.success}
                        class:btn-error={autofill.errorMessage}
                        class:btn-primary={!autofill.errorMessage &&
                          !autofill.success}
                        type="button"
                        disabled={wakingUp}
                      >
                        {#if wakingUp}
                          <i class="fa-solid fa-spinner fa-spin"></i>
                          Starting autofill service...
                        {:else if autofill.success}
                          Success!
                        {:else if autofill.errorMessage}
                          <i class="fa-solid fa-exclamation-triangle"></i>
                          An error occurred!
                        {:else if autofill.loading}
                          <i class="fa-solid fa-spinner fa-spin"></i>
                          Loading...
                        {:else}
                          <i class="fa-solid fa-bolt"></i>
                          Autofill
                        {/if}
                      </button>
                      {#if wakingUp}
                        <p
                          class="mt-2 flex max-w-xs items-start gap-2 text-right text-xs text-base-content/70"
                          aria-live="polite"
                        >
                          <i class="fa-solid fa-clock mt-0.5"></i>
                          <span>
                            Warming up the autofill service. It can take up to a
                            minute to be ready.
                          </span>
                        </p>
                      {/if}
                    </div>
                  {/if}
                </div>
              </div>
              <div class="grid gap-6 md:grid-cols-2">
                {#snippet nameField()}
                  <input
                    name="name"
                    type="text"
                    bind:value={$form.name}
                    {...$constraints.name}
                    class="input w-full"
                  />
                {/snippet}
                <FormField
                  title="Name"
                  error={$errors.name}
                  required
                  helpHref="/docs/submission-manual/cubes#name"
                  children={nameField}
                />
                {#snippet editionTypeField()}
                  <select
                    name="cubeVersion"
                    bind:value={$form.versionType}
                    {...$constraints.versionType}
                    class="select w-full"
                    required
                  >
                    {#each cubeVersions as cubeVersion, index (index)}
                      <option>{cubeVersion}</option>
                    {/each}
                  </select>
                {/snippet}
                <FormField
                  title="Cube version"
                  error={$errors.versionType}
                  required
                  helpHref="/docs/submission-manual/cubes#cube-version"
                  children={editionTypeField}
                />
              </div>

              <div class="grid gap-6 md:grid-cols-2">
                {#snippet brandField()}
                  {#if $form.brandID === "___other"}
                    <div class="join w-full">
                      <input
                        name="otherBrand"
                        type="text"
                        class="input join-item min-w-0 grow"
                        bind:value={$form.otherBrand}
                        {...$constraints.otherBrand}
                        placeholder="New brand name"
                      />
                      <button
                        type="button"
                        class="btn btn-outline join-item"
                        aria-label="Choose an existing brand"
                        onclick={() => {
                          $form.brandID = String(brands[0].id);
                          $form.otherBrand = "";
                        }}
                      >
                        <i class="fa-solid fa-arrow-left" aria-hidden="true"
                        ></i>
                        <span class="hidden sm:inline">Back</span>
                      </button>
                    </div>
                  {:else}
                    <select
                      name="brandID"
                      bind:value={$form.brandID}
                      {...$constraints.brandID}
                      class="select w-full"
                      required
                    >
                      <option value="___other">+ Add Brand</option>
                      {#each brands as b, index (index)}
                        <option value={String(b.id)}>{b.name}</option>
                      {/each}
                    </select>
                  {/if}
                {/snippet}
                <FormField
                  title={$form.brandID === "___other" ? "New brand" : "Brand"}
                  error={$form.brandID === "___other"
                    ? $errors.otherBrand
                    : $errors.brandID}
                  required
                  helpHref="/docs/submission-manual/cubes#brand"
                  children={brandField}
                />
                {#snippet cubeTypeField()}
                  {#if $form.typeID === "___other"}
                    <div class="join w-full">
                      <input
                        name="otherType"
                        type="text"
                        class="input join-item min-w-0 grow"
                        bind:value={$form.otherType}
                        {...$constraints.otherType}
                        placeholder="New cube type"
                      />
                      <button
                        type="button"
                        class="btn btn-outline join-item"
                        aria-label="Choose an existing cube type"
                        onclick={() => {
                          $form.typeID = String(types[0].id);
                          $form.otherType = "";
                        }}
                      >
                        <i class="fa-solid fa-arrow-left" aria-hidden="true"
                        ></i>
                        <span class="hidden sm:inline">Back</span>
                      </button>
                    </div>
                  {:else}
                    <select
                      name="typeID"
                      bind:value={$form.typeID}
                      {...$constraints.typeID}
                      class="select w-full"
                      required
                    >
                      <option value="___other">+ Create Type</option>
                      {#each types as t (t.name)}
                        <option value={String(t.id)}>{t.name}</option>
                      {/each}
                    </select>
                  {/if}
                {/snippet}
                <FormField
                  title={$form.typeID === "___other"
                    ? "New cube type"
                    : "Cube type"}
                  error={$form.typeID === "___other"
                    ? $errors.otherType
                    : $errors.typeID}
                  required
                  helpHref="/docs/submission-manual/cubes#cube-type"
                  children={cubeTypeField}
                />
              </div>

              {#snippet subTypeField()}
                <select
                  name="subType"
                  bind:value={$form.subType}
                  {...$constraints.subType}
                  class="select w-full"
                  required
                >
                  <option value="auto">Handle Automatically</option>
                  {#each subTypes as subType (subType)}
                    <option>{subType}</option>
                  {/each}
                </select>
              {/snippet}
              <FormField
                title="Sub-type"
                error={$errors.subType}
                helpHref="/docs/submission-manual/cubes#sub-type"
                children={subTypeField}
              />

              {#snippet seriesField()}
                {#if isAddingSeries}
                  <div class="join w-full">
                    <input
                      name="otherSeries"
                      type="text"
                      class="input join-item min-w-0 grow"
                      bind:value={$form.otherSeries}
                      {...$constraints.otherSeries}
                      placeholder="New series name"
                    />
                    <button
                      type="button"
                      class="btn btn-outline join-item"
                      aria-label="Choose an existing series"
                      onclick={() => {
                        isAddingSeries = false;
                        $form.otherSeries = "";
                      }}
                    >
                      <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
                      <span class="hidden sm:inline">Back</span>
                    </button>
                  </div>
                {:else}
                  <div class="space-y-2">
                    <SearchValues
                      values={allSeries}
                      bind:outputValue={$form.seriesID}
                    />
                    <button
                      type="button"
                      class="btn btn-ghost btn-sm"
                      onclick={() => {
                        isAddingSeries = true;
                        $form.seriesID = "___other";
                      }}
                    >
                      <i class="fa-solid fa-plus" aria-hidden="true"></i>
                      Add a new series
                    </button>
                  </div>
                {/if}
                <input
                  type="hidden"
                  name="seriesID"
                  bind:value={$form.seriesID}
                  {...$constraints.seriesID}
                />
              {/snippet}
              <FormField
                title={isAddingSeries ? "New series" : "Series"}
                error={isAddingSeries ? $errors.otherSeries : $errors.seriesID}
                helpHref="/docs/submission-manual/cubes#series"
                children={seriesField}
              />

              {#snippet relatedCubeField()}
                <div>
                  <SearchValues
                    values={allCubes}
                    bind:outputValue={$form.relatedToId}
                    disabled={!$form.features.modded &&
                      $form.versionType === "Base"}
                  />
                </div>
                <input
                  type="hidden"
                  name="relatedToId"
                  bind:value={$form.relatedToId}
                  {...$constraints.relatedToId}
                  disabled={!$form.features.modded &&
                    $form.versionType === "Base"}
                />
              {/snippet}
              <FormField
                title="Related cube"
                error={$errors.relatedToId}
                helpHref="/docs/submission-manual/cubes#related-model"
                children={relatedCubeField}
              />
            </section>

            <section class="space-y-6">
              <div class="space-y-1">
                <h2 class="flex items-center gap-2 text-xl font-semibold">
                  <i
                    class="fa-solid fa-box-open text-primary"
                    aria-hidden="true"
                  ></i>
                  Product details
                </h2>
                <p class="text-sm text-base-content/60">
                  Add the release information and physical specifications.
                </p>
              </div>

              <label
                class="flex w-fit cursor-pointer items-center gap-3 text-sm"
              >
                <input
                  name="discontinued"
                  type="checkbox"
                  bind:checked={$form.discontinued}
                  {...$constraints.discontinued}
                  class="toggle toggle-primary toggle-sm"
                />
                <span>
                  <span class="font-medium text-base-content">
                    Discontinued
                    <FormHelpLink
                      href="/docs/submission-manual/cubes#discontinued"
                      title="discontinued cubes"
                    />
                  </span>
                  <span class="ml-1 text-base-content/50">
                    No longer produced by the manufacturer.
                  </span>
                </span>
              </label>

              <div class="grid gap-6 md:grid-cols-2">
                {#snippet releaseDateField()}
                  <input
                    name="releaseDate"
                    type="text"
                    inputmode="numeric"
                    placeholder="YYYY, YYYY-MM, or YYYY-MM-DD"
                    autocomplete="off"
                    class="input w-full"
                    bind:value={$form.releaseDate}
                    {...$constraints.releaseDate}
                  />
                {/snippet}
                <FormField
                  title="Release date"
                  error={$errors.releaseDate}
                  helpHref="/docs/submission-manual/cubes#release-date"
                  children={releaseDateField}
                />
                {#snippet imageURLField()}
                  <input
                    name="imageUrl"
                    type="url"
                    bind:value={$form.imageUrl}
                    {...$constraints.imageUrl}
                    class="input w-full"
                    required
                  />
                {/snippet}
                <FormField
                  title="Image URL"
                  error={$errors.imageUrl}
                  required
                  helpHref="/docs/submission-manual/cubes#image-url"
                  children={imageURLField}
                />
              </div>

              <div class="grid gap-6 md:grid-cols-3">
                {#snippet surfaceFinishField()}
                  <select
                    name="surfaceFinish"
                    bind:value={$form.surfaceFinish}
                    {...$constraints.surfaceFinish}
                    class="select w-full"
                  >
                    {#each surfaces as surface, index (index)}
                      <option>{surface}</option>
                    {/each}
                  </select>
                {/snippet}
                <FormField
                  title="Surface finish"
                  error={$errors.surfaceFinish}
                  helpHref="/docs/submission-manual/cubes#surface-finish"
                  children={surfaceFinishField}
                />
                {#snippet weightField()}
                  <div class="input flex w-full items-center gap-2">
                    <input
                      name="weight"
                      type="number"
                      min="1"
                      step="0.1"
                      class="min-w-0 grow"
                      bind:value={$form.weight}
                      {...$constraints.weight}
                    />
                    <span class="badge badge-ghost badge-sm">g</span>
                  </div>
                {/snippet}
                <FormField
                  title="Weight (g)"
                  error={$errors.weight}
                  helpHref="/docs/submission-manual/cubes#weight"
                  children={weightField}
                />
                {#snippet sizeField()}
                  <div class="input flex w-full items-center gap-2">
                    <input
                      name="size"
                      type="text"
                      placeholder="L x W x H"
                      class="min-w-0 grow"
                      bind:value={$form.size}
                      {...$constraints.size}
                    />
                    <span class="badge badge-ghost badge-sm">mm</span>
                  </div>
                {/snippet}
                <FormField
                  title="Size (mm)"
                  error={$errors.size}
                  helpHref="/docs/submission-manual/cubes#size"
                  children={sizeField}
                />
              </div>
            </section>

            <section class="space-y-5">
              <div class="space-y-1">
                <h2 class="flex items-center gap-2 text-xl font-semibold">
                  <i
                    class="fa-solid fa-wand-magic-sparkles text-primary"
                    aria-hidden="true"
                  ></i>
                  Features <FormHelpLink
                    href={cubeSubmissionManualPath + "#features"}
                    title="Features"
                  />
                </h2>
                <p class="text-sm text-base-content/60">
                  Select every feature included with this model.
                </p>
              </div>

              <fieldset>
                <legend class="sr-only">Cube features</legend>

                <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {#each features as feature (feature.code)}
                    {@const formKey = featureFormKeys[feature.code]}

                    {#if formKey}
                      <label
                        class="flex cursor-pointer items-center gap-3 rounded-box px-3 py-2 transition-colors hover:bg-base-200"
                      >
                        <input
                          name={formKey}
                          type="checkbox"
                          bind:checked={$form.features[formKey]}
                          {...$constraints.features?.[formKey]}
                          class="checkbox checkbox-primary checkbox-sm"
                        />

                        <span class="text-sm text-base-content">
                          {feature.label}
                        </span>
                      </label>
                    {/if}
                  {/each}
                </div>
              </fieldset>
            </section>
          {:else if currentPage === "vendor-links"}
            <section
              class="overflow-hidden rounded-box border border-base-content/10 bg-base-100"
            >
              <div
                class="flex flex-col gap-3 border-b border-base-content/10 bg-base-200/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <!-- <p class="text-sm text-base-content/60">
                  Missing a vendor?
                  <a
                    href={resolve("/submit/vendor")}
                    class="link link-primary font-medium"
                    target="_blank"
                  >
                    Submit it here
                  </a>
                </p> -->

                <button
                  type="button"
                  class="btn btn-primary btn-sm shrink-0"
                  onclick={() => {
                    $form.vendorLinks = [
                      ...$form.vendorLinks,
                      {
                        vendor_id: 0,
                        url: "",
                        price: 0,
                        available: false,
                      },
                    ];
                    vendorAutofillStates.push({
                      status: "idle",
                      errorMessage: "",
                    });
                  }}
                >
                  <i class="fa-solid fa-plus" aria-hidden="true"></i>
                  Add Vendor
                </button>
              </div>

              {#if $form.vendorLinks.length === 0}
                <div
                  class="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center"
                >
                  <div
                    class="rounded-full bg-base-200 p-4 text-base-content/50"
                  >
                    <i class="fa-solid fa-link text-xl" aria-hidden="true"></i>
                  </div>

                  <div>
                    <p class="font-medium">No vendor links added</p>
                    <p class="text-sm text-base-content/60">
                      Add a vendor to configure its product URL and price.
                    </p>
                  </div>
                </div>
              {:else}
                <div class="overflow-x-auto">
                  <table class="table">
                    <thead class="bg-base-200/30">
                      <tr>
                        <th class="min-w-48">Vendor</th>
                        <th class="min-w-72">Product URL</th>
                        <th class="min-w-40">Price</th>
                        <th class="text-center">Available</th>
                        <th class="min-w-32 text-right">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {#each $form.vendorLinks as link, index (index)}
                        {@const currentVendor = vendors.find(
                          (vendor) => vendor.id === link.vendor_id,
                        )}
                        {@const vendorErrors = $errors.vendorLinks?.[index]}
                        <!-- {@const hasProductUrl = Boolean(link.url?.trim())} -->
                        {@const vendorAutofillState =
                          vendorAutofillStates[index]}

                        <tr class="align-top hover:bg-base-200/20">
                          <td>
                            <select
                              name="vendorLinks"
                              bind:value={link.vendor_id}
                              class:select-error={Boolean(
                                vendorErrors?.vendor_id,
                              )}
                              class="select select-bordered w-full"
                              required
                            >
                              <option value={0} disabled>Select vendor</option>

                              {#each vendors as vendor, index (index)}
                                <option value={vendor.id}>
                                  {vendor.name}
                                </option>
                              {/each}
                            </select>

                            {#if vendorErrors?.vendor_id}
                              <p class="mt-1 text-xs text-error">
                                {vendorErrors.vendor_id}
                              </p>
                            {/if}
                          </td>

                          <td>
                            <label
                              class:input-error={Boolean(vendorErrors?.url)}
                              class="input input-bordered flex w-full items-center gap-2"
                            >
                              <i
                                class="fa-solid fa-link shrink-0 text-base-content/40"
                                aria-hidden="true"
                              ></i>

                              <input
                                name="vendorLinks"
                                type="url"
                                class="min-w-0 grow"
                                bind:value={link.url}
                                oninput={() => {
                                  vendorAutofillState.status = "idle";
                                  vendorAutofillState.errorMessage = "";
                                }}
                                placeholder={currentVendor?.base_url ??
                                  "https://example.com/product"}
                              />
                            </label>

                            {#if vendorErrors?.url}
                              <p class="mt-1 text-xs text-error">
                                {vendorErrors.url}
                              </p>
                            {/if}
                          </td>

                          <td>
                            <label
                              class:input-error={Boolean(vendorErrors?.price)}
                              class="input input-bordered flex w-full items-center gap-2"
                            >
                              <span class="text-base-content/50">
                                {getCurrencySymbol(currentVendor?.currency) ??
                                  "—"}
                              </span>

                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                class="min-w-0 grow"
                                name="vendorLinks"
                                bind:value={link.price}
                              />
                            </label>

                            {#if vendorErrors?.price}
                              <p class="mt-1 text-xs text-error">
                                {vendorErrors.price}
                              </p>
                            {/if}
                          </td>

                          <td class="text-center">
                            <input
                              type="checkbox"
                              class="checkbox"
                              name="vendorLinks"
                              bind:checked={link.available}
                            />

                            {#if vendorErrors?.available}
                              <p class="mt-1 text-xs text-error">
                                {vendorErrors.available}
                              </p>
                            {/if}
                          </td>

                          <td>
                            <div class="flex flex-col items-end gap-1">
                              <div class="flex justify-end gap-2">
                                <!-- <button
                                  type="button"
                                  class="btn btn-outline btn-sm"
                                  class:btn-info={vendorAutofillState.status ===
                                    "idle" ||
                                    vendorAutofillState.status === "loading"}
                                  class:btn-success={vendorAutofillState.status ===
                                    "success"}
                                  class:btn-error={vendorAutofillState.status ===
                                    "error"}
                                  disabled={!hasProductUrl ||
                                    vendorAutofillState.status === "loading"}
                                  aria-live="polite"
                                  title="Autofill using the product URL"
                                  onclick={() => autofillVendorPrice(index)}
                                >
                                  {#if vendorAutofillState.status === "loading"}
                                    <i
                                      class="fa-solid fa-spinner fa-spin"
                                      aria-hidden="true"
                                    ></i>
                                    <span class="hidden xl:inline">
                                      Loading
                                    </span>
                                  {:else if vendorAutofillState.status === "success"}
                                    <i
                                      class="fa-solid fa-check"
                                      aria-hidden="true"
                                    ></i>
                                    <span class="hidden xl:inline">
                                      Success
                                    </span>
                                  {:else if vendorAutofillState.status === "error"}
                                    <i
                                      class="fa-solid fa-triangle-exclamation"
                                      aria-hidden="true"
                                    ></i>
                                    <span class="hidden xl:inline">
                                      Error
                                    </span>
                                  {:else}
                                    <i
                                      class="fa-solid fa-wand-magic-sparkles"
                                      aria-hidden="true"
                                    ></i>
                                    <span class="hidden xl:inline">
                                      Autofill
                                    </span>
                                  {/if}
                                </button> -->

                                <button
                                  type="button"
                                  class="btn btn-ghost btn-sm text-error hover:bg-error/10"
                                  title="Remove vendor"
                                  onclick={() => {
                                    vendorAutofillStates.splice(index, 1);
                                    $form.vendorLinks =
                                      $form.vendorLinks.filter(
                                        (_, rowIndex) => rowIndex !== index,
                                      );
                                  }}
                                >
                                  <i
                                    class="fa-solid fa-trash"
                                    aria-hidden="true"
                                  ></i>
                                </button>
                              </div>

                              <!-- {#if vendorAutofillState.errorMessage}
                                <p
                                  class="max-w-48 wrap-break-words text-right text-xs text-error"
                                  role="alert"
                                >
                                  {vendorAutofillState.errorMessage}
                                </p>
                              {/if} -->
                            </div>
                          </td>
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                </div>
              {/if}
            </section>
          {:else if currentPage === "sources"}
            <section class="space-y-6">
              <div class="space-y-1">
                <h2
                  id="submitter-note-heading"
                  class="flex items-center gap-2 text-xl font-semibold"
                >
                  <i
                    class="fa-solid fa-file-lines text-primary"
                    aria-hidden="true"
                  ></i>
                  Sources and notes
                </h2>
                <p class="text-sm text-base-content/60">
                  Help reviewers verify the submission and understand any
                  details that are not clear from the form alone.
                </p>
              </div>

              {#snippet submitterNoteField()}
                <textarea
                  name="submitterNote"
                  class="textarea min-h-40 w-full"
                  placeholder="Add source links and any context reviewers should know…"
                  bind:value={$form.submitterNote}
                  {...$constraints.submitterNote}></textarea>
              {/snippet}
              <FormField
                title="Sources and notes"
                error={$errors.submitterNote}
                required
                helpHref="/docs/submission-manual/cubes#submitter-note"
                children={submitterNoteField}
              />
            </section>
          {/if}

          <FormFooter
            {submitLabel}
            {submissionNote}
            message={$message}
            allErrors={$allErrors}
          />
        </div>
      </form>
    </div>
  </div>
</section>

{#if enableAutofill}
  <CubeDetailsAutofillDialog
    bind:open={isAutofillCardOpen}
    {applyData}
    bind:autofill
    dirty={isTainted($tainted)}
  />
{/if}
