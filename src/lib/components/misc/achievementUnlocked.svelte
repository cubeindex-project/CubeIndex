<script lang="ts">
  import { supabase } from "$lib/supabaseClient";
  import type { User } from "@supabase/supabase-js";
  import type { Achievements } from "../dbTableTypes";
  import { fade, scale } from "svelte/transition";

  const { user }: { user: User | null } = $props();

  // --- UI state
  let open = $state(false);
  let achievement: Achievements | null = $state(null);

  // Map rarity to visual styles
  const rarityBg: Record<string, string> = {
    Special: "bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600",
    Mythic: "bg-gradient-to-r from-red-600 to-rose-700",
    Legendary: "bg-gradient-to-r from-yellow-300 to-yellow-500",
    Exotic: "bg-gradient-to-r from-teal-400 to-cyan-400",
    Epic: "bg-gradient-to-r from-purple-600 to-fuchsia-600",
    Rare: "bg-gradient-to-r from-blue-600 to-indigo-600",
    Common: "bg-neutral-700",
  };
  const rarityDot: Record<string, string> = {
    Special: "bg-yellow-300",
    Mythic: "bg-rose-400",
    Legendary: "bg-yellow-400",
    Exotic: "bg-teal-300",
    Epic: "bg-purple-400",
    Rare: "bg-blue-400",
    Common: "bg-neutral-400",
  };
  const dotFor = (r?: string) => rarityDot[r ?? "Common"] ?? rarityDot.Common;

  let closeBtnEl: HTMLButtonElement | null = null;

  function showAchievementOverlay(a: Achievements) {
    achievement = a;
    open = true;
    queueMicrotask(() => {
      // Move focus inside the dialog
      closeBtnEl?.focus();
    });
  }

  function close() {
    open = false;
    // blur active element to avoid stray focus outlines
    queueMicrotask(() => (document.activeElement as HTMLElement)?.blur?.());
  }

  // Close on Escape with a stable handler (and proper cleanup)
  const onKeydown = (e: KeyboardEvent) => {
    if (!open) return;
    if (e.key === "Escape") close();
  };

  $effect(() => {
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  });

  // Supabase realtime: listen to user_achievements inserts
  $effect(() => {
    const channel = supabase
      .channel("unlocked_achievements")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "user_achievements" },
        async (payload) => {
          if (payload.new.user_id === user?.id) {
            const { data, error } = await supabase
              .from("achievements")
              .select()
              .eq("slug", payload.new.achievement_slug)
              .single();
            if (!error && data) showAchievementOverlay(data as Achievements);
            else console.error("Failed to fetch achievement:", error?.message);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  });

  // Dev trigger (keep handy)
  function triggerTest() {
    showAchievementOverlay({
      name: "Test Achievement",
      description: "This is placeholder data.",
      rarity: "Mythic",
      icon: "⭐",
    } as Achievements);
  }

  // assumes: achievement, open, bgFor()/dotFor() exist in your file
  // Add a tiny confetti system (emoji particles) scoped to this card:
  type Particle = {
    id: number;
    x: number;
    y: number;
    delay: number;
    emoji: string;
  };
  let particles = $state<Particle[]>([]);

  function burstConfetti() {
    const EMOJI = ["🎉", "✨", "🎊", "⭐", "🥳", "🏆"];
    const N = 18;
    particles = Array.from({ length: N }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // % left
      y: 0, // start top of the card
      delay: Math.random() * 120, // ms
      emoji: EMOJI[(Math.random() * EMOJI.length) | 0],
    }));
    // Clean up after the animation
    setTimeout(() => (particles = []), 1400);
  }

  // Trigger confetti each time a card opens/shows a new achievement
  $effect(() => {
    if (open && achievement) burstConfetti();
  });
</script>

