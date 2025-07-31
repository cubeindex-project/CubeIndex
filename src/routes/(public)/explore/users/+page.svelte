<script lang="ts">
  import { configCatClient } from "$lib/configcatClient";
  import FeatureDisabled from "$lib/components/misc/featureDisabled.svelte";
  import { onMount } from "svelte";
  import UserCard from "$lib/components/user/userCard.svelte";
  import { SsgoiTransition } from "@ssgoi/svelte";
  import { page } from "$app/state";

  const { data } = $props();
  const { profiles, user_achievements, user_cubes } = data;
  let databaseAvailability: boolean = $state(true);

  onMount(() =>
    configCatClient.getValueAsync("database", false).then((value) => {
      databaseAvailability = value;
    })
  );
</script>

<SsgoiTransition id={page.url.pathname}>
  {#if databaseAvailability}
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
                (ua: { username: any }) => ua.username === profile.username
              ).length || 0}
              user_cubes_count={user_cubes.filter(
                (uc: { username: string }) => uc.username === profile.username
              ).length || 0}
              staff={false}
            />
          {/each}
        </div>
      </div>
    </section>
  {:else}
    <FeatureDisabled featureName="The database is" />
  {/if}
</SsgoiTransition>
