<!-- staffCubeCard.svelte -->
<script lang="ts">
  import { m } from "$lib/paraglide/messages";
  import ManageCubeStatus from "./manageCubeStatus.svelte";
  import CubeCardSkeleton from "../cube/cubeCardSkeleton.svelte";

  // single props destructure
  let { cube } = $props();

  // reactive state
  let openModNotes = $state(false);
  let reason = $state<"Accept" | "Reject">("Accept");

  const statusLabels: Partial<Record<string, string>> = {
    Approved: m.cube_submission_status_approved_label(),
    Pending: m.cube_submission_status_pending_label(),
    Rejected: m.cube_submission_status_rejected_label(),
  };

  function toggleModNotes(r: typeof reason) {
    reason = r;
    openModNotes = !openModNotes;
  }
</script>

{#snippet top()}
  <div
    class="h-10 flex items-center justify-center w-full rounded-t-2xl {cube.status ===
    'Approved'
      ? 'bg-success text-success-content'
      : cube.status === 'Pending'
        ? 'bg-warning text-warning-content'
        : 'bg-error text-error-content'}"
  >
    <p class="font-semibold tracking-wider">
      {statusLabels[cube.status] ?? cube.status}
    </p>
  </div>
{/snippet}

{#snippet content()}
  {#if cube.status === "Approved"}
    <div class="flex-1 flex flex-col">
      <div class="py-4">
        <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
          {m.staff_cube_card_verified_by_text({
            name: cube.verified_by_id.display_name,
          })}
        </h2>
      </div>

      <div class="mt-4 flex gap-2">
        <a href={`cubes/edit/${cube.slug}`} class="btn btn-info flex-1">
          <i class="fa-solid fa-pencil mr-2"></i>
          {m.staff_cube_card_edit_cta()}
        </a>
      </div>

      <a href={`/explore/cubes/${cube.slug}`} class="btn btn-primary mt-4">
        {m.staff_cube_card_view_cta()} <i class="fa-solid fa-arrow-right"></i>
      </a>
    </div>
  {:else if cube.status === "Pending"}
    <div class="flex-1 flex flex-col">
      <div class="mt-4 flex gap-2">
        <button
          class="btn btn-success flex-1"
          onclick={() => toggleModNotes("Accept")}
        >
          <i class="fa-solid fa-check mr-2"></i>
          {m.staff_cube_card_accept_cta()}
        </button>
        <a href={`cubes/edit/${cube.slug}`} class="btn btn-info flex-1">
          <i class="fa-solid fa-pencil mr-2"></i>
          {m.staff_cube_card_edit_cta()}
        </a>
        <button
          class="btn btn-error flex-1"
          onclick={() => toggleModNotes("Reject")}
        >
          <i class="fa-solid fa-xmark mr-2"></i>
          {m.staff_cube_card_reject_cta()}
        </button>
      </div>
      <a href={`/explore/cubes/${cube.slug}`} class="btn btn-primary mt-4">
        {m.staff_cube_card_view_cta()} <i class="fa-solid fa-arrow-right"></i>
      </a>
    </div>
  {:else}
    <div class="flex-1 flex flex-col">
      <div class="flex flex-col gap-4 mt-4">
        <div class="flex flex-row items-center">
          <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
            {m.staff_cube_card_rejected_by_text({
              name: cube.verified_by_id.display_name,
            })}
          </h2>
        </div>

        <div>
          <h2 class="text-lg font-bold flex items-center gap-2">
            {m.staff_cube_card_reason_label()}
          </h2>
          <p>{cube.notes}</p>
        </div>
      </div>

      <a href={`/explore/cubes/${cube.slug}`} class="btn btn-primary mt-4">
        {m.staff_cube_card_view_cta()} <i class="fa-solid fa-arrow-right"></i>
      </a>
    </div>
  {/if}
{/snippet}

{#snippet bottom()}{/snippet}

<CubeCardSkeleton
  {cube}
  rating={false}
  {top}
  {content}
  {bottom}
/>

{#if openModNotes}
  <ManageCubeStatus
    cube_name={`${cube.series} ${cube.model} ${cube.version_name}`}
    cube_id={cube.id}
    {reason}
    onCancel={() => (openModNotes = false)}
  />
{/if}