{#if open && achievement}
  <!-- Toast container -->
  <div
    class="fixed bottom-5 right-5 z-[1000] flex p-4"
    transition:fade={{ duration: 120 }}
  >
    <!-- Click-blocking backdrop (optional, remove if you want non-modal toast) -->
    <button
      class="fixed inset-0"
      onclick={(e) => e.currentTarget === e.target && (open = false)}
      aria-label="Close"
      transition:fade={{ duration: 120 }}
    ></button>

    <!-- Card with gradient glow frame -->
    <button
      class="relative w-full max-w-lg"
      onclick={(e) => e.stopPropagation()}
      transition:scale={{ duration: 160, start: 0.95 }}
    >
      <!-- Outer glow ring -->
      <div
        class="pointer-events-none absolute -inset-1 rounded-[28px] opacity-60 blur-md"
        style="background: radial-gradient(60% 60% at 50% 0%, rgba(255,255,255,.18), transparent 55%);"
      ></div>

      <div
        class="rounded-[26px] p-[1.5px] bg-gradient-to-br from-white/30 via-white/10 to-transparent"
      >
        <div
          class="relative overflow-hidden rounded-[24px] border border-base-300 bg-base-100/95 shadow-xl ring-1 ring-black/5"
        >
          <!-- “Unlocked” ribbon -->
          <div class="pointer-events-none mt-3 ml-3 justify-start flex">
            <span
              class="inline-block rounded-full bg-success/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-success ring-1 ring-success/20 shadow-sm"
            >
              New Achievement Unlocked!
            </span>
          </div>

          <!-- Content -->
          <div class="relative p-6 pt-0 md:p-8">
            <!-- Sparkle sweep -->
            <div
              class="pointer-events-none absolute -top-8 -left-8 h-40 w-40 rotate-12 opacity-30 shimmer"
              aria-hidden="true"
            ></div>

            <div class="flex items-start gap-4">
              <!-- Icon with ping ring & pop -->
              <div class="relative select-none">
                <span
                  class="absolute inset-0 -z-10 animate-ping rounded-2xl bg-accent/30"
                ></span>
                <div
                  class="grid size-16 place-items-center rounded-2xl bg-base-200 ring-1 ring-base-300 text-3xl animate-pop"
                  aria-hidden="true"
                >
                  {achievement.icon}
                </div>
              </div>

              <div class="min-w-0 flex-1 flex justify-start flex-col">
                <!-- Shimmered title -->
                <h3
                  class="text-2xl md:text-3xl font-extrabold leading-tight tracking-tight bg-gradient-to-r from-base-content via-base-content/70 to-base-content bg-[length:200%_100%] bg-clip-text text-transparent animate-title-shimmer flex justify-start"
                >
                  {achievement.name}
                </h3>

                <!-- Rarity pill -->
                <div
                  class="mt-2 inline-flex items-center gap-2 w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ring-1 ring-base-300"
                >
                  <span
                    class={"inline-block size-2 rounded-full " +
                      dotFor(achievement.rarity)}
                  ></span>
                  <span class="uppercase">{achievement.rarity}</span>
                </div>
              </div>
            </div>

            <div
              class="my-5 h-px bg-gradient-to-r from-base-300 via-base-200 to-transparent"
            ></div>

            <p class="text-base leading-relaxed text-pretty/80">
              {achievement.description}
            </p>

            <!-- Confetti layer -->
            <div class="pointer-events-none absolute inset-0 overflow-hidden">
              {#each particles as p (p.id)}
                <span
                  class="absolute text-lg md:text-xl confetti"
                  style={`left:${p.x}%; top:${p.y}%; animation-delay:${p.delay}ms;`}
                  aria-hidden="true"
                >
                  {p.emoji}
                </span>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </button>
  </div>
{/if}

<!-- Dev trigger -->
<!-- <div class="fixed bottom-5 left-5 z-50">
  <button class="btn btn-primary" onclick={triggerTest}
    >Show Test Achievement</button
  >
</div> -->

<style>
  /* Title shimmer */
  @keyframes titleShimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: 0% 0;
    }
  }
  .animate-title-shimmer {
    animation: titleShimmer 1.4s ease-out 1;
  }

  /* Icon pop */
  @keyframes pop {
    0% {
      transform: scale(0.85);
      opacity: 0;
    }
    60% {
      transform: scale(1.06);
      opacity: 1;
    }
    100% {
      transform: scale(1);
    }
  }
  .animate-pop {
    animation: pop 260ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
  }

  /* Sparkle sweep block (just a gradient square that glides across) */
  @keyframes shimmerSweep {
    0% {
      transform: translateX(-30%) translateY(-10%) rotate(12deg);
      opacity: 0.25;
    }
    100% {
      transform: translateX(120%) translateY(20%) rotate(12deg);
      opacity: 0;
    }
  }
  .shimmer {
    background: radial-gradient(
        closest-side,
        rgba(255, 255, 255, 0.6),
        transparent 60%
      ),
      conic-gradient(from 0deg, rgba(255, 255, 255, 0.25), transparent 60%);
    animation: shimmerSweep 950ms ease-out 1;
    filter: blur(1px);
  }

  /* Confetti fall + drift */
  @keyframes confettiFall {
    0% {
      transform: translateY(-10px) translateX(0) rotate(0);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    100% {
      transform: translateY(220px) translateX(var(--drift, 40px)) rotate(540deg);
      opacity: 0;
    }
  }
  .confetti {
    animation: confettiFall 900ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
    /* each span can randomize drift via inline style if you want; kept simple here */
  }
</style>
