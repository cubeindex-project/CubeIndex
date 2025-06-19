<script lang="ts">
  import type { PageData } from "./$types";
  import UserCubeCard from "$lib/components/userCubeCard.svelte";
  import EditUserCubeCard from "$lib/components/editUserCubeCard.svelte";

  let { data }: { data: PageData } = $props();
  const { user_cubes, cubes, profile, user } = data;

  let edit = $state(false);

  const userCubeName = new Set(user_cubes.map((uc) => uc.cube));

  const userCubesFromAll = cubes.filter((cube) => userCubeName.has(cube.slug));
</script>

<div class="relative max-w-6xl mx-auto mt-12 px-4">
  <div class="flex justify-between">
    <h3 class="text-2xl font-bold mb-4">Cube Collection</h3>
    {#if user?.id === profile.user_id && userCubesFromAll.length > 0}
      <button
        class="btn {edit
          ? 'btn-error text-error-content'
          : 'btn-info text-info-content'}"
        onclick={() => {
          edit = !edit;
        }}
      >
        {#if edit}
          <i class="fa-solid fa-xmark"></i>
          Cancel
        {:else}
          <i class="fa-solid fa-pencil"></i>
          Edit
        {/if}
      </button>
    {/if}
  </div>
  {#if user_cubes && user_cubes.length > 0}
    <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {#each userCubesFromAll as cube}
        {#if edit}
          <EditUserCubeCard {cube} user_details={user_cubes} image={true} />
        {:else}
          <UserCubeCard {cube} user_details={user_cubes} image={true} />
        {/if}
      {/each}
    </ul>
  {:else}
    <div
      class="bg-gradient-to-r from-base-200 via-blue-950 to-base-200 rounded-xl p-6 text-center text-gray-300 border border-base-300"
    >
      <span class="text-lg font-medium"
        >{user?.id === profile.user_id ? "You have" : "This user has"} no cubes in
        {user?.id === profile.user_id ? "your" : "their"} collection.</span
      >
    </div>
  {/if}
</div>
