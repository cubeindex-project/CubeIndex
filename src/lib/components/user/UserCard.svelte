<script lang="ts">
  import { resolve } from "$app/paths";
  import type { Tables } from "$lib/types/database.types";
  import Avatar from "./Avatar.svelte";
  import RoleBadge from "./RoleBadge.svelte";

  interface Props {
    profile: Tables<"v_detailed_profiles">;
    showCount?: boolean;
    compact?: boolean; // tighter padding + smaller avatar/text
    showArrow?: boolean; // hide the chevron if you need a quieter list
  }

  const {
    profile,
    showCount = true,
    compact = false,
    showArrow = true,
  }: Props = $props();

  const href = $derived(
    profile.username
      ? resolve("/(public)/user/[username]", { username: profile.username })
      : undefined,
  );

  // 1. Compact formatting for large numbers
  const nf = new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 1,
  });
  const fmt = (n: number) => nf.format(n);
  const cubeCount = $derived(profile.user_cubes_count ?? 0);
  const achievementCount = $derived(profile.user_achievements_count ?? 0);

  // 2. Tiny plural helper
  const plural = (n: number, s: string) => (n === 1 ? s : `${s}s`);
</script>

<article
  class="rounded-xl border border-base-300 bg-base-200/70 shadow-sm backdrop-blur-[1px]
         transition hover:border-base-300/80 hover:shadow-md"
>
  <a
    {href}
    class={`group flex items-center gap-4 transition px-4 ${compact ? "py-3" : "py-4"}`}
  >
    <Avatar {profile} imageWidth="w-15" />
    <div class="min-w-0 flex-1">
      <div class="flex flex-col gap-0.5">
        <span
          class="font-semibold truncate {compact ? 'text-sm' : 'text-base'}"
        >
          {profile.display_name}
          <RoleBadge {profile} showRoleName={false} />
        </span>

        {#if showCount}
          <span
            class="text-xs/5 text-base-content/70 flex items-center gap-2 truncate"
          >
            <i class="fa-solid fa-cube shrink-0" aria-hidden="true"></i>
            <span
              title={`${cubeCount} ${plural(cubeCount, "cube")}`}
            >
              {fmt(cubeCount)}
              {plural(cubeCount, "cube")}
            </span>

            <span class="mx-1 opacity-60" aria-hidden="true">•</span>

            <i class="fa-solid fa-medal shrink-0" aria-hidden="true"></i>
            <span
              title={`${achievementCount} ${plural(achievementCount, "achievement")}`}
            >
              {fmt(achievementCount)}
              {plural(achievementCount, "achievement")}
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
</article>

<style>
  /* Extra-visible keyboard focus for the <a> */
  a:focus-visible {
    outline: 3px solid hsl(var(--p));
    outline-offset: 3px;
    border-radius: 0.75rem; /* match rounded-xl */
  }
</style>
