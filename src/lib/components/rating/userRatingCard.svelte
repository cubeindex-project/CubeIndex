<script lang="ts">
  import StarRating from "./starRating.svelte";
  import { formatDate } from "../helper_functions/formatDate.svelte";
  import { onMount } from "svelte";
  import RateCube from "./rateCube.svelte";
  import Report from "../report/report.svelte";
  import { page } from "$app/state";

  const MAX_COMMENT_LENGTH = 300;

  const { user_rating, cube, isAuthor, showCubeDetails } = $props();

  const supabase = page.data.supabase;
  const popoverId = $derived(
    `popover-${user_rating.username}-${user_rating.cube_slug}`,
  );

  let showFullComment = $state(false);

  let loading = $state(false);
  let success = $state(false);

  let helpful_ratings: any[] = $state([]);

  let isConfirmingDelete = $state(false);
  let isEditingRating = $state(false);
  let isReporting = $state(false);

  function toggleDeletingRating() {
    isConfirmingDelete = !isConfirmingDelete;
  }

  function toggleEditingRating() {
    isEditingRating = !isEditingRating;
  }

  function toggleReporting() {
    isReporting = !isReporting;
  }

  function onCancel() {
    location.reload();
  }

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
        new Error("Failed: " + data.error);
      }
    }, 1000);
  }

  async function setRatingHelpful() {
    const res = await fetch("/api/rating/helpful-rating", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ratingId: user_rating.id,
        rating_category: "cube",
      }),
    });
    const data = await res.json();

    if (data.success) {
      onCancel();
    } else {
      new Error("Failed: " + data.error);
    }
  }

  $effect(() => {
    const _ = isConfirmingDelete;
    if (isConfirmingDelete) {
      setTimeout(toggleDeletingRating, 2000);
    }
  });

  onMount(async () => {
    const { data: helpful, error: helpErr } = await supabase
      .from("helpful_rating")
      .select("*")
      .eq("rating", user_rating.id);

    if (helpErr) {
      throw new Error(`500, Failed to fetch profiles: ${helpErr.message}`);
    }

    helpful_ratings = helpful;
  });
</script>

<div class="bg-base-200 rounded-xl p-4 border border-base-300 shadow-sm">
  {#if showCubeDetails}
    <div class="flex flex-row items-center gap-4 mb-4">
      <img
        src="https://res.cloudinary.com/dc7wdwv4h/image/fetch/f_webp,fl_lossy,q_auto,h_96/{cube.image_url}"
        alt="{cube.series} {cube.model} {cube.version_name}"
        class="size-24 object-cover rounded-2xl"
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
    </div>
  {/if}
  <div
    class="flex items-center gap-3 flex-col sm:flex-row"
    class:mb-2={!!user_rating.comment}
  >
    <div class="flex justify-start w-full sm:w-fit">
      <StarRating readOnly={true} rating={user_rating.rating ?? 0} />
    </div>

    <div class="flex flex-row justify-between items-center flex-1 w-full">
      <span class="text-sm justify-start flex gap-1 flex-1">
        by
        <a href="/user/{user_rating.profile.username}" class="underline">
          {user_rating.profile.display_name}
        </a>
      </span>

      <div class="flex flex-row items-center flex-1 justify-end">
        <span class="text-xs ml-auto">
          {formatDate(user_rating.created_at)}
        </span>
        {#if isAuthor}
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
                <button
                  class="btn-info btn btn-ghost"
                  onclick={toggleEditingRating}
                >
                  <i class="fa-solid fa-pencil"></i>
                  Edit
                </button>
                <div>
                  {#if !isConfirmingDelete}
                    <button
                      class="btn btn-error btn-ghost"
                      onclick={toggleDeletingRating}
                    >
                      <i class="fa-solid fa-trash sm:mr-2"></i>
                      Delete
                    </button>
                  {:else}
                    <button
                      class="btn btn-error"
                      onclick={() => {
                        deleteRating();
                      }}
                      disabled={loading || success}
                    >
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
                    </button>
                  {/if}
                </div>
              </div>
            </ul>
          </div>
        {/if}
      </div>
    </div>
  </div>
  {#if user_rating.comment}
    <p class="mt-2 text-sm leading-relaxed">
      {user_rating.comment.length > MAX_COMMENT_LENGTH && !showFullComment
        ? user_rating.comment.slice(0, MAX_COMMENT_LENGTH) + "…"
        : user_rating.comment}
      {#if user_rating.comment.length > MAX_COMMENT_LENGTH}
        <button
          class="link-primary link-hover cursor-pointer"
          onclick={() => (showFullComment = !showFullComment)}
          aria-label={showFullComment
            ? "Show less of comment"
            : "Show more of comment"}
        >
          {showFullComment ? "Show less" : "Show more"}
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

  {#if !isAuthor}
    <div class="flex flex-row">
      <button
        class="link link-success link-hover mt-3"
        onclick={setRatingHelpful}
      >
        <i class="fa-solid fa-thumbs-up"></i>
        <span>Helpful</span>
      </button>
      <div class="divider-vertical mx-3 divider-primary"></div>
      <button class="link link-error link-hover mt-3" onclick={toggleReporting}>
        <i class="fa-solid fa-flag"></i>
        <span>Report</span>
      </button>
    </div>
  {/if}
</div>

{#if isEditingRating}
  <RateCube
    onCancel={() => (isEditingRating = !isEditingRating)}
    {cube}
    rating={user_rating.rating}
    comment={user_rating.comment}
  />
{/if}

{#if isReporting}
  <Report
    onCancel={() => (isReporting = !isReporting)}
    reportType="cube-rating"
    reported={user_rating.id}
    reporLabel="{user_rating.profile
      .display_name}'s comment on the {cube.series} {cube.model} {cube.version_name}"
  />
{/if}
