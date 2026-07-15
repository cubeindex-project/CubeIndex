<script module lang="ts">
  export interface SubmissionReviewUsers {
    submitter?: { display_name: string | null } | null;
    verifier?: { display_name: string | null } | null;
  }
</script>

<script lang="ts">
  import { formatDate } from "$lib/utils/formatDate";
  import type { Snippet } from "svelte";
  import SubmissionStatusManager from "./SubmissionStatusManager.svelte";
  import type { ResolvedPathname } from "$app/types";
  import { getSubmissionStatusBadgeColor } from "$lib/utils/getSubmissionStatusBadgeColor";
  import type { Enums } from "$lib/types/database.types";

  interface Submission extends SubmissionReviewUsers {
    id: number;
    name: string;
    status: Enums<"submission_status">;
    created_at: string;
    verified_at: string | null;
  }

  interface Props {
    submission: Submission;
    entityLabel: string;
    editHref: ResolvedPathname;
    children: Snippet;
  }

  let { submission, entityLabel, editHref, children }: Props = $props();
</script>

<section class="mx-auto max-w-5xl px-4 py-8 sm:px-6">
  <header
    class="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-base-300 pb-4"
  >
    <div>
      <p class="text-sm text-base-content/60">
        Review {entityLabel} submission
      </p>
      <h1 class="font-clash text-3xl font-semibold">{submission.name}</h1>
    </div>
    <span class="badge {getSubmissionStatusBadgeColor(submission.status)}"
      >{submission.status}</span
    >
  </header>

  <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
    <main class="overflow-hidden rounded-box border border-base-300">
      <h2 class="border-b border-base-300 bg-base-200 px-4 py-3 font-semibold">
        Submitted values
      </h2>
      <div class="overflow-x-auto">
        <table class="table table-sm">
          <tbody>
            {@render children()}
          </tbody>
        </table>
      </div>
    </main>

    <aside
      class="space-y-5 rounded-box border border-base-300 p-4 lg:sticky lg:top-24"
    >
      <div>
        <p class="text-sm text-base-content/60">Submitted by</p>
        <p class="font-medium">
          {submission.submitter?.display_name ?? "Unknown user"}
        </p>
      </div>
      <div>
        <p class="text-sm text-base-content/60">Submitted at</p>
        <p class="font-medium">{formatDate(submission.created_at)}</p>
      </div>

      {#if submission.status === "Pending"}
        <div class="border-t border-base-300 pt-4">
          <h2 class="mb-1 font-semibold">Decision</h2>
          <p class="mb-3 text-sm text-base-content/60">
            Verify the values, then approve or reject.
          </p>
          <a class="btn btn-outline btn-sm mb-3 w-full" href={editHref}>
            <i class="fa-solid fa-pencil" aria-hidden="true"></i>
            Edit {entityLabel}
          </a>
          <SubmissionStatusManager {submission} {entityLabel} />
        </div>
      {:else}
        <div>
          <p class="text-sm text-base-content/60">Verified by</p>
          <p class="font-medium">
            {submission.verifier?.display_name ?? "Unknown user"}
          </p>
        </div>
        <div>
          <p class="text-sm text-base-content/60">Verified at</p>
          <p class="font-medium">
            {submission.verified_at
              ? formatDate(submission.verified_at)
              : "No verification date"}
          </p>
        </div>
      {/if}
    </aside>
  </div>
</section>
