<script lang="ts">
  import CubeVersionType from "./cubeVersionType.svelte";

  let { cube, user_details = [], image } = $props();

  let showNotes = $state(false);

  const user_details_cube = user_details.filter((ud) => ud.cube === cube.slug);
</script>

<div
  class="bg-base-200 border border-base-300 rounded-2xl overflow-hidden transition flex flex-col"
>
  <div class="flex justify-end">
    {#if user_details_cube[0].quantity > 1}
      <div
        class="absolute bg-primary -mr-3 -mt-3 transform rotate-15 rounded-full size-12 flex items-center justify-center text-primary-content"
      >
        x{user_details_cube[0].quantity}
      </div>
    {/if}
  </div>
  {#if image}
    <img
      src={cube.image_url}
      alt={cube.name}
      class="w-full h-48 object-cover"
    />
  {/if}
  <div class="p-5 flex-1 flex flex-col">
    <h2 class="text-xl font-bold mb-1 items-center">
      {cube.series}
      {cube.model}
      {#if cube.version_type !== "Base"}
        <span class="text-secondary">{cube.version_name}</span>
      {/if}
      <CubeVersionType version_type={cube.version_type} moreInfo={false} />
    </h2>
    <p class="text-sm">
      {cube.type} ・ {cube.brand}
    </p>
    <div class="mt-4 flex gap-2">
      {#if user_details.length > 0}
        <div>
          {#if user_details_cube[0].condition}
            <p>
              <span class="font-bold">Condition:</span>
              {user_details_cube[0].condition}
            </p>
          {/if}
          {#if user_details_cube[0].status}
            <p>
              <span class="font-bold">Status:</span>
              {user_details_cube[0].status}
            </p>
          {/if}
          {#if user_details_cube[0].notes}
            <span class="font-bold">Notes:</span>
            <button class="cursor-pointer link link-primary" onclick={() => {showNotes = !showNotes}}>Show</button>
            <div class="bg-base-300 border border-base-100 p-2 rounded-2xl {showNotes ? "flex" : "hidden"}">
              <p>
                {user_details_cube[0].notes}
              </p>
            </div>
          {/if}
          {#if user_details_cube[0].acquired_date}
            <p>
              <span class="font-bold">Acquired Date:</span>
              {user_details_cube[0].acquired_date}
            </p>
          {/if}
        </div>
      {/if}
    </div>
    <a
      href="/explore/cubes/{cube.slug}"
      class="btn btn-primary mt-4"
      aria-label="View Cube Details"
    >
      View Details
      <i class="fa-solid fa-arrow-right"></i>
    </a>
  </div>
</div>
