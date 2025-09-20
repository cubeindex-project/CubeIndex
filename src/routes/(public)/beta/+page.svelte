<script lang="ts">
  interface BetaHighlight {
    title: string;
    description: string;
    icon: string;
  }

  interface BetaStep {
    title: string;
    summary: string;
  }

  const { data } = $props();

  let isLoggedIn = Boolean(data.session);
  let lacksBetaAccess = isLoggedIn && data.profile?.beta_access !== true;

  const highlights: BetaHighlight[] = [
    {
      title: "Shape CubeIndex",
      description:
        "Preview upcoming features, validate workflows, and help us prioritize what matters for cubers everywhere.",
      icon: "fa-wand-magic-sparkles",
    },
    {
      title: "Early Feature Access",
      description:
        "Try experimental tooling before it ships to production and share feedback directly with the team.",
      icon: "fa-compass-drafting",
    },
    {
      title: "Community First",
      description:
        "Join a focused group of solvers, collectors, and analysts building the future of CubeIndex together.",
      icon: "fa-hands-holding-circle",
    },
  ];

  const steps: BetaStep[] = [
    {
      title: "Request an invite",
      summary:
        "Hop into our Discord server and introduce yourself in the beta access channel. We onboard new testers in waves.",
    },
    {
      title: "Watch your inbox",
      summary:
        "Once approved, you will receive an email confirming beta access. Add CubeIndex to your safe senders list so you do not miss it.",
    },
    {
      title: "Log in and explore",
      summary:
        "Use the same email to sign in. Your dashboard will unlock beta-only features and feedback prompts when available.",
    },
  ];
</script>

<svelte:head>
  <title>Join the CubeIndex Beta</title>
  <meta
    name="description"
    content="Request early access to CubeIndex, explore upcoming features, and help guide the roadmap for the community."
  />
</svelte:head>

<section class="relative overflow-hidden">
  <div
    class="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-transparent to-base-100"
  ></div>
  <div class="mx-auto max-w-5xl px-6 md:px-10 py-16 md:py-24 text-center">
    <h1 class="font-clash text-4xl md:text-6xl font-extrabold tracking-tight">
      Help Shape CubeIndex
    </h1>
    <p class="mt-5 text-lg md:text-xl text-base-content/70">
      CubeIndex made available a private beta to cubers passionate about the
      platform. We are them to try features early, stress-test new ideas, and
      collaborate with the team before full launch.
    </p>
    {#if lacksBetaAccess}
      <div
        class="mt-6 alert alert-warning shadow-sm flex flex-col md:flex-row gap-3 items-center"
      >
        <i class="fa-solid fa-circle-info text-xl"></i>
        <span class="text-left text-sm md:text-base">
          You are signed in, but your account has not been granted beta access
          yet. Request an invite through Discord and we will email you once you
          are in.
        </span>
      </div>
    {/if}

    <div
      class="mt-10 flex flex-col md:flex-row items-center justify-center gap-4"
    >
      <a href="/discord" class="btn btn-primary btn-lg rounded-2xl px-8">
        <i class="fa-solid fa-comments text-xl"></i>
        <span>Request Beta Access</span>
      </a>
      <a
        href="https://beta.thecubeindex.com/auth/login"
        class="btn btn-lg rounded-2xl px-8 bg-base-100 border-base-300 hover:border-primary"
      >
        <i class="fa-solid fa-right-to-bracket text-xl"></i>
        <span>I Already Have Access</span>
      </a>
    </div>
    <p class="mt-4 text-sm text-base-content/60">
      Invites are limited. We review requests weekly and expand the cohort as
      soon as we can.
    </p>
  </div>
</section>

<section class="mx-auto max-w-6xl px-6 md:px-10 pb-16">
  <div class="grid gap-6 md:grid-cols-3">
    {#each highlights as { title, description, icon }}
      <div
        class="h-full rounded-3xl border border-base-200 bg-base-100 p-8 text-left shadow-sm"
      >
        <div
          class="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"
        >
          <i class={"fa-solid " + icon + " text-xl"}></i>
        </div>
        <h2 class="mt-6 text-2xl font-semibold font-clash">{title}</h2>
        <p class="mt-3 text-base-content/70 text-sm md:text-base">
          {description}
        </p>
      </div>
    {/each}
  </div>
</section>

<section class="bg-base-200">
  <div class="mx-auto max-w-5xl px-6 md:px-10 py-16 md:py-24">
    <h2 class="text-3xl md:text-4xl font-clash font-semibold text-center">
      How beta access works
    </h2>
    <p class="mt-4 text-base-content/70 text-center max-w-2xl mx-auto">
      Joining the beta is simple and meant to be collaborative. Follow the steps
      below and we will email you as soon as your invite is ready.
    </p>
    <div class="mt-12 space-y-6">
      {#each steps as { title, summary }, index}
        <div
          class="bg-base-100 border border-base-300 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-6 md:items-center"
        >
          <div class="flex items-center justify-center">
            <span
              class="flex size-12 md:size-14 items-center justify-center rounded-full bg-primary text-primary-content text-xl font-bold"
            >
              {index + 1}
            </span>
          </div>
          <div class="md:flex-1 text-left">
            <h3 class="text-xl font-semibold font-clash">{title}</h3>
            <p class="mt-2 text-base-content/70 text-sm md:text-base">
              {summary}
            </p>
          </div>
        </div>
      {/each}
    </div>
    <div class="mt-12 text-center">
      <p class="text-sm text-base-content/60">
        Already invited but seeing this page? Double-check that you are logging
        in with the email we approved for the beta.
      </p>
    </div>
  </div>
</section>
