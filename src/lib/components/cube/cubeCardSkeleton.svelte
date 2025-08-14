<script lang="ts">
  import StarRating from "../rating/starRating.svelte";
  import CubeVersionType from "./cubeVersionType.svelte";
  import type { Cube } from "../dbTableTypes";
  import type { Snippet } from "svelte";

  interface Props {
    cube: Cube;
    newRibbon: boolean;
    quantity?: number;
    rating: boolean;
    top?: Snippet<[]>;
    content: Snippet<[]>;
    bottom?: Snippet<[]>;
  }

  let { cube, top, rating, content, bottom }: Props = $props();
</script>

<div
  class="relative bg-base-200 border border-base-300 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition flex flex-col z-50"
>
  {@render top?.()}
  <img
    data-hero-key={`cube-image-${cube.id}`}
    src="https://res.cloudinary.com/dc7wdwv4h/image/fetch/f_webp,q_auto,w_403/{cube.image_url}"
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
    {#if rating}
      <div class="mt-3 flex justify-start">
        <StarRating readOnly={true} rating={cube.rating ?? 0} />
      </div>
    {/if}
    {@render content()}
    {@render bottom?.()}
  </div>
</div>
