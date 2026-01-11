<script lang="ts">
  import { formatDate } from "$lib/components/helper_functions/formatDate.svelte";
  import Avatar from "$lib/components/user/avatar.svelte";
  import { m } from "$lib/paraglide/messages";

  const { data } = $props();

  const { profile, stats, recent } = data;

  const cards = [
    {
      label: m.dashboard_card_collection_label(),
      value: stats.cubesCount,
      icon: "fa-box-archive",
      href: `/user/${profile.username}/cubes`,
    },
    {
      label: m.dashboard_card_ratings_label(),
      value: stats.ratingsCount,
      icon: "fa-star",
      href: `/user/${profile.username}/ratings`,
    },
    {
      label: m.dashboard_card_achievements_label(),
      value: stats.achievementsCount,
      icon: "fa-trophy",
      href: `/user/${profile.username}/achievements`,
    },
    {
      label: m.dashboard_card_followers_label(),
      value: stats.followersCount,
      icon: "fa-user-group",
      href: `/user/${profile.username}/social`,
    },
    {
      label: m.dashboard_card_submissions_label(),
      value: stats.submissionsCount,
      icon: "fa-paper-plane",
      href: "/user/submissions",
    },
  ];

  const submissionStatusBadge = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized === "approved") return "badge-success";
    if (normalized === "pending") return "badge-warning";
    if (normalized === "rejected") return "badge-error";
    return "badge-ghost";
  };
</script>

<svelte:head>
  <title>{m.dashboard_meta_title()}</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-8">
  <header class="mb-8">
    <div class="flex md:items-center gap-4 flex-col justify-start md:flex-row">
      <Avatar
        profile={{
          display_name: profile.display_name || profile.username,
          profile_picture: profile.profile_picture ?? null,
        }}
        imgSize="w-16 h-16"
        textSize="text-xl"
      />
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-3xl font-clash tracking-tight">
            {m.dashboard_welcome_title_text({
              name: profile.display_name || profile.username,
            })}
          </h1>
        </div>
        <p class="text-base-content/70 mt-1">
          {m.dashboard_intro_text()}
        </p>
      </div>
    </div>
  </header>

  <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
    {#each cards as c (c.label)}
      <a
        href={c.href}
        class="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition"
      >
        <div class="card-body">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm opacity-70">{c.label}</p>
              <p class="text-3xl font-extrabold">{c.value}</p>
            </div>
            <i class={`fa-solid ${c.icon} text-2xl opacity-70`}></i>
          </div>
        </div>
      </a>
    {/each}
    <!-- Add a CTA card -->
    <a
      href="/explore/cubes"
      class="card bg-primary text-primary-content shadow-md hover:shadow-lg transition"
    >
      <div class="card-body items-start">
        <p class="text-sm opacity-90">{m.dashboard_cta_kicker_label()}</p>
        <p class="text-2xl font-extrabold">
          {m.dashboard_cta_title_text()}
        </p>
        <span class="opacity-90 text-sm">
          {m.dashboard_cta_description_text()}
        </span>
      </div>
    </a>
  </section>

  <section class="grid grid-cols-1 xl:grid-cols-1 gap-6 mb-8">
    <!-- Recent Submissions -->
    <div class="card bg-base-100 border border-base-300 xl:col-span-1">
      <div class="card-body">
        <div class="flex items-center justify-between gap-2">
          <h2 class="card-title">{m.dashboard_recent_title()}</h2>
          <a class="btn btn-xs" href="/user/submissions">
            {m.dashboard_recent_view_all_cta()}
          </a>
        </div>
        {#if recent.submissions.length === 0}
          <div class="text-sm opacity-70">
            {m.dashboard_recent_empty_text()}
            <a class="link" href="/submit">{m.dashboard_recent_empty_cta()}</a>
            {m.dashboard_recent_empty_suffix_text()}
          </div>
        {:else}
          <ul class="divide-y divide-base-300">
            {#each recent.submissions as submission (submission.slug)}
              <li class="py-3 flex items-center gap-3">
                {#if submission.image_url}
                  <img
                    src="https://res.cloudinary.com/dc7wdwv4h/image/fetch/f_webp,q_auto,w_403/{submission.image_url}"
                    alt={submission.name}
                    class="w-10 h-10 rounded object-cover"
                  />
                {:else}
                  <div
                    class="w-10 h-10 rounded bg-base-300 flex items-center justify-center"
                  >
                    <i class="fa-solid fa-paper-plane"></i>
                  </div>
                {/if}
                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between gap-2">
                    <a
                      class="font-medium hover:underline"
                      href={`/explore/cubes/${submission.slug}`}
                    >
                      {submission.name}
                    </a>
                    <span
                      class={`badge badge-sm ${submissionStatusBadge(submission.status)}`}
                    >
                      {submission.status}
                    </span>
                  </div>
                  <p class="text-xs opacity-70">
                    {m.dashboard_recent_submitted_text({
                      date: formatDate(submission.created_at),
                    })}
                  </p>
                </div>
              </li>
            {/each}
          </ul>
          <div class="pt-3 flex flex-wrap">
            <a class="btn btn-ghost btn-sm" href="/submit"
              >{m.dashboard_recent_submit_another_cta()}</a
            >
          </div>
        {/if}
      </div>
    </div>
  </section>

  <section class="card bg-base-100 border border-base-300">
    <div class="card-body">
      <h2 class="card-title">{m.dashboard_actions_title()}</h2>
      <div class="flex flex-wrap gap-3">
        <a class="btn btn-primary" href={`/user/${profile.username}`}>
          {m.dashboard_action_view_profile_cta()}
        </a>
        <a class="btn" href={`/user/${profile.username}/cubes`}>
          {m.dashboard_action_manage_collection_cta()}
        </a>
        <a class="btn" href="/user/submissions">
          {m.dashboard_action_my_submissions_cta()}
        </a>
        <a class="btn" href="/submit">{m.dashboard_action_submit_cta()}</a>
        <a class="btn" href={`/user/${profile.username}/ratings`}>
          {m.dashboard_action_my_ratings_cta()}
        </a>
        <a class="btn" href="/achievements">
          {m.dashboard_action_browse_achievements_cta()}
        </a>
        <a class="btn" href="/explore/users">
          {m.dashboard_action_discover_users_cta()}
        </a>
        <a class="btn" href="/userbar">{m.dashboard_action_userbar_cta()}</a>
      </div>
    </div>
  </section>
</div>
