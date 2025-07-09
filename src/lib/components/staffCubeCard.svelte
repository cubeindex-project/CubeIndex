<!-- staffCubeCard.svelte -->
<script lang="ts">
  import StarRating from "./starRating.svelte";
  import CubeVersionType from "./cubeVersionType.svelte";
  import ManageCubeStatus from "./manageCubeStatus.svelte";
  import UnapproveCube from "./unapproveCube.svelte";

  // single props destructure
  let { cube } = $props();

  // reactive state
  let openModNotes = $state(false);
  let openUnapproveConfirm = $state(false);
  let reason = $state<"Accept" | "Reject" | "Edit">("Accept");

  // map status → background class
  const statusBg = (() => {
    if (cube.status === "Pending") return "bg-warning";
    if (cube.status === "Rejected") return "bg-error";
    if (cube.status === "Approved") return "bg-success";
    return "bg-base-300";
  });

  const cubeName = `${cube.series} ${cube.model} ${cube.version_name}`;

  function toggleModNotes(r: typeof reason) {
    reason = r;
    openModNotes = !openModNotes;
  }

  function toggleUnapprove() {
    openUnapproveConfirm = !openUnapproveConfirm;
  }
</script>

<div
  class="bg-base-200 border border-base-300 rounded-2xl shadow-lg hover:shadow-xl transition flex flex-col"
>
  <div
    class={`h-10 flex items-center justify-center w-full rounded-t-2xl ${statusBg()}`}
  >
    <p class="font-semibold tracking-wider">{cube.status}</p>
  </div>
  <img
    src={cube.image_url}
    alt={`${cube.series} ${cube.model} ${cube.version_name}`}
    class="w-full h-48 object-cover"
  />
  <div class="p-5 flex-1 flex flex-col">
    <h2 class="text-xl font-bold mb-1">
      {cube.series} {cube.model}
      {#if cube.version_type !== "Base"}
        <span class="text-blue-400">{cube.version_name}</span>
      {/if}
      <CubeVersionType version_type={cube.version_type} moreInfo={false} />
    </h2>
    <p class="text-sm text-gray-400">
      {cube.type} ・ {cube.brand}
    </p>
    <div class="mt-3">
      <StarRating rating={cube.rating} large={false} />
    </div>
    <div class="mt-4 flex gap-2">
      {#if cube.status === "Pending"}
        <button
          class="btn btn-success flex-1"
          onclick={() => toggleModNotes("Accept")}
        >
          <i class="fa-solid fa-check mr-2"></i>Accept
        </button>
      {/if}
      {#if cube.status !== "Rejected"}
        <a href={`cubes/edit/${cube.slug}`} class="btn btn-info flex-1">
          <i class="fa-solid fa-pencil mr-2"></i>Edit
        </a>
      {/if}
      {#if cube.status === "Approved"}
        <div class="relative flex-1">
          <button class="btn btn-error w-full" onclick={toggleUnapprove}>
            <i class="fa-solid fa-trash mr-2"></i>Unapprove
          </button>
          {#if openUnapproveConfirm}
            <UnapproveCube cube_id={cube.id} onCancel={toggleUnapprove} />
          {/if}
        </div>
      {:else if cube.status !== "Rejected"}
        <button
          class="btn btn-error flex-1"
          onclick={() => toggleModNotes("Reject")}
        >
          <i class="fa-solid fa-xmark mr-2"></i>Reject
        </button>
      {/if}
    </div>
    {#if cube.status === "Rejected"}
      <button
        class="btn btn-warning mt-4"
        onclick={() => toggleModNotes("Edit")}
      >
        <i class="fa-solid fa-pencil mr-2"></i>
        {cube.notes ? "Edit" : "Write"} Mod Note
      </button>
    {/if}
    <a href={`/explore/cubes/${cube.slug}`} class="btn btn-primary mt-4">
      See Cube <i class="fa-solid fa-arrow-right"></i>
    </a>
  </div>
</div>

{#if openModNotes}
  <ManageCubeStatus
    cube_name={cubeName}
    cube_id={cube.id}
    existingNote={cube.notes}
    {reason}
    onCancel={() => (openModNotes = false)}
  />
{/if}
