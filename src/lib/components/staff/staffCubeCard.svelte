<!-- staffCubeCard.svelte -->
<script lang="ts">
  import StarRating from "../rating/starRating.svelte";
  import CubeVersionType from "../cube/cubeVersionType.svelte";
  import ManageCubeStatus from "./manageCubeStatus.svelte";
  import UnapproveCube from "./unapproveCube.svelte";

  // single props destructure
  let { cube, profile } = $props();

  // reactive state
  let openModNotes = $state(false);
  let openUnapproveConfirm = $state(false);
  let reason = $state<"Accept" | "Reject" | "Edit">("Accept");

  function toggleModNotes(r: typeof reason) {
    reason = r;
    openModNotes = !openModNotes;
  }

  function toggleUnapprove() {
    openUnapproveConfirm = !openUnapproveConfirm;
  }
</script>

{#if cube.status === "Approved"}
  <div
    class="bg-base-200 border border-base-300 rounded-2xl shadow-lg hover:shadow-xl transition flex flex-col"
  >
    <div
      class={`h-10 flex items-center justify-center w-full rounded-t-2xl bg-success`}
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
      <div class="mt-3">
        <StarRating readOnly={true} rating={cube.rating ?? 0} />
      </div>

      <div class="py-4">
        <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
          Verified By: {cube.verified_by_id.display_name}
        </h2>
      </div>

      <div class="mt-4 flex gap-2">
        <a href={`cubes/edit/${cube.slug}`} class="btn btn-info flex-1">
          <i class="fa-solid fa-pencil mr-2"></i>Edit
        </a>
        <div class="relative flex-1">
          <button class="btn btn-error w-full" onclick={toggleUnapprove}>
            <i class="fa-solid fa-trash mr-2"></i>Unapprove
          </button>
          {#if openUnapproveConfirm}
            <UnapproveCube cube_id={cube.id} onCancel={toggleUnapprove} />
          {/if}
        </div>
      </div>
      <a href={`/explore/cubes/${cube.slug}`} class="btn btn-primary mt-4">
        See Cube <i class="fa-solid fa-arrow-right"></i>
      </a>
    </div>
  </div>
{/if}

{#if cube.status === "Pending"}
  <div
    class="bg-base-200 border border-base-300 rounded-2xl shadow-lg hover:shadow-xl transition flex flex-col"
  >
    <div
      class={`h-10 flex items-center justify-center w-full rounded-t-2xl bg-warning`}
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
      <div class="mt-3">
        <StarRating readOnly={true} rating={cube.rating ?? 0} />
      </div>
      <div class="mt-4 flex gap-2">
        <button
          class="btn btn-success flex-1"
          onclick={() => toggleModNotes("Accept")}
        >
          <i class="fa-solid fa-check mr-2"></i>Accept
        </button>
        <a href={`cubes/edit/${cube.slug}`} class="btn btn-info flex-1">
          <i class="fa-solid fa-pencil mr-2"></i>Edit
        </a>
        <button
          class="btn btn-error flex-1"
          onclick={() => toggleModNotes("Reject")}
        >
          <i class="fa-solid fa-xmark mr-2"></i>Reject
        </button>
      </div>
      <a href={`/explore/cubes/${cube.slug}`} class="btn btn-primary mt-4">
        See Cube <i class="fa-solid fa-arrow-right"></i>
      </a>
    </div>
  </div>
{/if}

{#if cube.status === "Rejected"}
  <div
    class="bg-base-200 border border-base-300 rounded-2xl shadow-lg hover:shadow-xl transition flex flex-col"
  >
    <div
      class="h-10 flex items-center justify-center w-full rounded-t-2xl bg-error"
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
      <div class="mt-3">
        <StarRating readOnly={true} rating={cube.rating ?? 0} />
      </div>

      <div class="flex flex-col gap-4 mt-4">
        <div class="flex flex-row items-center">
          <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
            Verified By: {cube.verified_by_id.display_name}
          </h2>
        </div>

        <div>
          <h2 class="text-lg font-bold flex items-center gap-2">Reason:</h2>
          <p>{cube.notes}</p>
        </div>
      </div>

      {#if profile.user_id === cube.verified_by_id.user_id}
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
{/if}

{#if openModNotes}
  <ManageCubeStatus
    cube_name={`${cube.series} ${cube.model} ${cube.version_name}`}
    cube_id={cube.id}
    existingNote={cube.notes}
    {reason}
    onCancel={() => (openModNotes = false)}
  />
{/if}
