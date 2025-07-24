<script lang="ts">
  import FeatureDisabled from "$lib/components/misc/featureDisabled.svelte";
  import StarRating from "$lib/components/rating/starRating.svelte";
  import AddCube from "$lib/components/cube/addCube.svelte";
  import CubeVersionType from "$lib/components/cube/cubeVersionType.svelte";
  import type { Cube } from "$lib/components/types/cube.js";
  import { formatDate } from "$lib/components/helper_functions/formatDate.svelte.js";
  import type { CubeVendorLinks } from "$lib/components/types/cubevendorLinks.js";
  import type { Profiles } from "$lib/components/types/profile.js";
  import UserRatings from "$lib/components/rating/userRatings.svelte";
  import Report from "$lib/components/report/report.svelte";

  let { data } = $props();
  let {
    cubesAvailability = true,
    databaseAvailability = true,
    cube = {} as Cube,
    profile = {} as Profiles,
    user_cube_ratings,
    profiles,
    cubeTrims,
    relatedCube,
    sameSeries,
    features = [],
  } = $derived(data);

  const featureMap = new Map<string, Set<string>>();
  let feats = $state(new Set<string>());

  $effect(() => {
    for (const { cube, feature } of features) {
      if (!featureMap.has(cube)) {
        featureMap.set(cube, new Set());
      }
      featureMap.get(cube)!.add(feature);
    }

    feats = featureMap.get(cube.slug) ?? new Set<string>();
  });

  let vendor_links: CubeVendorLinks[] | undefined = $state(data.vendor_links);
  let cubeUserCount: Cube[] | undefined = $state(data.cubeUserCount);

  let loading = $state(true);

  $effect(() => {
    const _ = cube;
    loading = false;
  });

  let openAddCard = $state(false);

  function idOfUser(user: string) {
    const profile = profiles?.find(
      (p: { username: string }) => p.username === user
    );
    return profile ? `/user/${profile.id}` : "#";
  }

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

