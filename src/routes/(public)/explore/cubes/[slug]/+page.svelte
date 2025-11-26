<script lang="ts">
  import type { Cube } from "$lib/components/dbTableTypes.js";
  import { formatDate } from "$lib/components/helper_functions/formatDate.svelte.js";

  let { data } = $props();
  let {
    cube = {},
    features = [],
    submittedBy,
    verifiedBy,
    meta,
  } = $derived(data);

  const feats = $derived.by(() => {
    const s = new Set<string>();
    for (const f of features) if (f.cube === cube.slug) s.add(f.feature);
    return s;
  });

  const isMagnetic = $derived.by(() => feats.has("magnetic"));
  const isSmart = $derived.by(() => feats.has("smart"));
  const isWcaLegal = $derived.by(() => feats.has("wca_legal"));
  const isDiscontinued = $derived.by(() => cube.discontinued);
  const isModded = $derived.by(() => feats.has("modded"));

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
    allFeatureBadges.filter((b) => feats.has(b.key))
  );
</script>

<svelte:head>
  <title>{meta.title}</title>
  <meta name="description" content={meta.description} />

  <meta property="og:title" content={meta.title} />
  <meta property="og:description" content={meta.description} />
  <meta property="og:image" content={meta.ogImage} />
  <meta property="og:url" content={meta.canonical} />
  <meta property="og:type" content="website" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={meta.title} />
  <meta name="twitter:description" content={meta.description} />
  <meta name="twitter:image" content={meta.ogImage} />

  <link rel="canonical" href={meta.canonical} />

  {@html `<script type="application/ld+json">${meta.ldJSON}</script>`}

  <link
    rel="preload"
    as="image"
    href={meta.preloadImage}
    fetchpriority="high"
  />
  <link rel="dns-prefetch" href="//res.cloudinary.com" />
</svelte:head>

<section class="space-y-6">
  <!-- Overview / Description -->
  <div class="p-5 bg-base-200 rounded-2xl border border-base-300 shadow-sm">
    <h2 class="text-base font-semibold opacity-70 mb-2">About</h2>
    <p class="leading-relaxed">
      The
      <span class="font-semibold text-primary">
        {`${cube.series} ${cube.model}${cube.version_type !== "Base" && cube.version_name ? ` ${cube.version_name}` : ""}`}
      </span>
      is a <span class="font-medium">{cube.type}</span> twisty puzzle
      {#if cube.release_date}
        released on
        <span class="font-medium">{formatDate(cube.release_date)}</span>
      {/if}. It is
      <span class="font-medium">{isMagnetic ? "magnetic" : "non‑magnetic"}</span
      >,
      <span class="font-medium">{isSmart ? "smart" : "non‑smart"}</span>, and
      <span class="font-medium"
        >{isWcaLegal ? "WCA‑legal" : "not WCA‑legal"}</span
      >. Currently
      <span class="font-medium"
        >{isDiscontinued ? "discontinued" : "available"}</span
      >
      with a community rating of
      <span class="font-medium">{(cube.rating ?? 0).toFixed(1)}/5</span>
      and
      <span class="font-medium">{isModded ? "modded" : "original"}</span> design.
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
          <dd class="font-medium">{cube.weight} g</dd>
        </div>
        <div
          class="flex items-center justify-between sm:justify-start sm:gap-3"
        >
          <dt class="opacity-70">Size</dt>
          <dd class="font-medium">{cube.size} mm</dd>
        </div>
        <div
          class="flex items-center justify-between sm:justify-start sm:gap-3"
        >
          <dt class="opacity-70">Surface</dt>
          <dd class="font-medium">{cube.surface_finish || "—"}</dd>
        </div>
        <div
          class="flex items-center justify-between sm:justify-start sm:gap-3"
        >
          <dt class="opacity-70">Version</dt>
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
      <h3 class="text-base font-semibold opacity-70 mb-3">Features</h3>
      {#if presentFeatures.length > 0}
        <div class="flex flex-wrap gap-2">
          {#each presentFeatures as f}
            <span class="badge badge-success badge-outline gap-1">
              <i class={`fa-solid ${f.icon}`}></i>
              {f.label}
            </span>
          {/each}
          {#if isDiscontinued}
            <span class="badge badge-error gap-1">
              <i class="fa-solid fa-ban"></i>
              Discontinued
            </span>
          {/if}
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
      <div class="flex items-center gap-3">
        <i class="fa-regular fa-circle-check opacity-70"></i>
        <div>
          <div class="text-xs opacity-70">Verified By</div>
          <a class="font-medium link" href="/user/{verifiedBy?.username}">
            {verifiedBy?.display_name || "Unknown"}
          </a>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <i class="fa-regular fa-user opacity-70"></i>
        <div>
          <div class="text-xs opacity-70">Submitted By</div>
          <a class="font-medium link" href="/user/{submittedBy?.username}">
            {submittedBy?.display_name || "Unknown"}
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
