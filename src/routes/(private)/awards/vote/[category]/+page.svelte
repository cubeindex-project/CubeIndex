<script lang="ts">
  import { resolve } from "$app/paths";
  import { submitAwardsVote } from "$lib/api/awards.js";
  import CubeCardSkeleton from "$lib/components/cube/CubeCardSkeleton.svelte";
  import AwardsCountdown from "$lib/components/misc/AwardsCountdown.svelte";
  import { getEventPhase } from "$lib/utils/eventPhase.js";

  import { untrack } from "svelte";

  let { data } = $props();
  const { currentEvent, currentCategory, nominees } = $derived(data);
  let userVote = $derived(data.userVote);

  let selectedNomineeID: number | null = $state(
    untrack(() => userVote?.nominee_id ?? null),
  );

  let voted = $derived(userVote !== null);
  let showConfetti = $state(false);
  let voting = $state(false);
  let voteError: string | null = $state(null);

  async function handleSubmit() {
    if (selectedNomineeID === null) return;

    voting = true;
    voteError = null;

    try {
      await submitAwardsVote(currentCategory.id, selectedNomineeID);

      voted = true;
      showConfetti = true;
    } catch (error) {
      voteError =
        error instanceof Error
          ? error.message
          : "Unable to submit your vote. Please try again.";
    } finally {
      voting = false;
    }
  }
</script>

{#if showConfetti}
  <div class="confetti" aria-hidden="true">
    {#each [...Array(32).keys()] as index (index)}
      <i
        style={`--delay: ${index * 35}ms; --x: ${index % 2 === 0 ? "1rem" : "calc(100vw - 1rem)"}; --drift: ${index % 2 === 0 ? 120 + ((index * 17) % 260) : -120 - ((index * 17) % 260)}px; --rise: ${55 + ((index * 13) % 40)}vh; --color: hsl(${(index * 47) % 360} 85% 60%);`}
      ></i>
    {/each}
  </div>
{/if}

<div class="min-h-screen bg-base-100">
  <div class="mx-auto max-w-6xl space-y-10 px-4 py-12">
    <header
      class="rounded-3xl border border-base-200 bg-base-200/50 p-6 shadow-sm"
    >
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="space-y-3">
          <p class="text-xs uppercase tracking-[0.25em] text-base-content/60">
            {currentEvent.title}
          </p>
          <div class="space-y-1">
            <h1 class="text-3xl font-clash font-bold md:text-4xl">
              {currentCategory.name}
            </h1>
            <p class="text-sm text-base-content/70 max-w-3xl">
              {currentCategory.description}
            </p>
          </div>
        </div>
        <AwardsCountdown
          event={currentEvent}
          eventPhase={getEventPhase(currentEvent)}
          countdownLabel="Voting closes in"
        />
      </div>
    </header>

    <div class="gap-6 space-y-4">
      <section class="space-y-4">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div class="space-y-1">
            <h2 class="text-lg font-semibold">Nominees</h2>
            <p class="text-sm text-base-content/70">
              Review the cubes and pick the one that best fits this category.
            </p>
          </div>
          {#if nominees.length > 0}
            <span class="badge badge-lg border-base-300 bg-base-100 shadow-sm">
              {nominees.length} available
            </span>
          {/if}
        </div>
        <div class="grid gap-4 md:grid-cols-3 items-stretch">
          {#each nominees as nominee (nominee.id)}
            {#snippet cubeCardContent()}
              <div class="mt-4 space-y-3">
                <div class="flex flex-row gap-2 items-center">
                  <button
                    type="button"
                    class="btn flex-1 justify-center"
                    class:btn-primary={nominee.id === selectedNomineeID}
                    class:btn-outline={nominee.id !== selectedNomineeID}
                    aria-pressed={nominee.id === selectedNomineeID}
                    onclick={() => (selectedNomineeID = nominee.id)}
                    disabled={userVote && userVote.nominee_id !== nominee.id}
                  >
                    {#if userVote && userVote.nominee_id === nominee.id}
                      Your vote
                    {:else}
                      {nominee.id === selectedNomineeID ? "Selected" : "Select"}
                    {/if}
                  </button>
                  <a
                    href={resolve("/(public)/explore/cubes/[slug]", {
                      slug: nominee.cube.slug,
                    })}
                    class="btn btn-ghost border border-base-300 flex-1 justify-center"
                    aria-label="View Cube Details"
                  >
                    View details
                  </a>
                </div>
              </div>
            {/snippet}
            <div
              class={`rounded-2xl border ${
                nominee.id === selectedNomineeID
                  ? "border-primary/70 ring-1 ring-primary/25"
                  : "border-base-200"
              }`}
            >
              <CubeCardSkeleton
                cube={nominee.cube}
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
              <a class="btn btn-primary" href={resolve("/awards/vote")}>
                Back to categories
              </a>
            </div>
          {/each}
        </div>
        <div
          class="rounded-2xl border border-base-200 bg-base-100 p-5 shadow-sm"
        >
          {#if voteError}
            <div class="alert alert-error mb-4" role="alert">
              <span>{voteError}</span>
            </div>
          {/if}
          <div
            class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
          >
            <div class="space-y-1">
              <p class="text-sm font-semibold">Submit your vote</p>
              <p class="text-xs text-base-content/70">
                You can submit one vote per category. Double-check your
                selection.
              </p>
            </div>
            <button
              class="btn btn-primary w-full md:w-auto"
              onclick={handleSubmit}
              disabled={voted ||
                nominees.length === 0 ||
                selectedNomineeID === null}
            >
              {#if voting}
                <span class="loading loading-spinner"></span>
                Voting...
              {:else if voted}
                You have already voted!
              {:else if selectedNomineeID === null}
                Select a nominee to vote
              {:else}
                Submit vote
              {/if}
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</div>

<style>
  .confetti {
    position: fixed;
    z-index: 50;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }

  .confetti i {
    position: absolute;
    bottom: -1rem;
    left: var(--x);
    width: 0.65rem;
    height: 1rem;
    background: var(--color);
    animation: launch 2.8s cubic-bezier(0.2, 0.8, 0.4, 1) var(--delay) forwards;
  }

  .confetti i:nth-child(odd) {
    border-radius: 999px;
    width: 0.5rem;
    height: 0.5rem;
  }

  @keyframes launch {
    to {
      transform: translate(var(--drift), calc(-1 * var(--rise))) rotate(720deg);
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .confetti {
      display: none;
    }
  }
</style>
