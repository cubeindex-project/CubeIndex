<script lang="ts">
  import AddCube from "./addCube.svelte";
  import RateCube from "../rating/rateCube.svelte";
  import type { Cube } from "../dbTableTypes";
  import CubeCardSkeleton from "./cubeCardSkeleton.svelte";
  import AddToCollectionButton from "../misc/addToCollectionButton.svelte";
  import RateCubeButton from "../misc/rateCubeButton.svelte";

  let {
    cube,
    rate,
    add,
    details,
    userCubeDetail,
  }: {
    cube: Cube;
    rate: boolean;
    add: boolean;
    details: boolean;
    badges: boolean;
    image: boolean;
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

  console.log(userCubeDetail)
</script>

{#snippet content()}
  <div class="mt-4 flex gap-2">
    {#if add}
      <AddToCollectionButton
        onClick={() => {
          openAddCard = !openAddCard;
        }}
        alreadyAdded={userCubeDetail !== undefined}
      />
    {/if}
    {#if rate}
      <RateCubeButton
        onClick={() => {
          openRateCard = !openRateCard;
        }}
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
