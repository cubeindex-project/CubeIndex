<script lang="ts">
  import type { LayoutProps } from "./$types";
  import CubeVersionType from "$lib/components/cube/cubeVersionType.svelte";
  import AddToCollectionButton from "$lib/components/misc/addToCollectionButton.svelte";
  import RateCubeButton from "$lib/components/misc/rateCubeButton.svelte";
  import ShareButton from "$lib/components/misc/shareButton.svelte";
  import { page } from "$app/state";
  import Report from "$lib/components/report/report.svelte";
  import AddCube from "$lib/components/cube/addCube.svelte";
  import RateCube from "$lib/components/rating/rateCube.svelte";
  import StarRating from "$lib/components/rating/starRating.svelte";
  import { m } from "$lib/paraglide/messages";

  let { data, children }: LayoutProps = $props();
  let {
    cube,
    sameSeries,
    relatedCube,
    cubeTrims,
    features,
    alreadyAdded,
    isCubeSubmitter,
    userCubeDetail,
  } = $derived(data);

  let openAddCard = $state(false);
  let openReport = $state(false);
  let openRateCard = $state(false);

  function toggleOpenReport() {
    openReport = !openReport;
  }

  // Derive the active tab from the URL so it stays in sync on navigation
  const currentTab = $derived.by(() => {
    const segments = page.url.pathname.split("/").filter(Boolean);
    // Expect .../explore/cubes/:slug[/tab]
    const last = segments[segments.length - 1] ?? "";
    return last === cube.slug ? "" : last;
  });

  // Tab definitions (keys map to child routes)
  const tabs = [
    { label: m.explore_cube_tab_details_label(), key: "", icon: "fa-circle-info" },
    { label: m.explore_cube_tab_prices_label(), key: "price", icon: "fa-store" },
    { label: m.explore_cube_tab_ratings_label(), key: "ratings", icon: "fa-star" },
    { label: m.explore_cube_tab_reviews_label(), key: "reviews", icon: "fa-comment-dots" },
  ] as const;
</script>

<svelte:head>
  <link
    rel="preload"
    as="image"
    href="https://res.cloudinary.com/dc7wdwv4h/image/fetch/f_webp,q_auto,w_403/{encodeURIComponent(
      cube.image_url,
    )}"
    fetchpriority="high"
  />
  <link rel="dns-prefetch" href="//res.cloudinary.com" />
</svelte:head>

