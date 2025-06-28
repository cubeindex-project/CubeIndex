<script lang="ts">
  import { configCatClient } from "$lib/configcatClient";
  import FeatureDisabled from "$lib/components/featureDisabled.svelte";
  import { onMount } from "svelte";
  import UserCard from "$lib/components/userCard.svelte";

  const { data } = $props();
  const { profiles, user_achievements, user_cubes } = data;
  let databaseAvailability: boolean = $state(true);

  onMount(() =>
    configCatClient.getValueAsync("database", false).then((value) => {
      databaseAvailability = value;
    })
  );
</script>

{#if databaseAvailability}
  <section class="min-h-screen px-4 py-12">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-clash font-bold mb-10 text-center">
        Explore Users
      </h1>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {#each profiles as profile}
          <UserCard {profile} {user_achievements} staff={false} />
        {/each}
      </div>
    </div>
  </section>
{:else}
  <FeatureDisabled featureName="The database is" />
{/if}
