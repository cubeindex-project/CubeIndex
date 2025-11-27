<script lang="ts">
  /**
   * Popover content for Explore menu.
   * Renders the same cards previously shown on /explore.
   * Client-only UI with accessible fallbacks handled by parent trigger.
   */
  let { id = "explore-popover" } = $props<{ id?: string }>();
  interface ExploreCard {
    href: string;
    icon: string;
    title: string;
    description: string;
  }

  const cards: ReadonlyArray<ExploreCard> = [
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
      description:
        "Browse achievements, and track community unlock progress.",
    },
  ];
</script>

<div
  role="menu"
  aria-label="Explore Menu"
  {id}
  class="w-[90vw] max-w-3xl rounded-2xl border border-base-300 bg-base-100 p-4 md:p-5 shadow-xl"
>
  <div class="mb-3 flex items-baseline justify-between">
    <h2 class="text-sm font-semibold tracking-wide text-base-content/80">
      Explore Database
    </h2>
    <a
      href="/explore"
      class="text-xs text-base-content/60 hover:text-primary transition inline-flex items-center gap-1"
      aria-label="View all explore options"
    >
      View all
      <i class="fa-solid fa-arrow-right text-[11px]"></i>
    </a>
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {#each cards as card}
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
            <span
              class="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-primary"
            >
              Explore
              <i
                class="fa-solid fa-arrow-right translate-x-0 group-hover:translate-x-0.5 transition-transform"
              ></i>
            </span>
          </div>
        </div>
      </a>
    {/each}
  </div>
  <div
    class="mt-4 flex items-center justify-between gap-3 rounded-xl border border-base-300 bg-base-200/70 px-4 py-3"
  >
    <div class="min-w-0">
      <p class="text-sm font-semibold text-base-content">
        Missing a cube?
      </p>
      <p class="text-xs text-base-content/70">
        Submit models that are not in the catalog and help keep CubeIndex updated.
      </p>
    </div>
    <a class="btn btn-primary btn-sm" href="/submit">
      <i class="fa-solid fa-paper-plane" aria-hidden="true"></i>
      <span class="hidden sm:inline">Submit a cube</span>
      <span class="sm:hidden">Submit</span>
    </a>
  </div>
  <p class="sr-only">Use arrow keys to navigate options</p>
</div>
