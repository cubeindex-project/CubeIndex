<!-- manageCubeStatus.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { blur } from "svelte/transition";
  import { getContext } from "svelte";
  import { supabase } from "$lib/supabaseClient";

  // all props in one destructure, with default for existingNote
  let {
    reason,
    onCancel,
    cube_id,
    cube_name,
    existingNote = "",
  } = $props<{
    reason: "Accept" | "Reject" | "Edit";
    onCancel: () => void;
    cube_id: string;
    cube_name: string;
    existingNote?: string;
  }>();

  // initialize note from existingNote
  let note = $state(existingNote);
  let isSubmitting = $state(false);
  let showSuccess = $state(false);
  let formMessage = $state("");
  let username = $state("");

  const getUser = getContext<() => { id: string }>("user");
  const user = getUser();

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
    const payload: any = {
      cube_id,
      status: reason === "Accept" ? "Approved" : "Rejected",
    };
    if (reason !== "Accept") payload.reason = note;

    try {
      const res = await fetch("/api/update-cube-status", {
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
      window.location.reload();
    }
  }
</script>

<div
  class="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50"
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
        <label class="label">
          <span class="label-text">Reason</span>
          <textarea
            bind:value={note}
            class="textarea textarea-bordered rounded-2xl w-full h-32"
            required
          ></textarea>
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
