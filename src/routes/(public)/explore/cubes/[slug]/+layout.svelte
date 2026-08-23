<script lang="ts">
  import { resolve } from "$app/paths";
  import type { Tables } from "$lib/types/database.types";
  import type { LayoutProps } from "./$types";
  import CubeVersionType from "$lib/components/cube/CubeVersionType.svelte";
  import AddToCollectionButton from "$lib/components/misc/AddToCollectionButton.svelte";
  import RateCubeButton from "$lib/components/misc/RateCubeButton.svelte";
  import ShareButton from "$lib/components/misc/ShareButton.svelte";
  import { page } from "$app/state";
  import Report from "$lib/components/report/Report.svelte";
  import AddCubeModal from "$lib/components/cube/AddCubeModal.svelte";
  import RateCubeModal from "$lib/components/rating/RateCubeModal.svelte";
  import StarRating from "$lib/components/rating/StarRating.svelte";
  import { formatPartialDate } from "$lib/utils/formatPartialDate";

  let { data, children }: LayoutProps = $props();
  let {
    cube,
    sameSeries,
    relatedCube,
    cubeTrims,
    alreadyAdded,
    userCubeDetail,
  } = $derived(data);

  let isAddingCube = $state(false);
  let isReportingCube = $state(false);
  let isRatingCube = $state(false);

  function toggleReporting() {
    isReportingCube = !isReportingCube;
  }

  const currentTab = $derived.by(() => {
    const segments = page.url.pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1] ?? "";
    return last === cube.slug ? "details" : last;
  });

  const tabs = [
    { label: "Details", key: "details", path: null, icon: "fa-circle-info" },
    { label: "Shops & Prices", key: "price", path: "price", icon: "fa-store" },
    { label: "Ratings", key: "ratings", path: "ratings", icon: "fa-star" },
    // { label: "Reviews", key: "reviews", path: "reviews", icon: "fa-comment-dots" },
  ] as const;

  type CubePreview = Pick<
    Tables<"v_detailed_cube_models">,
    "slug" | "name" | "series" | "image_url"
  >;
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

