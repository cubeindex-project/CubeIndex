<script lang="ts">
  import { formatDate } from "../../utils/formatDate";
  import CubeCardSkeleton from "./CubeCardSkeleton.svelte";
  import ManageCubeModal from "./ManageCubeModal.svelte";
  import { type Tables } from "$lib/types/database.types";
  import { resolve } from "$app/paths";
  import { deleteCubeFromCollection } from "$lib/api/cubeCollection";
  import { getCurrencySymbol } from "$lib/utils/getCurrencySymbol";
  import { getUserCubeStatusLabel } from "$lib/utils/getUserCubeStatusLabel";

  interface Props {
    mode?: "view" | "edit";
    cube: Tables<"v_detailed_cube_models">;
    user_details: Tables<"user_cubes"> & {
      vendor: { name: string } | null;
    };
    user_rating: number;
    onDelete?: () => void;
  }

  let {
    mode = "view",
    cube,
    user_details,
    user_rating,
    onDelete,
  }: Props = $props();

  let editModalOpen = $state(false);
  let deleteMessage = $state("");
  let isDeleting = $state(false);

  async function handleDelete() {
    deleteMessage = "";
    isDeleting = true;

    try {
      await deleteCubeFromCollection(user_details.id);
      onDelete?.();
    } catch (err) {
      deleteMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
    } finally {
      isDeleting = false;
    }
  }
</script>

{#snippet top()}
  {#if mode === "view"}
    {#if user_details.main}
      <div class="absolute left-3 top-3">
        <div class="badge badge-ghost gap-1" title="Main cube">
          <i class="fa-solid fa-thumbtack"></i>
          Main
        </div>
      </div>
    {/if}
    {#if user_details.quantity > 1}
      <div class="absolute right-3 top-3">
        <div class="badge badge-primary badge-lg gap-1" title="Quantity">
          <i class="fa-solid fa-layer-group"></i>
          x{user_details.quantity}
        </div>
      </div>
    {/if}
  {/if}
{/snippet}
{#snippet content()}
  {#if mode === "view"}
    <div class="mt-4">
      <div class="flex flex-wrap gap-2 items-center">
        {#if user_rating > 0}
          <div
            class="badge badge-warning badge-lg gap-1 text-black"
            title="Your rating"
          >
            <i class="fa-solid fa-star"></i>
            {user_rating}
          </div>
        {/if}

        {#if user_details.status}
          <div class="badge badge-lg gap-1 bg-base-300" title="Status">
            <i class="fa-solid fa-clipboard-check"></i>
            {getUserCubeStatusLabel(user_details.status)}
          </div>
        {/if}

        {#if user_details.condition}
          <div class="badge badge-lg gap-1 bg-base-300" title="Condition">
            <i class="fa-solid fa-cube"></i>
            {user_details.condition}
          </div>
        {/if}

        {#if user_details.vendor}
          <div class="badge badge-lg gap-1 bg-base-300" title="Bought from">
            <i class="fa-solid fa-store"></i>
            {user_details.vendor.name}
          </div>
        {/if}

        {#if user_details.purchase_price !== null && user_details.purchase_price_currency !== null}
          <div class="badge badge-lg gap-1 bg-base-300" title="Purchase price">
            <i class="fa-solid fa-tag"></i>
            {getCurrencySymbol(user_details.purchase_price_currency)}
            {user_details.purchase_price}
          </div>
        {/if}

        {#if user_details.acquired_at}
          <div class="badge badge-lg gap-1 bg-base-300" title="Acquired on">
            <i class="fa-solid fa-calendar-day"></i>
            {formatDate(user_details.acquired_at)}
          </div>
        {/if}
      </div>

      {#if user_details.notes}
        <div class="mt-3 bg-base-200 border border-base-100 p-3 rounded-xl">
          <p class="whitespace-pre-wrap">{user_details.notes}</p>
        </div>
      {/if}
    </div>
  {/if}
{/snippet}

{#snippet bottom()}
  {#if mode === "view"}
    <a
      href={resolve("/(public)/explore/cubes/[slug]", { slug: cube.slug })}
      class="btn btn-primary mt-4"
      aria-label="View Cube Details"
    >
      View Details
      <i class="fa-solid fa-arrow-right"></i>
    </a>
  {:else}
    <div
      class="mt-4 grid grid-cols-[repeat(auto-fit,minmax(10.5rem,1fr))] gap-4"
    >
      <button
        class="btn btn-error w-full"
        onclick={handleDelete}
        disabled={isDeleting}
        aria-label="Remove from collection"
      >
        {#if isDeleting}
          <span class="loading loading-spinner"></span>
          Removing...
        {:else}
          <i class="fa-solid fa-trash"></i>
          Remove
        {/if}
      </button>
      <button
        class="btn btn-primary w-full"
        onclick={() => (editModalOpen = true)}
      >
        <i class="fa-solid fa-pen"></i>
        Edit
      </button>
    </div>

    {#if deleteMessage}
      <div class="alert alert-error mt-3">
        <i class="fa-solid fa-circle-exclamation"></i>
        <span>{deleteMessage}</span>
      </div>
    {/if}
  {/if}
{/snippet}

<CubeCardSkeleton
  {cube}
  rating={false}
  showMeta={false}
  {top}
  {content}
  {bottom}
/>

<ManageCubeModal
  bind:open={editModalOpen}
  {cube}
  alreadyAdded={true}
  defaultData={{
    quantity: user_details.quantity,
    condition: user_details.condition,
    main: user_details.main,
    status: user_details.status,
    bought_from_id: user_details.bought_from_id,
    notes: user_details.notes,
    acquired_at: user_details.acquired_at,
    purchase_price: user_details.purchase_price,
    purchase_price_currency: user_details.purchase_price_currency,
  }}
/>
