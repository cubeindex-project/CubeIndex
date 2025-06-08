<script lang="ts">
  import { configCatClient } from "$lib/configcatClient";
  import FeatureDisabled from "$lib/components/featureDisabled.svelte";
  import Badge from "$lib/components/badge.svelte";
  import { onMount } from "svelte";

  const { data } = $props();
  const { profiles, user_achievements } = data;
  let databaseAvailability: boolean = $state(true);

  onMount(() =>
    configCatClient.getValueAsync("database", false).then((value) => {
      databaseAvailability = value;
    }),
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
          <a
            href={`/user/${profile.id}`}
            class="flex items-center gap-4 bg-base-200 rounded-xl px-4 py-4 shadow border border-base-300 transition group"
          >
            {#if profile.profile_picture}
              <img
                src={profile.profile_picture}
                alt={profile.username}
                class="w-14 h-14 rounded-full border-2 border-primary object-cover shadow"
              />
            {:else}
              <div class="avatar avatar-placeholder">
                <div
                  class="bg-base-300 w-14 h-14 rounded-full border-2 border-primary"
                >
                  <span class="text-2xl uppercase font-clash"
                    >{profile.username.charAt(0)}</span
                  >
                </div>
              </div>
            {/if}
            <div class="flex-1 min-w-0">
              <div class="flex flex-col gap-0.5">
                <span class="font-semibold truncate"
                  >{profile.username}
                  <Badge {profile} textSize="xs" /></span
                >
                <span class="text-xs flex items-center gap-2">
                  <i class="fa-solid fa-cube"></i>0 Cubes
                  <span class="mx-1">•</span>
                  <i class="fa-solid fa-medal"></i>{user_achievements.filter(
                    (ua) => ua.username === profile.username,
                  ).length || 0} Achievements
                </span>
              </div>
              <p class="text-xs truncate max-w-full mt-1">
                {profile.bio || "No bio provided."}
              </p>
            </div>
            <span
              class="ml-2 text-primary group-hover:translate-x-1 transition-transform"
            >
              <i class="fa-solid fa-arrow-right"></i>
            </span>
          </a>
        {/each}
      </div>
    </div>
  </section>
{:else}
  <FeatureDisabled featureName="The database is" />
{/if}
