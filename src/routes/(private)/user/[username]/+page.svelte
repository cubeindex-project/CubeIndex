<script lang="ts">
  import CubeCard from "$lib/components/cube/cubeCard.svelte";
  import { emoji } from "@cartamd/plugin-emoji";
  import type { PageData } from "./$types";
  import { Carta, Markdown } from "carta-md";
  import DOMPurify from "isomorphic-dompurify";

  const carta = new Carta({
    sanitizer: DOMPurify.sanitize,
    extensions: [emoji()],
  });

  let { data }: { data: PageData } = $props();
  const { profile, main_cubes, user_cubes, user_achievements } = data;
</script>

<div class="min-h-screen mx-24 grid grid-cols-4 gap-6 p-6">
  <div class="col-span-2.5">
    <p>Bio:</p>
    <div class="card bg-base-300 p-3 max-h-96 overflow-auto">
      <Markdown {carta} value={profile.bio} />
    </div>
  </div>
  <div>
    <p>Stats:</p>
    <div class="card bg-base-300">
      Total Cubes: {user_cubes.length}
      Total Achievements: {user_achievements.length}
    </div>
  </div>
  <div>
    <p>Main cubes:</p>
    <div class="bg-base-300 p-6 grid grid-cols-1 card gap-4">
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
</div>
