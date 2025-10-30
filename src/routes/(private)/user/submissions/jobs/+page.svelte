<script lang="ts">
  import type { PageData } from "./$types";

  const { data } = $props<{ data: PageData }>();
  let runs = $derived(data.runs ?? []);
  let summary = $derived(data.summary);

  const hasRuns = $derived(runs.length > 0);

  const dtFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const formatDateTime = (value: string | null) =>
    value ? dtFormatter.format(new Date(value)) : null;

  const formatStatus = (status: string) =>
    status
      .split("_")
      .map(
        (segment) =>
          segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase()
      )
      .join(" ");

  const statusBadge = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized === "completed" || normalized === "done") {
      return "badge-success";
    }
    if (normalized === "running" || normalized === "in_progress") {
      return "badge-info";
    }
    if (normalized === "failed" || normalized === "error") {
      return "badge-error";
    }
    return "badge-warning";
  };

  const shortenUrl = (value: string) =>
    value.length > 80 ? `${value.slice(0, 77)}...` : value;

  type UrlStatusBuckets = {
    queued: number;
    inProgress: number;
    completed: number;
    failed: number;
  };

  const runTimeline = (run: PageData["runs"][number]) =>
    [
      `Queued ${formatDateTime(run.created_at)}`,
      run.started_at && `Started ${formatDateTime(run.started_at)}`,
      run.finished_at && `Finished ${formatDateTime(run.finished_at)}`,
    ].filter((entry): entry is string => Boolean(entry));
</script>

<svelte:head>
  <title>Queued Jobs - CubeIndex</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="mx-auto max-w-5xl px-4 py-8 flex flex-col gap-8">
  <header
    class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
  >
    <div class="space-y-1">
      <h1 class="text-3xl font-clash tracking-tight">Queued jobs</h1>
      <p class="text-sm text-base-content/70">
        Review the automated imports you have requested and monitor their
        progress.
      </p>
    </div>
    <a href="/user/submissions" class="btn btn-outline btn-sm">
      <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
      <span>Back to submissions</span>
    </a>
  </header>

  <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <article class="card border border-base-200 bg-base-100/80 shadow-sm">
      <div class="card-body">
        <p class="text-sm text-base-content/60">Total runs</p>
        <p class="text-4xl font-semibold text-base-content">
          {summary.totalRuns}
        </p>
        {#if summary.lastQueuedAt}
          <p class="text-xs text-base-content/50 mt-2">
            Last queued {formatDateTime(summary.lastQueuedAt)}
          </p>
        {/if}
      </div>
    </article>
    <article class="card border border-base-200 bg-base-100/80 shadow-sm">
      <div class="card-body">
        <p class="text-sm text-base-content/60">In progress</p>
        <p class="text-4xl font-semibold text-info">
          {summary.inProgress}
        </p>
      </div>
    </article>
    <article class="card border border-base-200 bg-base-100/80 shadow-sm">
      <div class="card-body">
        <p class="text-sm text-base-content/60">Completed</p>
        <p class="text-4xl font-semibold text-success">
          {summary.completed}
        </p>
        {#if summary.lastFinishedAt}
          <p class="text-xs text-base-content/50 mt-2">
            Last finished {formatDateTime(summary.lastFinishedAt)}
          </p>
        {/if}
      </div>
    </article>
    <article class="card border border-base-200 bg-base-100/80 shadow-sm">
      <div class="card-body">
        <p class="text-sm text-base-content/60">Failed</p>
        <p class="text-4xl font-semibold text-error">
          {summary.failed}
        </p>
        <p class="text-xs text-base-content/50 mt-2">
          {summary.totalUrls} URLs processed
        </p>
      </div>
    </article>
  </section>

  <section class="space-y-4">
    <h2 class="text-lg font-semibold text-base-content">Recent runs</h2>
    {#if hasRuns}
      <ul class="space-y-4">
        {#each runs as run (run.id)}
          {@const timeline = runTimeline(run)}
          <li
            class="rounded-2xl border border-base-200 bg-base-100/70 p-5 shadow-sm"
          >
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="space-y-2">
                <p class="text-base font-semibold text-base-content">
                  {run.name?.trim() || `Run #${run.id}`}
                </p>
                <ul class="text-xs text-base-content/60 space-y-1">
                  {#each timeline as item}
                    <li>{item}</li>
                  {/each}
                </ul>
                {#if run.urls.length}
                  <div
                    class="flex flex-wrap gap-2 text-xs text-base-content/70"
                  >
                    <span class="badge badge-ghost badge-sm">
                      {run.urls.length} URL{run.urls.length === 1 ? "" : "s"}
                    </span>
                  </div>
                {/if}
              </div>
              <span class={`badge badge-md ${statusBadge(run.status)}`}>
                {formatStatus(run.status)}
              </span>
            </div>
            {#if run.urls.length}
              <details class="collapse collapse-arrow mt-4 bg-base-200/40">
                <summary
                  class="collapse-title text-sm font-medium text-base-content/80"
                >
                  View retailer links
                </summary>
                <div class="collapse-content space-y-2">
                  {#each run.urls as url (url.id)}
                    <div
                      class="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-base-100 px-3 py-2 text-xs text-base-content/80"
                    >
                      <div class="min-w-0">
                        <p class="font-medium truncate" title={url.source_url}>
                          {shortenUrl(url.source_url)}
                        </p>
                        <p class="text-[0.7rem] text-base-content/60">
                          Queued {formatDateTime(url.created_at)}
                        </p>
                      </div>
                    </div>
                  {/each}
                </div>
              </details>
            {:else}
              <p class="mt-4 text-sm text-base-content/60">
                This run has no URLs recorded yet.
              </p>
            {/if}
          </li>
        {/each}
      </ul>
    {:else}
      <div
        class="rounded-2xl border border-dashed border-base-200 bg-base-100/60 p-10 text-center"
      >
        <p class="text-base font-semibold text-base-content mb-2">
          No import jobs yet.
        </p>
        <p class="text-sm text-base-content/70">
          Queue store links from the submission form and they will appear here
          instantly.
        </p>
        <a
          href="/submit"
          class="btn btn-primary btn-sm mt-4 inline-flex items-center gap-2"
        >
          <i class="fa-solid fa-link" aria-hidden="true"></i>
          <span>Queue an import</span>
        </a>
      </div>
    {/if}
  </section>
</div>
