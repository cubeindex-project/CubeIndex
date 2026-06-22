<script lang="ts">
  import StarRating from "./starRating.svelte";
  import { formatDate } from "../helper_functions/formatDate";
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { resolve } from "$app/paths";
  import type { Tables } from "$lib/types/database.types";

  const supabase = page.data.supabase;

  interface Props {
    user_rating: Omit<Tables<"user_cube_ratings">, "user_id"> & {
      user_id: Pick<Tables<"profiles">, "display_name" | "username">;
    };
    cube: Tables<"v_detailed_cube_models">;
  }

  const { user_rating, cube }: Props = $props();

  let helpful_ratings: (Omit<Tables<"helpful_rating">, "user_id"> & {
    user_id: Pick<Tables<"profiles">, "display_name" | "username">;
  })[] = $state([]);

  let confDeleteRating = $state(false);

  function toggleDelRating() {
    confDeleteRating = !confDeleteRating;
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
        body: JSON.stringify({
          cube_slug: cube.slug,
          user_id: user_rating.user_id,
        }),
      });
      const data = await res.json();

      if (data.success) {
        loading = false;
        success = true;
        setTimeout(() => {
          onCancel();
          location.reload();
        }, 1000);
      } else {
        loading = false;
        new Error("Failed: " + data.error);
      }
    }, 1000);
  }

  $effect(() => {
    if (confDeleteRating) {
      setTimeout(toggleDelRating, 2000);
    }
  });

  // local state for toggling
  let showFull = $state(false);
  const maxCommentLength = 300;

  onMount(async () => {
    const { data: helpful, error: helpErr } = await supabase
      .from("helpful_rating")
      .select("*, user_id(*)")
      .eq("rating", user_rating.id);

    if (helpErr) {
      throw new Error(`500, Failed to fetch profiles: ${helpErr.message}`);
    }

    helpful_ratings = helpful;
  });
</script>

<div class="bg-base-200 rounded-xl p-4 border border-base-300 shadow-sm">
  <a href={resolve("/(public)/explore/cubes/[slug]", { slug: cube.slug })}>
    <h2 class="text-xl font-bold mb-1">
      {cube.series}
      {cube.model}
      {#if cube.version_type !== "Base"}
        <span class="text-blue-400">{cube.version_name}</span>
      {/if}
    </h2>
  </a>
  <div
    class="flex items-center gap-3 flex-col sm:flex-row"
    class:mb-2={!!user_rating.comment}
  >
    <StarRating readOnly={true} rating={user_rating.rating ?? 0} />

    <span class="text-sm">
      by
      {#if user_rating.user_id.display_name && user_rating.user_id.username}
        <a
          href={resolve("/(public)/user/[username]", {
            username: user_rating.user_id.username,
          })}
          class="underline"
        >
          {user_rating.user_id.display_name}
        </a>
      {/if}
    </span>

    <span class="text-xs ml-auto">
      {formatDate(user_rating.created_at)}
    </span>
    <div class="relative">
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
      this helpful :
    </p>
    {#each helpful_ratings as hr, index (index)}
      {#if hr.user_id.display_name && hr.user_id.username}
        <a
          href={resolve("/(public)/user/[username]", {
            username: hr.user_id.username,
          })}
        >
          {hr.user_id.display_name}
        </a>
      {/if}
    {/each}
  {/if}
</div>
