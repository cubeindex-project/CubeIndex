<script lang="ts">
  /**
   * Popover content for Explore menu.
   * Renders the same cards previously shown on /explore.
   * Client-only UI with accessible fallbacks handled by parent trigger.
   */
  interface ExploreCard {
    href: string;
    icon: string;
    title: string;
    description: string;
    available: boolean;
  }

  const cards: ReadonlyArray<ExploreCard> = [
    {
      href: "cubes",
      icon: "🧊",
      title: "Cubes",
      description:
        "Browse thousands of cubes by brand, type, and community rating.",
      available: true,
    },
    {
      href: "accessories",
      icon: "🧰",
      title: "Accessories",
      description:
        "Discover timers, mats, lubricants, and everything else you need.",
      available: false,
    },
    {
      href: "vendors",
      icon: "🏬",
      title: "Vendors",
      description:
        "Find trusted cube shops and compare prices from top vendors worldwide.",
      available: true,
    },
    {
      href: "users",
      icon: "🧍",
      title: "Users",
      description:
        "Explore user profiles, discover top solvers, and see community activity.",
      available: true,
    },
  ];
</script>

<div
  role="menu"
  aria-label="Explore Menu"
  class="w-[90vw] max-w-3xl rounded-2xl border border-base-300 bg-base-200 p-4 shadow-md"
>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {#each cards as card}
      {#if !card.available}
        <div
          role="menuitem"
          aria-disabled="true"
          class="relative group rounded-xl p-4 bg-base-200/70 border border-base-300/60 shadow-sm cursor-not-allowed opacity-70 select-none"
        >
          <span
            class="absolute top-2 right-2 text-[10px] uppercase tracking-wide bg-red-500 text-white px-2 py-0.5 rounded-md shadow-sm"
            aria-hidden="true"
          >
            Soon
          </span>
          <div class="flex items-start gap-3">
            <div
              class="size-12 rounded-xl bg-base-100/70 border border-base-300 flex items-center justify-center shadow-inner"
              aria-hidden="true"
            >
              <span class="text-xl">{card.icon}</span>
            </div>
            <div class="flex-1">
              <h3 class="text-base font-semibold">{card.title}</h3>
              <p class="text-xs text-base-content/70">{card.description}</p>
            </div>
          </div>
        </div>
      {:else}
        <a
          role="menuitem"
          href={`/explore/${card.href}`}
          class="relative group rounded-xl p-4 bg-base-200 border border-base-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-transform duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 overflow-hidden"
        >
          <div
            class="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-primary/10 to-secondary/10"
            aria-hidden="true"
          ></div>
          <div class="flex items-start gap-3">
            <div
              class="size-12 rounded-xl bg-base-100/70 border border-base-300 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform"
              aria-hidden="true"
            >
              <span class="text-xl">{card.icon}</span>
            </div>
            <div class="flex-1">
              <h3 class="text-base font-semibold tracking-tight">{card.title}</h3>
              <p class="text-xs text-base-content/70">{card.description}</p>
              <span class="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                Explore
                <i class="fa-solid fa-arrow-right translate-x-0 group-hover:translate-x-0.5 transition-transform"></i>
              </span>
            </div>
          </div>
        </a>
      {/if}
    {/each}
  </div>
  <p class="sr-only">Use arrow keys to navigate options</p>
</div>
