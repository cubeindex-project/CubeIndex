<script lang="ts">
  import { onMount } from "svelte";
  import { SsgoiTransition } from "@ssgoi/svelte";
  import { page } from "$app/state";

  let mounted = $state(false);

  type Accent = "primary" | "secondary" | "accent" | "info";

  /** Awards categories surfaced to visitors. */
  type AwardCategory = {
    title: string;
    subtitle: string;
    description: string;
    criteria: string[];
    icon: string;
    accent: Accent;
  };

  type Partner = {
    name: string;
    emoji: string;
    description: string;
    link: { label: string; url: string };
  };

  const awardCategories: AwardCategory[] = [
    {
      title: "Flagship of the Year",
      subtitle: "Performance-first releases that defined 2024.",
      description:
        "Celebrates the most complete main-worthy speedcube and the team that built it.",
      criteria: ["Elite results", "Hardware polish", "Consistency"],
      icon: "fa-bolt",
      accent: "primary",
    },
    {
      title: "Innovation Award",
      subtitle: "Ideas that bent expectations.",
      description:
        "Highlights breakthroughs in tensioning, tactility, smart tech, or sustainability.",
      criteria: ["New tech", "Smart features", "Patent-pending"],
      icon: "fa-lightbulb",
      accent: "accent",
    },
    {
      title: "Budget Breakthrough",
      subtitle: "Affordable cubes that punch way up.",
      description:
        "Spotlights community-loved releases under $25 that still feel premium.",
      criteria: ["Accessibility", "Durability", "Out-of-box feel"],
      icon: "fa-coins",
      accent: "info",
    },
    {
      title: "Community Favorite",
      subtitle: "The crowd-sourced champion.",
      description:
        "100% fan vote driven by showcase submissions, streams, and CubeIndex data.",
      criteria: ["Fan vote", "Shareability", "Memorable design"],
      icon: "fa-heart",
      accent: "secondary",
    },
    {
      title: "Collector's Choice",
      subtitle: "Pieces that belong on every shelf.",
      description:
        "Limited runs, artist collaborations, and story-rich puzzles earn the spotlight.",
      criteria: ["Story", "Finish quality", "Rarity"],
      icon: "fa-gem",
      accent: "primary",
    },
    {
      title: "Sustainability Impact",
      subtitle: "Design that respects the planet.",
      description:
        "Rewards companies using recycled materials, modular builds, or smarter packaging.",
      criteria: ["Materials", "Repairability", "Packaging"],
      icon: "fa-leaf",
      accent: "accent",
    },
  ];

  const partners: Partner[] = [
    {
      name: "SpeedLab Studios",
      emoji: "🎥",
      description:
        "Production partner powering the broadcast stage, gear labs, and backstage set tours.",
      link: { label: "Visit SpeedLab", url: "https://speedlab.example.com" },
    },
    {
      name: "CubeDepot",
      emoji: "🛒",
      description:
        "Retail partner providing prize kits, community giveaways, and sustainability spotlights.",
      link: { label: "Shop CubeDepot", url: "https://cubedepot.example.com" },
    },
  ];

  const accentClasses: Record<
    Accent,
    { icon: string; border: string; glow: string }
  > = {
    primary: {
      icon: "bg-primary/15 text-primary ring-primary/30",
      border: "border-primary/25",
      glow: "from-primary/25",
    },
    secondary: {
      icon: "bg-secondary/15 text-secondary ring-secondary/30",
      border: "border-secondary/25",
      glow: "from-secondary/25",
    },
    accent: {
      icon: "bg-accent/15 text-accent ring-accent/30",
      border: "border-accent/25",
      glow: "from-accent/25",
    },
    info: {
      icon: "bg-info/15 text-info ring-info/30",
      border: "border-info/25",
      glow: "from-info/25",
    },
  };

  const ui = {
    section: "relative overflow-hidden py-20 px-6",
    container: "mx-auto max-w-6xl",
    hero: "bg-base-100",
    h1: "text-4xl sm:text-6xl font-clash font-extrabold leading-tight",
    h2: "text-3xl sm:text-4xl font-clash font-extrabold tracking-tight",
    lead: "text-lg sm:text-xl text-base-content/80",
    pill: "inline-flex items-center gap-2 rounded-full px-4 py-1 text-sm ring-1",
    ctas: "flex flex-col sm:flex-row gap-4 justify-center",
    tileCard:
      "group relative overflow-hidden rounded-2xl border bg-base-100/70 backdrop-blur p-6 shadow-sm hover:shadow-lg transition",
    tileIcon:
      "inline-flex size-12 items-center justify-center rounded-2xl ring-1",
    statCard:
      "rounded-2xl border border-base-200/80 bg-base-100/70 backdrop-blur p-6 text-left shadow-sm",
    timelineCard:
      "rounded-2xl border border-base-200/80 bg-base-100/80 backdrop-blur px-5 py-4 shadow-sm",
    partnerCard:
      "rounded-2xl border border-base-200/80 bg-base-100/70 backdrop-blur p-6 flex flex-col gap-3 shadow-sm",
  };

  onMount(() => {
    mounted = true;
  });
