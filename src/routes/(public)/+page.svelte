<script lang="ts">
  import { resolve } from "$app/paths";
  import CubeCard from "$lib/components/cube/cubeCard.svelte";
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
        alt: "acubemy Logo",
        class: "size-9 object-contain",
      },
    },
    {
      name: "CubingPanda",
      url: "https://discord.gg/VHhYR6nyzs",
      logo: {
        src: "/partners-logo/cubingpanda_logo.webp",
        alt: "CubingPanda Logo",
        class: "size-9 rounded-full object-cover",
      },
    },
  ];

  let mounted = $state(false);

  onMount(() => (mounted = true));
</script>

<main class="overflow-hidden">
  <section class="hero">
    <div
      class="hero-overlay bg-base-100 bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--color-primary)_30%,transparent)_0%,transparent_60%)]"
    ></div>
    <div class="hero-content flex-col px-5 py-16 lg:py-24">
      <div class="flex flex-col lg:flex-row gap-14">
        <div class="max-w-2xl text-center lg:text-left">
          <h1
            class="font-clash text-5xl leading-[0.98] tracking-tight sm:text-7xl"
          >
            Give your cubes<br /> a new home.
          </h1>
          <p class="mt-7 text-lg leading-8 text-base-content/70 sm:text-xl">
            Build your collection, find your next puzzle, and share what you
            love with the speedcubing community.
          </p>
          <div
            class="mt-5 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start"
          >
            <a
              class="btn btn-primary btn-lg px-8"
              href={resolve("/(auth)/auth/signup")}
            >
              Start collecting <i
                class="fa-solid fa-arrow-right"
                aria-hidden="true"
              ></i>
            </a>
            <a
              class="btn btn-outline btn-lg px-8"
              href={resolve("/(public)/explore/cubes")}>Explore cubes</a
            >
          </div>
        </div>

        {#if featuredCube}
          <div class="relative mx-auto w-full max-w-sm rotate-2">
            <div
              class="badge badge-primary absolute -top-3 left-4 z-20 h-auto gap-2 px-3 py-2 shadow-sm"
            >
              <i class="fa-solid fa-sparkles" aria-hidden="true"></i>
              Most recent cube added
            </div>
            <div class="stack stack-end">
              <CubeCard
                cube={featuredCube}
                showAddButton={false}
                showRateButton={false}
                showDetailsButton={true}
                alreadyAdded={false}
              />
              {#each [1, 2] as index (index)}
                <div
                  class="bg-base-200 border border-base-300 rounded-2xl shadow-lg hover:shadow-xl transition"
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
            </a>
          {/each}
        </div>
      </div>
    </div>
  </section>

  <section class="px-5">
    <dl
      class="mx-auto flex max-w-6xl divide-x divide-y divide-base-300 sm:divide-y-0"
    >
      {#each statistics as stat, index (index)}
        <div class="flex-1 py-5 text-center sm:py-6">
          <dt class="text-sm text-base-content/60">{stat.title}</dt>
          <dd class="font-clash text-xl sm:text-2xl">
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
          </dd>
        </div>
      {/each}
    </dl>
  </section>

  <section class="px-5 py-20 sm:px-8 sm:py-28">
    <div class="mx-auto max-w-6xl">
      <div class="mt-16 space-y-20 sm:mt-20 sm:space-y-28">
        {#each features as feature, index (index)}
          <article
            class="flex flex-col items-center gap-9 lg:flex-row lg:gap-16 lg:even:flex-row-reverse"
          >
            <div class="w-full lg:w-1/2">
              <img
                class="rounded-2xl shadow-xl"
                src={feature.image}
                alt="Feature illustration"
              />
            </div>

            <div class="w-full lg:w-1/2">
              <span class="flex items-center gap-4">
                <div
                  class="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
                >
                  <i class={feature.icon} aria-hidden="true"></i>
                </div>
                <h3 class="mt-2 font-clash text-4xl sm:text-5xl">
                  {feature.title}
                </h3>
              </span>
              <p class="mt-4 max-w-xl text-lg leading-8 text-base-content/70">
                {feature.description}
              </p>
            </div>
          </article>
        {/each}
      </div>
    </div>
  </section>

  <section class="px-5 py-20 sm:px-8 sm:py-28">
    <div class="aura aura-holo mx-auto block max-w-6xl">
      <div
        class="hero relative min-h-96 overflow-hidden rounded-box bg-neutral text-neutral-content"
      >
        <div class="hero-content max-w-3xl py-16 text-center">
          <div>
            <div
              class="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-content"
            >
              <i class="fa-solid fa-cubes-stacked text-2xl" aria-hidden="true"
              ></i>
            </div>
            <h2 class="font-clash text-4xl sm:text-5xl">
              Your collection deserves more than a spreadsheet.
            </h2>
            <p
              class="mx-auto mt-5 max-w-xl text-lg leading-8 text-neutral-content/70"
            >
              Create your free collection and join cubers discovering, rating,
              and sharing their favorite puzzles.
            </p>
            <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                class="btn btn-primary btn-lg px-8"
                href={resolve("/(auth)/auth/signup")}
              >
                Create your collection
              </a>
              <a
                class="btn btn-outline btn-lg border-neutral-content/30 text-neutral-content hover:border-neutral-content hover:bg-neutral-content hover:text-neutral"
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
