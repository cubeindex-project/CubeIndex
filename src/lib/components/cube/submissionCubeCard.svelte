<script lang="ts">
  import CubeCardSkeleton from "./cubeCardSkeleton.svelte";
  import type { Cube } from "../dbTableTypes";
  import { formatDate } from "../helper_functions/formatDate.svelte";

  let {
    cube,
  }: {
    cube: Cube;
  } = $props();

  const statusCopy: Partial<Record<string, string>> = {
    Approved: "Great news! Your cube is live on CubeIndex.",
    Pending: "Our moderators are reviewing this submission.",
    Rejected:
      "There was an issue with the submission. Check the moderator note for next steps.",
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
    <p class="font-semibold tracking-wider">{cube.status}</p>
  </div>
{/snippet}

{#snippet content()}
  <div class="mt-4 flex flex-col gap-4">
    <section
      class="rounded-2xl bg-base-300/50 border border-base-300 p-4 flex flex-col gap-2"
    >
      <p class="text-sm font-semibold text-base-content">Submission status</p>
      {#if statusCopy[cube.status]}
        <p class="text-sm text-base-content/70">{statusCopy[cube.status]}</p>
      {/if}
      <div class="text-xs text-base-content/60 flex flex-wrap gap-x-4 gap-y-2">
        <span>
          <span class="font-medium text-base-content/80">Submitted:</span>
          <time datetime={cube.created_at} class="ml-1 text-base-content">
            {formatDate(cube.created_at)}
          </time>
        </span>
        {#if cube.verified_at}
          <span>
            <span class="font-medium text-base-content/80">Verified:</span>
            <time datetime={cube.verified_at} class="ml-1 text-base-content">
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
          Moderator note
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
    aria-label="View Cube Details"
  >
    View Details
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
