<script lang="ts">
  import CubeCardSkeleton from "$lib/components/cube/CubeCardSkeleton.svelte";
  import { formatDate } from "../../utils/formatDate";
  import type { Tables } from "$lib/types/database.types";
  import StaffNote from "../submission/StaffNote.svelte";

  interface Props {
    cubeSubmission: Tables<"cube_submissions"> & Tables<"submissions">;
  }

  let { cubeSubmission }: Props = $props();
</script>

{#snippet top()}
  <div
    class="h-10 flex items-center justify-center w-full rounded-t-2xl {cubeSubmission.status ===
    'Approved'
      ? 'bg-success text-success-content'
      : cubeSubmission.status === 'Pending'
        ? 'bg-warning text-warning-content'
        : 'bg-error text-error-content'}"
  >
    <p class="font-semibold tracking-wider">
      {cubeSubmission.status}
    </p>
  </div>
{/snippet}

{#snippet content()}
  <div class="mt-4 flex flex-col gap-4">
    <section
      class="text-xs text-base-content/60 flex flex-wrap gap-x-4 gap-y-2"
    >
      <span>
        <i class="fa-regular fa-calendar" aria-hidden="true"></i>
        <span class="font-medium text-base-content/80">Submitted:</span>
        <time
          datetime={cubeSubmission.created_at?.toString()}
          class="ml-1 text-base-content"
        >
          {cubeSubmission.created_at
            ? formatDate(cubeSubmission.created_at)
            : "—"}
        </time>
      </span>
      {#if cubeSubmission.reviewed_at}
        <span>
          <i class="fa-solid fa-check" aria-hidden="true"></i>
          <span class="font-medium text-base-content/80">Verified:</span>
          <time
            datetime={cubeSubmission.reviewed_at.toString()}
            class="ml-1 text-base-content"
          >
            {formatDate(cubeSubmission.reviewed_at)}
          </time>
        </span>
      {/if}
    </section>
    {#if cubeSubmission.reviewer_note}
      <StaffNote staff_note={cubeSubmission.reviewer_note} />
    {/if}
  </div>
{/snippet}

<CubeCardSkeleton
  cube={cubeSubmission}
  rating={false}
  {top}
  {content}
  showMeta={false}
/>
