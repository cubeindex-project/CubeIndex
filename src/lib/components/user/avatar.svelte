<script lang="ts">
  import type { Profiles } from "../types/profile";

  const { profile, size }: { profile: Profiles; size: "sm" | "md" | "lg" } =
    $props();
</script>

{#if profile.profile_picture}
  <img
    src={profile.profile_picture}
    alt="Avatar"
    class="rounded-2xl border-4 border-primary bg-black object-cover transition-transform duration-200
    {size === 'lg'
      ? 'size-32 sm:size-64'
      : size === 'md'
        ? 'size-24 sm:size-24'
        : 'size-14 sm:size-14'}"
  />
{:else}
  <div class="avatar avatar-placeholder">
    <div
      class="bg-base-300 rounded-2xl border-4 border-primary
      {size === 'lg'
        ? 'size-32 sm:size-64'
        : size === 'md'
          ? 'size-24 sm:size-24'
          : 'size-14 sm:size-14'}"
    >
      <span
        class="{size === 'lg'
          ? 'text-9xl'
          : size === 'md'
            ? 'text-6xl'
            : 'text-2xl'} uppercase font-clash"
      >
        {profile.username.charAt(0)}
      </span>
    </div>
  </div>
{/if}
