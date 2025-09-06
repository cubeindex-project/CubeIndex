<script lang="ts">
  import NumberFlow, { continuous } from "@number-flow/svelte";
  import { onMount } from "svelte";
  import { SsgoiTransition } from "@ssgoi/svelte";
  import { page } from "$app/state";
  import FeatureSection from "$lib/components/marketing/FeatureSection.svelte";
  import { inView } from "$lib/actions/inView.js";

  const { data } = $props();
  const { totalCubes, totalUsers, achievements } = $derived(
    data || { totalCubes: 0, totalUsers: 0, achievements: [] }
  );
  let mounted = $state(false);

  const unlockAchi = $derived(
    achievements.filter((ta) => ta.unlockable === true).length
  );
  const totalAchi = $derived(achievements.length);

  let statsVisible = $state(false);

  type Partner = {
    name: string;
    emoji: string;
    description: string;
    links: {
      label: string;
      url: string;
      color: "primary" | "secondary" | "neutral";
    }[];
  };

  const partners: Partner[] = [
    {
      name: "CubingPanda",
      emoji: "🐼",
      description:
        "CubingPanda is the go-to community for Rubik's Cube fans at every skill level—whether you're a veteran speedcuber or someone who's never solved a single face.",
      links: [
        {
          label: "Join Discord",
          url: "https://discord.gg/VHhYR6nyzs",
          color: "primary",
        },
      ],
    },
    {
      name: "AlgArchive",
      emoji: "📚",
      description:
        "The open archive for cube algorithms. Browse community-vetted solutions across every puzzle type, tag them with your average-of-5, and share your PB-crushing secrets.",
      links: [
        {
          label: "Visit Site",
          url: "https://alg-archive.vercel.app/",
          color: "secondary",
        },
        {
          label: "Join Discord",
          url: "https://discord.gg/NYPG43xe9t",
          color: "primary",
        },
      ],
    },
  ];

  // Compact feature tiles (mosaic) like the screenshot
  type Tile = {
    title: string;
    description: string;
    iconClass: string; // Font Awesome icon classes
    accent:
      | "primary"
      | "secondary"
      | "accent"
      | "success"
      | "warning"
      | "info"
      | "neutral";
  };

  /**
   * Accent style map: keep classes literal so Tailwind can see them.
   */
  const accentStyles: Record<
    Tile["accent"],
    { icon: string; gradient: string }
  > = {
    primary: {
      icon: "bg-primary/15 text-primary ring-primary/30",
      gradient: "from-primary/30",
    },
    secondary: {
      icon: "bg-secondary/15 text-secondary ring-secondary/30",
      gradient: "from-secondary/30",
    },
    accent: {
      icon: "bg-accent/15 text-accent ring-accent/30",
      gradient: "from-accent/30",
    },
    success: {
      icon: "bg-success/15 text-success ring-success/30",
      gradient: "from-success/30",
    },
    warning: {
      icon: "bg-warning/15 text-warning ring-warning/30",
      gradient: "from-warning/30",
    },
    info: {
      icon: "bg-info/15 text-info ring-info/30",
      gradient: "from-info/30",
    },
    neutral: {
      icon: "bg-neutral/15 text-neutral ring-neutral/30",
      gradient: "from-neutral/30",
    },
  };

  const tiles: Tile[] = [
    {
      title: "Always Up To Date",
      description:
        "CubeIndex stays fresh with new puzzles and database updates from the community.",
      iconClass: "fa-rotate",
      accent: "info",
    },
    {
      title: "Easy Organization",
      description:
        "Group by brand, size, or tags. Filter quickly to find anything in your stash.",
      iconClass: "fa-layer-group",
      accent: "secondary",
    },
    {
      title: "Compatible",
      description:
        "From 2×2 to big cubes and shape mods—track virtually every puzzle.",
      iconClass: "fa-cubes",
      accent: "primary",
    },
    {
      title: "Personalized",
      description:
        "Tune themes and views to match how you collect and compare.",
      iconClass: "fa-sliders",
      accent: "accent",
    },
    {
      title: "Insightful",
      description:
        "Smart stats and highlights surface the right info at the right time.",
      iconClass: "fa-chart-line",
      accent: "success",
    },
    {
      title: "Secure",
      description:
        "Your credentials never leave your device. Privacy-first by design.",
      iconClass: "fa-shield-halved",
      accent: "neutral",
    },
  ];

  // Reusable class tokens for consistency
  const ui = {
    section: "relative overflow-hidden py-20 px-6",
    container: "mx-auto max-w-6xl",
    heroContainer:
      "px-6 relative flex min-h-[72vh] sm:min-h-[78vh] items-center justify-center text-center",
    h1: "text-5xl sm:text-7xl font-clash font-extrabold leading-[1.05] tracking-tight",
    h2: "text-3xl sm:text-4xl lg:text-5xl font-clash font-extrabold tracking-tight text-center",
    lead: "text-lg sm:text-xl text-base-content/80",
    ctas: "flex flex-col sm:flex-row gap-4 justify-center",
    statCard:
      "group relative rounded-3xl border border-base-300/60 bg-base-200/60 backdrop-blur-xl p-8 sm:p-10 shadow-sm hover:shadow-lg transition",
    pill: "inline-flex items-center gap-3 rounded-full bg-base-100/70 ring-1 ring-base-300 px-3 py-1",
    partnerCard:
      "rounded-2xl border border-base-300/60 bg-base-200/40 backdrop-blur p-6 flex flex-col gap-4 hover:shadow-lg transition",
    partnerHeader: "flex items-center gap-3",
    partnerEmoji: "text-4xl",
    tileCard:
      "group relative overflow-hidden rounded-2xl border border-base-300/60 bg-base-100/50 backdrop-blur p-6 sm:p-7 shadow-sm hover:shadow-md transition",
    tileIcon:
      "inline-flex size-10 items-center justify-center rounded-xl ring-1",
    tileHeading: "text-lg sm:text-xl font-bold",
  };

  onMount(() => {
    mounted = true;
  });
