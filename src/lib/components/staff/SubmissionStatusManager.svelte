<script lang="ts">
  import Modal from "../ui/Modal.svelte";
  import type { Enums } from "$lib/types/database.types";
  import { enhance } from "$app/forms";
  import type { SubmitFunction } from "@sveltejs/kit";

  interface Props {
    submission: { id: number; name: string };
    entityLabel: string;
  }

  let { submission, entityLabel }: Props = $props();

  let isUpdatingStatus = $state(false);
  let status: Exclude<Enums<"submission_status">, "Pending"> | null =
    $state(null);

  let note: string = $state("");
  let isSubmitting: boolean = $state(false);
  let showSuccess: boolean = $state(false);
  let formMessage: string = $state("");

  const actionNoun = $derived(status === "Rejected" ? "Reject" : "Approve");
  const actionVerb = $derived(
    status === "Rejected" ? "Rejecting" : "Approving",
  );
  const actionAdjective = $derived(
    status === "Rejected" ? "Rejected" : "Approved",
  );

  function openStatusModal(
    nextStatus: Exclude<Enums<"submission_status">, "Pending">,
  ) {
    status = nextStatus;
    note = entityLabel === "cube" ? "Not a twisty puzzle" : "";
    formMessage = "";
    showSuccess = false;
    isUpdatingStatus = true;
  }

  const enhanceStatusForm: SubmitFunction = () => {
    isSubmitting = true;
    showSuccess = false;
    formMessage = "";

    return async ({ result, update }) => {
      try {
        if (result.type === "failure") {
          formMessage =
            result.data?.form?.message ??
            result.data?.form?.errors?._errors?.[0] ??
            result.data?.message ??
            `Unable to update the ${entityLabel} status.`;
          await update({ reset: false, invalidateAll: false });
          return;
        }

        if (result.type === "error") {
          formMessage =
            result.error?.message ??
            `Unable to update the ${entityLabel} status.`;
          await update({ reset: false, invalidateAll: false });
          return;
        }

        if (result.type === "success") {
          showSuccess = true;
        }

        await update({ reset: false });
      } finally {
        isSubmitting = false;
      }
    };
  };
</script>

<div class="flex gap-2">
  <button
    class="btn btn-success flex-1"
    type="button"
    onclick={() => openStatusModal("Approved")}
  >
    <i class="fa-solid fa-check mr-2"></i>Accept
  </button>
  <button
    class="btn btn-error flex-1"
    type="button"
    onclick={() => openStatusModal("Rejected")}
  >
    <i class="fa-solid fa-xmark mr-2"></i>Reject
  </button>
</div>

<Modal
  bind:open={isUpdatingStatus}
  title="You are {actionVerb.toLowerCase()}: {submission.name}"
>
  <form class="w-full" method="POST" use:enhance={enhanceStatusForm}>
    <input type="hidden" name="ID" value={submission.id} />
    <input type="hidden" name="status" value={status ?? ""} />

    {#if status === "Rejected"}
      <fieldset class="fieldset w-full">
        <span class="fieldset-legend">Reason</span>
        <textarea
          bind:value={note}
          class="textarea textarea-bordered w-full rounded-2xl h-32 max-h-64 mt-3"
          name="staffNote"
          required></textarea>
      </fieldset>
    {/if}

    {#if formMessage}
      <p class="text-error mt-2" role="alert" aria-live="assertive">
        {formMessage}
      </p>
    {/if}

    <div class="mt-6 flex justify-end">
      <button
        type="submit"
        class="btn btn-primary"
        disabled={isSubmitting || showSuccess}
      >
        {#if isSubmitting}
          <span class="loading loading-spinner"></span>{actionVerb}...
        {:else if showSuccess}
          <i class="fa-solid fa-check mr-2"></i>{actionAdjective}!
        {:else}
          {actionNoun}
        {/if}
      </button>
    </div>
  </form>
</Modal>
