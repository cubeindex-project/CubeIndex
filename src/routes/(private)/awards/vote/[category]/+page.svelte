<script lang="ts">
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

  const endTime = new Date(event.end_at).getTime();
  const startTime = new Date(event.start_at).getTime();
  let nowMs = $state(Date.now());
  type EventPhase = "unknown" | "upcoming" | "live" | "past";
  const eventPhase: EventPhase = $derived.by(() => {
    if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
      return "unknown";
    }
    if (nowMs < startTime) return "upcoming";
    if (nowMs <= endTime) return "live";
    return "past";
  });
  const votingEnabled = $derived(() => eventPhase === "live");
  const formatDateTime = (value: number) => {
    if (!Number.isFinite(value)) return "";
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  };
  const startDateLabel = $derived.by(() => formatDateTime(startTime));
  const endDateLabel = $derived.by(() => formatDateTime(endTime));
  const voteStatusMessage = $derived.by(() => {
    if (eventPhase === "upcoming" && startDateLabel) {
      return `Voting opens on ${startDateLabel}.`;
    }
    if (eventPhase === "past" && endDateLabel) {
      return `Voting closed on ${endDateLabel}.`;
    }
    if (eventPhase === "unknown") {
      return "Voting is not available right now.";
    }
    return "";
  });
  const formatCountdown = () => {
    const diffMs = endTime - nowMs;
    if (diffMs <= 0) return "Voting closed";
    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts = [
      days > 0 ? `${days}d` : null,
      `${hours}h`,
      `${minutes}m`,
      `${seconds}s`,
    ].filter(Boolean);
    return parts.join(" ");
  };

  let countdownLabel = $state(formatCountdown());
  $effect(() => {
    const id = setInterval(() => {
      nowMs = Date.now();
      countdownLabel = formatCountdown();
    }, 1000);
    return () => clearInterval(id);
  });

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
  <div class="min-h-screen bg-base-100">
    <div class="mx-auto max-w-6xl space-y-10 px-4 py-12">
      <header
        class="rounded-3xl border border-base-200 bg-base-200/50 p-6 shadow-sm"
      >
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="space-y-3">
            <p class="text-xs uppercase tracking-[0.25em] text-base-content/60">
              {event.title}
            </p>
            <div class="space-y-1">
              <h1 class="text-3xl font-clash font-bold md:text-4xl">
                {category.name}
              </h1>
              <p class="text-sm text-base-content/70 max-w-3xl">
                {category.description}
              </p>
            </div>
            <p class="text-xs text-base-content/60">
              Select one nominee. Votes are final once submitted.
            </p>
          </div>
          <div
            class="rounded-2xl border border-base-300 bg-base-100 px-4 py-3 text-right shadow-sm"
          >
            <p class="text-xs text-base-content/60">Voting closes in</p>
            <p class="text-lg font-semibold">{countdownLabel}</p>
          </div>
        </div>
        {#if voteStatusMessage}
          <p class="text-xs text-warning/80">{voteStatusMessage}</p>
        {/if}
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
              <span
                class="badge badge-lg border-base-300 bg-base-100 shadow-sm"
              >
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
                      class:btn-primary={nominee.nominee_id ===
                        selectedNomineeId}
                      class:btn-outline={nominee.nominee_id !==
                        selectedNomineeId}
                      aria-pressed={nominee.nominee_id === selectedNomineeId}
                      onclick={() => selectNominee(nominee)}
                      disabled={!votingEnabled ||
                        (userVote !== null && userVote !== nominee.nominee_id)}
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
                  nominee.nominee_id === selectedNomineeId
                    ? "border-primary/70 ring-1 ring-primary/25"
                    : "border-base-200"
                }`}
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
                <a class="btn btn-primary" href="/awards/vote">
                  Back to categories
                </a>
              </div>
            {/each}
          </div>
          <div
            class="rounded-2xl border border-base-200 bg-base-100 p-5 shadow-sm"
          >
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
                onclick={submitVote}
                disabled={!votingEnabled ||
                  userVote !== null ||
                  nominees.length === 0 ||
                  selectedNomineeId === null}
              >
                {#if voting}
                  <span class="loading loading-spinner"></span>
                  Voting...
                {:else if voted}
                  Voted!
                {:else if !votingEnabled}
                  Voting not open
                {:else if userVote !== null}
                  You have already voted!
                {:else if selectedNomineeId === null}
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