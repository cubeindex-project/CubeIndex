<script lang="ts">
  import { resolve } from "$app/paths";
  import CubeCard from "$lib/components/cube/CubeCard.svelte";
  import NumberFlow, { continuous } from "@number-flow/svelte";
  import { onMount } from "svelte";

  const { data } = $props();
  const {
    featuredCube,
    totalCubes,
    totalUsers,
    totalVendors,
    totalTrackedPrices,
  } = $derived(data);

  const features = [
    {
      description:
        "Search and filter the cube database by brand, puzzle type, release year, features, rating, popularity, and price.",
      icon: "fa-solid fa-magnifying-glass",
      image: "images/landing-page/discover.webp",
      title: "Discover",
    },
    {
      description:
        "Build a personal collection, track versions and condition, leave notes, and share the collection through your profile.",
      icon: "fa-solid fa-box-archive",
      image: "images/landing-page/collect.webp",
      title: "Collect",
    },
    {
      description:
        "Compare specifications, ratings, vendors, availability, and prices before purchasing.",
      icon: "fa-solid fa-scale-balanced",
      image: "images/landing-page/compare.webp",
      title: "Compare",
    },
  ];

  const statistics = $derived([
    {
      title: "Cubes indexed",
      count: totalCubes,
    },
    {
      title: "Collectors",
      count: totalUsers,
    },
    {
      title: "Stores",
      count: totalVendors,
    },
    {
      title: "Prices tracked",
      count: totalTrackedPrices,
    },
  ]);

  const partners = [
    {
      name: "acubemy",
      url: "https://acubemy.com/r/cubeindex",
      logo: {
        src: "/partners-logo/acubemy_logo.svg",
        alt: "Visit acubemy",
        class: "size-9 object-contain",
      },
    },
    {
      name: "CubingPanda",
      url: "https://discord.gg/VHhYR6nyzs",
      logo: {
        src: "/partners-logo/cubingpanda_logo.webp",
        alt: "Visit CubingPanda",
        class: "size-9 rounded-full object-cover",
      },
    },
  ];

  let mounted = $state(false);

  onMount(() => (mounted = true));
</script>

