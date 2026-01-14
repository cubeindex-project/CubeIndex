<script lang="ts">
  import { m } from "$lib/paraglide/messages";
  import CubeCardSkeleton from "./cubeCardSkeleton.svelte";
  import type { DetailedCube } from "../dbTableTypes";
  import { formatDate } from "../helper_functions/formatDate.svelte";

  let {
    cube,
  }: {
    cube: DetailedCube;
  } = $props();

  const statusCopy: Partial<Record<string, string>> = {
    Approved: m.cube_submission_status_approved_text(),
    Pending: m.cube_submission_status_pending_text(),
    Rejected:
      m.cube_submission_status_rejected_text(),
  };
  const statusLabels: Partial<Record<string, string>> = {
    Approved: m.cube_submission_status_approved_label(),
    Pending: m.cube_submission_status_pending_label(),
    Rejected: m.cube_submission_status_rejected_label(),
  };

  const noteText = cube.notes?.trim();
  const hasNote = Boolean(noteText);
</script>

{#snippet top()}
  <div
    class="h-10 flex items-center justify-center w-full rounded-t-2xl {cube.status ===
    'Approved'
      ? 'bg-success text-success-content'
      : cube.status === 'Pending'
        ? 'bg-warning text-warning-content'
        : 'bg-error text-error-content'}"
  >
    <p class="font-semibold tracking-wider">
      {statusLabels[cube.status] ?? cube.status}
    </p>
  </div>
{/snippet}

{#snippet content()}
  <div class="mt-4 flex flex-col gap-4">
    <section
      class="rounded-2xl bg-base-300/50 border border-base-300 p-4 flex flex-col gap-2"
    >
      <p class="text-sm font-semibold text-base-content">
        {m.cube_submission_status_title()}
      </p>
      {#if statusCopy[cube.status]}
        <p class="text-sm text-base-content/70">{statusCopy[cube.status]}</p>
      {/if}
      <div class="text-xs text-base-content/60 flex flex-wrap gap-x-4 gap-y-2">
        <span>
          <span class="font-medium text-base-content/80">
            {m.cube_submission_submitted_label()}
          </span>
          <time datetime={cube.created_at.toString()} class="ml-1 text-base-content">
            {formatDate(cube.created_at)}
          </time>
        </span>
        {#if cube.verified_at}
          <span>
            <span class="font-medium text-base-content/80">
              {m.cube_submission_verified_label()}
            </span>
            <time datetime={cube.verified_at.toString()} class="ml-1 text-base-content">
              {formatDate(cube.verified_at)}
            </time>
          </span>
        {/if}
      </div>
    </section>
    {#if hasNote}
      <section
        class="rounded-2xl bg-base-200 border border-dashed border-base-300 p-4"
      >
        <p class="text-xs uppercase tracking-wide text-base-content/60 mb-2">
          {m.cube_submission_moderator_note_label()}
        </p>
        <p
          class="text-sm leading-relaxed text-base-content/80 whitespace-pre-wrap"
        >
          {noteText}
        </p>
      </section>
    {/if}
  </div>
{/snippet}

{#snippet bottom()}
  <a
    href="/explore/cubes/{cube.slug}"
    class="btn btn-primary mt-4"
    aria-label={m.cube_submission_view_details_aria()}
  >
    {m.cube_submission_view_details_cta()}
    <i class="fa-solid fa-arrow-right"></i>
  </a>
{/snippet}

<CubeCardSkeleton
  {cube}
  rating={false}
  {top}
  {content}
  {bottom}
  showMeta={false}
/>
