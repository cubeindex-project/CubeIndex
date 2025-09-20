<script lang="ts">
  import { superForm } from "sveltekit-superforms";
  import type { Cube } from "$lib/components/dbTableTypes.js";
  import SearchCubes from "$lib/components/cube/searchCubes.svelte";

  const { data } = $props();
  const { brands, types, surfaces, subTypes } = data;
  let cubes: Cube[] = $derived(data.cubes);

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

  const { form, allErrors, errors, constraints, message, enhance } = superForm(
    data.form,
    {
      dataType: "json",
      resetForm: false,
      onError({ result }) {
        $message = result.error.message || "Unknown error";
      },
    }
  );

  let allCubes: {
    label: string;
    value: string;
  }[] = $state([]);

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

  const fillWithDemoData = () => {
    const brandName = brands[0]?.name;
    const typeName = types[0]?.name;
    const finishName = surfaces[0];
    const fallbackSubType = subTypes[0] ?? "auto";
    if (!brandName || !typeName || !finishName) {
      $message =
        "Add at least one brand, type, and surface finish before using the autofill.";
      return;
    }

    const baseCube = allCubes[0];

    $form = {
      ...$form,
      series: "Aurora",
      model: "Velocity",
      versionType: "Trim",
      versionName: "Galaxy UV",
      brand: brandName,
      type: typeName,
      sub_type: fallbackSubType,
      relatedTo: baseCube?.value ?? "",
      releaseDate: "2024-06-01",
      imageUrl: "https://cdn.cubeindex.dev/demo/aurora-velocity.jpg",
      surfaceFinish: finishName,
      weight: 63.5,
      size: "56 x 56 x 56",
      discontinued: false,
      features: {
        ...$form.features,
        wcaLegal: true,
        magnetic: true,
        smart: false,
        modded: false,
        maglev: true,
        stickered: true,
        ballCore: true,
      },
    };

    $message = "Loaded demo cube details - adjust as needed before submitting.";
  };
</script>