{#snippet discover()}
  <div
    class="overflow-hidden rounded-2xl border border-base-300 bg-base-200 shadow-xl p-3 sm:p-4"
    role="img"
    aria-label="Cube database search interface"
  >
    <div class="join mb-4 flex" aria-hidden="true">
      <div class="btn join-item pointer-events-none">
        <i class="fa-solid fa-sliders" aria-hidden="true"></i>
      </div>
      <div class="input w-full pointer-events-none">
        <i class="fa-solid fa-magnifying-glass text-xs" aria-hidden="true"></i>
        <span class="grow text-base-content/50">Search cubes</span>
      </div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
      {#each [{ name: "GAN16 MagLev", rating: "4.9", popularity: 842, price: "$64.99" }, { name: "MoYu WeiLong WR M V10 Ferrocore", rating: "4.8", popularity: 617, price: "$34.99" }, { name: "MoYu RS3 M V5", rating: "4.7", popularity: 1_294, price: "$9.99" }, { name: "QiYi Clock", rating: "4.4", popularity: 186, price: "$24.99" }, { name: "MoYu RS Skewb M", rating: "4.6", popularity: 243, price: "$12.99" }, { name: "QiYi MS 2x2", rating: "4.5", popularity: 328, price: "$7.99" }] as cube (cube.name)}
        <div class="rounded-xl border border-base-300 bg-base-100">
          <div class="p-2">
            <p class="truncate text-xs font-semibold">
              {cube.name}
            </p>

            <div class="mt-1 flex flex-wrap items-center gap-2 text-[10px]">
              <span class="flex items-center gap-1 text-warning">
                <i class="fa-solid fa-star" aria-hidden="true"></i>
                <span class="text-base-content/60">{cube.rating}</span>
              </span>

              <span
                class="flex items-center gap-1 text-base-content/50"
                title={`${cube.popularity.toLocaleString()} users have this cube`}
              >
                <i class="fa-solid fa-users" aria-hidden="true"></i>
                {cube.popularity.toLocaleString()}
              </span>

              <span class="flex items-center gap-1 text-base-content/50">
                <i class="fa-solid fa-tag" aria-hidden="true"></i>
                {cube.price}
              </span>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/snippet}

{#snippet collect()}
  <div
    class="overflow-hidden rounded-2xl border border-base-300 bg-base-200 p-3 shadow-xl sm:p-4"
    role="img"
    aria-label="Personal cube collection interface"
  >
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="font-clash text-lg">My Cube Collection</p>
        <p class="mt-0.5 text-xs text-base-content/55">24 cubes collected</p>
      </div>
      <div class="badge badge-primary badge-sm gap-1">
        <i class="fa-solid fa-plus text-[9px]" aria-hidden="true"></i>
        Add cube
      </div>
    </div>

    <div class="mt-4 grid grid-cols-2 gap-3">
      {#each [{ name: "GAN 16 MagLev", condition: "New in box", vendor: "SpeedCubeShop", color: "bg-primary" }, { name: "MoYu WRM V10", condition: "Good", vendor: "TheCubicle", color: "bg-secondary" }, { name: "QiYi MS 5x5", condition: "Broken", vendor: "Cubezz", color: "bg-accent" }, { name: "YJ MGC Square-1", condition: "New", vendor: "KewbzUK", color: "bg-warning" }] as cube (cube.name)}
        <div class="rounded-xl border border-base-300 bg-base-100 p-3">
          <div class="flex items-center gap-3">
            <div class="min-w-0">
              <p class="truncate text-xs font-semibold">
                {cube.name}
              </p>
              <div class="flex flex-col sm:flex-row">
                <span class="badge badge-ghost badge-xs mt-1">
                  <i class="fa-solid fa-cube"></i>
                  {cube.condition}
                </span>
                <span class="badge badge-ghost badge-xs mt-1">
                  <i class="fa-solid fa-store"></i>
                  {cube.vendor}
                </span>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/snippet}

{#snippet compare()}
  <div
    class="overflow-hidden rounded-2xl border border-base-300 bg-base-200 p-3 shadow-xl sm:p-4"
    role="img"
    aria-label="GAN 16 MagLev price comparison across stores"
  >
    <div class="mb-4 flex items-center justify-between">
      <p class="font-clash text-lg">GAN 16 MagLev</p>
    </div>

    <div class="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2 sm:gap-3">
      {#each [{ name: "SpeedCubeShop", price: "$59.95", inStock: true, cheapest: false }, { name: "TheCubicle", price: "$57.99", inStock: true, cheapest: true }, { name: "Cubezz", price: "$61.99", inStock: true, cheapest: false }, { name: "KewbzUK", price: "$64.99", inStock: false, cheapest: false }] as vendor, index (index)}
        <div
          class:!border-primary={vendor.cheapest}
          class:!bg-primary={vendor.cheapest}
          class:!rounded-tr-none={vendor.cheapest}
          class:!mt-2={vendor.cheapest}
          class="relative rounded-xl border border-base-300 bg-base-100 p-3"
        >
          {#if vendor.cheapest}
            <span
              class="badge badge-primary rounded-br-none badge-xs absolute -top-2 right-0 gap-1"
            >
              <i class="fa-solid fa-trophy text-[8px]" aria-hidden="true"></i>
              Best price
            </span>
          {/if}

          <div class="flex items-start justify-between gap-2">
            <p class="font-semibold">{vendor.name}</p>
            <span
              class:badge-success={vendor.inStock}
              class:badge-error={!vendor.inStock}
              class="badge badge-xs shrink-0"
            >
              {vendor.inStock ? "In stock" : "Out of stock"}
            </span>
          </div>

          <div class="mt-3 flex items-end justify-between gap-2">
            <span class="font-clash text-xl">
              {vendor.price}
            </span>
            <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"
            ></i>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/snippet}

<main class="overflow-hidden">
  <section class="hero">
    <div class="hero-content flex-col px-5 py-16 lg:py-24">
      <div class="flex flex-col gap-8 md:flex-row md:items-center lg:gap-14">
        <div class="max-w-2xl text-left">
          <h1 class="font-clash text-6xl tracking-tight sm:text-7xl">
            Give your cubes<br /> a new home.
          </h1>
          <p class="mt-7 text-lg leading-8 text-base-content/70 sm:text-xl">
            Build your collection, find your next puzzle, and share what you
            love with the speedcubing community.
          </p>
          <div class="mt-5 flex flex-col gap-3 sm:flex-row">
            <a
              class="btn btn-primary btn-lg"
              href={resolve("/(auth)/auth/signup")}
            >
              Start collecting <i
                class="fa-solid fa-arrow-right"
                aria-hidden="true"
              ></i>
            </a>
            <a
              class="btn btn-outline btn-lg"
              href={resolve("/(public)/explore/cubes")}
            >
              Explore cubes
            </a>
          </div>
        </div>

        {#if featuredCube}
          <div class="flex w-full justify-center md:w-auto md:shrink-0">
            <div class="stack stack-end grid w-full max-w-sm md:rotate-2">
              <CubeCard
                cube={featuredCube}
                showAddButton={false}
                showRateButton={false}
                showDetailsButton={true}
                alreadyAdded={false}
              />
              {#each [1, 2] as index (index)}
                <div
                  class="rounded-2xl border border-base-300 bg-base-200"
                ></div>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      <div class="mx-auto mt-15 text-center lg:col-span-2">
        <h2 class="text-sm text-base-content/60">They believe in CubeIndex</h2>
        <div class="mt-4 flex items-center justify-center gap-8 sm:gap-10">
          {#each partners as partner, index (index)}
            <a
              class="flex items-center gap-2 transition-opacity hover:opacity-70"
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer external"
            >
              <img
                class={partner.logo.class}
                src={partner.logo.src}
                alt={partner.logo.alt}
              />
              <span class="font-clash">{partner.name}</span>
              <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i>
            </a>
          {/each}
        </div>
      </div>
    </div>
  </section>

  <section class="flex w-full px-5 sm:px-[10vw]">
    <div class="grid w-full grid-cols-2 lg:grid-cols-4">
      {#each statistics as stat, index (index)}
        <div class="stat place-items-center">
          <div class="stat-title">{stat.title}</div>
          <div class="stat-value font-clash">
            <NumberFlow
              value={mounted ? stat.count : 0}
              plugins={[continuous]}
              transformTiming={{ duration: 50, easing: "linear" }}
              spinTiming={{
                duration: 1000,
                easing: "linear",
              }}
              opacityTiming={{ duration: 400, easing: "ease-out" }}
              class="inline-block align-baseline"
            />
          </div>
        </div>
      {/each}
    </div>
  </section>

  <section class="px-5 py-20 sm:px-8 sm:py-28">
    <div class="mx-auto max-w-6xl">
      <div class="mt-16 space-y-20 sm:mt-20 sm:space-y-28">
        {#each features as feature, index (index)}
          <article
            class="flex flex-col-reverse items-center gap-9 lg:flex-row lg:gap-16 lg:even:flex-row-reverse"
          >
            <div class="w-full lg:w-1/2">
              {#if feature.title === "Discover"}
                {@render discover()}
              {:else if feature.title === "Collect"}
                {@render collect()}
              {:else if feature.title === "Compare"}
                {@render compare()}
              {/if}
            </div>

            <div class="w-full lg:w-1/2">
              <div class="flex items-center gap-4">
                <div
                  class="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
                >
                  <i class={feature.icon} aria-hidden="true"></i>
                </div>
                <h3 class="mt-2 font-clash text-4xl sm:text-5xl">
                  {feature.title}
                </h3>
              </div>
              <p class="mt-4 max-w-xl text-lg leading-8 text-base-content/70">
                {feature.description}
              </p>
            </div>
          </article>
        {/each}
      </div>
    </div>
  </section>

  <section class="px-4 py-14 sm:px-8 sm:py-28">
    <div class="aura aura-holo mx-auto block max-w-6xl">
      <div
        class="hero relative overflow-hidden rounded-box bg-base-200 sm:min-h-96"
      >
        <div class="hero-content max-w-3xl px-5 py-10 text-center sm:py-16">
          <div>
            <div
              class="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-content sm:mb-6 sm:size-16"
            >
              <i class="fa-solid fa-cubes-stacked text-2xl" aria-hidden="true"
              ></i>
            </div>
            <h2 class="font-clash text-3xl leading-tight sm:text-5xl">
              Your collection deserves more than a spreadsheet.
            </h2>
            <p
              class="mx-auto mt-4 max-w-xl text-base leading-7 sm:mt-5 sm:text-lg sm:leading-8"
            >
              Create your free collection and join cubers discovering, rating,
              and sharing their favorite puzzles.
            </p>
            <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                class="btn btn-primary w-full sm:btn-lg sm:w-auto"
                href={resolve("/(auth)/auth/signup")}
              >
                Create your collection
              </a>
              <a
                class="btn btn-ghost w-full sm:btn-lg sm:w-auto"
                href={resolve("/(public)/explore/cubes")}
              >
                Browse the database
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>
