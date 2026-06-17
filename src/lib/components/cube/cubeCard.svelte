<script lang="ts">
  import AddCube from "./addCube.svelte";
  import RateCube from "../rating/rateCube.svelte";
  import CubeCardSkeleton from "./cubeCardSkeleton.svelte";
  import AddToCollectionButton from "../misc/addToCollectionButton.svelte";
  import RateCubeButton from "../misc/rateCubeButton.svelte";
  import type { Tables } from "$lib/types/database.types";

  interface Props {
    cube: Tables<"v_detailed_cube_models">;
    showRateButton: boolean;
    showAddButton: boolean;
    showDetailsButton: boolean;
    alreadyAdded: boolean;
    userCubeDetail?: Tables<"user_cubes">;
  }

  let {
    cube,
    showRateButton,
    showAddButton,
    showDetailsButton,
    alreadyAdded,
    userCubeDetail,
  }: Props = $props();

  let openAddCard = $state(false);
  let openRateCard = $state(false);

  /**
   * Checks if a cube is recently verified (within the last 7 days).
   * @param addedDateString The ISO date string of verification.
   * @returns True if the cube was verified less than 7 days ago.
   */
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
        class="absolute top-4 -right-8 transform rotate-45 bg-primary text-primary-content shadow-lg px-10 py-1 text-sm font-bold tracking-wide"
      >
        NEW
      </div>
    {/if}
  </div>
{/snippet}

{#snippet content()}
  <div class="mt-4 flex gap-2">
    {#if showAddButton}
      <AddToCollectionButton
        onClick={() => {
          openAddCard = !openAddCard;
        }}
        {alreadyAdded}
        addClass="flex-1"
      />
    {/if}
    {#if showRateButton}
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
  {#if showDetailsButton}
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
      openAddCard = false;
    }}
    {cube}
    {alreadyAdded}
    defaultData={userCubeDetail}
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
