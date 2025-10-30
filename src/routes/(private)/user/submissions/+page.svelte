<script lang="ts">
  import type { PageData } from "./$types";
  import SubmissionCubeCard from "$lib/components/cube/submissionCubeCard.svelte";
  import type { Cube } from "$lib/components/dbTableTypes";

  const { data } = $props<{ data: PageData }>();
  let submissions: Cube[] = $derived(data.submissions ?? []);
  let summary = $derived(data.summary);
  let importPreview = $derived(data.importPreview ?? []);

  type FilterKey = "all" | "pending" | "approved" | "rejected";
  let activeFilter = $state<FilterKey>("all");

  const filters = $derived([
    { label: "All", value: "all" as const, count: summary.total },
    { label: "Pending", value: "pending" as const, count: summary.pending },
    { label: "Approved", value: "approved" as const, count: summary.approved },
    { label: "Rejected", value: "rejected" as const, count: summary.rejected },
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

<div class="mx-auto max-w-6xl px-4 py-8 flex flex-col gap-8">
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

  <section class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
    <article class="card border border-base-200 bg-base-100/80 shadow-sm">
      <div class="card-body">
        <p class="text-sm text-base-content/60">Total submissions</p>
        <p class="text-4xl font-semibold text-base-content">{summary.total}</p>
        {#if summary.lastSubmittedAt}
          <p class="text-xs text-base-content/50 mt-2">
            Last submitted on {formatDateTime(summary.lastSubmittedAt)}
          </p>
        {/if}
      </div>
    </article>
    <article class="card border border-base-200 bg-base-100/80 shadow-sm">
      <div class="card-body">
        <p class="text-sm text-base-content/60">Pending review</p>
        <p class="text-4xl font-semibold text-warning">{summary.pending}</p>
      </div>
    </article>
    <article class="card border border-base-200 bg-base-100/80 shadow-sm">
      <div class="card-body">
        <p class="text-sm text-base-content/60">Approved</p>
        <p class="text-4xl font-semibold text-success">{summary.approved}</p>
        {#if summary.lastUpdatedAt}
          <p class="text-xs text-base-content/50 mt-2">
            Last update on {formatDateTime(summary.lastUpdatedAt)}
          </p>
        {/if}
      </div>
    </article>
    <article class="card border border-base-200 bg-base-100/80 shadow-sm">
      <div class="card-body">
        <p class="text-sm text-base-content/60">Rejected</p>
        <p class="text-4xl font-semibold text-error">{summary.rejected}</p>
      </div>
    </article>
  </section>

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
            <span class="badge badge-xs ml-2">{filter.count}</span>
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

  <section id="import-status" class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h2 class="text-lg font-semibold text-base-content">
        Queued import jobs
      </h2>
      <a href="/user/submissions/jobs" class="btn btn-ghost btn-sm">
        View all jobs
        <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
      </a>
    </div>
    {#if importPreview.length}
      <ul class="space-y-3">
        {#each importPreview as run (run.id)}
          <li
            class="rounded-2xl border border-base-200 bg-base-100/70 p-4 shadow-sm"
          >
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="space-y-1">
                <p class="text-sm font-semibold text-base-content">
                  {run.name?.trim() || `Run #${run.id}`}
                </p>
                <p class="text-xs text-base-content/60">
                  Queued {formatDateTime(run.created_at)}
                </p>
              </div>
              <span class={`badge badge-sm ${statusBadge(run.status)}`}>
                {formatStatus(run.status)}
              </span>
            </div>
            {#if run.urls.length}
              <ul
                class="mt-3 flex flex-wrap gap-2 text-xs text-base-content/60"
              >
                {#each run.urls as url (url.id)}
                  <li
                    class="rounded-full bg-base-200/80 px-3 py-1"
                    title={url.source_url}
                  >
                    {shortenUrl(url.source_url)}
                  </li>
                {/each}
              </ul>
            {/if}
          </li>
        {/each}
      </ul>
    {:else}
      <div
        class="rounded-2xl border border-dashed border-base-200 bg-base-100/60 p-6 text-center"
      >
        <p class="text-sm text-base-content/70">
          No automated imports queued yet. Use the scraper on the submission
          page to import retailer listings.
        </p>
      </div>
    {/if}
  </section>
</div>
