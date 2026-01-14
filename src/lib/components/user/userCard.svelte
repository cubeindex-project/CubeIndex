<script lang="ts">
  import { m } from "$lib/paraglide/messages";
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

  const cubeCountText = $derived(
    m.user_card_cube_count_text({
      count: profile.user_cubes_count,
      countFormatted: fmt(profile.user_cubes_count),
    })
  );
  const achievementCountText = $derived(
    m.user_card_achievement_count_text({
      count: profile.user_achievements_count,
      countFormatted: fmt(profile.user_achievements_count),
    })
  );
  const cubeCountTitle = $derived(
    m.user_card_cube_count_text({
      count: profile.user_cubes_count,
    })
  );
  const achievementCountTitle = $derived(
    m.user_card_achievement_count_title_text({
      count: profile.user_achievements_count,
    })
  );
  const nameForAria = $derived(
    profile?.display_name ?? m.user_card_generic_user_label()
  );
  const ariaLabel = $derived(
    showCount
      ? m.user_card_profile_with_counts_aria_text({
          name: nameForAria,
          cubeCount: cubeCountText,
          achievementCount: achievementCountText,
        })
      : m.user_card_profile_aria_text({ name: nameForAria })
  );
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
                title={cubeCountTitle}
              >
                {cubeCountText}
              </span>

              <span class="mx-1 opacity-60" aria-hidden="true">•</span>

              <i class="fa-solid fa-medal shrink-0" aria-hidden="true"></i>
              <span
                title={achievementCountTitle}
              >
                {achievementCountText}
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
      aria-label={m.user_card_profile_unavailable_aria_text({
        name: profile?.display_name ?? m.user_card_generic_user_label(),
      })}
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
            {profile?.display_name ?? m.user_card_unknown_user_label()}
            <Badge {profile} textSize={compact ? "xs" : "xs"} />
          </span>

          {#if showCount}
            <span
              class="text-xs/5 text-base-content/60 flex items-center gap-2 truncate"
            >
              <i class="fa-solid fa-cube" aria-hidden="true"></i>
              {cubeCountText}
              <span class="mx-1 opacity-60" aria-hidden="true">•</span>
              <i class="fa-solid fa-medal" aria-hidden="true"></i>
              {achievementCountText}
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
