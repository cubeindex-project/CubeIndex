<script lang="ts">
  import { m } from "$lib/paraglide/messages";
  import { onMount } from "svelte";
  import { blur } from "svelte/transition";
  import { supabase } from "$lib/supabaseClient";
  import { error } from "@sveltejs/kit";
  import { getContext } from "svelte";
  import { enhance } from "$app/forms";

  let { onCancel, cube } = $props();

  let username: string = $state("");
  let isSubmitting = $state(false);
  let showSuccess = $state(false);
  let formMessage = $state("");

  const getUser = getContext<() => { id: any }>("user");
  let user = getUser();

  onMount(async () => {
    const { data: profiles, error: profileErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user?.id);

    if (profileErr) throw error(500, profileErr.message);
    username = profiles[0].username;
    return { username };
  });

  let slug = $derived(cube.slug);
  let quantity = $state(1);
  let condition = $state("");
  let main = $state(false);
  let status = $state("");
  let notes = $state("");
  let acquired_at = $state();
</script>

<div
  class="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50"
  transition:blur
>
  <form
    method="POST"
    class="card w-full max-w-lg transform -translate-y-17 absolute z-50 backdrop-blur-3xl bg-base-100/80 backdrop-opacity-100"
    use:enhance={() => {
      isSubmitting = true;
      formMessage = "";
      return async ({ result, update }) => {
        isSubmitting = false;
        await update();
        if (result.type === "success") {
          showSuccess = true;
          setTimeout(() => {
            onCancel();
          }, 1000);
        }
      };
    }}
  >
    <div class="card-body">
      <h2 class="card-title">
        {m.you_are_adding({
          cube_name: `${cube.series} ${cube.model} ${cube.version_name}`,
          username: username ? username : "Unknown",
        })}
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="username"
          bind:value={username}
          class="input"
          hidden
        />
        <input type="text" name="slug" bind:value={slug} class="input" hidden />
        <!-- Quantity -->
        <label class="flex flex-col">
          <span class="label-text">{m.quantity()}</span>
          <input
            name="quantity"
            type="number"
            min="1"
            max="999"
            bind:value={quantity}
            class="input w-full"
            required
          />
        </label>
        <!-- Main cube toggle -->
        <label class="flex items-center space-x-2 mt-6">
          <input
            type="checkbox"
            name="main"
            bind:checked={main}
            class="checkbox bg-base-100"
          />
          <span>{m.main_cube()}</span>
        </label>
        <!-- Condition -->
        <label class="flex flex-col">
          <span class="label-text">{m.condition()}</span>
          <select
            name="condition"
            bind:value={condition}
            class="select w-full"
            required
          >
            <option value="New in box">{m.condition_new_in_box()}</option>
            <option value="New">{m.condition_new()}</option>
            <option value="Good">{m.condition_good()}</option>
            <option value="Fair">{m.condition_fair()}</option>
            <option value="Worn">{m.condition_worn()}</option>
            <option value="Poor">{m.condition_poor()}</option>
            <option value="Broken">{m.condition_broken()}</option>
          </select>
        </label>
        <!-- Status -->
        <label class="flex flex-col">
          <span class="label-text">{m.status()}</span>
          <select
            name="status"
            bind:value={status}
            class="select w-full"
            required
          >
            <option value="Owned">{m.status_owned()}</option>
            <option value="Wishlist">{m.status_wishlist()}</option>
            <option value="Loaned">{m.status_loaned()}</option>
            <option value="Borrowed">{m.status_borrowed()}</option>
            <option value="Lost">{m.status_lost()}</option>
          </select>
        </label>
      </div>

      <!-- Full-width fields -->
      <div class="mt-4 space-y-4">
        <label class="flex flex-col">
          <span class="label-text">{m.notes()}</span>
          <textarea
            name="notes"
            placeholder="Any special notes..."
            bind:value={notes}
            class="textarea textarea-bordered rounded-2xl w-full max-h-50"
          ></textarea>
        </label>
        <label class="flex flex-col">
          <span class="label-text">{m.acquired_the()}</span>
          <input
            name="acquiredAt"
            type="date"
            bind:value={acquired_at}
            class="input input-bordered w-full"
          />
        </label>
      </div>
    </div>

    <div class="flex justify-between">
      <div class="card-actions p-4">
        <button
          class="btn btn-secondary"
          onclick={onCancel}
          disabled={isSubmitting}>{m.cancel()}</button
        >
      </div>

      <div class="card-actions p-4">
        <button class="btn btn-primary" type="submit" disabled={isSubmitting}>
          {#if isSubmitting}
            <span class="loading loading-spinner"></span>
            {m.adding_cube()}
          {:else if showSuccess}
            <i class="fa-solid fa-check"></i>
            {m.cube_added()}
          {:else}
            {m.add_cube()}
          {/if}
        </button>
      </div>
    </div>
  </form>
</div>
