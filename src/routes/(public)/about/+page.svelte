<script lang="ts">
  import { page } from "$app/state";
  import Badge from "$lib/components/user/badge.svelte";
  import { SsgoiTransition } from "@ssgoi/svelte";
  const { data } = $props();
  const { logoDesigner, team, features, futureFeatures } = data;

  // How many cards to show before "Show more"
  const FEATURE_CAP = 4;
  const FUTURE_FEATURE_CAP = 8;

  // UI state
  let showAllFeatures = $state(false);
  let showAllFuture = $state(false);

  // Derived visible slices
  const visibleFeatures = $derived(
    showAllFeatures ? features : features.slice(0, FEATURE_CAP)
  );
  const visibleFuture = $derived(
    showAllFuture ? futureFeatures : futureFeatures.slice(0, FUTURE_FEATURE_CAP)
  );
</script>

<svelte:head>
  <title>About - CubeIndex</title>
</svelte:head>

<SsgoiTransition id={page.url.pathname}>
  <!-- Subtle background gradient -->
  <div
    aria-hidden="true"
    class="pointer-events-none absolute inset-0 -z-10"
  ></div>
  <div class="relative mx-auto max-w-6xl px-5 py-12 sm:py-16 space-y-16">
    <!-- Hero -->
    <section class="text-center space-y-3" id="hero">
      <div
        class="mx-auto w-28 h-28 sm:w-32 sm:h-32 rounded-2xl shadow-xl ring-1 ring-base-300 overflow-hidden"
      >
        <img
          src="/images/CubeIndex_Logo.webp"
          alt="CubeIndex Logo"
          class="w-full h-full object-cover"
        />
      </div>
      <!-- Disclaimer -->
      <p class="text-xs italic text-base-content/70">
        Logo designed by <a href="/user/{logoDesigner.username}" class="link">
          {logoDesigner.display_name}
        </a>.
      </p>
      <h1 class="text-4xl sm:text-5xl font-clash tracking-tight">
        Welcome to CubeIndex
      </h1>
      <p class="text-base sm:text-lg max-w-2xl mx-auto text-base-content/80">
        CubeIndex is your ultimate speedcubing companion. Organize, explore, and
        showcase your cube collection - all in one place.
      </p>
    </section>

    <section id="features">
      <h2 class="text-2xl sm:text-3xl font-semibold text-center mb-6">
        What You Can Do
      </h2>

      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {#each visibleFeatures as f}
          <div
            class="card card-compact bg-base-100 border border-base-300/60 hover:border-base-300 transition p-4 text-center"
          >
            <div
              class="mx-auto mb-3 flex w-10 h-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
            >
              <i class="{f.icon} text-xl" aria-hidden="true"></i>
            </div>
            <h3 class="text-base font-semibold mb-0.5">{f.title}</h3>
            <p class="text-xs leading-snug text-base-content/80">{f.description}</p>
          </div>
        {/each}
      </div>

      {#if features.length > FEATURE_CAP}
        <div class="mt-4 flex justify-center">
          <button
            class="btn btn-sm btn-outline"
            onclick={() => (showAllFeatures = !showAllFeatures)}
            aria-expanded={showAllFeatures}
            aria-controls="features-grid"
          >
            {showAllFeatures
              ? "Show less"
              : `Show ${features.length - FEATURE_CAP} more`}
          </button>
        </div>
      {/if}
    </section>

    <!-- Future Features Highlights -->
    <section id="future-features">
      <h2 class="text-2xl sm:text-3xl font-semibold text-center mb-6">
        Coming Soon
      </h2>

      <div
        id="features-grid"
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {#each visibleFuture as f}
          <div
            class="card card-compact bg-base-100 border border-dashed border-base-300/60 transition p-4 text-center opacity-80"
          >
            <div
              class="mx-auto mb-3 flex w-10 h-10 items-center justify-center rounded-xl bg-base-300 text-base-content/60"
            >
              <i class="{f.icon} text-xl" aria-hidden="true"></i>
            </div>
            <h3 class="text-base font-semibold mb-0.5">{f.title}</h3>
            <p class="text-xs leading-snug text-base-content/70">{f.description}</p>
            <span
              class="mt-2 inline-block text-[10px] font-medium text-base-content/60"
              >🚧 In development</span
            >
          </div>
        {/each}
      </div>

      {#if futureFeatures.length > FUTURE_FEATURE_CAP}
        <div class="mt-4 flex justify-center">
          <button
            class="btn btn-sm btn-outline"
            onclick={() => (showAllFuture = !showAllFuture)}
            aria-expanded={showAllFuture}
            aria-controls="future-features-grid"
          >
            {showAllFuture
              ? "Show less"
              : `Show ${futureFeatures.length - FUTURE_FEATURE_CAP} more`}
          </button>
        </div>
      {/if}
    </section>

    <!-- Team Spotlight -->
    <section id="team">
      <h2 class="text-2xl sm:text-3xl font-semibold text-center mb-8">
        Meet the Team
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {#each team as member}
          <div
            class="card card-compact bg-base-100 border border-base-300/60 hover:border-base-300 shadow-sm hover:shadow-md transition duration-200 p-6 text-center"
          >
            <div class="flex justify-center mb-4">
              {#if member.profile_picture}
                <img
                  src={member.profile_picture}
                  alt={`Avatar of ${member.display_name}`}
                  class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-primary bg-black object-cover"
                />
              {:else}
                <div class="avatar avatar-placeholder">
                  <div
                    class="bg-base-300 rounded-2xl border-4 border-primary w-24 h-24 sm:w-28 sm:h-28"
                  >
                    <span class="uppercase font-clash text-3xl">
                      {member.display_name.charAt(0)}
                    </span>
                  </div>
                </div>
              {/if}
            </div>
            <h3 class="text-lg font-semibold mb-1">{member.display_name}</h3>
            <div class="mb-4">
              <Badge textSize="sm" profile={member} />
            </div>
            <a href="/user/{member.username}" class="btn btn-neutral w-full">
              Visit Profile <i
                class="fa-solid fa-arrow-up-right-from-square"
                aria-hidden="true"
              ></i>
            </a>
          </div>
        {/each}
        <div
          class="card card-compact bg-base-100 border border-dashed border-base-300/60 hover:border-base-300 shadow-sm hover:shadow-md transition duration-200 p-6 text-center"
        >
          <div class="flex justify-center mb-4">
            <img
              src="/images/we-want-you.webp"
              alt="Recruitment placeholder"
              class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-primary bg-black object-cover"
            />
          </div>
          <h3 class="text-xl font-semibold mb-2">You</h3>
          <a href="https://tally.so/r/w7gbd9" class="btn btn-neutral w-full">
            Apply <i
              class="fa-solid fa-arrow-up-right-from-square"
              aria-hidden="true"
            ></i>
          </a>
        </div>
      </div>
    </section>
  </div>
</SsgoiTransition>
