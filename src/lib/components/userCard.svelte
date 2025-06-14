<script lang="ts">
  import Badge from "./badge.svelte";

  const { profile, user_achievements, staff } = $props();
</script>

<div class="bg-base-200 rounded-xl border border-base-300">
  <a
    href={`/user/${profile.id}`}
    class="flex items-center gap-4 px-4 py-4 transition group"
  >
    {#if profile.profile_picture}
      <img
        src={profile.profile_picture}
        alt={profile.username}
        class="w-14 h-14 rounded-full border-2 border-primary object-cover shadow"
      />
    {:else}
      <div class="avatar avatar-placeholder">
        <div class="bg-base-300 w-14 h-14 rounded-full border-2 border-primary">
          <span class="text-2xl uppercase font-clash"
            >{profile.username.charAt(0)}</span
          >
        </div>
      </div>
    {/if}
    <div class="flex-1 min-w-0">
      <div class="flex flex-col gap-0.5">
        <span class="font-semibold truncate"
          >{profile.username}
          <Badge {profile} textSize="xs" /></span
        >
        <span class="text-xs flex items-center gap-2">
          <i class="fa-solid fa-cube"></i>0 Cubes
          <span class="mx-1">•</span>
          <i class="fa-solid fa-medal"></i>{user_achievements.filter(
            (ua: { username: any }) => ua.username === profile.username
          ).length || 0} Achievements
        </span>
      </div>
      <p class="text-xs truncate max-w-full mt-1">
        {profile.bio || "No bio provided."}
      </p>
    </div>
    <span
      class="ml-2 text-primary group-hover:translate-x-1 transition-transform"
    >
      <i class="fa-solid fa-arrow-right"></i>
    </span>
  </a>
  {#if staff}
  <div class="flex p-2 justify-between">
  <button class="btn btn-primary">View Logs</button>
  <button class="btn btn-accent">Warn User</button>
  <button class="btn btn-error">Ban User</button>
  </div>
  {/if}
</div>
