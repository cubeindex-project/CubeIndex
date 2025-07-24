<script lang="ts">
  import StarRating from "../rating/starRating.svelte";
  import CubeVersionType from "./cubeVersionType.svelte";
  import AddCube from "./addCube.svelte";
  import RateCube from "../rating/rateCube.svelte";
  import type { Cube } from "../types/cube";
  import type { User } from "@supabase/supabase-js";
  import { getContext } from "svelte";

  let {
    cube,
    rate,
    add,
    details,
    badges,
    image,
  }: {
    cube: Cube;
    rate: boolean;
    add: boolean;
    details: boolean;
    badges: boolean;
    image: boolean;
  } = $props();

  const user = getContext<User>("user");

  let openAddCard = $state(false);
  let openRateCard = $state(false);

  function isNewCube(addedDateString: string | null): boolean {
    if (!addedDateString) return false;

    const addedDate = new Date(addedDateString);
    const now = new Date();

    const diffMs = now.getTime() - addedDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    return diffDays < 7;
  }
</script>

<div>
  <div
    class="relative bg-base-200 border border-base-300 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition flex flex-col"
  >
    <div class="flex justify-end">
      {#if isNewCube(cube.verified_at)}
        <div
          class="absolute top-4 right-[-32px] transform rotate-45 bg-primary text-primary-content shadow-lg px-10 py-1 text-sm font-bold tracking-wide"
        >
          NEW
        </div>
      {/if}
    </div>
    {#if image}
      <img
        src={cube.image_url}
        alt="{cube.series} {cube.model} {cube.version_name}"
        class="w-full h-48 object-cover"
      />
    {/if}
    <div class="p-5 flex-1 flex flex-col">
      <h2 class="text-xl font-bold mb-1">
        {cube.series}
        {cube.model}
        {#if cube.version_type !== "Base"}
          <span class="text-blue-400">{cube.version_name}</span>
        {/if}
        {#if badges}
          <CubeVersionType version_type={cube.version_type} moreInfo={false} />
        {/if}
      </h2>
      <p class="text-sm text-gray-400">
        {cube.type} ・ {cube.brand}
      </p>
      <div class="mt-3 flex justify-start">
        <StarRating readOnly={true} rating={cube.rating ?? 0} />
      </div>
      <div class="mt-4 flex gap-2">
        {#if add}
          <button
            class="btn btn-secondary flex-1"
            type="button"
            onclick={() => {
              openAddCard = !openAddCard;
            }}
            aria-label="Add to Collection"
          >
            <i class="fa-solid fa-plus mr-2"></i>
            Add<span class="hidden sm:block">to Collection</span>
          </button>
        {/if}
        {#if rate}
          <button
            class="btn btn-accent flex-1"
            type="button"
            onclick={() => {
              openRateCard = !openRateCard;
            }}
            aria-label="Rate this Cube"
          >
            <i class="fa-solid fa-star mr-2"></i>
            Rate<span class="hidden sm:block">this Cube</span>
          </button>
        {/if}
      </div>
      {#if details}
        <a
          href="/explore/cubes/{cube.slug}"
          class="btn btn-primary mt-4"
          aria-label="View Cube Details"
        >
          View Details
          <i class="fa-solid fa-arrow-right"></i>
        </a>
      {/if}
    </div>
  </div>
  {#if openAddCard}
    <AddCube
      onCancel={() => {
        openAddCard = !openAddCard;
      }}
      {cube}
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
</div>
