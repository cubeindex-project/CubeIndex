<script lang="ts">
  import type { PageData } from "./$types";
  import CubeCard from "$lib/components/cubeCard.svelte";

  let { data }: { data: PageData } = $props();

  const { submittedCubes, user, profile } = data;
</script>

<div class="relative max-w-6xl mx-auto mt-12 px-4">
  <h3 class="text-2xl font-bold mb-4">Submitted Cubes</h3>
  {#if submittedCubes && submittedCubes.length > 0}
    <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {#each submittedCubes as cube}
        <CubeCard
          {cube}
          image={true}
          rate={false}
          add={false}
          details={true}
          badges={true}
        />
      {/each}
    </ul>
  {:else}
    <a
      href="/submit"
      class="btn bg-gradient-to-r from-base-200 via-blue-950 to-base-200 rounded-xl p-6 text-center text-gray-300 border border-base-300 w-full h-18"
    >
      <span class="text-lg font-medium"
        >You haven't submitted any cubes yet. Click here to submit one now!</span
      >
    </a>
  {/if}
</div>