{#if databaseAvailability && cubesAvailability}
  <section class="min-h-screen px-6 py-16">
    {#if loading}
      <div class="max-w-4xl mx-auto animate-pulse">
        <!-- IMAGE SKELETON -->
        <div class="my-6 flex flex-col sm:flex-row items-center gap-6">
          <div
            class="rounded-2xl bg-base-200 p-4 my-4 border border-base-300 object-contain w-full max-w-md max-h-96 h-72"
          ></div>
        </div>

        <!-- TITLE & VERSION SKELETON -->
        <div class="flex gap-3 items-center mb-4">
          <div class="h-10 w-2/3 rounded-lg bg-base-200"></div>
        </div>

        <!-- ADD TO COLLECTION BUTTON -->
        <div class="h-12 w-56 rounded-xl bg-base-300 mb-4"></div>

        <!-- DESCRIPTION SKELETON -->
        <div
          class="mb-4 p-4 bg-base-200 rounded-xl border border-base-300 shadow-sm"
        >
          <div class="h-6 w-1/2 bg-base-300 rounded mb-2"></div>
          <div class="h-4 w-full bg-base-200 rounded mb-1"></div>
          <div class="h-4 w-5/6 bg-base-200 rounded mb-1"></div>
          <div class="h-4 w-2/3 bg-base-200 rounded"></div>
        </div>

        <!-- STATS GRID SKELETON -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 mb-4">
          <div
            class="bg-base-200 rounded-xl p-4 flex flex-col gap-3 border border-base-300"
          >
            {#each Array(5) as _}
              <div class="flex items-center justify-between">
                <div class="h-4 w-24 bg-base-300 rounded"></div>
                <div class="h-5 w-10 bg-base-200 rounded"></div>
              </div>
            {/each}
          </div>
          <div
            class="bg-base-200 rounded-xl p-4 flex flex-col gap-3 border border-base-300"
          >
            {#each Array(5) as _}
              <div class="flex items-center justify-between">
                <div class="h-4 w-24 bg-base-300 rounded"></div>
                <div class="h-5 w-10 bg-base-200 rounded"></div>
              </div>
            {/each}
          </div>
        </div>

        <!-- VENDORS SKELETON -->
        <div class="my-8">
          <div class="h-6 w-40 bg-base-300 rounded mb-3"></div>
          <div class="flex flex-wrap gap-3">
            {#each Array(3) as _}
              <div class="h-10 w-40 bg-base-200 rounded-lg"></div>
            {/each}
          </div>
        </div>

        <!-- DATABASE INFO SKELETON -->
        <div class="my-8">
          <div class="bg-base-200 rounded-xl p-4 border border-base-300">
            <div class="h-6 w-36 bg-base-300 rounded mb-3"></div>
            <div class="flex flex-col sm:flex-row gap-6">
              {#each Array(4) as _}
                <div class="h-4 w-32 bg-base-200 rounded"></div>
              {/each}
            </div>
          </div>
        </div>

        <!-- TRIMS / RELATED / SERIES SKELETON -->
        <div class="mb-8">
          <div class="h-6 w-32 bg-base-300 rounded mb-3"></div>
          <div class="flex gap-4">
            {#each Array(3) as _}
              <div
                class="flex flex-col items-center border rounded-xl px-4 py-2 border-base-300 bg-base-200 w-28"
              >
                <div class="h-16 w-16 bg-base-300 rounded mb-2"></div>
                <div class="h-4 w-16 bg-base-200 rounded"></div>
              </div>
            {/each}
          </div>
        </div>

        <!-- USER RATINGS SKELETON -->
        <div class="mb-8">
          <div class="h-6 w-32 bg-base-300 rounded mb-3"></div>
          <div class="flex flex-col gap-4">
            {#each Array(2) as _}
              <div
                class="bg-base-200 rounded-xl p-4 border border-base-300 shadow-sm"
              >
                <div class="flex items-center gap-3 mb-2">
                  <div class="h-5 w-24 bg-base-300 rounded"></div>
                  <div class="h-4 w-24 bg-base-200 rounded ml-auto"></div>
                </div>
                <div class="h-4 w-1/2 bg-base-200 rounded"></div>
              </div>
            {/each}
          </div>
        </div>

        <div class="mt-6">
          <div class="h-12 w-48 bg-base-200 rounded-xl"></div>
        </div>
      </div>
    {:else}
      <div class="max-w-4xl mx-auto">
        {#if profile && cube.submitted_by === profile.username && cube.status !== "Approved"}
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
            src={cube.image_url}
            alt="{cube.series} {cube.model} {cube.version_name}"
            loading="lazy"
            class="rounded-2xl bg-base-200 p-4 my-4 border border-base-300 object-contain w-full max-w-md max-h-96"
          />
        </div>
        <h1
          class="text-4xl font-bold mb-4 flex sm:items-center flex-col sm:flex-row items-start"
        >
          <span
            class="font-clash flex-col flex sm:flex-row sm:items-center items-start gap-2"
          >
            {cube.series}
            {cube.model}
            {#if cube.version_type !== "Base"}
              <span class="text-secondary">{cube.version_name}</span>
            {/if}
            <CubeVersionType version_type={cube.version_type} moreInfo={true} />
          </span>
          {#if cube.discontinued}
            <span
              class="sm:ml-3 px-3 py-1 rounded-full bg-error text-error-content text-xs font-semibold flex items-center gap-1"
            >
              <i class="fa-solid fa-ban"></i> Discontinued
            </span>
          {/if}
        </h1>

        <p class="mb-4">
          {cubeUserCount?.length} user{cubeUserCount?.length === 1 ? "" : "s"} have
          this cube
        </p>

        {#if cube.status === "Approved"}
          <button
            class="btn btn-secondary flex-1 mb-4"
            type="button"
            onclick={() => {
              openAddCard = !openAddCard;
            }}
            aria-label="Add to Collection"
          >
            <i class="fa-solid fa-plus mr-2"></i>
            Add to Collection
          </button>
        {:else}
          <button
            class="btn btn-error flex-1 mb-4 cursor-not-allowed"
            type="button"
            aria-label="Add to Collection"
          >
            Only approved cubes can be added to your collection.
          </button>
        {/if}

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
                >{features.some((f) => f.feature === "magnetic")
                  ? "magnetic"
                  : "non-magnetic"}</span
              >,
              <span class="font-bold text-primary"
                >{features.some((f) => f.feature === "smart")
                  ? "smart"
                  : "non-smart"}</span
              >, and
              <span class="font-bold text-primary"
                >{features.some((f) => f.feature === "wca_legal")
                  ? "WCA-legal"
                  : "not WCA-legal"}</span
              >. Currently, it is
              <span class="font-bold text-primary"
                >{features.some((f) => f.feature === "discontinued")
                  ? "discontinued"
                  : "available"}</span
              >, has a community rating of
              <span class="font-bold text-primary">{cube.rating}/5</span>, and
              is
              <span class="font-bold text-primary"
                >{features.some((f) => f.feature === "modded")
                  ? "modded"
                  : "original"}</span
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

        {#if cube.notes && profile && profile.username === cube.submitted_by}
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
                    src={trim.image_url}
                    alt={trim.version_name}
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
                  src={relatedCube.image_url}
                  alt={relatedCube.version_name}
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
                    src={seriesCube.image_url}
                    alt={seriesCube.version_name}
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
          <button
          onclick={toggleOpenReport}
            class="btn btn-error"
          >
            🚩 Report incorrect/missing data
        </button>
        </div>

        <a href="/explore/cubes" class="btn btn-lg btn-primary mt-6">
          ← Back to Explore
        </a>
      </div>
    {/if}
  </section>
{:else if !cubesAvailability}
  <FeatureDisabled featureName="The cubes explore page is" />
{:else if !databaseAvailability}
  <FeatureDisabled featureName="The database is" />
{/if}

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
  />
{/if}
