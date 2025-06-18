<script lang="ts">
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  const { user_achievements, achievements } = data;

  let showAllAchievements = $state(false);
  let achievementsToShow: any[] = $state([]);

  const userAchievementNames = new Set(
    user_achievements.map((ua) => ua.achievement)
  );

  const userAchievementsFromAll = achievements.filter((achievement) =>
    userAchievementNames.has(achievement.name)
  );

  // Show either all achievements or just the first 3, based on toggle state
  $effect(() => {
    achievementsToShow = showAllAchievements
      ? userAchievementsFromAll
      : userAchievementsFromAll.slice(0, 2);
  });
</script>

<div class="relative max-w-6xl mx-auto mt-12 px-4">
  <h3 class="text-2xl font-bold mb-4">Achievements Earned</h3>
  {#if user_achievements && user_achievements.length > 0}
    <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {#each achievementsToShow as achievement}
        <li
          class="{achievement.rarity == 'Mythic'
            ? 'bg-gradient-to-r from-red-600 to-rose-700'
            : achievement.rarity == 'Legendary'
              ? 'bg-gradient-to-r from-yellow-300 to-yellow-500'
              : achievement.rarity == 'Exotic'
                ? 'bg-teal-400'
                : achievement.rarity == 'Epic'
                  ? 'bg-purple-600'
                  : achievement.rarity == 'Rare'
                    ? 'bg-blue-600'
                    : 'bg-neutral-700'} 
                                            {achievement.rarity ==
            'Legendary' || achievement.rarity == 'Exotic'
            ? 'text-black'
            : 'text-white'} rounded-xl p-4 text-center"
        >
          {achievement.icon}
          <span class="text-lg font-medium">{achievement.name}</span>
        </li>
      {/each}

      {#if userAchievementsFromAll.length > 2}
        <button
          onclick={() => (showAllAchievements = !showAllAchievements)}
          class="btn btn-base-200 h-15"
        >
          {showAllAchievements ? "Show Less" : "Show More"}
        </button>
      {/if}
    </ul>
  {:else}
    <div
      class="bg-gradient-to-r from-base-200 via-blue-950 to-base-200 rounded-xl p-6 text-center text-gray-300 border border-base-300"
    >
      <span class="text-lg font-medium">No achievements earned yet!</span>
    </div>
  {/if}
</div>
