<script lang="ts">
  import type { PageData } from "./$types";

  const { data } = $props();
  let runs = $derived(data.runs ?? []);

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

  const runTimeline = (run: PageData["runs"][number]) =>
    [
      `Queued ${formatDateTime(run.created_at)}`,
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

  <section class="space-y-4">
    <h2 class="text-lg font-semibold text-base-content">Recent runs</h2>
    {#if hasRuns}
      <ul class="space-y-4">
        {#each runs as run (run.id)}
          {@const timeline = runTimeline(run)}
          <li
            class="rounded-xl border border-base-200 bg-base-200 p-5"
          >
            <div class="flex flex-wrap items-center justify-between gap-3">
              <p class="truncate text-lg font-semibold text-base-content">
                {run.name?.trim()} <span class="text-neutral-500 text-sm">#{run.id}</span>
              </p>
              <span
                class={`badge whitespace-nowrap ${statusBadge(run.status)}`}
              >
                {formatStatus(run.status)}
              </span>
            </div>

            <div class="mt-4 space-y-4 text-sm text-base-content/70">
              <div class="space-y-1">
                <p class="text-xs font-medium uppercase tracking-wide text-base-content/50">
                  Timeline
                </p>
                <ul class="space-y-2">
                  {#if timeline.length > 0}
                    {#each timeline as item}
                      <li class="flex items-start gap-2">
                        <span class="mt-1 h-1.5 w-1.5 rounded-full bg-primary/80"></span>
                        <span>{item}</span>
                      </li>
                    {/each}
                  {:else}
                    <li class="text-base-content/50">Awaiting timeline updates</li>
                  {/if}
                </ul>
              </div>

              <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div class="min-w-0">
                  <p class="text-xs font-medium uppercase tracking-wide text-base-content/50">
                    Source URL
                  </p>
                  <a href={run.url} class="link link-hover font-medium text-base-content">
                    {run.url}
                  </a>
                </div>
              </div>
            </div>
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
