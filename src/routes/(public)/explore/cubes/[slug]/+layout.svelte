<script lang="ts">
  import type { LayoutProps } from "./$types";
  import CubeVersionType from "$lib/components/cube/cubeVersionType.svelte";
  import AddToCollectionButton from "$lib/components/misc/addToCollectionButton.svelte";
  import ShareButton from "$lib/components/misc/shareButton.svelte";
  import { page } from "$app/state";
  import Report from "$lib/components/report/report.svelte";
  import AddCube from "$lib/components/cube/addCube.svelte";
  import { SsgoiTransition } from "@ssgoi/svelte";
  import RateCube from "$lib/components/rating/rateCube.svelte";
  import StarRating from "$lib/components/rating/starRating.svelte";

  let { data, children }: LayoutProps = $props();
  let { cube, profile, meta } = $derived(data);

  let cubeUserCount: number | undefined = $derived(
    data.user_cubes?.length ?? 0
  );

  const userCubeDetail = data.user_cubes?.find(
    (uc) => uc.username === profile.username
  );

  let openAddCard = $state(false);
  let openReport = $state(false);
  let openRateCard = $state(false);

  function toggleOpenReport() {
    openReport = !openReport;
  }

  let currentTab = $state("");

  const tabs = [
    { label: "Details", key: "" },
    { label: "Price Tracking", key: "price" },
    { label: "Ratings", key: "ratings" },
  ];
</script>

<SsgoiTransition id={page.url.pathname}>
  <section class="min-h-screen px-6 py-16 max-w-4xl mx-auto">
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
      <div>
        {#if cube.status === "Approved"}
          <AddToCollectionButton
            onClick={() => (openAddCard = !openAddCard)}
            alreadyAdded={userCubeDetail !== undefined}
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
        <button
          class="btn btn-accent gap-1"
          type="button"
          onclick={() => {
            openRateCard = !openRateCard;
          }}
          aria-label="Rate this Cube"
        >
          <i class="fa-solid fa-star mr-2"></i>
          Rate
          <span class="hidden sm:block">this Cube</span>
        </button>
      </div>
      <ShareButton url={page.url.href} />
    </div>

    <!-- Highlighted Rating -->
    <div class="flex flex-col items-start mb-5 sm:mt-0">
      <StarRating readOnly={true} rating={cube.rating ?? 0} />
    </div>

    <nav class="my-6 flex flex-wrap gap-2 tabs tabs-border justify-center">
      {#each tabs as tab}
        <a
          href="/explore/cubes/{cube.slug}/{tab.key}"
          class="tab"
          class:tab-active={tab.key === currentTab}
          onclick={() => (currentTab = tab.key)}
          data-sveltekit-noscroll
        >
          {tab.label}
        </a>
      {/each}
    </nav>

    {@render children()}

    <div class="mt-4">
      <button onclick={toggleOpenReport} class="btn btn-error">
        🚩 Report incorrect/missing data
      </button>
    </div>

    <a href="/explore/cubes" class="btn btn-lg btn-primary mt-6">
      ← Back to Explore
    </a>
  </section>
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

{#if openRateCard}
  <RateCube
    onCancel={() => {
      openRateCard = !openRateCard;
    }}
    {cube}
  />
{/if}