</script>

<svelte:head>
  <title>CubeIndex Awards</title>
</svelte:head>

<SsgoiTransition id={page.url.pathname}>
  <section class={`${ui.section} ${ui.hero}`}>
    <div aria-hidden="true" class="absolute inset-0">
      <div
        class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
      ></div>
      <div
        class="absolute inset-0 bg-gradient-to-b from-base-200 via-base-100 to-base-100"
      ></div>
      <div
        class="absolute inset-0 opacity-30"
        style="background-image: radial-gradient(circle at 10% 20%, rgba(79, 70, 229, 0.25), transparent 45%), radial-gradient(circle at 80% 0%, rgba(236, 72, 153, 0.2), transparent 35%), radial-gradient(circle at 80% 60%, rgba(59, 130, 246, 0.2), transparent 40%);"
      ></div>
    </div>

    <div class={`${ui.container} relative z-10 space-y-12 text-center`}>
      <div class="space-y-6 max-w-4xl mx-auto">
        <span class={`${ui.pill} ring-base-200/70 bg-base-100/70`}>
          <i class="fa-solid fa-award text-primary"></i>
          CubeIndex Awards 2024
        </span>
        <h1 class={ui.h1}>Celebrate the Cubes that Redefined the Season</h1>
        <p class={ui.lead}>
          The CubeIndex Awards honor the most innovative, beloved, and
          collectible puzzles of the year. Nominate your favorites, vote with
          the community, and tune in for the live broadcast on December 7.
        </p>
        <div class={ui.ctas}>
          <a href="/awards/vote" class="btn btn-primary btn-lg sm:btn-xl"
            >Nominate a Cube</a
          >
          <a href="#categories" class="btn btn-outline btn-lg sm:btn-xl"
            >View Categories</a
          >
        </div>
      </div>
    </div>
  </section>

  <section id="categories" class={ui.section}>
    <div class={ui.container}>
      <div class="text-center max-w-3xl mx-auto space-y-4">
        <p class={`${ui.pill} justify-center ring-base-200/70 bg-base-100/70`}>
          <i class="fa-solid fa-list-check text-secondary"></i>
          Award Categories
        </p>
        <h2 class={ui.h2}>Nominate Across Six Signature Trophies</h2>
        <p class="text-base-content/70">
          Each category balances performance data, community excitement, and
          storytelling. Explore the criteria before you submit your ballot.
        </p>
      </div>

      <div class="mt-12 grid gap-6 md:grid-cols-2">
        {#each awardCategories as category (category.title)}
          <article class={`${ui.tileCard} border-base-200/70`}>
            <div class="flex items-center gap-3">
              <span
                class={`${ui.tileIcon} ${accentClasses[category.accent].icon}`}
              >
                <i class={`fa-solid ${category.icon}`}></i>
              </span>
              <div class="text-left">
                <h3 class="text-2xl font-bold">{category.title}</h3>
                <p class="text-sm text-base-content/70">{category.subtitle}</p>
              </div>
            </div>
            <p class="mt-4 text-base-content/80">{category.description}</p>
            <div class="mt-4 flex flex-wrap gap-2">
              {#each category.criteria as criterion (criterion)}
                <span
                  class="rounded-full bg-base-200/70 px-3 py-1 text-xs uppercase tracking-wide"
                  >{criterion}</span
                >
              {/each}
            </div>
          </article>
        {/each}
      </div>
    </div>
  </section>

  <section class={ui.section}>
    <div class={ui.container}>
      <div class="text-center max-w-3xl mx-auto space-y-4">
        <p class={`${ui.pill} justify-center ring-base-200/70 bg-base-100/70`}>
          <i class="fa-solid fa-handshake text-primary"></i>
          Partners
        </p>
        <h2 class={ui.h2}>Partners</h2>
        <p class="text-base-content/70">
          <!-- To change -->
          These teams provide the cameras, stages, and prizes that make the CubeIndex
          Awards unforgettable.
        </p>
      </div>

      <div class="mt-12 grid gap-6 sm:grid-cols-2">
        {#each partners as partner (partner.name)}
          <article class={ui.partnerCard}>
            <div class="flex items-center gap-3">
              <span class="text-3xl" aria-hidden="true">{partner.emoji}</span>
              <h3 class="text-xl font-semibold">{partner.name}</h3>
            </div>
            <p class="text-base-content/70">{partner.description}</p>
            <a
              href={partner.link.url}
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-sm btn-outline w-fit">{partner.link.label}</a
            >
          </article>
        {/each}
      </div>
    </div>
  </section>
</SsgoiTransition>
