<script lang="ts">
  import type { PageData } from "./$types";
  import DOMPurify from "isomorphic-dompurify";
  import UserCubeCard from "$lib/components/cube/userCubeCard.svelte";
  import UserCard from "$lib/components/user/userCard.svelte";
  import Markdown from "svelte-exmarkdown";
  import { gfmPlugin } from "svelte-exmarkdown/gfm";
  import "github-markdown-css/github-markdown.css";

  const plugins = [gfmPlugin()];

  let { data }: { data: PageData } = $props();

  const profile = $derived(data.profile);
  const bio = $derived(DOMPurify.sanitize(profile.bio));
  const main_cubes = $derived(data.main_cubes);
  const user_cubes = $derived(data.user_cubes);
  const user_achievements = $derived(data.user_achievements);
  const user_cube_ratings = $derived(data.user_cube_ratings);
</script>

<div
  class="min-h-screen lg:mx-24 p-6 grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-4"
>
  <div class="col-span-1 flex flex-col gap-6">
    <!-- Bio Card -->
    {#if profile.bio}
      <div>
        <h2 class="text-xl font-semibold mb-2">Bio</h2>
        <div
          class="card !bg-base-200 p-4 rounded-2xl max-h-96 overflow-auto markdown-body !text-base-content"
        >
          <Markdown md={bio} {plugins} />
        </div>
      </div>
    {/if}

    <!-- Stats Card -->
    <div>
      <h2 class="text-xl font-semibold mb-4">Stats</h2>
      <div class="card bg-base-200 p-6 rounded-2xl flex flex-col">
        <div class="space-y-2">
          <div>
            <span class="font-medium">Total Cubes:</span>
            {user_cubes.length}
          </div>
          <div>
            <span class="font-medium">Achievements:</span>
            {user_achievements.length}
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Main Cubes -->
  <div class="col-span-full lg:col-span-2">
    <h2 class="text-xl font-semibold mb-2">Main Cubes</h2>
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-4">
      {#each main_cubes as mc}
        <UserCubeCard
          mode="view"
          cube={mc.cube_model}
          user_details={mc}
          user_rating={user_cube_ratings.find(
            (ucr) => ucr.cube_slug === mc.slug
          )?.rating ?? 0}
        />
      {:else}
        This user hasn't set any cubes as their main
      {/each}
    </div>
  </div>

  <!-- Recent Activity -->
  <!-- <div class="card bg-base-300 p-4 rounded-2xl lg:col-span-2">
    <h2 class="text-xl font-semibold mb-2">Recent Activity</h2>
    <ul class="list-disc list-inside space-y-1 max-h-80 overflow-auto">
      {#each recent_activity as act}
        <li>{act}</li>
      {/each}
      {#if recent_activity.length === 0}
        <li class="italic text-base-content/50">No recent activity.</li>
      {/if}
    </ul>
  </div> -->
</div>
