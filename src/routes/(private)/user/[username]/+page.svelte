<script lang="ts">
  import CubeCard from "$lib/components/cube/cubeCard.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  const { profile, main_cubes } = data;
</script>

<div class="min-h-screen mx-24 grid grid-cols-4 gap-6">
  <div class="bg-base-200 card">
    <p class="break-words">
      {profile?.bio || "No bio provided."}
    </p>
  </div>
  <div class="bg-base-200 p-6 grid grid-cols-1 card">
    {#each main_cubes as cube}
      <div class="">
        <CubeCard
          {cube}
          rate={false}
          add={false}
          details={true}
          badges={true}
          image={true}
        />
      </div>
    {/each}
  </div>
</div>
