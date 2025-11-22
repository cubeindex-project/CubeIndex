<script lang="ts">
  import { page } from "$app/state";
  import { SsgoiTransition } from "@ssgoi/svelte";
  import CubeCardSkeleton from "$lib/components/cube/cubeCardSkeleton.svelte";
  import type {
    AwardsEvent,
    AwardsCategory,
    DetailedCube,
  } from "$lib/components/dbTableTypes";

  interface NomineeCube extends DetailedCube {
    nominee_id: number;
  }

  let { data } = $props();

  const event: AwardsEvent = data.current_event;
  const category: AwardsCategory = data.awards_category;
  const nominees: NomineeCube[] = data.awards_nominee;
  let userVote = $state(data.user_vote);

  let selectedNomineeId: number | null = $derived(userVote);

  const selectNominee = (nominee: NomineeCube) => {
    selectedNomineeId = nominee.nominee_id;
  };

  let voting = $state(false);
  let voted = $state(false);

  async function submitVote() {
    voting = true;
    const res = await fetch("/api/awards/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_id: event.id,
        category_id: category.id,
        nominee_id: selectedNomineeId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      voting = false;
      throw new Error(data.error || "Vote failed");
    }

    voting = false;
    voted = true;
    userVote = selectedNomineeId;
  }
  $effect(() => {
    const _ = voting;
    if (!voting) return;
    const id = setTimeout(() => {
      voting = false;
      throw new Error("Timeout, please try again in a few minutes.");
    }, 10000);
    return () => {
      clearTimeout(id);
    };
  });
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

      <div class="gap-6">
        <section class="space-y-3">
          <h2 class="text-lg font-semibold">Nominees</h2>
          <div class="grid gap-3 md:grid-cols-2">
            {#each nominees as nominee}
              {#snippet cubeCardContent()}
                <div class="mt-4 gap-3 flex w-full items-center">
                  <button
                    type="button"
                    class="btn flex-1"
                    class:btn-primary={nominee.nominee_id !== selectedNomineeId}
                    class:btn-outline={nominee.nominee_id !== selectedNomineeId}
                    class:btn-success={nominee.nominee_id === selectedNomineeId}
                    aria-pressed={nominee.id === selectedNomineeId}
                    onclick={() => selectNominee(nominee)}
                    disabled={userVote !== null &&
                      userVote !== nominee.nominee_id}
                  >
                    {#if userVote !== nominee.nominee_id}
                      {nominee.nominee_id === selectedNomineeId
                        ? "Selected"
                        : "Select"}
                    {:else}
                      Voted
                    {/if}
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
              <div
                class={nominee.nominee_id === userVote
                  ? "border border-success rounded-2xl"
                  : ""}
              >
                <CubeCardSkeleton
                  cube={nominee}
                  rating={false}
                  showMeta={false}
                  content={cubeCardContent}
                />
              </div>
            {:else}
              <div
                class="col-span-full w-full rounded-xl border border-dashed border-base-300 bg-base-200/70 p-6 text-center space-y-3"
              >
                <p class="text-base font-semibold">
                  No cubes have been nominated for this category yet.
                </p>
                <p class="text-sm text-base-content/70">
                  Check back soon to vote once nominations are announced.
                </p>
                <a class="btn btn-primary" href="/awards/vote"
                  >Back to categories</a
                >
              </div>
            {/each}
          </div>
          <div>
            <button
              class="btn btn-primary w-full"
              onclick={submitVote}
              disabled={userVote !== null || nominees.length === 0}
            >
              {#if voting}
                <span class="loading loading-spinner"></span>
                Voting...
              {:else if voted}
                Voted!
              {:else}
                {userVote === null ? "Vote" : "You have already voted!"}
              {/if}
            </button>
          </div>
        </section>
      </div>
    </div>
  </div>
</SsgoiTransition>
