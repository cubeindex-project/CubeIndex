<script lang="ts">
  import { m } from "$lib/paraglide/messages";
  
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
      title: m.explore_popover_cubes_title(),
      description:
        m.explore_popover_cubes_description(),
    },
    {
      href: "vendors",
      icon: "🏬",
      title: m.explore_popover_vendors_title(),
      description:
        m.explore_popover_vendors_description(),
    },
    {
      href: "users",
      icon: "🧍",
      title: m.explore_popover_users_title(),
      description:
        m.explore_popover_users_description(),
    },
    {
      href: "achievements",
      icon: "🏅",
      title: m.explore_popover_achievements_title(),
      description:
        m.explore_popover_achievements_description(),
    },
  ];
</script>

<div
  role="menu"
  aria-label={m.explore_popover_menu_aria()}
  class="w-[90vw] max-w-3xl rounded-2xl border border-base-300 bg-base-100 p-4 md:p-5 shadow-xl"
>
  <div class="mb-3 flex items-baseline justify-between">
    <h2 class="text-sm font-semibold tracking-wide text-base-content/80">
      {m.explore_popover_heading_text()}
    </h2>
    <a
      href="/explore"
      class="text-xs text-base-content/60 hover:text-primary transition inline-flex items-center gap-1"
      aria-label={m.explore_popover_view_all_aria()}
    >
      {m.nav_explore_view_all_label()}
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
              {m.explore_popover_card_cta()}
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
        {m.explore_popover_missing_cube_title()}
      </p>
      <p class="text-xs text-base-content/70">
        {m.explore_popover_missing_cube_description()}
      </p>
    </div>
    <a class="btn btn-primary btn-sm" href="/submit">
      <i class="fa-solid fa-paper-plane" aria-hidden="true"></i>
      <span class="hidden sm:inline">{m.explore_popover_submit_cube_cta()}</span>
      <span class="sm:hidden">{m.explore_popover_submit_cta()}</span>
    </a>
  </div>
</div>
