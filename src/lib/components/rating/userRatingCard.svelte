<script lang="ts">
  import { m } from "$lib/paraglide/messages";
  import StarRating from "./starRating.svelte";
  import { formatDate } from "../helper_functions/formatDate.svelte";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import RateCube from "./rateCube.svelte";
  import Report from "../report/report.svelte";

  const { user_rating, cube, isAuthor, showCubeDetails } = $props();

  let popoverId = $state(
    `popover-${user_rating.username}-${user_rating.cube_slug}`
  );

  let helpful_ratings: any[] = $state([]);

  let confDeleteRating = $state(false);
  let editRating = $state(false);
  let openReport = $state(false);

  function toggleDelRating() {
    confDeleteRating = !confDeleteRating;
  }

  function toggleEditRating() {
    editRating = !editRating;
  }

  function toggleOpenReport() {
    openReport = !openReport;
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
    const _ = confDeleteRating;
    if (confDeleteRating) {
      setTimeout(toggleDelRating, 2000);
    }
  });

  // local state for toggling
  let showFull = $state(false);
  const maxCommentLength = 300;
  const imageAlt = $derived(
    m.rating_cube_image_alt_text({
      series: cube.series,
      model: cube.model,
      versionName: cube.version_name ?? "",
    })
  );

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
        alt={imageAlt}
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
        {m.rating_by_label()}
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
              aria-label={m.rating_user_menu_aria()}
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
                  onclick={toggleEditRating}
                >
                  <i class="fa-solid fa-pencil"></i>
                  {m.rating_edit_cta()}
                </button>
                <div>
                  {#if !confDeleteRating}
                    <button
                      class="btn btn-error btn-ghost"
                      onclick={toggleDelRating}
                    >
                      <i class="fa-solid fa-trash sm:mr-2"></i>
                      {m.rating_delete_cta()}
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
                        {m.rating_delete_loading_text()}
                      {:else if success}
                        <i class="fa-solid fa-check"></i>
                        {m.rating_delete_success_text()}
                      {:else}
                        <i class="fa-solid fa-trash sm:mr-2"></i>
                        {m.rating_delete_confirm_text()}
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
      {user_rating.comment.length > maxCommentLength && !showFull
        ? user_rating.comment.slice(0, maxCommentLength) + "…"
        : user_rating.comment}
      {#if user_rating.comment.length > maxCommentLength}
        <button
          class="link-primary link-hover cursor-pointer"
          onclick={() => (showFull = !showFull)}
          aria-label={showFull
            ? m.rating_comment_show_less_aria()
            : m.rating_comment_show_more_aria()}
        >
          {showFull ? m.rating_show_less_label() : m.rating_show_more_label()}
        </button>
      {/if}
    </p>
  {/if}

  {#if helpful_ratings.length > 0}
    <p class="mt-5">
      {m.rating_helpful_count_text({ count: helpful_ratings.length })}
    </p>
  {/if}

  {#if !isAuthor}
    <div class="flex flex-row">
      <button
        class="link link-success link-hover mt-3"
        onclick={setRatingHelpful}
      >
        <i class="fa-solid fa-thumbs-up"></i>
        <span>{m.rating_helpful_cta()}</span>
      </button>
      <div class="divider-vertical mx-3 divider-primary"></div>
      <button
        class="link link-error link-hover mt-3"
        onclick={toggleOpenReport}
      >
        <i class="fa-solid fa-flag"></i>
        <span>{m.rating_report_cta()}</span>
      </button>
    </div>
  {/if}
</div>

{#if editRating}
  <RateCube
    onCancel={() => (editRating = !editRating)}
    {cube}
    rating={user_rating.rating}
    comment={user_rating.comment}
  />
{/if}

{#if openReport}
  <Report
    onCancel={() => (openReport = !openReport)}
    reportType="cube-rating"
    reported={user_rating.id}
    reporLabel={m.rating_report_label_text({
      name: user_rating.profile.display_name,
      series: cube.series,
      model: cube.model,
      versionName: cube.version_name ?? "",
    })}
  />
{/if}
