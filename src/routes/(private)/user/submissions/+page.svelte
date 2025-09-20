<script lang="ts">
  import type { PageData } from "./$types";
  import SubmissionCubeCard from "$lib/components/cube/submissionCubeCard.svelte";

  let { data }: { data: PageData } = $props();

  const { submittedCubes = [], user, profile } = data;

  type SubmissionStatus = PageData["submittedCubes"][number]["status"];
  type StatusFilter = SubmissionStatus | "All";

  const statusOrder: SubmissionStatus[] = ["Pending", "Approved", "Rejected"];
  const statusVariants: Record<
    SubmissionStatus,
    { label: string; badgeClass: string; description: string }
  > = {
    Approved: {
      label: "Approved",
      badgeClass: "badge-success",
      description: "Published on CubeIndex and visible to the community.",
    },
    Pending: {
      label: "Pending Review",
      badgeClass: "badge-warning",
      description:
        "Awaiting a moderator decision. We typically respond within a few days.",
    },
    Rejected: {
      label: "Rejected",
      badgeClass: "badge-error",
      description:
        "Refused for the reason given in the moderator note.",
    },
  };

  const summary = submittedCubes.reduce<
    Record<SubmissionStatus | "total", number>
  >(
    (acc, cube) => {
      acc[cube.status] = (acc[cube.status] ?? 0) + 1;
      acc.total += 1;
      return acc;
    },
    { Approved: 0, Pending: 0, Rejected: 0, total: 0 }
  );

  let statusFilter: StatusFilter = $state("All");
  const filterTabs: StatusFilter[] = ["All", ...statusOrder];

  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  });
  const isIsoString = (value: string | null | undefined): value is string =>
    Boolean(value);

  const latestTimestampIso = submittedCubes.reduce<string | null>(
    (latest, cube) => {
      const candidates = [
        cube.updated_at,
        cube.verified_at,
        cube.created_at,
      ].filter(isIsoString);
      const cubeLatest = candidates.reduce<string | null>(
        (currentLatest, iso) => {
          if (!currentLatest || new Date(iso) > new Date(currentLatest))
            return iso;
          return currentLatest;
        },
        null
      );
      if (!cubeLatest) return latest;
      if (!latest || new Date(cubeLatest) > new Date(latest)) return cubeLatest;
      return latest;
    },
    null
  );

  const submissionCountCopy =
    summary.total === 1 ? "submission" : "submissions";

  const getStatusLabel = (filter: StatusFilter): string =>
    filter === "All" ? "All statuses" : statusVariants[filter].label;

  const getEmptyStateQualifier = (filter: StatusFilter): string =>
    filter === "All"
      ? "yet"
      : `marked as ${statusVariants[filter].label.toLowerCase()}`;

  let latestUpdateLabel = latestTimestampIso
    ? dateFormatter.format(new Date(latestTimestampIso))
    : null;
  const filteredCubes = $derived(
    statusFilter === "All"
      ? submittedCubes
      : submittedCubes.filter((cube) => cube.status === statusFilter)
  );
</script>

<div class="relative max-w-6xl mx-auto mt-12 px-4 pb-16">
  <section
    class="rounded-3xl border border-base-300 bg-base-200/60 backdrop-blur p-6 md:p-8 shadow-xl"
  >
    <div
      class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between"
    >
      <div class="flex-1">
        <p class="text-xs uppercase tracking-[0.2em] text-base-content/50">
          Submission overview
        </p>
        <h1 class="mt-2 text-3xl font-bold text-base-content md:text-4xl">
          {profile.display_name ?? profile.username}&apos;s cube submissions
        </h1>
        <p class="mt-3 max-w-2xl text-sm text-base-content/70">
          Track the status of every cube you&apos;ve shared with the community,
          follow up on moderator feedback, and queue new models when you&apos;re
          ready.
        </p>
      </div>
      <a href="/submit" class="btn btn-info btn-wide md:self-start">
        <i class="fa-solid fa-plus"></i>
        Submit a cube
      </a>
    </div>
  </section>

  <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <div class="rounded-2xl border border-base-300 bg-base-200 p-5">
      <p class="text-sm text-base-content/70">In review pipeline</p>
      <p class="mt-2 text-3xl font-semibold text-base-content">
        {summary.total}
      </p>
      {#if latestUpdateLabel}
        <p class="mt-3 text-xs text-base-content/60">
          Latest activity {latestUpdateLabel}
        </p>
      {/if}
    </div>
    {#each statusOrder as status}
      <div
        class="rounded-2xl border border-base-300 bg-base-200 p-5 flex flex-col gap-3"
      >
        <div class="flex items-center justify-between">
          <p class="font-semibold text-base-content">
            {statusVariants[status].label}
          </p>
          <span class={`badge ${statusVariants[status].badgeClass}`}
            >{summary[status]}</span
          >
        </div>
        <p class="text-sm text-base-content/70">
          {statusVariants[status].description}
        </p>
      </div>
    {/each}
  </div>

  <div class="mt-10 flex flex-col gap-4">
    <div
      class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
    >
      <h2 class="text-lg font-semibold text-base-content">
        Submission tracker
      </h2>
      <div
        class="join"
        role="tablist"
        aria-label="Filter submissions by status"
      >
        {#each filterTabs as tab}
          <button
            type="button"
            class={`join-item btn btn-sm ${statusFilter === tab ? "btn-primary" : "btn-ghost"}`}
            onclick={() => {
              statusFilter = tab;
            }}
            aria-pressed={statusFilter === tab}
          >
            {getStatusLabel(tab)}
            <span class="badge badge-sm badge-ghost ml-2">
              {tab === "All" ? summary.total : summary[tab]}
            </span>
          </button>
        {/each}
      </div>
    </div>

    {#if filteredCubes.length > 0}
      <ul class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {#each filteredCubes as cube (cube.slug)}
          <li class="flex flex-col">
            <SubmissionCubeCard {cube} />
          </li>
        {/each}
      </ul>
    {:else}
      <div
        class="mt-12 rounded-3xl border border-dashed border-base-300 bg-base-200/70 p-10 text-center"
      >
        <h3 class="text-2xl font-semibold text-base-content">
          No submissions {getEmptyStateQualifier(statusFilter)}
        </h3>
        <p class="mt-3 text-sm text-base-content/70">
          We couldn&apos;t find any cubes in this view. Adjust the filter or
          start a new submission to fill the pipeline.
        </p>
        <a href="/submit" class="btn btn-outline btn-primary mt-6">
          <i class="fa-solid fa-plus"></i>
          Submit a cube
        </a>
      </div>
    {/if}
  </div>
</div>