<section class="min-h-screen px-6 py-16 max-w-4xl mx-auto">
  {#if isCubeSubmitter && cube.status !== "Approved"}
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

      {m.explore_cube_submission_notice_text({ status: cube.status })}
    </div>
  {:else if cube.status === "Rejected"}
    <div
      class="flex items-center gap-3 p-4 my-4 rounded-xl bg-error font-semibold shadow-sm"
    >
      <i class="fa-solid fa-triangle-exclamation"></i>
      {m.explore_cube_status_rejected_text()}
    </div>
  {:else if cube.status === "Pending"}
    <div
      class="flex items-center gap-3 p-4 my-4 rounded-xl bg-warning font-semibold shadow-sm"
    >
      <i class="fa-solid fa-hourglass-half"></i>
      {m.explore_cube_status_pending_text()}
    </div>
  {/if}

  <div class="my-6 flex flex-col items-start">
    <figure class="relative w-full max-w-md">
      <img
        data-hero-key={`cube-image-${cube.id}`}
        src="https://res.cloudinary.com/dc7wdwv4h/image/fetch/f_webp,q_auto,w_403/{encodeURIComponent(
          cube.image_url,
        )}"
        alt={m.explore_cube_image_alt({
          series: cube.series,
          model: cube.model,
          versionName: cube.version_name,
        })}
        fetchpriority="high"
        decoding="async"
        width="768"
        height="384"
        class="rounded-2xl bg-base-200 p-4 mt-4 border border-base-300 object-contain w-full max-h-96"
      />
      {#if cube.image_source}
        <figcaption
          class="absolute left-2 bottom-2 rounded-lg backdrop-blur px-3 py-1.5 text-xs font-medium bg-base-200/80"
        >
          {m.explore_cube_image_credit_text({
            source: cube.image_source,
          })}
        </figcaption>
      {/if}
    </figure>
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
          <span>{m.explore_cube_discontinued_label()}</span>
        </div>
      {/if}
    </div>

    <!-- bottom row: version type -->
    <div class="mt-2">
      <CubeVersionType version_type={cube.version_type} />
    </div>
  </h1>

  <p class="mb-4">
    {m.explore_cube_popularity_text({ count: cube.popularity })}
  </p>

  <div class="flex flex-wrap mb-4 justify-between">
    <div class="flex justify-start join">
      {#if cube.status === "Approved"}
        <AddToCollectionButton
          {alreadyAdded}
          onClick={() => {
            openAddCard = !openAddCard;
          }}
          addClass="join-item"
        />
      {:else}
        <button
          class="btn btn-error cursor-not-allowed join-item tooltip"
          type="button"
          aria-label={m.explore_cube_add_disabled_tooltip_text()}
          data-tip={m.explore_cube_add_disabled_tooltip_text()}
        >
          <i class="fa-solid fa-ban mr-2"></i>
          {m.explore_cube_not_available_label()}
        </button>
      {/if}
      {#if cube.status === "Approved"}
        <RateCubeButton
          onClick={() => (openRateCard = !openRateCard)}
          addClass="join-item"
        />
      {:else}
        <button
          class="btn btn-error cursor-not-allowed join-item tooltip"
          type="button"
          aria-label={m.explore_cube_rate_disabled_tooltip_text()}
          data-tip={m.explore_cube_rate_disabled_tooltip_text()}
        >
          <i class="fa-solid fa-ban mr-2"></i>
          {m.explore_cube_not_available_label()}
        </button>
      {/if}
    </div>
    <ShareButton url={page.url.href} label="" />
  </div>

  <!-- Highlighted Rating -->
  <div class="flex flex-col items-start mb-5 sm:mt-0">
    <StarRating readOnly={true} rating={cube.rating ?? 0} />
  </div>

  <!-- Tabs: URL-aware, scrollable on mobile, accessible roles -->
  <nav class="my-6 -mx-6 px-6 overflow-x-auto">
    <div
      class="tabs tabs-border flex-nowrap gap-2 justify-start sm:justify-center"
      role="tablist"
      aria-label={m.explore_cube_tabs_aria()}
    >
      {#each tabs as tab (tab.key)}
        <a
          href={tab.key
            ? `/explore/cubes/${cube.slug}/${tab.key}`
            : `/explore/cubes/${cube.slug}`}
          class="tab tab-sm sm:tab-md whitespace-nowrap"
          class:tab-active={tab.key === currentTab}
          role="tab"
          aria-selected={tab.key === currentTab}
          aria-current={tab.key === currentTab ? "page" : undefined}
          data-sveltekit-noscroll
        >
          <i class={`fa-solid ${tab.icon} mr-2`}></i>
          {tab.label}
        </a>
      {/each}
    </div>
  </nav>

  {@render children()}

  {#if cube.notes && isCubeSubmitter}
    <div class="bg-base-200 border border-base-300 rounded-xl p-4 my-8">
      <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
        <i class="fa-solid fa-note-sticky"></i>
        {m.explore_cube_moderator_note_title()}
        <span class="text-xs">{m.explore_cube_moderator_note_hint()}</span>
      </h2>
      <p class="whitespace-pre-line">{cube.notes}</p>
    </div>
  {/if}

  <!-- Trim selector -->
  {#if cube.version_type === "Base" && cubeTrims && cubeTrims.length > 0}
    <section class="my-10">
      <header class="mb-4 flex items-center gap-2">
        <h2
          class="text-xl font-semibold tracking-tight flex items-center gap-2"
        >
          <i class="fa-solid fa-palette text-primary"></i>
          {m.explore_cube_trim_section_title()}
        </h2>
        <span class="badge badge-neutral badge-sm ml-2">{cubeTrims.length}</span
        >
      </header>

      <!-- Mobile: smooth horizontal scroll; ≥md: grid -->
      <ul
        class="flex gap-3 overflow-x-auto overscroll-x-contain snap-x snap-mandatory pr-1 md:grid md:grid-cols-2 md:sm:grid-cols-3 md:lg:grid-cols-4 md:xl:grid-cols-6 md:gap-4 md:overflow-visible md:snap-none"
        aria-label={m.explore_cube_trim_list_aria()}
      >
        {#each cubeTrims ?? [] as trim (trim.id)}
          <li class="min-w-[9.5rem] snap-start md:min-w-0">
            <a
              href="/explore/cubes/{trim.slug}"
              class="group block rounded-2xl border border-base-300 bg-base-200/80 hover:bg-base-300/60 transition-all duration-200 shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              aria-label={m.explore_cube_trim_open_aria({
                name: trim.version_name,
              })}
            >
              <div class="p-3">
                <div
                  class="aspect-square w-full rounded-xl bg-base-100/70 border border-base-300 overflow-hidden"
                >
                  <img
                    src={`https://res.cloudinary.com/dc7wdwv4h/image/fetch/f_webp,q_auto,w_256/${encodeURIComponent(trim.image_url)}`}
                    alt={trim.version_name}
                    loading="lazy"
                    decoding="async"
                    width="256"
                    height="256"
                    class="size-full object-contain p-2 transition-transform duration-200"
                  />
                </div>
                <div class="mt-2 text-center">
                  <span class="text-sm font-medium line-clamp-2"
                    >{trim.version_name}</span
                  >
                </div>
              </div>
            </a>
          </li>
        {/each}
      </ul>
    </section>
  {/if}

  <!-- Related-to (for modded / non-base) -->
  {#if (cube.version_type !== "Base" || features.some((f) => f === "modded") === true) && relatedCube}
    <section class="my-10">
      <header class="mb-4 flex items-center gap-2">
        <h2
          class="text-xl font-semibold tracking-tight flex items-center gap-2"
        >
          <i class="fa-solid fa-link text-primary"></i>
          {m.explore_cube_related_section_title()}
        </h2>
      </header>

      <div class="max-w-sm">
        <a
          href="/explore/cubes/{relatedCube.slug}"
          class="group block rounded-2xl border border-base-300 bg-base-200/80 hover:bg-base-300/60 transition-all duration-200 shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          aria-label={m.explore_cube_related_open_aria({
            series: relatedCube.series,
            model: relatedCube.model,
          })}
        >
          <div class="p-4 flex items-center gap-4">
            <div
              class="size-20 shrink-0 rounded-xl bg-base-100/70 border border-base-300 overflow-hidden"
            >
              <img
                src={`https://res.cloudinary.com/dc7wdwv4h/image/fetch/f_webp,q_auto,w_192/${encodeURIComponent(relatedCube.image_url)}`}
                alt={relatedCube.version_name}
                loading="lazy"
                decoding="async"
                width="192"
                height="192"
                class="size-full object-contain p-1 transition-transform duration-200"
              />
            </div>
            <div class="min-w-0">
              <p class="text-base font-semibold truncate">
                {relatedCube.series}
                {relatedCube.model}
              </p>
              <p class="text-xs opacity-70 truncate">
                {relatedCube.version_name}
              </p>
            </div>
          </div>
        </a>
      </div>
    </section>
  {/if}

  <!-- Same series -->
  {#if sameSeries && sameSeries.length > 0 && sameSeries[0].series !== ""}
    <section class="my-10">
      <header class="mb-4 flex items-center gap-2">
        <h2
          class="text-xl font-semibold tracking-tight flex items-center gap-2"
        >
          <i class="fa-solid fa-layer-group text-primary"></i>
          {m.explore_cube_same_series_section_title()}
        </h2>
        <span class="badge badge-neutral badge-sm ml-2"
          >{sameSeries.length}</span
        >
      </header>

      <div class="-mx-2 overflow-x-auto pb-2">
        <ul
          class="flex gap-4 px-2 snap-x snap-mandatory"
          aria-label={m.explore_cube_same_series_list_aria({
            series: sameSeries[0].series,
          })}
        >
          {#each sameSeries as seriesCube (seriesCube.slug)}
            <li class="w-48 shrink-0 snap-start">
              <a
                href="/explore/cubes/{seriesCube.slug}"
                class="group block rounded-2xl border border-base-300 bg-base-200/80 hover:bg-base-300/60 transition-all duration-200 shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                aria-label={m.explore_cube_same_series_open_aria({
                  series: seriesCube.series,
                  model: seriesCube.model,
                })}
              >
                <div class="p-3">
                  <div
                    class="aspect-square w-full rounded-xl bg-base-100/70 border border-base-300 overflow-hidden"
                  >
                    <img
                      src={`https://res.cloudinary.com/dc7wdwv4h/image/fetch/f_webp,q_auto,w_256/${encodeURIComponent(seriesCube.image_url)}`}
                      alt={seriesCube.version_name}
                      loading="lazy"
                      decoding="async"
                      width="256"
                      height="256"
                      class="size-full object-contain p-2 transition-transform duration-200"
                    />
                  </div>
                  <div class="mt-2 text-center">
                    <p class="text-sm font-semibold line-clamp-2">
                      {seriesCube.series}
                      {seriesCube.model}
                    </p>
                    <p class="text-xs opacity-70 line-clamp-1">
                      {seriesCube.version_name}
                    </p>
                  </div>
                </div>
              </a>
            </li>
          {/each}
        </ul>
      </div>
    </section>
  {/if}

  <div class="mt-4">
    <button onclick={toggleOpenReport} class="btn btn-error">
      🚩 {m.explore_cube_report_cta()}
    </button>
  </div>

  <a href="/explore/cubes" class="btn btn-lg btn-primary mt-6">
    ← {m.explore_cube_back_to_explore_cta()}
  </a>
</section>

{#if openReport}
  <Report
    onCancel={() => (openReport = !openReport)}
    reportType="cube"
    reported={cube.slug}
    reporLabel={m.explore_cube_report_label({
      series: cube.series,
      model: cube.model,
      versionName: cube.version_name,
    })}
  />
{/if}

{#if openAddCard}
  <AddCube
    onCancel={() => {
      openAddCard = !openAddCard;
    }}
    {cube}
    {alreadyAdded}
    defaultData={{
      quantity: userCubeDetail?.quantity,
      condition: userCubeDetail?.condition,
      main: userCubeDetail?.main,
      status: userCubeDetail?.status,
      bought_from: userCubeDetail?.bought_from,
      notes: userCubeDetail?.notes,
      acquired_at: userCubeDetail?.acquired_at,
      purchase_price: userCubeDetail?.purchase_price ?? null,
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
