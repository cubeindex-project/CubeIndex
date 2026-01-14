<script lang="ts">
  import { formatDate } from "$lib/components/helper_functions/formatDate.svelte.js";
  import { m } from "$lib/paraglide/messages";

  let { data } = $props();
  let { cube, features = [], submittedBy, verifiedBy } = $derived(data);

  const isMagnetic = $derived.by(() => features.includes("magnetic"));
  const isSmart = $derived.by(() => features.includes("smart"));
  const isWcaLegal = $derived.by(() => features.includes("wca_legal"));
  const isDiscontinued = $derived.by(() => cube.discontinued);
  const isModded = $derived.by(() => features.includes("modded"));

  const allFeatureBadges = [
    { label: m.explore_cube_feature_smart_label(), key: "smart", icon: "fa-microchip" },
    { label: m.explore_cube_feature_magnetic_label(), key: "magnetic", icon: "fa-magnet" },
    { label: m.explore_cube_feature_modded_label(), key: "modded", icon: "fa-screwdriver-wrench" },
    { label: m.explore_cube_feature_wca_legal_label(), key: "wca_legal", icon: "fa-scale-balanced" },
    { label: m.explore_cube_feature_maglev_label(), key: "maglev", icon: "fa-bolt" },
    { label: m.explore_cube_feature_stickered_label(), key: "stickered", icon: "fa-tags" },
    { label: m.explore_cube_feature_ball_core_label(), key: "ball_core", icon: "fa-circle-dot" },
  ] as const;

  const presentFeatures = $derived.by(() =>
    allFeatureBadges.filter((b) => features.includes(b.key)),
  );
</script>

<svelte:head>
  <title>{m.explore_cube_meta_title({ name: cube.name })}</title>
</svelte:head>

<section class="space-y-6">
  <!-- Overview / Description -->
  <div class="p-5 bg-base-200 rounded-2xl border border-base-300 shadow-sm">
    <h2 class="text-base font-semibold opacity-70 mb-2">
      {m.explore_cube_about_heading_label()}
    </h2>
    <p class="leading-relaxed">
      {m.explore_cube_about_intro_text({
        name: `${cube.series} ${cube.model}${cube.version_type !== "Base" && cube.version_name ? ` ${cube.version_name}` : ""}`,
        type: cube.type,
      })}
      {#if cube.release_date}
        {m.explore_cube_release_date_text({
          date: formatDate(cube.release_date),
        })}
      {/if}
      {m.explore_cube_about_summary_text({
        magneticState: m.explore_cube_magnetic_state_text({
          isMagnetic: isMagnetic ? "true" : "false",
        }),
        smartState: m.explore_cube_smart_state_text({
          isSmart: isSmart ? "true" : "false",
        }),
        wcaState: m.explore_cube_wca_state_text({
          isWcaLegal: isWcaLegal ? "true" : "false",
        }),
        availabilityState: m.explore_cube_availability_state_text({
          isDiscontinued: isDiscontinued ? "true" : "false",
        }),
        rating: (cube.rating ?? 0).toFixed(1),
        moddedState: m.explore_cube_modded_state_text({
          isModded: isModded ? "true" : "false",
        }),
      })}
    </p>
  </div>

  <!-- Specs + Features -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <!-- Specs -->
    <div class="bg-base-200 rounded-2xl p-5 border border-base-300">
      <h3 class="text-base font-semibold opacity-70 mb-3">
        {m.explore_cube_specs_heading_label()}
      </h3>
      <dl class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          class="flex items-center justify-between sm:justify-start sm:gap-3"
        >
          <dt class="opacity-70">{m.explore_cube_specs_brand_label()}</dt>
          <dd class="font-medium">{cube.brand}</dd>
        </div>
        <div
          class="flex items-center justify-between sm:justify-start sm:gap-3"
        >
          <dt class="opacity-70">{m.explore_cube_specs_type_label()}</dt>
          <dd class="font-medium">{cube.type}</dd>
        </div>
        <div
          class="flex items-center justify-between sm:justify-start sm:gap-3"
        >
          <dt class="opacity-70">{m.explore_cube_specs_weight_label()}</dt>
          <dd class="font-medium">{cube.weight} g</dd>
        </div>
        <div
          class="flex items-center justify-between sm:justify-start sm:gap-3"
        >
          <dt class="opacity-70">{m.explore_cube_specs_size_label()}</dt>
          <dd class="font-medium">{cube.size} mm</dd>
        </div>
        <div
          class="flex items-center justify-between sm:justify-start sm:gap-3"
        >
          <dt class="opacity-70">{m.explore_cube_specs_surface_label()}</dt>
          <dd class="font-medium">{cube.surface_finish || "—"}</dd>
        </div>
        <div
          class="flex items-center justify-between sm:justify-start sm:gap-3"
        >
          <dt class="opacity-70">{m.explore_cube_specs_version_label()}</dt>
          <dd class="font-medium">
            {cube.version_type}{cube.version_type !== "Base" &&
            cube.version_name
              ? ` · ${cube.version_name}`
              : ""}
          </dd>
        </div>
      </dl>
    </div>

    <!-- Features -->
    <div class="bg-base-200 rounded-2xl p-5 border border-base-300">
      <h3 class="text-base font-semibold opacity-70 mb-3">
        {m.explore_cube_features_heading_label()}
      </h3>
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
        <p class="opacity-70">
          {m.explore_cube_features_empty_text()}
        </p>
      {/if}
    </div>
  </div>

  <!-- Database meta -->
  <div class="bg-base-200 rounded-2xl p-5 border border-base-300">
    <h3 class="text-base font-semibold opacity-70 mb-3">
      {m.explore_cube_database_heading_label()}
    </h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div class="flex items-center gap-3">
        <i class="fa-regular fa-id-badge opacity-70"></i>
        <div>
          <div class="text-xs opacity-70">{m.explore_cube_database_id_label()}</div>
          <div class="font-medium">{cube.id}</div>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <i class="fa-regular fa-circle-check opacity-70"></i>
        <div>
          <div class="text-xs opacity-70">
            {m.explore_cube_database_verified_by_label()}
          </div>
          <a class="font-medium link" href="/user/{verifiedBy?.username}">
            {verifiedBy?.display_name || m.common_meta_unknown_label()}
          </a>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <i class="fa-regular fa-user opacity-70"></i>
        <div>
          <div class="text-xs opacity-70">
            {m.explore_cube_database_submitted_by_label()}
          </div>
          <a class="font-medium link" href="/user/{submittedBy?.username}">
            {submittedBy?.display_name || m.common_meta_unknown_label()}
          </a>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <i class="fa-regular fa-calendar-plus opacity-70"></i>
        <div>
          <div class="text-xs opacity-70">{m.explore_cube_database_added_label()}</div>
          <div class="font-medium">
            {cube.created_at ? formatDate(cube.created_at) : "—"}
          </div>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <i class="fa-regular fa-clock opacity-70"></i>
        <div>
          <div class="text-xs opacity-70">
            {m.explore_cube_database_last_updated_label()}
          </div>
          <div class="font-medium">
            {cube.updated_at ? formatDate(cube.updated_at) : "—"}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
