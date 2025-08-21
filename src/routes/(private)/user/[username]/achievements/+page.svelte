<script lang="ts">
  import type { PageData } from "./$types";
  import { formatDate } from "$lib/components/helper_functions/formatDate.svelte";

  let { data }: { data: PageData } = $props();
  const { user_achievements = [], profile } = data;

  // UI state
  let showAll = $state(false);

  // Derived
  const total = $derived(user_achievements.length);
  const visible = $derived(
    showAll ? user_achievements : user_achievements.slice(0, 6)
  );

  // Centralized rarity styles → maintainable & consistent
  type RarityKey =
    | "Special"
    | "Mythic"
    | "Legendary"
    | "Exotic"
    | "Epic"
    | "Rare"
    | "Common";
  const rarityStyles: Record<
    RarityKey,
    { bg: string; text: string; ring?: string }
  > = {
    Special: {
      bg: "bg-gradient-to-b from-yellow-400 via-pink-500 to-purple-600",
      text: "text-neutral-900",
    },
    Mythic: {
      bg: "bg-gradient-to-r from-red-600 to-rose-700",
      text: "text-white",
    },
    Legendary: {
      bg: "bg-gradient-to-r from-yellow-300 to-yellow-500",
      text: "text-neutral-900",
    },
    Exotic: { bg: "bg-teal-400", text: "text-neutral-900" },
    Epic: { bg: "bg-purple-600", text: "text-white" },
    Rare: { bg: "bg-blue-600", text: "text-white" },
    Common: { bg: "bg-neutral-700", text: "text-white" },
  };

  function styleFor(rarity?: string) {
    const key = (rarity as RarityKey) ?? "Common";
    return rarityStyles[key] ?? rarityStyles.Common;
  }
</script>

<svelte:head>
  <title>{profile.display_name}'s Achievements - CubeIndex</title>
</svelte:head>

<div class="relative mx-auto mt-12 max-w-6xl px-4">
  <header class="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 class="text-2xl font-extrabold tracking-tight">
        {profile.display_name}'s Achievements
      </h1>
      <p class="text-sm text-base-content/70">{total} earned</p>
    </div>

    {#if total > 6}
      <button
        type="button"
        class="btn btn-outline btn-sm"
        onclick={() => (showAll = !showAll)}
        aria-expanded={showAll}
        aria-controls="achievements-grid"
      >
        {showAll ? "Show less" : "Show more"}
      </button>
    {/if}
  </header>

  {#if total > 0}
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
      {#each visible as achievement (achievement.name)}
        <div>
          <article
            class="group relative overflow-hidden rounded-2xl border border-base-300 bg-base-200 shadow-sm ring-1 ring-transparent transition focus-within:ring-2 focus-within:ring-accent"
            aria-label={`Achievement: ${achievement.name}`}
          >
            <!-- Header band with rarity background -->
            <div class={"h-16 w-full " + styleFor(achievement.rarity).bg}></div>

            <!-- Body -->
            <div class="p-5">
              <!-- Icon overlaps the band for depth -->
              <div class="-mt-9 mb-3 flex items-center justify-between gap-3">
                <div
                  class={"inline-flex h-14 w-14 items-center justify-center rounded-xl ring-2 ring-base-200 bg-base-100 text-3xl select-none"}
                  aria-hidden="true"
                >
                  {achievement.icon}
                </div>

                <!-- Rarity badge -->
                <span
                  class={"inline-flex items-center rounded-bl-md select-none rounded-br-md px-3 py-1 text-[11px] font-semibold ring-0 ring-black/5 " +
                    styleFor(achievement.rarity).bg +
                    " " +
                    styleFor(achievement.rarity).text}
                  title={`Rarity: ${achievement.rarity}`}
                >
                  {achievement.rarity}
                </span>
              </div>

              <h3 class="text-lg font-bold leading-snug">{achievement.name}</h3>

              {#if achievement.description}
                <p class="mt-1 text-sm text-base-content/70 line-clamp-2">
                  {achievement.description}
                </p>
              {/if}

              <!-- Meta (compact, aligned) -->
              <dl class="mt-4 grid grid-cols-1 gap-2 text-sm">
                {#if achievement.created_at}
                  <div class="flex items-start justify-between gap-3">
                    <dt class="text-base-content/60">Earned</dt>
                    <dd class="font-medium text-right">
                      {formatDate(achievement.created_at)}
                    </dd>
                  </div>
                {/if}
              </dl>
            </div>
          </article>
        </div>
      {/each}

      <!-- Show more button inside grid for alignment on small lists -->
      {#if total > 6}
        <li class="col-span-full flex justify-center">
          <button
            type="button"
            class="btn btn-outline"
            onclick={() => (showAll = !showAll)}
            aria-expanded={showAll}
            aria-controls="achievements-grid"
          >
            {showAll ? "Show less" : `Show ${total - 6} more`}
          </button>
        </li>
      {/if}
    </div>
  {:else}
    <div class="col-span-full flex flex-col items-center justify-center py-20">
      <i class="fa-solid fa-trophy fa-3x mb-4"></i>
      <h2 class="text-2xl font-semibold mb-2">
        This user didn't earn any achievements yet.
      </h2>
    </div>
  {/if}
</div>
