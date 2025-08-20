<script lang="ts">
  import type { Cube } from "$lib/components/dbTableTypes.js";
  import { formatDate } from "$lib/components/helper_functions/formatDate.svelte.js";
  import type { Profiles } from "$lib/components/dbTableTypes.js";

  let { data } = $props();
  let {
    cube = {} as Cube,
    profile = {} as Profiles,
    cubeTrims,
    relatedCube,
    sameSeries,
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

  const statuses = [
    { label: "Smart", key: "smart" },
    { label: "Magnetic", key: "magnetic" },
    { label: "Modded", key: "modded" },
    { label: "WCA Legal", key: "wca_legal" },
    { label: "Maglev", key: "maglev" },
    { label: "Stickered", key: "stickered" },
    { label: "Ball Core", key: "ball_core" },
  ];
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

<div class="mb-4 p-4 bg-base-200 rounded-xl border border-base-300 shadow-sm">
  <p class="leading-relaxed">
    Description:
    <span class="block mt-2">
      The <span class="font-bold text-primary"
        >{`${cube.series} ${cube.model} ${cube.version_type !== "Base" ? cube.version_name : ""}`}</span
      >
      is a
      <span class="font-bold text-primary">{cube.type}</span>
      twisty puzzle released on
      <span class="font-bold text-primary">
        {cube.release_date ? formatDate(cube.release_date) : "Loading..."}
      </span>. It is
      <span class="font-bold text-primary"
        >{isMagnetic ? "magnetic" : "non-magnetic"}</span
      >,
      <span class="font-bold text-primary"
        >{isSmart ? "smart" : "non-smart"}</span
      >, and
      <span class="font-bold text-primary"
        >{isWcaLegal ? "WCA-legal" : "not WCA-legal"}</span
      >. Currently, it is
      <span class="font-bold text-primary"
        >{isDiscontinued ? "discontinued" : "available"}</span
      >, has a community rating of
      <span class="font-bold text-primary">{cube.rating}/5</span>, and is
      <span class="font-bold text-primary"
        >{isModded ? "modded" : "original"}</span
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
      <span class="font-medium">{cube.brand}</span>
    </div>
    <div class="flex items-center justify-between">
      <span>Type:</span>
      <span class="font-medium">{cube.type}</span>
    </div>
    <div class="flex items-center justify-between">
      <span>Weight:</span>
      <span class="font-medium">{cube.weight} g</span>
    </div>
    <div class="flex items-center justify-between">
      <span>Size:</span>
      <span class="font-medium">{cube.size} mm</span>
    </div>
    <div class="flex items-center justify-between">
      <span>Surface Finish:</span>
      <span class="font-medium">{cube.surface_finish}</span>
    </div>
    <div class="flex items-center justify-between">
      <span>Release Date:</span>
      <span class="font-medium">
        {cube.release_date ? formatDate(cube.release_date) : "Loading..."}
      </span>
    </div>
  </div>
  <div class="bg-base-200 rounded-xl p-4 space-y-2 border border-base-300">
    {#each statuses as status}
      <div class="flex items-center justify-between">
        <span class="font-medium text-sm">{status.label}</span>
        <span class="text-xl">
          {feats.has(status.key) ? "✅" : "❌"}
        </span>
      </div>
    {/each}
  </div>
</div>
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
          {cube.created_at ? formatDate(cube.created_at) : "Loading..."}
        </span>
      </div>
      <div class="flex items-center gap-2">
        <span>Last Updated:</span>
        <span class="font-medium">
          {cube.updated_at ? formatDate(cube.updated_at) : "Loading..."}
        </span>
      </div>
      <div class="flex items-center gap-2">
        <span>Verified by:</span>
        <a class="font-medium underline" href="/user/{verifiedBy?.username}">
          {verifiedBy?.display_name || "Unknown"}
        </a>
      </div>
      <div class="flex items-center gap-2">
        <span>Submitted by:</span>
        <a class="font-medium underline" href="/user/{submittedBy?.username}">
          {submittedBy?.display_name || "Unknown"}
        </a>
      </div>
    </div>
  </div>
</div>

{#if cube.notes && profile && profile.user_id === cube.submitted_by}
  <div class="bg-base-200 border border-base-300 rounded-xl p-4 my-8">
    <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
      <i class="fa-solid fa-note-sticky"></i>
      Moderator Note
      <span class="text-xs">(Only you can see this)</span>
    </h2>
    <p class="whitespace-pre-line">{cube.notes}</p>
  </div>
{/if}

{#if cube.version_type === "Base" && cubeTrims && cubeTrims.length > 0}
  <div class="mb-8">
    <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
      <i class="fa-solid fa-palette"></i>
      Select Trim:
    </h2>
    <div class="flex gap-4">
      {#each cubeTrims ?? [] as trim}
        <a
          class="flex flex-col items-center border rounded-xl px-4 py-2 transition duration-200 focus:outline-none border-base-300 bg-base-200 hover:bg-base-300"
          href="/explore/cubes/{trim.slug}"
        >
          <img
            src={`https://res.cloudinary.com/dc7wdwv4h/image/fetch/f_webp,q_auto,w_192/${encodeURIComponent(trim.image_url)}`}
            alt={trim.version_name}
            loading="lazy"
            decoding="async"
            width="192"
            height="192"
            class="h-16 object-contain mb-2 rounded"
          />
          <span class="font-medium">{trim.version_name}</span>
        </a>
      {/each}
    </div>
  </div>
{/if}
{#if (cube.version_type !== "Base" || features.some((f) => f.feature === "modded") === true) && relatedCube}
  <div class="mb-8">
    <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
      <i class="fa-solid fa-palette"></i>
      Related To:
    </h2>
    <div class="flex gap-4">
      <a
        class="flex flex-col items-center border rounded-xl px-4 py-2 transition duration-200 focus:outline-none border-base-300 bg-base-200 hover:bg-base-300"
        href="/explore/cubes/{relatedCube.slug}"
      >
        <img
          src={`https://res.cloudinary.com/dc7wdwv4h/image/fetch/f_webp,q_auto,w_192/${encodeURIComponent(relatedCube.image_url)}`}
          alt={relatedCube.version_name}
          loading="lazy"
          decoding="async"
          width="192"
          height="192"
          class="h-16 object-contain mb-2 rounded"
        />
        <span class="font-medium"
          >{relatedCube.series}
          {relatedCube.model}</span
        >
      </a>
    </div>
  </div>
{/if}
{#if sameSeries && sameSeries.length > 0 && sameSeries[0].series !== ""}
  <div class="mb-8">
    <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
      <i class="fa-solid fa-layer-group"></i>
      In the Same Series:
    </h2>
    <div class="flex flex-wrap gap-4">
      {#each sameSeries as seriesCube}
        <a
          class="flex flex-col items-center border rounded-xl px-4 py-2 transition duration-200 focus:outline-none border-base-300 bg-base-200 hover:bg-base-300 w-36"
          href="/explore/cubes/{seriesCube.slug}"
        >
          <img
            src={`https://res.cloudinary.com/dc7wdwv4h/image/fetch/f_webp,q_auto,w_192/${encodeURIComponent(seriesCube.image_url)}`}
            alt={seriesCube.version_name}
            loading="lazy"
            decoding="async"
            width="192"
            height="192"
            class="h-24 object-contain mb-2 rounded"
          />
          <span class="font-medium text-center">
            {seriesCube.series}
            {seriesCube.model}
          </span>
        </a>
      {/each}
    </div>
  </div>
{/if}
