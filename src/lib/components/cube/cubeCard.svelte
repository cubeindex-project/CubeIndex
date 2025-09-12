<script lang="ts">
  import AddCube from "./addCube.svelte";
  import RateCube from "../rating/rateCube.svelte";
  import type { Cube } from "../dbTableTypes";
  import CubeCardSkeleton from "./cubeCardSkeleton.svelte";
  import AddToCollectionButton from "../misc/addToCollectionButton.svelte";
  import RateCubeButton from "../misc/rateCubeButton.svelte";

  /**
   * Cube data for the card. Supports additional optional metadata fields
   * (e.g., popularity, avg_price, feature flags) that may come from DB views.
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

  let {
    cube,
    rate,
    add,
    details,
    alreadyAdded,
    userCubeDetail,
  }: {
    cube: CubeWithMeta;
    rate: boolean;
    add: boolean;
    details: boolean;
    badges: boolean;
    image: boolean;
    alreadyAdded: boolean;
    userCubeDetail: any;
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

{#snippet top()}
  <div class="flex justify-end">
    {#if isNewCube(cube.verified_at)}
      <div
        class="absolute top-4 right-[-32px] transform rotate-45 bg-primary text-primary-content shadow-lg px-10 py-1 text-sm font-bold tracking-wide"
      >
        NEW
      </div>
    {/if}
  </div>
{/snippet}

{#snippet content()}
  <div class="mt-4 flex gap-2">
    {#if add}
      <AddToCollectionButton
        onClick={() => {
          openAddCard = !openAddCard;
        }}
        {alreadyAdded}
        addClass="flex-1"
      />
    {/if}
    {#if rate}
      <RateCubeButton
        onClick={() => {
          openRateCard = !openRateCard;
        }}
        addClass="flex-1"
      />
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

<CubeCardSkeleton {cube} rating={true} {top} {content} {bottom} />

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
