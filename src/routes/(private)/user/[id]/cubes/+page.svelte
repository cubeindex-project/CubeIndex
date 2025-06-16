<script lang="ts">
  import type { PageData } from "./$types";
  import UserCubeCard from "$lib/components/userCubeCard.svelte";

  let { data }: { data: PageData } = $props();
  const { user_cubes, cubes } = data;

  const userCubeName = new Set(user_cubes.map((uc) => uc.cube));

  const userCubesFromAll = cubes.filter((cube) => userCubeName.has(cube.slug));
</script>

<div class="relative max-w-6xl mx-auto mt-12 px-4">
  <h3 class="text-2xl font-bold mb-4">Cube Collection</h3>
  {#if user_cubes && user_cubes.length > 0}
    <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {#each userCubesFromAll as cube}
        <UserCubeCard {cube} user_details={user_cubes} image={true} />
      {/each}
    </ul>
  {:else}
    <div
      class="bg-gradient-to-r from-base-200 via-blue-950 to-base-200 rounded-xl p-6 text-center text-gray-300 border border-base-300"
    >
      <span class="text-lg font-medium"
        >This user has no cubes in their collection.</span
      >
    </div>
  {/if}
</div>
