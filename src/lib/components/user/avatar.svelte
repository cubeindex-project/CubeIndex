<script lang="ts">
  import type { Profiles } from "../dbTableTypes";

  type ProfileAvatar = Pick<Profiles, "display_name" | "profile_picture">;

  const {
    profile,
    imgSize,
    textSize,
  }: { profile: ProfileAvatar; imgSize: string; textSize: string } = $props();
</script>

{#if profile.profile_picture}
  <img
    src="https://res.cloudinary.com/dc7wdwv4h/image/fetch/f_webp,q_auto,w_248,dpr_auto/{profile.profile_picture}"
    alt="Avatar"
    class="rounded-2xl border-4 border-primary bg-black {imgSize} object-cover"
    loading="eager"
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
