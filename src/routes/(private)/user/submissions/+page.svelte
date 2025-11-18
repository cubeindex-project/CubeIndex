<script lang="ts">
  import type { PageData } from "./$types";
  import SubmissionCubeCard from "$lib/components/cube/submissionCubeCard.svelte";
  import type { Cube } from "$lib/components/dbTableTypes";

  const { data } = $props<{ data: PageData }>();
  let submissions: Cube[] = $derived(data.submissions ?? []);

  type FilterKey = "all" | "pending" | "approved" | "rejected";
  let activeFilter = $state<FilterKey>("all");

  const filters = $derived([
    { label: "All", value: "all" as const },
    { label: "Pending", value: "pending" as const },
    { label: "Approved", value: "approved" as const },
    { label: "Rejected", value: "rejected" as const},
  ]);

  const filteredSubmissions = $derived(
    activeFilter === "all"
      ? submissions
      : submissions.filter((cube) => cube.status.toLowerCase() === activeFilter)
  );

  const hasSubmissions = $derived(submissions.length > 0);
  const hasFilteredResults = $derived(filteredSubmissions.length > 0);

  const dtFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const formatDateTime = (value: string | null) =>
    value ? dtFormatter.format(new Date(value)) : null;

  const statusBadge = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized === "approved") return "badge-success";
    if (normalized === "pending") return "badge-warning";
    if (normalized === "rejected") return "badge-error";
    return "badge-neutral";
  };

  const formatStatus = (status: string) =>
    status
      .split("_")
      .map(
        (segment) =>
          segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase()
      )
      .join(" ");

  const shortenUrl = (value: string) =>
    value.length > 60 ? `${value.slice(0, 57)}...` : value;
</script>

<svelte:head>
  <title>My Submissions - CubeIndex</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="min-h-screen mx-auto max-w-6xl px-4 py-8 flex flex-col gap-8">
  <header
    class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
  >
    <div class="space-y-1">
      <h1 class="text-3xl font-clash tracking-tight">My submissions</h1>
      <p class="text-sm text-base-content/70">
        Track every cube you have sent to the catalog and keep an eye on
        moderator decisions.
      </p>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <a href="/user/submissions/jobs" class="btn btn-outline btn-sm">
        <i class="fa-solid fa-diagram-project" aria-hidden="true"></i>
        <span>Queued jobs</span>
      </a>
      <a href="/submit" class="btn btn-primary btn-sm">
        <i class="fa-solid fa-plus" aria-hidden="true"></i>
        <span>Submit a cube</span>
      </a>
    </div>
  </header>

  <section class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h2 class="text-lg font-semibold text-base-content">Submitted cubes</h2>
      <div class="flex flex-wrap gap-2">
        {#each filters as filter}
          <button
            type="button"
            class={`btn btn-xs md:btn-sm ${activeFilter === filter.value ? "btn-primary" : "btn-ghost"}`}
            onclick={() => (activeFilter = filter.value)}
            aria-pressed={activeFilter === filter.value}
          >
            {filter.label}
          </button>
        {/each}
      </div>
    </div>

    {#if hasSubmissions}
      {#if hasFilteredResults}
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {#each filteredSubmissions as cube (cube.slug)}
            <SubmissionCubeCard {cube} />
          {/each}
        </div>
      {:else}
        <div
          class="rounded-2xl border border-dashed border-base-200 bg-base-100/70 p-6 text-center"
        >
          <p class="text-base font-semibold text-base-content">
            No cubes match that filter yet.
          </p>
          <p class="mt-2 text-sm text-base-content/60">
            Try another status or submit a new cube.
          </p>
        </div>
      {/if}
    {:else}
      <div
        class="rounded-2xl border border-dashed border-base-200 bg-base-100/70 p-10 text-center"
      >
        <p class="text-xl font-semibold text-base-content mb-2">
          You have not submitted any cubes yet.
        </p>
        <p class="text-sm text-base-content/70">
          Start with our guided form and we will keep you posted as moderators
          review your submission.
        </p>
        <a
          href="/submit"
          class="btn btn-primary mt-4 inline-flex items-center gap-2"
        >
          <i class="fa-solid fa-paper-plane" aria-hidden="true"></i>
          <span>Submit your first cube</span>
        </a>
      </div>
    {/if}
  </section>
</div>
