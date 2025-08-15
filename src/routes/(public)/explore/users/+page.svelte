<script lang="ts">
  import UserCard from "$lib/components/user/userCard.svelte";
  import { SsgoiTransition } from "@ssgoi/svelte";
  import { page } from "$app/state";

  const { data } = $props();
  const { profiles, user_achievements, user_cubes } = data;
</script>

<svelte:head>
  <title>Explore Users - CubeIndex</title>
</svelte:head>

<SsgoiTransition id={page.url.pathname}>
  <section class="min-h-screen px-4 py-12">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-clash font-bold mb-10 text-center">
        Explore Users
      </h1>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {#each profiles as profile}
          <UserCard
            {profile}
            user_achievements_count={user_achievements.filter(
              (ua: { user_id: any }) => ua.user_id === profile.user_id
            ).length || 0}
            user_cubes_count={user_cubes.filter(
              (uc: { user_id: string }) => uc.user_id === profile.user_id
            ).length || 0}
          />
        {/each}
      </div>
    </div>
  </section>
</SsgoiTransition>
