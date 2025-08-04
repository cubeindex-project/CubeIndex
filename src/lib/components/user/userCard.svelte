<script lang="ts">
  import Avatar from "./avatar.svelte";
  import Badge from "./badge.svelte";

  const {
    profile,
    user_achievements_count = 0,
    user_cubes_count = 0,
    showCount = true,
  } = $props();
</script>

<div class="bg-base-200 rounded-xl border border-base-300">
  <a
    href={`/user/${profile.username}`}
    class="flex items-center gap-4 px-4 py-4 transition group"
  >
    <Avatar {profile} size="sm" />
    <div class="flex-1 min-w-0">
      <div class="flex flex-col gap-0.5">
        <span class="font-semibold truncate">
          {profile.display_name}
          <Badge {profile} textSize="xs" />
        </span>
        {#if showCount}
          <span class="text-xs flex items-center gap-2">
            <i class="fa-solid fa-cube"></i>{user_cubes_count} Cube{user_cubes_count ===
            1
              ? ""
              : "s"}
            <span class="mx-1">•</span>
            <i class="fa-solid fa-medal"></i>{user_achievements_count} Achievement{user_achievements_count ===
            1
              ? ""
              : "s"}
          </span>
        {/if}
      </div>
      {#if profile.bio}
        <p class="text-xs truncate max-w-full mt-1">
          {profile.bio}
        </p>
      {/if}
    </div>
    <span
      class="ml-2 text-primary group-hover:translate-x-1 transition-transform"
    >
      <i class="fa-solid fa-arrow-right"></i>
    </span>
  </a>
</div>
