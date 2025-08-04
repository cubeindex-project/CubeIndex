<script lang="ts">
  import { emoji } from "@cartamd/plugin-emoji";
  import type { PageData } from "./$types";
  import { Carta, Markdown } from "carta-md";
  import DOMPurify from "isomorphic-dompurify";
  import UserCubeCard from "$lib/components/cube/userCubeCard.svelte";
  import UserCard from "$lib/components/user/userCard.svelte";

  const carta = new Carta({
    sanitizer: DOMPurify.sanitize,
    extensions: [emoji()],
  });

  let { data }: { data: PageData } = $props();

  const profile = $derived(data.profile);
  const main_cubes = $derived(data.main_cubes);
  const user_cubes = $derived(data.user_cubes);
  const user_achievements = $derived(data.user_achievements);
  const friends = $derived(data.friends);
  const user_cube_ratings = $derived(data.user_cube_ratings);
</script>

<div
  class="min-h-screen mx-8 lg:mx-24 p-6 grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-4"
>
  <div class="col-span-1 flex flex-col gap-6">
    <!-- Bio Card -->
    {#if profile.bio}
      <div>
        <h2 class="text-xl font-semibold mb-2">Bio</h2>
        <div class="card bg-base-300 p-4 rounded-2xl max-h-96 overflow-auto">
          <Markdown {carta} value={profile.bio} />
        </div>
      </div>
    {/if}

    <!-- Stats Card -->
    <div>
      <h2 class="text-xl font-semibold mb-4">Stats</h2>
      <div class="card bg-base-300 p-6 rounded-2xl flex flex-col">
        <div class="space-y-2">
          <div>
            <span class="font-medium">Total Cubes:</span>
            {user_cubes.length}
          </div>
          <div>
            <span class="font-medium">Achievements:</span>
            {user_achievements.length}
          </div>
          <div>
            <span class="font-medium">Friends:</span>
            {friends.length}
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Friends List -->
  <div>
    <h2 class="text-xl font-semibold mb-2">Friends</h2>
    <div class="flex flex-col gap-2">
      {#each friends as friend}
        <UserCard profile={friend} showCount={false} />
      {/each}
      {#if friends.length === 0}
        <p class="italic">No friends added.</p>
      {/if}
    </div>
  </div>

  <!-- Main Cubes -->
  <div class="col-span-full lg:col-span-2">
    <h2 class="text-xl font-semibold mb-2">Main Cubes</h2>
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-4">
      {#each main_cubes as cube}
        <UserCubeCard
          {cube}
          user_details={user_cubes}
          user_rating={user_cube_ratings.find(
            (ucr) => ucr.cube_slug === cube.slug
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
