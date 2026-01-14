<script lang="ts">
  import type { PageData } from "./$types";
  import SubmissionCubeCard from "$lib/components/cube/submissionCubeCard.svelte";
  import type { Cube } from "$lib/components/dbTableTypes";
  import { m } from "$lib/paraglide/messages";

  const { data } = $props<{ data: PageData }>();
  let submissions: Cube[] = $derived(data.submissions ?? []);

  type FilterKey = "all" | "pending" | "approved" | "rejected";
  let activeFilter = $state<FilterKey>("all");

  const filters = $derived([
    { label: m.user_submissions_filter_all_label(), value: "all" as const },
    {
      label: m.user_submissions_filter_pending_label(),
      value: "pending" as const,
    },
    {
      label: m.user_submissions_filter_approved_label(),
      value: "approved" as const,
    },
    {
      label: m.user_submissions_filter_rejected_label(),
      value: "rejected" as const,
    },
  ]);

  const filteredSubmissions = $derived(
    activeFilter === "all"
      ? submissions
      : submissions.filter(
          (cube) => cube.status.toLowerCase() === activeFilter,
        ),
  );

  const hasSubmissions = $derived(submissions.length > 0);
  const hasFilteredResults = $derived(filteredSubmissions.length > 0);
</script>

<svelte:head>
  <title>{m.user_submissions_meta_title()}</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="min-h-screen mx-auto max-w-6xl px-4 py-8 flex flex-col gap-8">
  <header
    class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
  >
    <div class="space-y-1">
      <h1 class="text-3xl font-clash tracking-tight">
        {m.user_submissions_title_h1()}
      </h1>
      <p class="text-sm text-base-content/70">
        {m.user_submissions_intro_text()}
      </p>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <a href="/submit" class="btn btn-primary btn-sm">
        <i class="fa-solid fa-plus" aria-hidden="true"></i>
        <span>{m.user_submissions_submit_cta()}</span>
      </a>
    </div>
  </header>

  <section class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h2 class="text-lg font-semibold text-base-content">
        {m.user_submissions_list_title()}
      </h2>
      <div class="flex flex-wrap gap-2">
        {#each filters as filter (filter.label)}
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
            {m.user_submissions_empty_filter_title_text()}
          </p>
          <p class="mt-2 text-sm text-base-content/60">
            {m.user_submissions_empty_filter_description_text()}
          </p>
        </div>
      {/if}
    {:else}
      <div
        class="rounded-2xl border border-dashed border-base-200 bg-base-100/70 p-10 text-center"
      >
        <p class="text-xl font-semibold text-base-content mb-2">
          {m.user_submissions_empty_all_title_text()}
        </p>
        <p class="text-sm text-base-content/70">
          {m.user_submissions_empty_all_description_text()}
        </p>
        <a
          href="/submit"
          class="btn btn-primary mt-4 inline-flex items-center gap-2"
        >
          <i class="fa-solid fa-paper-plane" aria-hidden="true"></i>
          <span>{m.user_submissions_empty_all_cta()}</span>
        </a>
      </div>
    {/if}
  </section>
</div>
