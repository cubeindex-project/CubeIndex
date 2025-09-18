<script lang="ts">
  import { onMount } from "svelte";
  import { blur } from "svelte/transition";
  import { getContext } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import Portal from "../misc/portal.svelte";

  let {
    reason,
    onCancel,
    cube_id,
    cube_name,
    existingNote = "",
  }: {
    reason: "Accept" | "Reject" | "Edit";
    onCancel: () => void;
    cube_id: number;
    cube_name: string;
    existingNote?: string;
  } = $props();

  const presetReasons = new Set([
    "Not a twisty puzzle",
    "Already in the database",
    "Not a valid trim",
  ]);

  let note: string = $state("Not a twisty puzzle");
  let otherNote: string = $state("");
  let isSubmitting: boolean = $state(false);
  let showSuccess: boolean = $state(false);
  let formMessage: string = $state("");
  let username: string = $state("");

  const getUser = getContext<{ id: string }>("user");
  const user = getUser;

  onMount(async () => {
    if (existingNote) {
      if (presetReasons.has(existingNote)) {
        note = existingNote;
      } else {
        note = "___other";
        otherNote = existingNote;
      }
    }

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

<Portal>
  <div
    class="fixed inset-0 bg-base-300/60 backdrop-blur-md flex items-center justify-center z-50"
    transition:blur
  >
    <form
      class="card w-full max-w-lg bg-base-100/80 backdrop-blur-3xl p-6"
      onsubmit={changeStatus}
    >
      <h2 class="card-title">
        You are {reason.toLowerCase()}ing: {cube_name} as {username}
      </h2>

      {#if reason !== "Accept"}
        <div class="mt-4">
          <label class="label flex flex-col items-start">
            <span class="label-text">Reason</span>
            <select
              name="brand"
              bind:value={note}
              class="select select-lg w-full mb-2"
              required
            >
              <option value="Not a twisty puzzle" selected>
                Not a twisty puzzle
              </option>
              <option value="Already in the database">
                Already in the database
              </option>
              <option value="Not a valid trim">Not a valid trim</option>
              <option value="___other">Other...</option>
            </select>
            {#if note === "___other"}
              <span class="label-text">Other reason</span>
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
          Cancel
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          disabled={isSubmitting || showSuccess}
        >
          {#if isSubmitting}
            <span class="loading loading-spinner"></span>{reason}ing...
          {:else if showSuccess}
            <i class="fa-solid fa-check mr-2"></i>{reason}ed!
          {:else}
            {reason}
          {/if}
        </button>
      </div>
    </form>
  </div>
</Portal>
