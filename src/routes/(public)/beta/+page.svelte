<script lang="ts">
  import type { PageData } from "./$types";
  import {
    PUBLIC_BETA_APP_URL,
    PUBLIC_DEPLOYMENT_CHANNEL,
    PUBLIC_PRODUCTION_APP_URL,
  } from "$env/static/public";

  interface BetaHighlight {
    title: string;
    description: string;
    icon: string;
  }

  interface BetaStep {
    title: string;
    summary: string;
  }

  const { data }: { data: PageData } = $props();

  const deploymentChannel = (PUBLIC_DEPLOYMENT_CHANNEL ?? "production").toLowerCase();
  const isLoggedIn = Boolean(data.session);
  const hasBetaAccess = data.profile?.beta_access === true;

  const toProduction = (path: string) => {
    if (deploymentChannel === "beta" && PUBLIC_PRODUCTION_APP_URL) {
      try {
        return new URL(path, PUBLIC_PRODUCTION_APP_URL).href;
      } catch (error) {
        console.warn("Invalid production app URL provided:", error);
        return path;
      }
    }
    return path;
  };

  const manageSettingsHref = toProduction("/user/settings?tab=beta");
  const loginHref = toProduction("/auth/login");
  const signupHref = toProduction("/auth/signup");
  const productionDashboardHref = toProduction("/dashboard");

  const betaAppHref = (() => {
    if (PUBLIC_BETA_APP_URL) {
      try {
        return new URL("/", PUBLIC_BETA_APP_URL).href;
      } catch (error) {
        console.warn("Invalid beta app URL provided:", error);
        return PUBLIC_BETA_APP_URL;
      }
    }
    return deploymentChannel === "beta" ? "/" : null;
  })();

  const betaAppLabel = (() => {
    if (!betaAppHref) return null;
    try {
      return new URL(betaAppHref).origin;
    } catch {
      return betaAppHref;
    }
  })();

  const highlights: BetaHighlight[] = [
    {
      title: "Self-serve access",
      description:
        "Opt in from your settings—no invites or approvals required. Leave whenever you want.",
      icon: "fa-toggle-on",
    },
    {
      title: "Automatic beta routing",
      description:
        "Once you opt in, visiting the production site sends you straight to the beta experience.",
      icon: "fa-arrows-rotate",
    },
    {
      title: "Shape every release",
      description:
        "Test upcoming tooling and share feedback that directly informs what ships next.",
      icon: "fa-comments",
    },
  ];

  const steps: BetaStep[] = [
    {
      title: "Sign in to CubeIndex",
      summary:
        "Use your CubeIndex account or create one so we can remember your beta preference.",
    },
    {
      title: "Open Settings → Beta Program",
      summary:
        "The new tab lets you manage beta access alongside your profile, social links, and theme.",
    },
    {
      title: "Flip the switch",
      summary:
        "Enable the toggle to join the beta. We'll redirect you automatically and you can return any time.",
    },
  ];
</script>

<svelte:head>
  <title>Join the CubeIndex Beta</title>
  <meta
    name="description"
    content="Opt in to the CubeIndex beta, explore upcoming features, and help guide the roadmap for the community."
  />
</svelte:head>

<section class="relative overflow-hidden">
  <div
    class="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-transparent to-base-100"
  ></div>
  <div class="mx-auto max-w-5xl px-6 md:px-10 py-16 md:py-24 text-center">
    <h1 class="font-clash text-4xl md:text-6xl font-extrabold tracking-tight">
      Join the CubeIndex Beta
    </h1>
    <p class="mt-5 text-lg md:text-xl text-base-content/70">
      Preview upcoming features, validate improvements, and help prioritize what the CubeIndex
      community ships next.
    </p>
    {#if isLoggedIn && !hasBetaAccess}
      <div
        class="mt-6 alert alert-info shadow-sm flex flex-col md:flex-row gap-3 items-center"
      >
        <i class="fa-solid fa-circle-info text-xl"></i>
        <span class="text-left text-sm md:text-base">
          You're signed in. Visit
          <a href={manageSettingsHref} class="link link-primary link-hover"
            >Settings → Beta Program</a
          >
          to opt in instantly and start testing new features.
        </span>
      </div>
    {:else if isLoggedIn && hasBetaAccess}
      <div
        class="mt-6 alert alert-success shadow-sm flex flex-col md:flex-row gap-3 items-center"
      >
        <i class="fa-solid fa-check text-xl"></i>
        <span class="text-left text-sm md:text-base">
          You're in the beta! We'll redirect you to {betaAppLabel ?? "the beta experience"} whenever
          you visit CubeIndex.
        </span>
      </div>
    {/if}

    <div class="mt-10 flex flex-col md:flex-row items-center justify-center gap-4">
      {#if isLoggedIn}
        <a href={manageSettingsHref} class="btn btn-primary btn-lg rounded-2xl px-8">
          <i class="fa-solid fa-sliders text-xl"></i>
          <span>Manage Beta Settings</span>
        </a>
        {#if hasBetaAccess && betaAppHref}
          <a
            href={betaAppHref}
            class="btn btn-lg rounded-2xl px-8 bg-base-100 border-base-300 hover:border-primary"
          >
            <i class="fa-solid fa-arrow-up-right-from-square text-xl"></i>
            <span>Open the Beta App</span>
          </a>
        {:else}
          <a
            href={productionDashboardHref}
            class="btn btn-lg rounded-2xl px-8 bg-base-100 border-base-300 hover:border-primary"
          >
            <i class="fa-solid fa-house text-xl"></i>
            <span>
              {deploymentChannel === "beta"
                ? "Open the Production App"
                : "Explore the Dashboard"}
            </span>
          </a>
        {/if}
      {:else}
        <a href={loginHref} class="btn btn-primary btn-lg rounded-2xl px-8">
          <i class="fa-solid fa-right-to-bracket text-xl"></i>
          <span>Sign in to join</span>
        </a>
        <a
          href={signupHref}
          class="btn btn-lg rounded-2xl px-8 bg-base-100 border-base-300 hover:border-primary"
        >
          <i class="fa-solid fa-user-plus text-xl"></i>
          <span>Create an account</span>
        </a>
      {/if}
    </div>
    <p class="mt-4 text-sm text-base-content/60">
      You can join or leave the beta whenever you like. We sync your preference across every device.
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
      How beta opt-in works
    </h2>
    <p class="mt-4 text-base-content/70 text-center max-w-2xl mx-auto">
      Switching to the beta takes only a minute. Follow these steps to manage your access whenever you
      need.
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
        Want to return to production? Toggle the beta setting off in Settings → Beta Program and revisit
        CubeIndex to switch back.
      </p>
    </div>
  </div>
</section>
