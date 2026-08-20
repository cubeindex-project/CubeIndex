<script lang="ts">
  import type { Tables } from "$lib/types/database.types";

  interface Props {
    profile: Pick<Tables<"profiles">, "banner" | "username">;
  }

  const { profile }: Props = $props();
</script>

{#if profile.banner}
  <div class="relative h-48 w-full sm:h-72 md:h-80 overflow-hidden">
    <img
      src={profile.banner}
      alt="{profile.username}'s banner"
      fetchpriority="high"
      class="w-full h-full object-cover object-center"
    />
    <div class="absolute inset-0 pointer-events-none"></div>
  </div>
{:else}
  <div
    class="relative w-full h-44 sm:h-56 bg-linear-to-tr from-primary via-secondary to-neutral"
  ></div>
{/if}
