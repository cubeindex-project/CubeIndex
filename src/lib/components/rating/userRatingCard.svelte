<script lang="ts">
  import StarRating from "./starRating.svelte";
  import DeleteCubeRating from "./deleteCubeRating.svelte";
  import { formatDate } from "../helper_functions/formatDate.svelte";
  import { idOfUser } from "../helper_functions/idOfUser";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import type { Profiles } from "../types/profile";

  const { id, user_rating, cube_slug, user } = $props();

  let profileId: Profiles = $state({} as Profiles);

  let openDeleteRating = $state(false);
  function toggleDelRating() {
    openDeleteRating = !openDeleteRating;
  }

  // local state for toggling
  let showFull = $state(false);
  const maxCommentLength = 300;

  onMount(async () => {
    const { data, error: pErr } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("username", user_rating.username)
      .single();

    if (pErr) {
      console.error(500, `Failed to fetch profiles: ${pErr.message}`);
      return;
    }

    profileId = data as Profiles;
  });
</script>

<div class="bg-base-200 rounded-xl p-4 border border-base-300 shadow-sm">
  <div
    class="flex items-center gap-3 flex-col sm:flex-row"
    class:mb-2={!!user_rating.comment}
  >
    <StarRating readOnly={true} score={user_rating.rating ?? 0} />

    <span class="text-sm">
      by
      <a href={idOfUser(user_rating.username)} class="underline">
        {user_rating.username}
      </a>
    </span>

    <span class="text-xs ml-auto">
      {formatDate(user_rating.created_at)}
    </span>

    <div class="relative">
      <button
        class="btn"
        popovertarget="popover-{id}"
        style="anchor-name:--anchor-{id}"
        aria-label="User Menu"
      >
        <i class="fa-solid fa-ellipsis-vertical"></i>
      </button>
      <ul
        class="dropdown dropdown-end menu w-auto rounded-box bg-base-100 shadow-sm mt-2 overflow-visible"
        popover
        id="popover-{id}"
        style="position-anchor:--anchor-{id}"
      >
        {#if profileId.user_id === user?.id}
          <div class="relative flex-col flex gap-1">
            <button class="btn-info btn" onclick={() => alert("Hello World")}>
              <i class="fa-solid fa-pencil"></i>
              <span class="hidden sm:block">Edit</span>
            </button>
            <div>
              <button class="btn btn-error" onclick={toggleDelRating}>
                <i class="fa-solid fa-trash sm:mr-2"></i>
                <span class="hidden sm:block">Delete</span>
              </button>
              {#if openDeleteRating}
                <DeleteCubeRating {cube_slug} onCancel={toggleDelRating} />
              {/if}
            </div>
          </div>
        {:else}
          <button class="btn btn-error hidden md:flex" disabled>
            <i class="fa-solid fa-flag"></i>
            <span>Report</span>
          </button>
        {/if}
      </ul>
    </div>
  </div>
  {#if user_rating.comment}
    <p class="mt-2 text-sm leading-relaxed">
      {user_rating.comment.length > maxCommentLength && !showFull
        ? user_rating.comment.slice(0, maxCommentLength) + "…"
        : user_rating.comment}
      {#if user_rating.comment.length > maxCommentLength}
        <button
          class="link-primary link-hover cursor-pointer"
          onclick={() => (showFull = !showFull)}
          aria-label={showFull
            ? "Show less of comment"
            : "Show more of comment"}
        >
          {showFull ? "Show less" : "Show more"}
        </button>
      {/if}
    </p>
  {/if}
</div>
