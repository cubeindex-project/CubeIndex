<script lang="ts">
  import FeatureDisabled from "$lib/components/misc/featureDisabled.svelte";
  import StarRating from "$lib/components/rating/starRating.svelte";
  import AddCube from "$lib/components/cube/addCube.svelte";
  import CubeVersionType from "$lib/components/cube/cubeVersionType.svelte";
  import type { Cube } from "$lib/components/dbTableTypes.js";
  import { formatDate } from "$lib/components/helper_functions/formatDate.svelte.js";
  import type { CubeVendorLinks } from "$lib/components/dbTableTypes.js";
  import type { Profiles } from "$lib/components/dbTableTypes.js";
  import UserRatings from "$lib/components/rating/userRatings.svelte";
  import Report from "$lib/components/report/report.svelte";
  import { page } from "$app/state";
  import { SsgoiTransition } from "@ssgoi/svelte";
  import AddToCollectionButton from "$lib/components/misc/addToCollectionButton.svelte";
  import ShareButton from "$lib/components/misc/shareButton.svelte";

  let { data } = $props();
  let {
    cubesAvailability = true,
    databaseAvailability = true,
    cube = {} as Cube,
    profile = {} as Profiles,
    user_cube_ratings,
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

  let vendor_links: CubeVendorLinks[] | undefined = $derived(data.vendor_links);
  let cubeUserCount: number | undefined = $derived(
    data.user_cubes?.length ?? 0
  );

  const userCubeDetail = data.user_cubes?.find(
    (uc) => uc.username === profile.username
  );

  let openAddCard = $state(false);

  const statuses = [
    { label: "Smart", key: "smart" },
    { label: "Magnetic", key: "magnetic" },
    { label: "Modded", key: "modded" },
    { label: "WCA Legal", key: "wca_legal" },
    { label: "Maglev", key: "maglev" },
    { label: "Stickered", key: "stickered" },
    { label: "Ball Core", key: "ball_core" },
  ];

  let openReport = $state(false);

  function toggleOpenReport() {
    openReport = !openReport;
  }
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

<SsgoiTransition id={page.url.pathname}>
  {#if databaseAvailability && cubesAvailability}
    <section class="min-h-screen px-6 py-16">
      <div class="max-w-4xl mx-auto">
        {#if profile && cube.submitted_by === profile.user_id && cube.status !== "Approved"}
          <div
            class="flex items-center gap-3 p-4 my-4 rounded-xl {cube.status ===
            'Pending'
              ? 'bg-warning'
              : 'bg-error'} font-semibold shadow-sm"
          >
            {#if cube.status === "Pending"}
              <i class="fa-solid fa-hourglass-half"></i>
            {:else}
              <i class="fa-solid fa-triangle-exclamation"></i>
            {/if}

            Your submission {cube.status === "Pending"
              ? "is awaiting verification by moderators"
              : "has been rejected"}.
          </div>
        {:else if cube.status === "Rejected"}
          <div
            class="flex items-center gap-3 p-4 my-4 rounded-xl bg-error font-semibold shadow-sm"
          >
            <i class="fa-solid fa-triangle-exclamation"></i>
            This cube has been rejected.
          </div>
        {:else if cube.status === "Pending"}
          <div
            class="flex items-center gap-3 p-4 my-4 rounded-xl bg-warning font-semibold shadow-sm"
          >
            <i class="fa-solid fa-hourglass-half"></i>
            This cube is awaiting verification by moderators.
          </div>
        {/if}

        <div class="my-6 flex flex-col sm:flex-row items-center gap-6">
          <img
            data-hero-key={`cube-image-${cube.id}`}
            src={meta.preloadImage}
            alt="{cube.series} {cube.model} {cube.version_name}"
            fetchpriority="high"
            decoding="async"
            width="768"
            height="384"
            class="rounded-2xl bg-base-200 p-4 my-4 border border-base-300 object-contain w-full max-w-md max-h-96"
          />
        </div>
        <h1 class="flex flex-col mb-4">
          <!-- top row: text + discontinued badge -->
          <div class="flex items-center text-4xl font-bold">
            <div class="font-clash" data-hero-key={`cube-title-${cube.id}`}>
              {cube.series}
              {cube.model}
              {#if cube.version_type !== "Base"}
                <span class="text-secondary"> {cube.version_name}</span>
              {/if}
            </div>
            {#if cube.discontinued}
              <div
                class="ml-3 flex items-center gap-1 px-3 py-1 rounded-full bg-error text-error-content text-xs font-semibold"
              >
                <i class="fa-solid fa-ban"></i>
                <span>Discontinued</span>
              </div>
            {/if}
          </div>

          <!-- bottom row: version type -->
          <div class="mt-2">
            <CubeVersionType version_type={cube.version_type} />
          </div>
        </h1>

        <p class="mb-4">
          {cubeUserCount} user{cubeUserCount === 1 ? "" : "s"}
          have this cube
        </p>

        <div class="flex flex-wrap gap-2 mb-4 justify-between">
          {#if cube.status === "Approved"}
            <AddToCollectionButton
              onClick={() => (openAddCard = !openAddCard)}
              alreadyAdded={userCubeDetail !== undefined ? true : false}
            />
          {:else}
            <button
              class="btn btn-error cursor-not-allowed"
              type="button"
              aria-label="Add to Collection"
            >
              Only approved cubes can be added to your collection.
            </button>
          {/if}
          <ShareButton url={page.url.href} />
        </div>

        <!-- Highlighted Rating -->
        <div class="flex flex-col items-start mb-5 sm:mt-0">
          <StarRating readOnly={true} rating={cube.rating ?? 0} />
        </div>

        <div
          class="mb-4 p-4 bg-base-200 rounded-xl border border-base-300 shadow-sm"
        >
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
                {cube.release_date
                  ? formatDate(cube.release_date)
                  : "Loading..."}
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
              <span class="font-bold text-primary">{cube.rating}/5</span>, and
              is
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
                {cube.release_date
                  ? formatDate(cube.release_date)
                  : "Loading..."}
              </span>
            </div>
          </div>
          <div
            class="bg-base-200 rounded-xl p-4 space-y-2 border border-base-300"
          >
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
        {#if vendor_links && vendor_links.length > 0}
          <div class="my-8">
            <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
              <i class="fa-solid fa-cart-shopping"></i>
              Available at:
            </h2>
            <div class="flex flex-wrap gap-3">
              {#each vendor_links as shop}
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
                <a
                  class="font-medium underline"
                  href="/user/{verifiedBy?.username}"
                >
                  {verifiedBy?.display_name || "Unknown"}
                </a>
              </div>
              <div class="flex items-center gap-2">
                <span>Submitted by:</span>
                <a
                  class="font-medium underline"
                  href="/user/{submittedBy?.username}"
                >
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
        <UserRatings user_cube_ratings={user_cube_ratings ?? []} {cube} />
        <div class="mt-4">
          <button onclick={toggleOpenReport} class="btn btn-error">
            🚩 Report incorrect/missing data
          </button>
        </div>

        <a href="/explore/cubes" class="btn btn-lg btn-primary mt-6">
          ← Back to Explore
        </a>
      </div>
    </section>
  {:else if !cubesAvailability}
    <FeatureDisabled featureName="The cubes explore page is" />
  {:else if !databaseAvailability}
    <FeatureDisabled featureName="The database is" />
  {/if}
</SsgoiTransition>

{#if openReport}
  <Report
    onCancel={() => (openReport = !openReport)}
    reportType="cube"
    reported={cube.slug}
    reporLabel="the {cube.series} {cube.model} {cube.version_name}"
  />
{/if}

{#if openAddCard}
  <AddCube
    onCancel={() => {
      openAddCard = !openAddCard;
    }}
    {cube}
    defaultData={{
      quantity: userCubeDetail?.quantity,
      condition: userCubeDetail?.condition,
      main: userCubeDetail?.main,
      status: userCubeDetail?.status,
      notes: userCubeDetail?.notes,
      acquired_at: userCubeDetail?.acquired_at,
    }}
  />
{/if}
