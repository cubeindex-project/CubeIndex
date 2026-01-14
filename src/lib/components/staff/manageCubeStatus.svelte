<script lang="ts">
  import { m } from "$lib/paraglide/messages";
  import { onMount } from "svelte";
  import { blur } from "svelte/transition";
  import { getContext } from "svelte";
  import { supabase } from "$lib/supabaseClient";

  let {
    reason,
    onCancel,
    cube_id,
    cube_name,
  }: {
    reason: "Accept" | "Reject";
    onCancel: () => void;
    cube_id: number;
    cube_name: string;
  } = $props();

  let note: string = $state("");
  let otherNote: string = $state("");
  let isSubmitting: boolean = $state(false);
  let showSuccess: boolean = $state(false);
  let formMessage: string = $state("");
  let username: string = $state("");

  const getUser = getContext<{ id: string }>("user");
  const user = getUser;

  onMount(async () => {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("username")
      .eq("user_id", user.id)
      .single();

    if (error) {
      formMessage = error.message;
    } else {
      username = profile.username;
    }
  });

  async function changeStatus() {
    isSubmitting = true;
    const payload: {
      cube_id: number;
      status: string;
      notes?: string;
    } = {
      cube_id,
      status: reason === "Accept" ? "Approved" : "Rejected",
    };
    if (reason === "Reject")
      payload.notes = note === "___other" ? otherNote : note;

    try {
      const res = await fetch("/api/staff/update-cube-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess = true;
        onCancel();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      formMessage = err.message;
    } finally {
      isSubmitting = false;
    }
  }
</script>

  <div
    class="fixed inset-0 bg-base-300/60 backdrop-blur-md flex items-center justify-center z-50"
    transition:blur
  >
    <form
      class="card w-full max-w-lg bg-base-100/80 backdrop-blur-3xl p-6"
      onsubmit={changeStatus}
    >
      <h2 class="card-title">
        {m.staff_manage_status_title_text({
          reason,
          cubeName: cube_name,
          username,
        })}
      </h2>

      {#if reason !== "Accept"}
        <div class="mt-4">
          <label class="label flex flex-col items-start">
            <span class="label-text">{m.staff_manage_status_reason_label()}</span>
            <select
              name="brand"
              bind:value={note}
              class="select select-lg w-full mb-2"
              required
            >
              <option value="Not a twisty puzzle" selected>
                {m.staff_manage_status_reason_not_twisty_label()}
              </option>
              <option value="Already in the database">
                {m.staff_manage_status_reason_duplicate_label()}
              </option>
              <option value="Not a valid trim">
                {m.staff_manage_status_reason_invalid_trim_label()}
              </option>
              <option value="___other">
                {m.staff_manage_status_reason_other_label()}
              </option>
            </select>
            {#if note === "___other"}
              <span class="label-text">
                {m.staff_manage_status_other_reason_label()}
              </span>
              <textarea
                bind:value={otherNote}
                class="textarea textarea-bordered rounded-2xl w-full h-32 mt-3"
                required
                transition:blur
              ></textarea>
            {/if}
          </label>
        </div>
      {/if}

      {#if formMessage}
        <p class="text-error mt-2">{formMessage}</p>
      {/if}

      <div class="mt-6 flex justify-end space-x-4">
        <button
          type="button"
          class="btn btn-secondary"
          onclick={onCancel}
          disabled={isSubmitting}
        >
          {m.staff_manage_status_cancel_cta()}
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          disabled={isSubmitting || showSuccess}
        >
          {#if isSubmitting}
            <span class="loading loading-spinner"></span>
            {m.staff_manage_status_submit_loading_text({ reason })}
          {:else if showSuccess}
            <i class="fa-solid fa-check mr-2"></i>
            {m.staff_manage_status_submit_success_text({ reason })}
          {:else}
            {m.staff_manage_status_submit_cta({ reason })}
          {/if}
        </button>
      </div>
    </form>
  </div>
