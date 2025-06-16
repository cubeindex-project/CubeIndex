<script lang="ts">
  import { onMount } from "svelte";
  import { blur } from "svelte/transition";
  import { supabase } from "$lib/supabaseClient";
  import { error } from "@sveltejs/kit";
  import { getContext } from "svelte";
  import { enhance } from "$app/forms";

  let { open, slug } = $props();

  let username: string = $state("");

  const form: { message: any } = getContext("form-cubes-add");
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

  let quantity = $state(1);
  let condition = $state("");
  let main = $state(false);
  let status = $state("");
  let notes = $state("");
  let acquired_at = $state();
</script>

{#if open}
  <form
    method="POST"
    class="card w-full max-w-lg transform -translate-y-17 absolute z-50 backdrop-blur-3xl bg-base-100/80 backdrop-opacity-100"
    transition:blur
    use:enhance
  >
    <div class="card-body">
      <h2 class="card-title">➕ Add Cube</h2>
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
          <span class="label-text">Quantity</span>
          <input
            name="quantity"
            type="number"
            min="1"
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
            class="toggle bg-base-100"
          />
          <span>Main Cube</span>
        </label>
        <!-- Condition -->
        <label class="flex flex-col">
          <span class="label-text">Condition</span>
          <select
            name="condition"
            bind:value={condition}
            class="select w-full"
            required
          >
            <option value="New in box">New in box</option>
            <option value="New">New</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Worn">Worn</option>
            <option value="Poor">Poor</option>
            <option value="Broken">Broken</option>
          </select>
        </label>
        <!-- Status -->
        <label class="flex flex-col">
          <span class="label-text">Status</span>
          <select
            name="status"
            bind:value={status}
            class="select w-full"
            required
          >
            <option value="Owned">Owned</option>
            <option value="Wishlist">Wishlist</option>
            <option value="Loaned">Loaned</option>
            <option value="Borrowed">Borrowed</option>
            <option value="Lost">Lost</option>
          </select>
        </label>
      </div>

      <!-- Full-width fields -->
      <div class="mt-4 space-y-4">
        <label class="flex flex-col">
          <span class="label-text">Notes</span>
          <textarea
            name="notes"
            rows="3"
            placeholder="Any special notes..."
            bind:value={notes}
            class="textarea textarea-bordered w-full"
          ></textarea>
        </label>
        <label class="flex flex-col">
          <span class="label-text">Acquired The</span>
          <input
            name="acquiredAt"
            type="date"
            bind:value={acquired_at}
            class="input input-bordered w-full"
          />
        </label>
      </div>
    </div>

    <div class="card-actions justify-end p-4">
      <button class="btn btn-primary" type="submit">Add Cube</button>
    </div>

    {#if form?.message}
      <p class="text-sm text-error mt-2">
        {form.message}
      </p>
    {/if}
  </form>
{/if}
