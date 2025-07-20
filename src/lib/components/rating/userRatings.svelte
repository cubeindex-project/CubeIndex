<script lang="ts">
  import UserRatingCard from "./userRatingCard.svelte";
  import RateCube from "./rateCube.svelte";
  import type { User } from "@supabase/supabase-js";
  import { getContext } from "svelte";
  const { user_ratings, cube } = $props();
  const user = getContext<User>("user");
  let openRateCard = $state(false);
</script>

<div class="mb-8">
  <div class="flex flex-row justify-between w-full mb-5 items-center">
    <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
      <i class="fa-solid fa-star"></i>
      User Ratings
    </h2>
    <button
      class="btn btn-accent"
      type="button"
      onclick={() => {
        openRateCard = !openRateCard;
      }}
      aria-label="Rate this Cube"
    >
      <i class="fa-solid fa-star mr-2"></i>
      Rate
      <p class="hidden sm:block">this Cube</p>
    </button>
  </div>

  {#if user_ratings?.length}
    <div class="flex flex-col gap-4">
      {#each user_ratings as user_rating, id}
        <UserRatingCard {id} {user_rating} cube_slug={cube.slug} {user} />
      {/each}
    </div>
  {:else}
    <div class="text-center italic text-gray-500">
      No user ratings yet. Be the first to rate this cube!
    </div>
  {/if}
</div>

{#if openRateCard}
  <RateCube
    onCancel={() => {
      openRateCard = !openRateCard;
    }}
    {cube}
    isConnected={user}
  />
{/if}
