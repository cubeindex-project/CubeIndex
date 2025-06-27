<script lang="ts">
  import CubeVersionType from "./cubeVersionType.svelte";
  import { supabase } from "$lib/supabaseClient";
  import { m } from "$lib/paraglide/messages";

  let { cube, user_details = [], image } = $props();

  let isSubmitting = $state(false);
  let showSuccess = $state(false);
  let message = $state("");

  $effect(() => {
    if (showSuccess) location.reload();
  });

  const user_details_cube = user_details.filter((ud) => ud.cube === cube.slug);

  let username = $state(user_details_cube[0].username);
  let slug = $state(user_details_cube[0].cube);
  let quantity = $state(user_details_cube[0].quantity);
  let condition = $state(user_details_cube[0].condition);
  let main = $state(user_details_cube[0].main);
  let status = $state(user_details_cube[0].status);
  let notes = $state(user_details_cube[0].notes);
  let acquired_at = $state(user_details_cube[0].acquired_date);

  async function update() {
    isSubmitting = true;
    const payload = {
      quantity,
      condition,
      main,
      status,
      notes,
      acquired_at,
    };

    const { error: err } = await supabase
      .from("user_cubes")
      .update(payload)
      .eq("username", username)
      .eq("cube", slug)
      .select();

    if (err) {
      message = err.message;
      isSubmitting = false;
      return;
    }

    isSubmitting = false;
    showSuccess = true;
  }

  async function remove() {
    const { error: err } = await supabase
      .from("user_cubes")
      .delete()
      .eq("username", username)
      .eq("cube", slug);

    if (err) {
      message = err.message;
      return;
    }

    location.reload();
  }
</script>

<div
  class="bg-base-200 border border-base-300 rounded-2xl overflow-hidden transition flex flex-col"
>
  <div class="flex justify-end">
    <button
      class="absolute bg-error rounded-bl-2xl flex items-center justify-center text-primary-content p-2 gap-2 cursor-pointer"
      onclick={remove}
    >
      <i class="fa-solid fa-trash"></i>
      {m.remove()}
    </button>
  </div>
  {#if image}
    <img
      src={cube.image_url}
      alt={cube.name}
      class="w-full h-48 object-cover"
    />
  {/if}
  <div class="p-5 flex-1 flex flex-col w-full">
    <h2 class="text-xl font-bold mb-1 items-center">
      {cube.series}
      {cube.model}
      {#if cube.version_type !== "Base"}
        <span class="text-secondary">{cube.version_name}</span>
      {/if}
      <CubeVersionType {cube} moreInfo={false} />
    </h2>
    <p class="text-sm">
      {cube.type} ・ {cube.brand}
    </p>
    <div class="mt-4 flex gap-2">
      <div>
        <label class="flex flex-col">
          <span class="font-bold">{m.quantity()}</span>
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
        <p>
          <label class="flex flex-col">
          <span class="font-bold">{m.condition()}</span>
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
        </p>
        <p>
          <label class="flex flex-col">
            <span class="font-bold">{m.status()}</span>
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
        </p>
        <label class="flex flex-col">
          <span class="font-bold">{m.notes()}</span>
          <textarea
            name="notes"
            placeholder={m.any_special_notes()}
            bind:value={notes}
            class="textarea textarea-bordered rounded-2xl w-full max-h-50"
          ></textarea>
        </label>
        <p>
          <label class="flex flex-col">
            <span class="font-bold">{m.acquired_date()}</span>
            <input
              name="acquiredAt"
              type="date"
              bind:value={acquired_at}
              class="input input-bordered w-full"
            />
          </label>
        </p>
      </div>
    </div>
    <button
      class="btn btn-primary mt-4 items-center"
      onclick={update}
      disabled={isSubmitting || showSuccess}
    >
      {#if isSubmitting}
        <span class="loading loading-spinner"></span>
        {m.editing()}
      {:else if showSuccess}
        <i class="fa-solid fa-check"></i>
        {m.edited()}
      {:else}
        <i class="fa-solid fa-floppy-disk"></i>
        {m.save()}
      {/if}
    </button>

    {#if message.length > 0}
      <p class="p-2 text-center">{message}</p>
    {/if}
  </div>
</div>
