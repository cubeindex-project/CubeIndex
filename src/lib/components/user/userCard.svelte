<script lang="ts">
  import type { Profiles } from "../dbTableTypes";
  import Avatar from "./avatar.svelte";
  import Badge from "./badge.svelte";

  interface extendedProfile extends Profiles {
    user_cubes_count: number;
    user_achievements_count: number;
    user_following_count: number;
    user_follower_count: number;
    user_cube_ratings_count: number;
    user_avg_rating_count: number;
  }

  const {
    profile,
    showCount = true,
    compact = false,
    showArrow = true,
  }: {
    profile: extendedProfile;
    showCount?: boolean;
    compact?: boolean; // tighter padding + smaller avatar/text
    showArrow?: boolean; // hide the chevron if you need a quieter list
  } = $props();

  const href = profile?.username ? `/user/${profile.username}` : undefined;

  // 1. Compact formatting for large numbers
  const nf = new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 1,
  });
  const fmt = (n: number) => nf.format(n);

  // 2. Tiny plural helper
  const plural = (n: number, s: string) => (n === 1 ? s : `${s}s`);

  // 3. Accessible label
  const ariaLabel =
    `View ${profile?.display_name ?? "user"}’s profile` +
    (showCount
      ? `, ${fmt(profile.user_cubes_count)} ${plural(profile.user_cubes_count, "cube")}, ${fmt(profile.user_achievements_count)} ${plural(profile.user_achievements_count, "achievement")}`
      : "");
</script>

<article
  class="rounded-xl border border-base-300 bg-base-200/70 shadow-sm backdrop-blur-[1px]
         transition hover:border-base-300/80 hover:shadow-md"
>
  <!-- When username is missing, render a non-link container but keep the same layout -->
  {#if href}
    <a
      {href}
      aria-label={ariaLabel}
      class={`group flex items-center gap-4 transition px-4 ${compact ? "py-3" : "py-4"}`}
    >
      <Avatar
        {profile}
        imgSize={compact ? "size-10 sm:size-10" : "size-14 sm:size-14"}
        textSize={compact ? "text-lg" : "text-2xl"}
      />
      <div class="min-w-0 flex-1">
        <div class="flex flex-col gap-0.5">
          <span
            class={`font-semibold truncate ${compact ? "text-sm" : "text-base"}`}
          >
            {profile.display_name}
            <Badge {profile} textSize={compact ? "xs" : "xs"} />
          </span>

          {#if showCount}
            <span
              class={`text-xs/5 text-base-content/70 flex items-center gap-2 truncate`}
            >
              <i class="fa-solid fa-cube shrink-0" aria-hidden="true"></i>
              <span
                title={`${profile.user_cubes_count} ${plural(profile.user_cubes_count, "cube")}`}
              >
                {fmt(profile.user_cubes_count)}
                {plural(profile.user_cubes_count, "cube")}
              </span>

              <span class="mx-1 opacity-60" aria-hidden="true">•</span>

              <i class="fa-solid fa-medal shrink-0" aria-hidden="true"></i>
              <span
                title={`${profile.user_achievements_count} ${plural(profile.user_achievements_count, "achievement")}`}
              >
                {fmt(profile.user_achievements_count)}
                {plural(profile.user_achievements_count, "achievement")}
              </span>
            </span>
          {/if}
        </div>
      </div>

      {#if showArrow}
        <span
          class="ml-2 text-primary transition-transform group-hover:translate-x-1 motion-reduce:transform-none"
          aria-hidden="true"
        >
          <i class="fa-solid fa-arrow-right"></i>
        </span>
      {/if}
    </a>
  {:else}
    <!-- Disabled state when there’s no username -->
    <div
      role="group"
      aria-label={`${profile?.display_name ?? "User"} (profile not available)`}
      class={`flex items-center gap-4 px-4 ${compact ? "py-3" : "py-4"} opacity-70`}
    >
      <Avatar
        {profile}
        imgSize={compact ? "size-10 sm:size-10" : "size-14 sm:size-14"}
        textSize={compact ? "text-lg" : "text-2xl"}
      />
      <div class="min-w-0 flex-1">
        <div class="flex flex-col gap-0.5">
          <span
            class={`font-semibold truncate ${compact ? "text-sm" : "text-base"}`}
          >
            {profile?.display_name ?? "Unknown User"}
            <Badge {profile} textSize={compact ? "xs" : "xs"} />
          </span>

          {#if showCount}
            <span
              class="text-xs/5 text-base-content/60 flex items-center gap-2 truncate"
            >
              <i class="fa-solid fa-cube" aria-hidden="true"></i>
              {fmt(profile.user_cubes_count)}
              {plural(profile.user_cubes_count, "cube")}
              <span class="mx-1 opacity-60" aria-hidden="true">•</span>
              <i class="fa-solid fa-medal" aria-hidden="true"></i>
              {fmt(profile.user_achievements_count)}
              {plural(profile.user_achievements_count, "achievement")}
            </span>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</article>

<style>
  /* Extra-visible keyboard focus for the <a> */
  a:focus-visible {
    outline: 3px solid hsl(var(--p));
    outline-offset: 3px;
    border-radius: 0.75rem; /* match rounded-xl */
  }
</style>
