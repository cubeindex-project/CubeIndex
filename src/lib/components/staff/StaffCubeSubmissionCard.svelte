<script lang="ts">
  import { resolve } from "$app/paths";
  import type { Tables } from "$lib/types/database.types";
  import { formatDate } from "$lib/utils/formatDate";
  import { getSubmissionStatusBadgeColor } from "$lib/utils/getSubmissionStatusBadgeColor";

  interface CubeSubmission extends Tables<"cube_submissions"> {
    submission: Tables<"submissions"> & {
      submitter: Pick<Tables<"profiles">, "display_name"> | null;
    };
  }

  interface Props {
    cubeSubmission: CubeSubmission;
  }

  const { cubeSubmission }: Props = $props();
  const submission = $derived(cubeSubmission.submission);
  const imageURL = $derived(
    `https://res.cloudinary.com/dc7wdwv4h/image/fetch/f_webp,q_auto,w_403/${cubeSubmission.image_url}`,
  );
</script>

<article
  class="card overflow-hidden border border-base-300 bg-base-200 shadow-sm"
>
  <img
    src={imageURL}
    alt={cubeSubmission.name}
    class="h-48 w-full object-cover"
    loading="lazy"
  />
  <div class="card-body gap-4">
    <div class="flex items-start justify-between gap-3">
      <h2 class="card-title min-w-0 truncate" title={cubeSubmission.name}>
        {cubeSubmission.name}
      </h2>
      <span class="badge {getSubmissionStatusBadgeColor(submission.status)}">
        {submission.status}
      </span>
    </div>

    <div class="space-y-2 text-sm text-base-content/70">
      <p class="flex items-center gap-2">
        <i class="fa-solid fa-user" aria-hidden="true"></i>
        Submitted by {submission.submitter?.display_name ?? "Unknown user"}
      </p>
      <p class="flex items-center gap-2">
        <i class="fa-regular fa-calendar" aria-hidden="true"></i>
        {formatDate(submission.submitted_at)}
      </p>
    </div>

    <div class="card-actions mt-auto justify-end">
      <a
        class="btn btn-primary btn-sm"
        href={resolve("/(admin)/staff/cubes/review/[slug]", {
          slug: String(submission.id),
        })}
      >
        <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
        Review
      </a>
    </div>
  </div>
</article>