<section class="relative min-h-screen overflow-hidden bg-base-200/80 py-16">
  <div
    class="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-base-200 to-secondary/5"
  ></div>
  <div class="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-6">
    <header class="flex flex-col items-center text-center gap-3">
      <h1 class="text-4xl font-clash font-semibold text-base-content">
        Submit a Cube
      </h1>
      <p class="max-w-2xl text-base-content/70">
        Provide accurate manufacturer details so the CubeIndex team can review
        and publish your cube quickly. Double-check specs before you send them.
      </p>
    </header>

    <div
      class="grid items-start gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
    >
      <form
        method="POST"
        use:enhance
        class="card border border-base-200 bg-base-100 shadow-xl"
      >
        <div class="card-body space-y-10">
          <div class="flex justify-end">
            <button
              type="button"
              class="btn btn-ghost btn-sm"
              onclick={fillWithDemoData}
            >
              Fill with demo data
            </button>
          </div>

          <section class="space-y-6" aria-labelledby="cube-identity">
            <div class="space-y-2">
              <h2
                id="cube-identity"
                class="text-xl font-semibold text-base-content"
              >
                Cube identity
              </h2>
              <p class="text-sm text-base-content/70">
                Tell us how the manufacturer refers to this cube.
              </p>
            </div>
            <div class="grid gap-6 md:grid-cols-2">
              <label
                class="flex flex-col gap-2 text-sm font-medium text-base-content/80"
              >
                Series
                <input
                  name="series"
                  type="text"
                  placeholder="GAN356"
                  bind:value={$form.series}
                  class="input input-lg w-full"
                />
                {#if $errors.series}
                  <span class="text-xs text-error">{$errors.series}</span>
                {/if}
              </label>
              <label
                class="flex flex-col gap-2 text-sm font-medium text-base-content/80"
              >
                <span>Model <span class="text-error">*</span></span>
                <input
                  name="model"
                  type="text"
                  placeholder="Maglev"
                  bind:value={$form.model}
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
                <span>Edition type <span class="text-error">*</span></span>
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
                {#if $errors.versionType}
                  <span class="text-xs text-error">{$errors.versionType}</span>
                {/if}
              </label>
              <label
                class="flex flex-col gap-2 text-sm font-medium text-base-content/80"
              >
                <span>Edition name <span class="text-error">*</span></span>
                <input
                  name="version"
                  type="text"
                  placeholder="UV / 10 Year Edition"
                  bind:value={$form.versionName}
                  class="input input-lg w-full"
                  required
                  disabled={$form.versionType === "Base"}
                />
                {#if $errors.versionName}
                  <span class="text-xs text-error">{$errors.versionName}</span>
                {/if}
              </label>
            </div>

            <div class="grid gap-6 md:grid-cols-2">
              <label
                class="flex flex-col gap-2 text-sm font-medium text-base-content/80"
              >
                <span>Brand <span class="text-error">*</span></span>
                <select
                  name="brand"
                  bind:value={$form.brand}
                  class="select select-lg w-full"
                  required
                >
                  {#each brands as b}
                    <option>{b.name}</option>
                  {/each}
                </select>
                {#if $errors.brand}
                  <span class="text-xs text-error">{$errors.brand}</span>
                {/if}
                <span class="text-xs text-base-content/60">
                  Missing a manufacturer? Let the team know through the cube
                  report button or Discord and we will add it for you.
                </span>
              </label>
              <label
                class="flex flex-col gap-2 text-sm font-medium text-base-content/80"
              >
                <span>Cube type <span class="text-error">*</span></span>
                <select
                  name="type"
                  bind:value={$form.type}
                  class="select select-lg w-full"
                  required
                >
                  {#each types as t}
                    <option>{t.name}</option>
                  {/each}
                </select>
                {#if $errors.type}
                  <span class="text-xs text-error">{$errors.type}</span>
                {/if}
                <span class="text-xs text-base-content/60">
                  Need another cube type? Let the team know through the cube
                  report button or Discord and we will add it for you.
                </span>
              </label>
            </div>

            <div
              class="flex flex-col gap-2 text-sm font-medium text-base-content/80"
            >
              Sub-type
              <select
                name="subType"
                bind:value={$form.sub_type}
                class="select select-lg w-full"
                required
              >
                <option value="auto">Handle Automatically</option>
                {#each subTypes as subType}
                  <option value={subType}>{subType}</option>
                {/each}
              </select>
              {#if $errors.sub_type}
                <span class="text-xs text-error">{$errors.sub_type}</span>
              {/if}
            </div>

            <div class="space-y-3">
              <p class="text-sm font-medium text-base-content">
                Related model link
              </p>
              <div class="rounded-xl border border-base-200 bg-base-200/40 p-4">
                <p class="mb-2 text-xs text-base-content/60">
                  Only approved cubes appear here. Select the base model this
                  release is derived from.
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
                Media &amp; specs
              </h2>
              <p class="text-sm text-base-content/70">
                Share reference imagery and key physical attributes.
              </p>
            </div>
            <div class="grid gap-6 md:grid-cols-2">
              <label
                class="flex flex-col gap-2 text-sm font-medium text-base-content/80"
              >
                <span>Release date <span class="text-error">*</span></span>
                <input
                  name="releaseDate"
                  type="date"
                  bind:value={$form.releaseDate}
                  class="input input-lg w-full"
                  required
                />
                {#if $errors.releaseDate}
                  <span class="text-xs text-error">{$errors.releaseDate}</span>
                {/if}
              </label>
              <label
                class="flex flex-col gap-2 text-sm font-medium text-base-content/80"
              >
                <span>Image URL <span class="text-error">*</span></span>
                <input
                  name="imageUrl"
                  type="url"
                  bind:value={$form.imageUrl}
                  class="input input-lg w-full"
                  placeholder="https://..."
                  required
                />
                {#if $errors.imageUrl}
                  <span class="text-xs text-error">{$errors.imageUrl}</span>
                {/if}
                <span class="text-xs text-base-content/60"
                  >Use an official product or press image.</span
                >
              </label>
            </div>

            <div class="grid gap-6 md:grid-cols-3">
              <label
                class="flex flex-col gap-2 text-sm font-medium text-base-content/80"
              >
                <span>Surface finish <span class="text-error">*</span></span>
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
                {#if $errors.surfaceFinish}
                  <span class="text-xs text-error">{$errors.surfaceFinish}</span>
                {/if}
              </label>
              <label
                class="flex flex-col gap-2 text-sm font-medium text-base-content/80"
              >
                <span>Weight (g) <span class="text-error">*</span></span>
                <input
                  name="weight"
                  type="number"
                  min="0"
                  step="0.1"
                  bind:value={$form.weight}
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
                <span>Size (mm) <span class="text-error">*</span></span>
                <input
                  name="size"
                  type="text"
                  placeholder="W x H x D"
                  bind:value={$form.size}
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
                Feature profile
              </h2>
              <p class="text-sm text-base-content/70">
                Mark every hardware capability that ships with this cube.
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
                  class="checkbox checkbox-primary mt-1"
                />
                <span>
                  <span class="block font-medium text-base-content"
                    >WCA legal</span
                  >
                  <span class="text-xs text-base-content/70"
                    >Approved for use in official competitions.</span
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
                  class="checkbox checkbox-primary mt-1"
                />
                <span>
                  <span class="block font-medium text-base-content"
                    >Magnetic</span
                  >
                  <span class="text-xs text-base-content/70"
                    >Factory-installed magnets for layer alignment.</span
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
                  class="checkbox checkbox-primary mt-1"
                />
                <span>
                  <span class="block font-medium text-base-content">Smart</span>
                  <span class="text-xs text-base-content/70"
                    >Bluetooth or app-connected tracking features.</span
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
                  class="checkbox checkbox-primary mt-1"
                />
                <span>
                  <span class="block font-medium text-base-content">Modded</span
                  >
                  <span class="text-xs text-base-content/70"
                    >Community or premium mod rather than stock hardware.</span
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
                  class="checkbox checkbox-primary mt-1"
                />
                <span>
                  <span class="block font-medium text-base-content">MagLev</span
                  >
                  <span class="text-xs text-base-content/70"
                    >Magnetic levitation tensioning system.</span
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
                  class="checkbox checkbox-primary mt-1"
                />
                <span>
                  <span class="block font-medium text-base-content"
                    >Ball core</span
                  >
                  <span class="text-xs text-base-content/70"
                    >Includes a magnetic core-ball assembly.</span
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
                  class="checkbox checkbox-primary mt-1"
                />
                <span>
                  <span class="block font-medium text-base-content"
                    >Stickered</span
                  >
                  <span class="text-xs text-base-content/70"
                    >Ships with factory stickers instead of tiles or primary
                    plastic.</span
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
                  class="checkbox checkbox-primary mt-1"
                />
                <span>
                  <span class="block font-medium text-base-content"
                    >Discontinued</span
                  >
                  <span class="text-xs text-base-content/70"
                    >The manufacturer no longer produces this cube.</span
                  >
                </span>
              </label>
            </div>
          </section>

          <div class="flex flex-col gap-3">
            <button type="submit" class="btn btn-primary btn-lg w-full"
              >Submit cube</button
            >
            <p class="text-center text-xs text-base-content/60">
              It make take up to a week for your submission to be approved.
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
                  Please fix the highlighted fields
                </h2>
                <ul class="mt-2 list-disc space-y-1 pl-4 text-sm">
                  {#each $allErrors as error}
                    <li>
                      <span class="font-semibold text-base-content"
                        >{error.path}:</span
                      >
                      {error.messages.join(". ")}
                    </li>
                  {/each}
                </ul>
              </div>
            </div>
          {/if}
        </div>
      </form>

      <aside class="space-y-4">
        <div class="card border border-base-200 bg-base-100/80 shadow-sm">
          <div class="card-body space-y-4">
            <h2 class="text-lg font-semibold text-base-content">
              Submission checklist
            </h2>
            <ul class="space-y-3 text-sm text-base-content/70">
              <li class="flex items-start gap-3">
                <i class="fa-solid fa-circle-check text-primary mt-1"></i>
                <span
                  >Confirm the model name, release date, and specs against
                  manufacturer documentation.</span
                >
              </li>
              <li class="flex items-start gap-3">
                <i class="fa-solid fa-circle-check text-primary mt-1"></i>
                <span
                  >Upload imagery that is free to share and clearly shows the
                  retail product.</span
                >
              </li>
              <li class="flex items-start gap-3">
                <i class="fa-solid fa-circle-check text-primary mt-1"></i>
                <span
                  >Explain relationships to existing cubes when submitting trims
                  or limited editions.</span
                >
              </li>
            </ul>
          </div>
        </div>

        <div
          class="card border border-dashed border-base-200 bg-base-100/60 shadow-sm"
        >
          <div class="card-body space-y-4">
            <h2 class="text-lg font-semibold text-base-content">
              What happens next?
            </h2>
            <ol class="space-y-3 text-sm text-base-content/70">
              <li class="flex gap-3">
                <span class="badge badge-sm badge-outline mt-0.5">1</span>
                <span
                  >Our reviewers check your submission for accuracy and
                  completeness.</span
                >
              </li>
              <li class="flex gap-3">
                <span class="badge badge-sm badge-outline mt-0.5">2</span>
                <span
                  >Approved cubes go live on CubeIndex with credit to your
                  profile.</span
                >
              </li>
            </ol>
            <div
              class="rounded-xl bg-base-200/60 px-4 py-3 text-sm text-base-content/70"
            >
              Need direct help? Contact us on <a href="/discord" class="link"
                >Discord</a
              >.
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</section>
