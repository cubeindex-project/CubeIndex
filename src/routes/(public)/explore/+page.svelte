<script lang="ts">
  import { SsgoiTransition } from "@ssgoi/svelte";
  import { page } from "$app/state";

  const cards = [
    {
      href: "cubes",
      icon: "🧊",
      title: "Cubes",
      description:
        "Browse thousands of cubes by brand, type, and community rating.",
    },
    {
      href: "vendors",
      icon: "🏬",
      title: "Vendors",
      description:
        "Find trusted cube shops and compare prices from top vendors worldwide.",
    },
    {
      href: "users",
      icon: "🧍",
      title: "Users",
      description:
        "Explore user profiles, discover top solvers, and see community activity.",
    },
    {
      href: "achievements",
      icon: "🏅",
      title: "Achievements",
      description: "Browse achievements, and track community unlock progress.",
    },
  ];
</script>

<svelte:head>
  <title>CubeIndex</title>
</svelte:head>

<SsgoiTransition id={page.url.pathname}>
  <section
    class="min-h-screen flex flex-col items-center justify-center px-6 py-16 space-y-12"
  >
    <h1 class="text-4xl sm:text-5xl font-clash font-bold text-center">
      What would you like to explore?
    </h1>

    <div
      class="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 max-w-5xl w-full"
    >
      {#each cards as card}
        <a
          href={`/explore/${card.href}`}
          class="relative group rounded-2xl p-6 md:p-8 bg-base-200 border border-base-300 shadow-sm
               hover:shadow-md hover:-translate-y-0.5 active:translate-y-0
               transition-transform duration-200 ease-out
               focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60
               focus-visible:ring-offset-2 focus-visible:ring-offset-base-100
               overflow-hidden"
        >
          <!-- subtle gradient wash on hover -->
          <div
            class="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100
                 transition-opacity bg-gradient-to-br from-primary/10 to-secondary/10"
            aria-hidden="true"
          ></div>

          <div class="flex flex-col items-center text-center gap-4">
            <div
              class="size-14 md:size-16 rounded-2xl bg-base-100/70 border border-base-300
                   flex items-center justify-center shadow-inner
                   group-hover:scale-105 transition-transform"
              aria-hidden="true"
            >
              <span class="text-2xl md:text-3xl">{card.icon}</span>
            </div>

            <h2 class="text-lg md:text-xl font-semibold tracking-tight">
              {card.title}
            </h2>

            <p class="text-sm md:text-base text-base-content/70">
              {card.description}
            </p>

            <!-- CTA row with reveal arrow -->
            <div
              class="mt-1 inline-flex items-center gap-2 text-sm font-medium text-primary"
            >
              Explore
              <i
                class="fa-solid fa-arrow-right translate-x-0 group-hover:translate-x-0.5 transition-transform"
              ></i>
            </div>
          </div>
        </a>
      {/each}
    </div>
  </section>
</SsgoiTransition>
