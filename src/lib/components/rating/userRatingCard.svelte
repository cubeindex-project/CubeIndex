<script lang="ts">
  import StarRating from "./starRating.svelte";
  import { formatDate } from "../helper_functions/formatDate.svelte";
  import { idOfUser } from "../helper_functions/idOfUser";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import type { Profiles } from "../types/profile";
  import RateCube from "./rateCube.svelte";

  const { user_rating, cube, user, showCubeDetails } = $props();

  let popoverId = $state(
    `popover-${user_rating.username}-${user_rating.cube_slug}`
  );

  let profile: Profiles = $state({} as Profiles);
  let helpful_ratings: any[] = $state([]);

  let confDeleteRating = $state(false);
  let editRating = $state(false);

  function toggleDelRating() {
    confDeleteRating = !confDeleteRating;
  }

  function toggleEditRating() {
    editRating = !editRating;
  }

  function onCancel() {
    location.reload();
  }

  let loading = $state(false);
  let success = $state(false);

  async function deleteRating() {
    loading = true;

    setTimeout(async () => {
      const res = await fetch("/api/rating/delete-rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cube_slug: cube.slug }),
      });
      const data = await res.json();

      if (data.success) {
        loading = false;
        success = true;
        setTimeout(onCancel, 1000);
      } else {
        loading = false;
        alert("Failed: " + data.error);
      }
    }, 1000);
  }

  async function setRatingHelpful() {
    const res = await fetch("/api/rating/helpful-rating", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ratingId: user_rating.id }),
    });
    const data = await res.json();

    if (data.success) {
      onCancel();
    } else {
      alert("Failed: " + data.error);
    }
  }

  $effect(() => {
    const _ = confDeleteRating;
    if (confDeleteRating) {
      setTimeout(toggleDelRating, 2000);
    }
  });

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

    profile = data as Profiles;

    const { data: helpful, error: helpErr } = await supabase
      .from("helpful_cube_rating")
      .select("*")
      .eq("rating", user_rating.id);

    if (helpErr) {
      console.error(500, `Failed to fetch profiles: ${helpErr.message}`);
      return;
    }

    helpful_ratings = helpful;
  });
</script>

<div class="bg-base-200 rounded-xl p-4 border border-base-300 shadow-sm">
  {#if showCubeDetails}
    <img
      src={cube.image_url}
      alt="{cube.series} {cube.model} {cube.version_name}"
      class="w-full h-48 object-cover"
    />
    <a href="/explore/cubes/{cube.slug}">
      <h2 class="text-xl font-bold mb-1">
        {cube.series}
        {cube.model}
        {#if cube.version_type !== "Base"}
          <span class="text-blue-400">{cube.version_name}</span>
        {/if}
      </h2>
    </a>
  {/if}
  <div
    class="flex items-center gap-3 flex-col sm:flex-row"
    class:mb-2={!!user_rating.comment}
  >
    <StarRating readOnly={true} rating={user_rating.rating ?? 0} />

    <span class="text-sm">
      by
      <a href={idOfUser(user_rating.username)} class="underline">
        {user_rating.username}
      </a>
    </span>

    <span class="text-xs ml-auto">
      {formatDate(user_rating.created_at)}
    </span>
    {#if profile.user_id === user?.id}
      <div class="relative">
        <button
          class="btn"
          popovertarget={popoverId}
          style="anchor-name:--anchor-{popoverId}"
          aria-label="User Menu"
        >
          <i class="fa-solid fa-ellipsis-vertical"></i>
        </button>
        <ul
          class="dropdown dropdown-end menu w-auto rounded-box bg-base-100 shadow-sm mt-2 overflow-visible"
          popover
          id={popoverId}
          style="position-anchor:--anchor-{popoverId}"
        >
          <div class="relative flex-col flex gap-1">
            <button class="btn-info btn" onclick={toggleEditRating}>
              <i class="fa-solid fa-pencil"></i>
              <span class="hidden sm:block">Edit</span>
            </button>
            <div>
              {#if !confDeleteRating}
                <button class="btn btn-error" onclick={toggleDelRating}>
                  <i class="fa-solid fa-trash sm:mr-2"></i>
                  <span class="hidden sm:block">Delete</span>
                </button>
              {:else}
                <button
                  class="btn btn-error"
                  onclick={() => {
                    deleteRating();
                  }}
                  disabled={loading || success}
                >
                  <span class="hidden sm:block">
                    {#if loading}
                      <span class="loading loading-spinner"></span>
                      Deleting...
                    {:else if success}
                      <i class="fa-solid fa-check"></i>
                      Deleted!
                    {:else}
                      <i class="fa-solid fa-trash sm:mr-2"></i>
                      Are you sure ?
                    {/if}
                  </span>
                </button>
              {/if}
            </div>
          </div>
        </ul>
      </div>
    {/if}
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

  {#if helpful_ratings.length > 0}
    <p class="mt-5">
      {helpful_ratings.length} user{helpful_ratings.length === 1 ? "" : "s"} find{helpful_ratings.length ===
      1
        ? ""
        : "s"}
      this helpful
    </p>
  {/if}

  <div class="flex flex-row">
    <button
      class="link link-success link-hover mt-3"
      onclick={setRatingHelpful}
    >
      <i class="fa-solid fa-thumbs-up"></i>
      <span>Helpful</span>
    </button>
    <div class="divider-vertical mx-3 divider-primary"></div>
    <button class="link link-error link-hover mt-3">
      <i class="fa-solid fa-flag"></i>
      <span>Report</span>
    </button>
  </div>
</div>

{#if editRating}
  <RateCube
    onCancel={() => (editRating = !editRating)}
    isConnected={user}
    {cube}
    rating={user_rating.rating}
    comment={user_rating.comment}
  />
{/if}
