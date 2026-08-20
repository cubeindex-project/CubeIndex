<script lang="ts">
  import type { Tables } from "$lib/types/database.types";
  import { onMount } from "svelte";

  interface Props {
    profile: Pick<Tables<"profiles">, "display_name" | "profile_picture">;
    imageWidth?: string;
  }

  const { profile, imageWidth = "w-12" }: Props = $props();

  let image: HTMLImageElement | null = $state(null);
  // svelte-ignore state_referenced_locally
  let imageLoaded = $state(Boolean(profile.profile_picture));

  onMount(() => {
    window.addEventListener("load", () => {
      imageLoaded = image?.complete ?? false;
    });
  });
</script>

{#if imageLoaded}
  <div class="avatar">
    <div class="{imageWidth} rounded-2xl">
      <img
        bind:this={image}
        src={profile.profile_picture}
        alt="{profile.display_name}'s Avatar"
        loading="eager"
        onerror={() => (imageLoaded = false)}
      />
    </div>
  </div>
{:else}
  <div class="avatar avatar-placeholder">
    <div class="bg-neutral text-neutral-content {imageWidth} rounded-2xl">
      <span class="uppercase font-clash text-3xl">
        {profile.display_name?.charAt(0)}
      </span>
    </div>
  </div>
{/if}
