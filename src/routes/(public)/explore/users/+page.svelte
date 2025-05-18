<script lang="ts">
  import { configCatClient } from "$lib/configcatClient";
  import FeatureDisabled from "$lib/components/featureDisabled.svelte";
  import { onMount } from "svelte";

  const { data } = $props();
  const { profiles } = data;
  let databaseAvailability: boolean = $state(true);

  onMount(() =>
    configCatClient.getValueAsync("database", false).then((value) => {
      databaseAvailability = value;
    }),
  );
</script>

{#if databaseAvailability}
  <section class="min-h-screen bg-black text-white px-4 py-12">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-clash font-bold mb-10 text-center">
        Explore Users
      </h1>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {#each profiles as profile}
          <a
            href={`/user/${profile.id}`}
            class="flex items-center gap-4 bg-neutral-900/80 hover:bg-neutral-900 rounded-xl px-4 py-4 shadow border border-neutral-800 transition group"
          >
            <img
              src={profile.profile_picture || "/images/default-profile.png"}
              alt={profile.username}
              class="w-14 h-14 rounded-full border-2 border-blue-500 object-cover shadow"
            />
            <div class="flex-1 min-w-0">
              <div class="flex flex-col gap-0.5">
                <span
                  class="font-semibold text-base group-hover:text-blue-400 truncate"
                  >{profile.username}</span
                >
                <span class="text-xs text-gray-400 flex items-center gap-2">
                  <i class="fa-solid fa-cube"></i>0 Cubes
                  <span class="mx-1">•</span>
                  <i class="fa-solid fa-medal"></i>0 Badges
                </span>
              </div>
              <p class="text-gray-300 text-xs truncate max-w-full mt-1">
                {profile.bio || "No bio provided."}
              </p>
            </div>
            <span
              class="ml-2 text-blue-500 group-hover:translate-x-1 transition-transform"
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
