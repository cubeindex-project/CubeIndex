<script lang="ts">
  import { SsgoiTransition } from "@ssgoi/svelte";
  import { page } from "$app/state";

  const { data } = $props();
  const { achievements, currentUserAchi } = data;

  // Centralize styling by rarity for maintainability
  const rarityStyles: Record<
    string,
    { bar: string; badge: string; badgeText?: string }
  > = {
    Special: {
      bar: "bg-gradient-to-b from-yellow-400 via-pink-500 to-purple-600",
      badge:
        "bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-neutral-900",
    },
    Mythic: {
      bar: "bg-red-600",
      badge: "bg-red-600 text-white",
    },
    Legendary: {
      bar: "bg-yellow-400",
      badge: "bg-yellow-400 text-neutral-900",
    },
    Exotic: {
      bar: "bg-teal-400",
      badge: "bg-teal-400 text-neutral-900",
    },
    Epic: {
      bar: "bg-purple-600",
      badge: "bg-purple-600 text-white",
    },
    Rare: {
      bar: "bg-blue-600",
      badge: "bg-blue-600 text-white",
    },
    Common: {
      bar: "bg-neutral-700",
      badge: "bg-neutral-700 text-white",
    },
  };

  function getRarityStyle(rarity?: string) {
    return rarityStyles[rarity ?? "Common"] ?? rarityStyles.Common;
  }
</script>

<svelte:head>
  <title>Achievements - CubeIndex</title>
</svelte:head>

<SsgoiTransition id={page.url.pathname}>
  <section class="min-h-screen px-6 py-20 md:py-24">
    <div class="mx-auto max-w-6xl">
      <header class="mb-10 text-center">
        <h1
          class="text-3xl md:text-4xl font-clash font-extrabold tracking-tight"
        >
          Achievements
        </h1>
        <p class="mt-3 text-base-content max-w-2xl mx-auto">
          Unlock achievements by participating in the CubeIndex community.
          Collect them all to showcase your journey.
        </p>
      </header>

      <!-- Cards Grid -->
      <div
        class="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      >
        {#each achievements as achievement (achievement.name)}
          {#key achievement.name}
            {@const isUnlocked = currentUserAchi.find(
              (cua) => cua.achievement === achievement.name
            )}

            <div
              class={"group relative overflow-hidden rounded-2xl border border-base-300 bg-base-200 shadow-sm ring-1 ring-transparent transition " +
                "hover:-translate-y-0.5 hover:shadow-md focus-within:ring-2 focus-within:ring-accent " +
                (!isUnlocked ? "opacity-95 grayscale-[18%]" : "")}
              aria-label={`Achievement: ${achievement.name}`}
            >
              <!-- Rarity Accent Bar -->
              <div
                class={"absolute left-0 top-0 h-full w-1.5 " +
                  getRarityStyle(achievement.rarity).bar}
              ></div>

              <!-- Card Body -->
              <div
                class="relative flex h-full flex-col p-5 md:p-6 pl-6 md:pl-7"
              >
                <!-- HEADER -->
                <div class="mb-3 flex items-start justify-between gap-4">
                  <div class="flex items-start gap-3">
                    <div
                      class="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-base-300 text-3xl leading-none ring-1 ring-base-300/70 select-none"
                      aria-hidden="true"
                    >
                      {achievement.icon}
                    </div>
                    <div>
                      <h2 class="text-lg md:text-xl font-bold leading-snug">
                        {achievement.name}
                      </h2>
                      <p class="mt-1 text-sm text-base-content/70 line-clamp-2">
                        {achievement.description}
                      </p>
                    </div>
                  </div>

                  <!-- Rarity badge (flow element, not absolute) -->
                  <span
                    class={"inline-flex flex-shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm ring-1 ring-black/5 select-none " +
                      getRarityStyle(achievement.rarity).badge}
                    title={`Rarity: ${achievement.rarity}`}
                  >
                    {achievement.rarity}
                  </span>
                </div>

                <!-- TITLE REWARD -->
                {#if achievement.title}
                  <div
                    class="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent ring-1 ring-accent/20"
                  >
                    <i class="fa-regular fa-star" aria-hidden="true"></i>
                    <span class="opacity-80">Title reward:</span>
                    <span class="font-semibold text-accent"
                      >“{achievement.title}”</span
                    >
                  </div>
                {/if}

                <!-- Spacer to keep consistent heights -->
                <div class="flex-1"></div>

                <!-- META (status included in-flow) -->
                <dl class="mt-5 grid grid-cols-1 gap-2 text-sm">
                  <div class="flex items-start justify-between gap-3">
                    <dt class="text-base-content/60">Category</dt>
                    <dd class="font-medium text-right">
                      {achievement.category}
                    </dd>
                  </div>

                  <div class="flex items-start justify-between gap-3">
                    <dt class="text-base-content/60">Unlock Method</dt>
                    <dd class="font-medium text-right">
                      {achievement.unlock_method}
                    </dd>
                  </div>

                  {#if isUnlocked}
                    <div class="flex items-start justify-between gap-3">
                      <dt class="text-base-content/60">Status</dt>
                      <dd>
                        <span
                          class="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-success ring-1 ring-success/20"
                        >
                          <i class="fa-solid fa-check" aria-hidden="true"></i>
                          Unlocked
                        </span>
                      </dd>
                    </div>
                  {:else if !achievement.unlockable}
                    <div class="flex items-start justify-between gap-3">
                      <dt class="text-base-content/60">Status</dt>
                      <dd>
                        <span
                          class="inline-flex items-center gap-1 rounded-full bg-error/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-error ring-1 ring-error/20"
                        >
                          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                          Not currently unlockable
                        </span>
                      </dd>
                    </div>
                  {/if}
                </dl>
              </div>

              <!-- Hover/focus flourish -->
              <div
                class="pointer-events-none absolute inset-0 rounded-2xl ring-0 ring-accent/0 transition-all duration-200 group-hover:ring-1 group-hover:ring-accent/30"
                aria-hidden="true"
              ></div>
            </div>
          {/key}
        {/each}
      </div>

      {#if !achievements || achievements.length === 0}
        <div class="mt-16 text-center">
          <div
            class="mx-auto mb-4 h-16 w-16 rounded-2xl bg-base-200 ring-1 ring-base-300 flex items-center justify-center text-3xl"
          >
            🏆
          </div>
          <h3 class="text-xl font-semibold">No achievements yet</h3>
        </div>
      {/if}
    </div>
  </section>
</SsgoiTransition>
