<script lang="ts">
  import AddCube from "./addCube.svelte";
  import RateCube from "../rating/rateCube.svelte";
  import type { Cube } from "../dbTableTypes";
  import CubeCardSkeleton from "./cubeCardSkeleton.svelte";

  let {
    cube,
    rate,
    add,
    details,
  }: {
    cube: Cube;
    rate: boolean;
    add: boolean;
    details: boolean;
    badges: boolean;
    image: boolean;
  } = $props();

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

{#snippet content()}
  <div class="mt-4 flex gap-2">
    {#if add}
      <button
        class="btn btn-secondary flex-1 gap-1"
        type="button"
        onclick={() => (openAddCard = !openAddCard)}
        aria-label="Add to Collection"
      >
        <i class="fa-solid fa-plus mr-2"></i>
        Add
        <span class="hidden sm:block">to Collection</span>
      </button>
    {/if}
    {#if rate}
      <button
        class="btn btn-accent flex-1 gap-1"
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
    {/if}
  </div>
{/snippet}

{#snippet bottom()}
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
{/snippet}

<CubeCardSkeleton
  {cube}
  newRibbon={isNewCube(cube.verified_at)}
  rating={true}
  {content}
  {bottom}
/>

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
