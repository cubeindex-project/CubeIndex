<script lang="ts">
  import StarRating from "../rating/starRating.svelte";
  import CubeVersionType from "./cubeVersionType.svelte";
  import type { Cube } from "../dbTableTypes";
  import type { Snippet } from "svelte";

  /**
   * Cube data as shown on list cards.
   * Accepts the core Cube plus optional metadata fields coming from views.
   */
  type CubeWithMeta = Cube &
    Partial<{
      avg_price: number;
      popularity: number;
      wca_legal: boolean;
      magnetic: boolean;
      smart: boolean;
      modded: boolean;
      stickered: boolean;
    }>;

  interface Props {
    cube: CubeWithMeta;
    rating: boolean;
    top?: Snippet<[]>;
    content: Snippet<[]>;
    bottom?: Snippet<[]>;
    newRibbon?: boolean;
  }

  let { cube, top, rating, content, bottom }: Props = $props();

  const preloadImage = `https://res.cloudinary.com/dc7wdwv4h/image/fetch/f_webp,q_auto,w_403/${cube.image_url}`;

  // Number formatters
  const compactNF = new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 1,
  });
  const fmtCompact = (n: number) => compactNF.format(n);

  const currencyNF = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
  const formatCurrency = (n: number) => currencyNF.format(n);
</script>

<svelte:head>
  <link rel="preload" as="image" href={preloadImage} fetchpriority="high" />
  <link rel="dns-prefetch" href="//res.cloudinary.com" />
</svelte:head>

<div
  class="relative bg-base-200 border border-base-300 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition flex flex-col z-50"
>
  {@render top?.()}
  <img
    data-hero-key={`cube-image-${cube.id}`}
    src={preloadImage}
    alt="{cube.series} {cube.model} {cube.version_name}"
    class="w-full h-48 object-cover"
    loading="eager"
    fetchpriority="high"
  />
  <div class="p-5 flex-1 flex flex-col">
    <h2 class="text-xl font-bold mb-1" data-hero-key={`cube-title-${cube.id}`}>
      {cube.series}
      {cube.model}
      {#if cube.version_type !== "Base"}
        <span class="text-blue-400">{cube.version_name}</span>
      {/if}
      <CubeVersionType version_type={cube.version_type} />
    </h2>
    <p class="text-sm text-gray-400">
      {cube.type} ・ {cube.brand}
    </p>
    <!-- Meta: popularity • avg price -->
    {#if (cube.popularity ?? 0) > 0 || (cube.avg_price ?? 0) > 0}
      <div class="mt-3 flex items-center gap-4 text-xs text-base-content/70">
        {#if (cube.popularity ?? 0) > 0}
          <span title="Popularity">
            <i class="fa-solid fa-users mr-1" aria-hidden="true"
            ></i>{fmtCompact(cube.popularity!)}
          </span>
        {/if}
        {#if (cube.avg_price ?? 0) > 0}
          <span title="Average price">
            <i class="fa-solid fa-tag mr-1" aria-hidden="true"
            ></i>{formatCurrency(cube.avg_price!)}
          </span>
        {/if}
      </div>
    {/if}
    {#if rating}
      <div class="mt-3 flex justify-start">
        <StarRating readOnly={true} rating={cube.rating ?? 0} />
      </div>
    {/if}
    {@render content()}
    {@render bottom?.()}
  </div>
</div>
