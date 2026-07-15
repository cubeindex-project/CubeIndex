<script lang="ts">
  import { resolve } from "$app/paths";
  import MissingValue from "$lib/components/misc/MissingValue.svelte";
  import { formatDate } from "$lib/utils/formatDate.js";
  import { formatPartialDate } from "$lib/utils/formatPartialDate.js";

  let { data } = $props();
  let { cube, submitter, verifier } = $derived(data);

  const allFeatureBadges = [
    { label: "Smart", key: "smart", icon: "fa-microchip" },
    { label: "Magnetic", key: "magnetic", icon: "fa-magnet" },
    { label: "Modded", key: "modded", icon: "fa-screwdriver-wrench" },
    { label: "WCA Legal", key: "wca_legal", icon: "fa-scale-balanced" },
    { label: "Maglev", key: "maglev", icon: "fa-bolt" },
    { label: "Stickered", key: "stickered", icon: "fa-tags" },
    { label: "Ball Core", key: "ball_core", icon: "fa-circle-dot" },
  ] as const;

  const presentFeatures = $derived.by(() =>
    allFeatureBadges.filter((badge) => Boolean(cube[badge.key])),
  );

  const missingFields = $derived(
    Object.entries({
      "release date": cube.release_date,
      weight: cube.weight,
      size: cube.size,
      "surface finish": cube.surface_finish,
    })
      .filter(([, value]) => value === null)
      .map(([label]) => label),
  );
</script>

{#snippet missingField()}
  <MissingValue missingValueText="Unknown" />
{/snippet}

<section class="space-y-6">
  {#if missingFields.length > 0}
    <div class="alert alert-warning" role="note">
      <i class="fa-solid fa-triangle-exclamation"></i>
      <span>
        Some data is missing: <span class="font-bold">
          {missingFields.join(", ")}
        </span>. If you know these values, please create a report.
      </span>
    </div>
  {/if}

  <!-- Overview / Description -->
  <div class="p-5 bg-base-200 rounded-2xl border border-base-300 shadow-sm">
    <h2 class="text-base font-semibold opacity-70 mb-2">About</h2>
    <p class="leading-relaxed">
      The
      <span class="font-semibold text-primary">
        {cube.name}
      </span>
      is a <span class="font-medium">{cube.type}</span> twisty puzzle
      {#if cube.release_date}
        released on
        <span class="font-medium">
          {formatPartialDate(cube.release_date, cube.release_date_precision)}
        </span>
      {:else}
        with no release date provided
      {/if}. It is
      <span class="font-medium"
        >{cube.magnetic ? "magnetic" : "non‑magnetic"}</span
      >,
      <span class="font-medium">{cube.smart ? "smart" : "non‑smart"}</span>, and
      <span class="font-medium"
        >{cube.wca_legal ? "WCA‑legal" : "not WCA‑legal"}</span
      >. Currently
      <span class="font-medium"
        >{cube.discontinued ? "discontinued" : "available"}</span
      >
      with a community rating of
      <span class="font-medium">{(cube.rating ?? 0).toFixed(1)}/5</span>
      and
      <span class="font-medium">{cube.modded ? "modded" : "original"}</span> design.
    </p>
  </div>

  <!-- Specs + Features -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <!-- Specs -->
    <div class="bg-base-200 rounded-2xl p-5 border border-base-300">
      <h3 class="text-base font-semibold opacity-70 mb-3">Specifications</h3>
      <dl class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          class="flex items-center justify-between sm:justify-start sm:gap-3"
        >
          <dt class="opacity-70">Brand</dt>
          <dd class="font-medium">{cube.brand}</dd>
        </div>
        <div
          class="flex items-center justify-between sm:justify-start sm:gap-3"
        >
          <dt class="opacity-70">Type</dt>
          <dd class="font-medium">{cube.type}</dd>
        </div>
        <div
          class="flex items-center justify-between sm:justify-start sm:gap-3"
        >
          <dt class="opacity-70">Weight</dt>
          {#if cube.weight !== null}
            <dd class="font-medium">{cube.weight} g</dd>
          {:else}
            {@render missingField()}
          {/if}
        </div>
        <div
          class="flex items-center justify-between sm:justify-start sm:gap-3"
        >
          <dt class="opacity-70">Size</dt>
          {#if cube.size}
            <dd class="font-medium">{cube.size} mm</dd>
          {:else}
            {@render missingField()}
          {/if}
        </div>
        <div
          class="flex items-center justify-between sm:justify-start sm:gap-3"
        >
          <dt class="opacity-70">Surface</dt>
          {#if cube.surface_finish}
            {cube.surface_finish}
          {:else}
            {@render missingField()}
          {/if}
        </div>
        <div
          class="flex items-center justify-between sm:justify-start sm:gap-3"
        >
          <dt class="opacity-70">Version</dt>
          <dd class="font-medium">{cube.version_type}</dd>
        </div>
      </dl>
    </div>

    <!-- Features -->
    <div class="bg-base-200 rounded-2xl p-5 border border-base-300">
      <h3 class="text-base font-semibold opacity-70 mb-3">Features</h3>
      {#if presentFeatures.length > 0}
        <div class="flex flex-wrap gap-2">
          {#each presentFeatures as f (f.key)}
            <span class="badge badge-success badge-outline gap-1">
              <i class={`fa-solid ${f.icon}`}></i>
              {f.label}
            </span>
          {/each}
        </div>
      {:else}
        <p class="opacity-70">No special features listed.</p>
      {/if}
    </div>
  </div>

  <!-- Database meta -->
  <div class="bg-base-200 rounded-2xl p-5 border border-base-300">
    <h3 class="text-base font-semibold opacity-70 mb-3">Database</h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div class="flex items-center gap-3">
        <i class="fa-regular fa-id-badge opacity-70"></i>
        <div>
          <div class="text-xs opacity-70">ID</div>
          <div class="font-medium">{cube.id}</div>
        </div>
      </div>
      {#if verifier}
        <div class="flex items-center gap-3">
          <i class="fa-regular fa-circle-check opacity-70"></i>
          <div>
            <div class="text-xs opacity-70">Verified By</div>
            <a
              class="font-medium link"
              href={verifier.username
                ? resolve("/(public)/user/[username]", {
                    username: verifier.username,
                  })
                : "#"}
            >
              {verifier.display_name ?? "Unknown"}
            </a>
          </div>
        </div>
      {/if}
      <div class="flex items-center gap-3">
        <i class="fa-regular fa-user opacity-70"></i>
        <div>
          <div class="text-xs opacity-70">Submitted By</div>
          <a
            class="font-medium link"
            href={submitter.username
              ? resolve("/(public)/user/[username]", {
                  username: submitter.username,
                })
              : "#"}
          >
            {submitter.display_name || "Unknown"}
          </a>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <i class="fa-regular fa-calendar-plus opacity-70"></i>
        <div>
          <div class="text-xs opacity-70">Added</div>
          <div class="font-medium">
            {cube.created_at ? formatDate(cube.created_at) : "—"}
          </div>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <i class="fa-regular fa-clock opacity-70"></i>
        <div>
          <div class="text-xs opacity-70">Last Updated</div>
          <div class="font-medium">
            {cube.updated_at ? formatDate(cube.updated_at) : "—"}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
