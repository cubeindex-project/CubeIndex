<script lang="ts">
  import { page } from "$app/state";
  import { SsgoiTransition } from "@ssgoi/svelte";
  import CubeCardSkeleton from "$lib/components/cube/cubeCardSkeleton.svelte";
  import type {
    AwardsEvent,
    AwardsCategory,
    DetailedCube,
  } from "$lib/components/dbTableTypes";

  let { data } = $props();

  const event: AwardsEvent = data.current_event;
  const category: AwardsCategory = data.awards_category;
  const nominees: DetailedCube[] = data.awards_nominee;

  let selectedNomineeId: number | null = $state(null);
  let activeNominee: DetailedCube | null = $state(null);

  const selectNominee = (nominee: DetailedCube) => {
    selectedNomineeId = nominee.id;
    activeNominee = nominee;
  };
</script>

<svelte:head>
  <title>{category.name} - Awards Ballot</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<SsgoiTransition id={page.url.pathname}>
  <div class="bg-base-100 min-h-screen">
    <div class="mx-auto max-w-5xl px-4 py-10 space-y-8">
      <header class="space-y-2">
        <p class="text-sm text-base-content/70">
          {event.title}
        </p>
        <h1 class="text-3xl font-clash font-bold md:text-4xl">
          {category.name}
        </h1>
        <p class="text-sm text-base-content/70">{category.description}</p>
      </header>

      <form class="grid gap-6">
        <section class="space-y-3">
          <h2 class="text-lg font-semibold">Nominees</h2>
          <div class="grid gap-3 md:grid-cols-2">
            {#each nominees as nominee}
              {#snippet cubeCardContent()}
                <div class="mt-4 gap-3 flex w-full items-center">
                  <button
                    type="button"
                    class="btn flex-1"
                    class:btn-primary={nominee.id !== selectedNomineeId}
                    class:btn-outline={nominee.id !== selectedNomineeId}
                    class:btn-success={nominee.id === selectedNomineeId}
                    aria-pressed={nominee.id === selectedNomineeId}
                    onclick={() => selectNominee(nominee)}
                  >
                    {nominee.id === selectedNomineeId ? "Selected" : "Select"}
                  </button>
                  <a
                    href="/explore/cubes/{nominee.slug}"
                    class="btn btn-primary flex-1"
                    aria-label="View Cube Details"
                  >
                    View Details
                    <i class="fa-solid fa-arrow-right"></i>
                  </a>
                </div>
              {/snippet}
              <CubeCardSkeleton
                cube={nominee}
                rating={false}
                showMeta={true}
                content={cubeCardContent}
              />
            {:else}
              <div
                class="rounded-xl border border-dashed border-base-300 bg-base-200/70 p-6 text-center space-y-3 w-full"
              >
                <p class="text-base font-semibold">
                  No cubes have been nominated for this category yet.
                </p>
                <p class="text-sm text-base-content/70">
                  Check back soon to vote once nominations are announced.
                </p>
                <a class="btn btn-primary" href="/awards/vote">
                  Back to categories
                </a>
              </div>
            {/each}
          </div>
        </section>
      </form>
    </div>
  </div>
</SsgoiTransition>
