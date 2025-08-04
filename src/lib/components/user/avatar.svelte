<script lang="ts">
  import type { Profiles } from "../types/profile";

  type ProfileAvatar = Pick<Profiles, "display_name" | "profile_picture">;

  const {
    profile,
    imgSize,
    textSize,
  }: { profile: ProfileAvatar; imgSize: string; textSize: string } = $props();
</script>

{#if profile.profile_picture}
  <img
    src={profile.profile_picture}
    alt="Avatar"
    class="rounded-2xl border-4 border-primary bg-primary {imgSize} object-cover"
  />
{:else}
  <div class="avatar avatar-placeholder">
    <div class="bg-base-300 rounded-2xl border-4 border-primary {imgSize}">
      <span class="uppercase font-clash {textSize}">
        {profile.display_name.charAt(0)}
      </span>
    </div>
  </div>
{/if}
