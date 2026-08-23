<script lang="ts">
  import ManageCubeModal from "./ManageCubeModal.svelte";
  import RateCubeModal from "../rating/RateCubeModal.svelte";
  import CubeCardSkeleton from "./CubeCardSkeleton.svelte";
  import AddToCollectionButton from "../misc/AddToCollectionButton.svelte";
  import RateCubeButton from "../misc/RateCubeButton.svelte";
  import type { Tables } from "$lib/types/database.types";
  import { resolve } from "$app/paths";

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
    {#if isNewCube(cube.created_at)}
      <div
        class="absolute top-4 -right-8 transform rotate-45 bg-primary text-primary-content shadow-lg px-10 py-1 text-sm font-bold tracking-wide"
      >
        NEW
      </div>
    {/if}
  </div>
{/snippet}

{#snippet content()}
  <div class="mt-4 grid grid-cols-[repeat(auto-fit,minmax(10.5rem,1fr))] gap-4">
    {#if showAddButton}
      <AddToCollectionButton
        onClick={() => {
          openAddCard = !openAddCard;
        }}
        {alreadyAdded}
        addClass="w-full"
      />
    {/if}
    {#if showRateButton}
      <RateCubeButton
        onClick={() => {
          openRateCard = !openRateCard;
        }}
        addClass="w-full"
      />
    {/if}
  </div>
{/snippet}

{#snippet bottom()}
  {#if showDetailsButton}
    <a
      href={resolve("/(public)/explore/cubes/[slug]", { slug: cube.slug })}
      class="btn btn-primary mt-4"
      aria-label="View Cube Details"
    >
      View Details
      <i class="fa-solid fa-arrow-right"></i>
    </a>
  {/if}
{/snippet}

<CubeCardSkeleton {cube} rating={true} {top} {content} {bottom} />

<ManageCubeModal
  bind:open={openAddCard}
  {cube}
  {alreadyAdded}
  defaultData={userCubeDetail}
  onAdded={() => {
    openRateCard = true;
  }}
/>
<RateCubeModal bind:open={openRateCard} {cube} />