{#snippet similarCubesSection(
  title: string,
  icon: string,
  cubes: CubePreview[],
  ariaLabel: string,
)}
  <section class="my-10">
    <header class="mb-4 flex items-center gap-2">
      <h2 class="flex items-center gap-2 text-xl font-semibold">
        <i class={`fa-solid ${icon}`}></i>
        {title}
      </h2>
      <span class="badge badge-neutral badge-sm">{cubes.length}</span>
    </header>

    <ul
      class="flex gap-3 overflow-x-auto md:grid md:grid-cols-3 md:gap-4 md:overflow-visible lg:grid-cols-4 xl:grid-cols-6"
      aria-label={ariaLabel}
    >
      {#each cubes as similarCube (similarCube.slug)}
        <li class="w-40 shrink-0 md:w-auto">
          <a
            href={resolve("/(public)/explore/cubes/[slug]", {
              slug: similarCube.slug,
            })}
            class="flex aspect-square flex-col rounded-2xl border border-base-300 bg-base-200 p-3 transition-all duration-200 hover:shadow-md"
            aria-label="Open {similarCube.name}"
          >
            <div class="min-h-0 flex-1">
              <img
                src={`https://res.cloudinary.com/dc7wdwv4h/image/fetch/f_webp,q_auto,w_256/${encodeURIComponent(similarCube.image_url)}`}
                alt={similarCube.name}
                loading="lazy"
                decoding="async"
                width="256"
                height="256"
                class="size-full object-contain"
              />
            </div>
            <p class="mt-2 line-clamp-2 text-sm font-semibold">
              {similarCube.name}
            </p>
          </a>
        </li>
      {/each}
    </ul>
  </section>
{/snippet}

<section class="min-h-screen pb-16">
  <header class="border-b border-base-300">
    <div
      class="relative mx-auto grid max-w-7xl overflow-hidden px-6 py-10 sm:px-8 md:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)] md:items-center md:gap-10 md:py-12"
    >
      <div class="relative z-10 max-w-2xl">
        <div class="mb-3 flex flex-wrap items-center gap-2">
          <CubeVersionType version_type={cube.version_type} />
          {#if cube.discontinued}
            <span
              class="flex items-center gap-1 rounded-full bg-error px-3 py-1 text-xs font-semibold text-error-content"
            >
              <i class="fa-solid fa-ban"></i>
              Discontinued
            </span>
          {/if}
        </div>

        <h1
          class="font-clash text-4xl font-bold tracking-tight sm:text-5xl"
          data-hero-key={`cube-title-${cube.id}`}
        >
          {cube.name}
        </h1>

        {#if cube.release_date}
          <p class="mt-4 flex items-center gap-2 text-sm text-base-content/70">
            <i class="fa-solid fa-calendar-days"></i>
            Released {formatPartialDate(
              cube.release_date,
              cube.release_date_precision,
            )}
          </p>
        {/if}

        <div
          class="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-base-content/75"
        >
          <span class="flex items-center gap-2">
            <i class="fa-solid fa-cube"></i>
            {cube.owned_count} user{cube.owned_count === 1 ? "" : "s"} own this cube
          </span>
          <span class="flex items-center gap-2">
            <i class="fa-regular fa-heart"></i>
            {cube.wishlist_count} user{cube.wishlist_count === 1 ? "" : "s"} want
            this cube
          </span>
          <span class="flex items-center gap-2">
            <i class="fa-solid fa-clock-rotate-left"></i>
            {cube.previously_owned_count} user{cube.previously_owned_count === 1
              ? ""
              : "s"} previously owned this cube
          </span>
        </div>

        <div class="mt-4">
          <StarRating readOnly={true} rating={cube.rating ?? 0} />
        </div>

        <div class="mt-7 flex flex-wrap items-center gap-3">
          <AddToCollectionButton
            {alreadyAdded}
            onClick={() => {
              isAddingCube = !isAddingCube;
            }}
          />
          <RateCubeButton onClick={() => (isRatingCube = !isRatingCube)} />
          <ShareButton
            url={page.url.href}
            label="Share"
            btnClass="btn btn-outline btn-info"
          />
        </div>
      </div>

      <figure class="relative mx-auto mt-8 w-full max-w-sm md:mt-0">
        <img
          data-hero-key={`cube-image-${cube.id}`}
          src="https://res.cloudinary.com/dc7wdwv4h/image/fetch/f_webp,q_auto,w_403/{encodeURIComponent(
            cube.image_url,
          )}"
          alt={cube.name}
          fetchpriority="high"
          decoding="async"
          width="768"
          height="384"
          class="aspect-4/3 w-full object-contain"
        />
        {#if cube.image_source}
          <figcaption class="text-xs">
            Image &copy;{cube.image_source}. All rights reserved.
          </figcaption>
        {/if}
      </figure>
    </div>
  </header>

  <div class="mx-auto max-w-4xl px-6 sm:px-8">
    <nav class="flex my-6 -mx-6 px-6 overflow-x-auto md:justify-center">
      <div
        class="tabs tabs-box flex-nowrap gap-2 justify-start sm:justify-center"
        role="tablist"
        aria-label="Cube sections"
      >
        {#each tabs as tab (tab.key)}
          <a
            href={resolve(
              tab.path
                ? `/explore/cubes/${cube.slug}/${tab.path}`
                : `/explore/cubes/${cube.slug}`,
            )}
            class="tab tab-sm sm:tab-md whitespace-nowrap"
            class:tab-active={tab.key === currentTab}
            role="tab"
            data-sveltekit-noscroll
          >
            <i class={`fa-solid ${tab.icon} mr-2`}></i>
            {tab.label}
          </a>
        {/each}
      </div>
    </nav>

    {@render children()}

    {#if (cube.version_type !== "Base" || cube.modded) && relatedCube}
      <section class="my-10">
        <header class="mb-4 flex items-center gap-2">
          <h2
            class="text-xl font-semibold tracking-tight flex items-center gap-2"
          >
            <i class="fa-solid fa-link"></i>
            Related To
          </h2>
        </header>

        <div class="max-w-sm">
          <a
            href={resolve("/(public)/explore/cubes/[slug]", {
              slug: relatedCube.slug,
            })}
            class="group block rounded-2xl border border-base-300 bg-base-200 transition-all duration-200 hover:shadow-md"
            aria-label="Open {relatedCube.name}"
          >
            <div class="p-4 flex items-center gap-4">
              <div
                class="size-20 shrink-0 rounded-xl bg-base-100/70 border border-base-300 overflow-hidden"
              >
                <img
                  src={`https://res.cloudinary.com/dc7wdwv4h/image/fetch/f_webp,q_auto,w_192/${encodeURIComponent(relatedCube.image_url)}`}
                  alt={relatedCube.name}
                  loading="lazy"
                  decoding="async"
                  width="192"
                  height="192"
                  class="size-full object-contain p-1 transition-transform duration-200"
                />
              </div>
              <div class="min-w-0">
                <p class="text-base font-semibold truncate">
                  {relatedCube.name}
                </p>
              </div>
            </div>
          </a>
        </div>
      </section>
    {/if}

    {#if cube.version_type === "Base" && cubeTrims && cubeTrims.length > 0}
      {@render similarCubesSection(
        "Select Variant",
        "fa-palette",
        cubeTrims,
        "Available variants",
      )}
    {/if}

    {#if sameSeries && sameSeries.length > 0}
      {@render similarCubesSection(
        "In the Same Series",
        "fa-layer-group",
        sameSeries,
        `Other cubes in the ${cube.series ?? "current"} series`,
      )}
    {/if}

    <div class="mt-6">
      <button onclick={toggleReporting} class="btn btn-error">
        <i class="fa-regular fa-flag"></i>
        Report incorrect/missing data
      </button>
    </div>
  </div>
</section>

<Report
  bind:open={isReportingCube}
  reportType="cube"
  reported={cube.slug}
  reporLabel="the {cube.name}"
/>

<AddCubeModal
  bind:open={isAddingCube}
  {cube}
  {alreadyAdded}
  defaultData={userCubeDetail ?? undefined}
/>

<RateCubeModal bind:open={isRatingCube} {cube} />