</script>

<svelte:head>
  <title>CubeIndex</title>
</svelte:head>

<SsgoiTransition id={page.url.pathname}>
  <!-- HERO -->
  <section class="relative overflow-hidden {ui.section} bg-base-100">
    <div aria-hidden="true" class="absolute inset-0">
      <!-- Subtle top divider line -->
      <div
        class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-base-content/20 to-transparent"
      ></div>

      <!-- Soft background wash -->
      <div
        class="absolute inset-0 bg-gradient-to-b from-base-200/70 via-base-100 to-base-100"
      ></div>

      <!-- Radial glow (SaaS-style spotlight) -->
      <svg
        class="absolute inset-0 h-full w-full text-primary/90"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="hero-radial" cx="50%" cy="25%" r="75%">
            <stop offset="0%" stop-color="currentColor" stop-opacity="0.22" />
            <stop offset="60%" stop-color="currentColor" stop-opacity="0.12" />
            <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-radial)" />
      </svg>

      <!-- Subtle grid pattern with radial fade -->
      <svg
        class="absolute inset-0 h-full w-full text-base-content/80"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="hero-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" stroke-width="1" stroke-opacity="0.08" />
          </pattern>
          <radialGradient id="hero-fade" cx="50%" cy="30%" r="80%">
            <stop offset="0%" stop-color="white" stop-opacity="1" />
            <stop offset="100%" stop-color="white" stop-opacity="0" />
          </radialGradient>
          <mask id="hero-grid-mask">
            <rect width="100%" height="100%" fill="url(#hero-fade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" mask="url(#hero-grid-mask)" />
      </svg>

      <!-- Accent blobs -->
      <div
        class="absolute left-1/2 -translate-x-1/2 h-[44rem] w-[44rem] rounded-full bg-primary/10 blur-3xl"
      ></div>
      <div
        class="absolute -right-20 top-1/4 h-72 w-72 rounded-full bg-secondary/10 blur-3xl"
      ></div>
      <div
        class="absolute -left-24 -bottom-10 h-56 w-56 rounded-full bg-accent/10 blur-3xl"
      ></div>
    </div>

    <div class={ui.heroContainer}>
      <div class="relative z-10 max-w-3xl space-y-6">
        <h1 class={ui.h1}>Build Your Ultimate Cube Collection</h1>
        <p class={ui.lead}>
          Track your cubes, unlock achievements, and explore the world's largest cube database.
        </p>
        <div class={ui.ctas}>
          <a href="/auth/signup" class="btn btn-primary btn-lg sm:btn-xl"
            >Get Started</a
          >
          <a href="/explore" class="btn btn-outline btn-lg sm:btn-xl"
            >Explore Database</a
          >
        </div>
      </div>
    </div>

    <!-- Scroll down indicator -->
    <a
      href="#why"
      aria-label="Scroll to content"
      class="group absolute inset-x-0 bottom-6 mx-auto mb-[7%] w-max select-none"
    >
      <span
        class="mx-auto flex items-center gap-2 rounded-full bg-base-100/70 px-3 py-1 text-sm text-base-content/70 ring-1 ring-base-300 backdrop-blur transition hover:text-base-content/90 hover:ring-base-300/80"
      >
        <span>Scroll</span>
        <i
          class="fa-solid fa-chevron-down motion-safe:animate-bounce text-base opacity-80 group-hover:opacity-100"
          aria-hidden="true"
        ></i>
      </span>
    </a>
  </section>

  <!-- FEATURE TILES (mosaic) -->
  <section id="why" class={ui.section}>
    <div
      aria-hidden="true"
      class="pointer-events-none select-none absolute inset-0"
    >
      <div
        class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-base-content/20 to-transparent"
      ></div>
      <div
        class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-base-content/20 to-transparent"
      ></div>
      <div
        class="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-secondary/5"
      ></div>
      <div
        class="absolute -left-24 -top-24 h-72 w-72 rounded-full blur-3xl opacity-30 bg-primary/20"
      ></div>
      <div
        class="absolute -right-24 -bottom-24 h-72 w-72 rounded-full blur-3xl opacity-30 bg-secondary/20"
      ></div>
    </div>

    <div class={ui.container}>
      <h2 class={ui.h2}>Why CubeIndex</h2>

      <div
        class="mt-10 grid gap-4 sm:gap-6 md:gap-7 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        role="list"
        aria-label="Key benefits"
      >
        {#each tiles as t (t.title)}
          <article class={ui.tileCard} role="listitem">
            <div
              aria-hidden="true"
              class="pointer-events-none absolute inset-0"
            >
              <div
                class={`absolute inset-0 bg-gradient-to-br ${accentStyles[t.accent].gradient} to-transparent opacity-[0.18] group-hover:opacity-25 transition`}
              ></div>
            </div>

            <div class="relative z-10">
              <div class="flex items-center gap-3">
                <span class={`${ui.tileIcon} ${accentStyles[t.accent].icon}`}>
                  <i class={`fa-solid ${t.iconClass} text-base`}></i>
                </span>
                <h3 class={ui.tileHeading}>{t.title}</h3>
              </div>
              <p class="mt-3 text-sm sm:text-base text-base-content/80">
                {t.description}
              </p>
            </div>
          </article>
        {/each}
      </div>
    </div>
  </section>

  <!-- Feature Sections (unchanged content, consistent padding/width handled inside component) -->
  <FeatureSection
    eyebrow="Collection"
    title="Add and Manage Your Rubik's Cube Collection"
    description="Catalog your entire puzzle collection. Track conditions and personal notes, then share with friends to showcase and brag!"
    imageSrc="/images/illus-collection.svg"
    imageAlt="Illustration of a personal collection dashboard with categorized cubes"
  />

  <FeatureSection
    reverse
    eyebrow="Pricing"
    title="Compare Prices Between Shops"
    description="Know where to buy. View vendor pricing side-by-side, check availability, and jump straight to the best deal."
    imageSrc="/images/illus-pricing.svg"
    imageAlt="Illustration showing price comparison cards across multiple stores"
  />

  <FeatureSection
    eyebrow="Ratings"
    title="Rate Cubes"
    description="Share your experience. Leave ratings and feedback so others can find their perfect main — your opinion makes the database better for everybody."
    imageSrc="/images/illus-rating.svg"
    imageAlt="Illustration of rating stars and feedback cards"
  />

  <FeatureSection
    reverse
    eyebrow="Community"
    title="See Other People's Cube Collection"
    description="Discover inspiring collections from across the community."
    imageSrc="/images/illus-community.svg"
    imageAlt="Illustration of community profiles and shared collections"
  />

  <FeatureSection
    eyebrow="Achievements"
    title="Earn Achievements"
    description="Celebrate milestones as you collect, rate, and explore. Unlock achievements for completing challenges and growing your collection."
    imageSrc="/images/illus-achievements.svg"
    imageAlt="Illustration of achievement badges and progress"
  />

  <!-- STATS -->
  <section
    class={`${ui.section} bg-base-100`}
    use:inView={{ once: true, onEnter: () => (statsVisible = true) }}
  >
    <div
      aria-hidden="true"
      class="pointer-events-none select-none absolute inset-0"
    >
      <div
        class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-base-content/20 to-transparent"
      ></div>
      <div
        class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-base-content/20 to-transparent"
      ></div>
      <div
        class="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-secondary/5"
      ></div>
      <div
        class="absolute -left-24 -top-24 h-72 w-72 rounded-full blur-3xl opacity-30 bg-primary/20"
      ></div>
      <div
        class="absolute -right-24 -bottom-24 h-72 w-72 rounded-full blur-3xl opacity-30 bg-secondary/20"
      ></div>
    </div>

    <div class={`relative z-10 ${ui.container}`}>
      <h2 class={ui.h2}>CubeIndex in Numbers</h2>

      <div
        class="mt-12 grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-3"
        role="list"
        aria-label="Key statistics"
      >
        <!-- Cubes -->
        <article class={ui.statCard} role="listitem">
          <div class="flex items-start justify-between">
            <div class={ui.pill}>
              <i class="fa-solid fa-cubes text-base sm:text-lg"></i>
              <span
                class="text-xs sm:text-sm font-medium uppercase tracking-wide"
                >Cubes Logged</span
              >
            </div>
          </div>

          <div
            class="mt-6 text-5xl sm:text-6xl lg:text-7xl font-black leading-none"
          >
            <span
              class="bg-clip-text bg-gradient-to-r from-primary to-secondary"
            >
              <NumberFlow
                value={mounted && statsVisible ? totalCubes : 0}
                plugins={[continuous]}
                transformTiming={{ duration: 50, easing: "linear" }}
                spinTiming={{
                  duration: Math.max(800, totalCubes * 3),
                  easing: "linear",
                }}
                opacityTiming={{ duration: 400, easing: "ease-out" }}
                class="inline-block align-baseline"
                aria-label={`Total cubes logged: ${totalCubes}`}
              />
            </span>
          </div>

          <p class="mt-3 text-sm text-base-content/70">
            Cataloged across brands, types, and generations.
          </p>
        </article>

        <!-- Users -->
        <article class={ui.statCard} role="listitem">
          <div class="flex items-start justify-between">
            <div class={ui.pill}>
              <i class="fa-solid fa-people-group text-base sm:text-lg"></i>
              <span
                class="text-xs sm:text-sm font-medium uppercase tracking-wide"
                >Registered Users</span
              >
            </div>
          </div>

          <div
            class="mt-6 text-5xl sm:text-6xl lg:text-7xl font-black leading-none"
          >
            <span
              class="bg-clip-text bg-gradient-to-r from-primary to-secondary"
            >
              <NumberFlow
                value={mounted && statsVisible ? totalUsers : 0}
                plugins={[continuous]}
                transformTiming={{ duration: 50, easing: "linear" }}
                spinTiming={{
                  duration: Math.max(1000, totalUsers * 10),
                  easing: "linear",
                }}
                opacityTiming={{ duration: 400, easing: "ease-out" }}
                class="inline-block align-baseline"
                aria-label={`Registered users: ${totalUsers}`}
              />
            </span>
          </div>

          <p class="mt-3 text-sm text-base-content/70">
            A growing community of cubers worldwide.
          </p>
        </article>

        <!-- Achievements -->
        <article class={ui.statCard} role="listitem">
          <div class="flex items-start justify-between">
            <div class={ui.pill}>
              <i class="fa-solid fa-trophy text-base sm:text-lg"></i>
              <span
                class="text-xs sm:text-sm font-medium uppercase tracking-wide"
                >Unlockable Achievements</span
              >
            </div>
          </div>

          <div
            class="mt-6 text-5xl sm:text-6xl lg:text-7xl font-black leading-none"
          >
            <span
              class="bg-clip-text bg-gradient-to-r from-primary to-secondary"
            >
              <!-- FIX: use numeric value, not function; make spin timing scale -->
              <NumberFlow
                value={mounted && statsVisible ? unlockAchi : 0}
                plugins={[continuous]}
                transformTiming={{ duration: 50, easing: "linear" }}
                spinTiming={{
                  duration: Math.max(600, unlockAchi * 10),
                  easing: "linear",
                }}
                opacityTiming={{ duration: 400, easing: "ease-out" }}
                class="inline-block align-baseline"
                aria-label={`Unlockable achievements: ${unlockAchi} out of ${totalAchi}`}
              />
            </span>
            <span
              class="ml-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-base-content/60 align-baseline"
            >
              / {totalAchi}
            </span>
          </div>

          <p class="mt-3 text-sm text-base-content/70">
            Earnable today based on your collection & activity.
          </p>
        </article>
      </div>
    </div>
  </section>

  <!-- PARTNERS -->
  <section class={`${ui.section} bg-base-100`}>
    <div class={ui.container}>
      <h2 class={ui.h2}>Our Partners</h2>

      <div class="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
        {#each partners as partner}
          <div class={ui.partnerCard}>
            <div class={ui.partnerHeader}>
              <span class={ui.partnerEmoji}>{partner.emoji}</span>
              <h3 class="text-xl font-semibold">{partner.name}</h3>
            </div>

            <p class="text-base-content/80">{partner.description}</p>

            <div class="flex gap-3 flex-wrap pt-1">
              {#each partner.links as link}
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class={`btn btn-sm ${link.color === "primary" ? "btn-primary" : link.color === "secondary" ? "btn-secondary" : "btn-neutral"}`}
                >
                  {link.label}
                </a>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="{ui.section} text-center">
    <div
      aria-hidden="true"
      class="pointer-events-none select-none absolute inset-0"
    >
      <div
        class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-base-content/20 to-transparent"
      ></div>
      <div
        class="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-secondary/5"
      ></div>
      <div
        class="absolute -left-24 -top-24 h-72 w-72 rounded-full blur-3xl opacity-30 bg-primary/20"
      ></div>
      <div
        class="absolute -right-24 -bottom-24 h-72 w-72 rounded-full blur-3xl opacity-30 bg-secondary/20"
      ></div>
    </div>

    <div class={ui.container}>
      <h2 class="text-4xl font-bold font-clash mb-4">
        Ready to level up your cube game?
      </h2>
      <p class="text-lg max-w-2xl mx-auto mb-8">
        Join the CubeIndex community and start tracking your collection,
        unlocking achievements, and connecting with cubers worldwide.
      </p>
      <div class="flex justify-center gap-4 flex-wrap">
        <a href="/auth/signup" class="btn btn-primary btn-lg sm:btn-xl"
          >Get Started</a
        >
        <a href="/explore" class="btn btn-outline btn-lg sm:btn-xl"
          >Explore Database</a
        >
      </div>
    </div>
  </section>
</SsgoiTransition>
