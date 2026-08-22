<script lang="ts">
  import { resolve } from "$app/paths";
  import { formatDate } from "$lib/utils/formatDate.js";
  import Avatar from "$lib/components/user/Avatar.svelte";

  const { data } = $props();

  const { profile, recent } = $derived(data);

  const submissionStatusBadge = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized === "approved") return "badge-success";
    if (normalized === "pending") return "badge-warning";
    if (normalized === "rejected") return "badge-error";
    return "badge-ghost";
  };
</script>

<div class="mx-auto max-w-6xl px-4 py-8">
  <header class="mb-8">
    <div class="flex md:items-center gap-4 flex-col justify-start md:flex-row">
      <Avatar
        profile={{
          display_name: profile.display_name || profile.username,
          profile_picture: profile.profile_picture ?? null,
        }}
        imageWidth="w-24"
      />
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-3xl font-clash tracking-tight">
            Welcome back, {profile.display_name || profile.username}
          </h1>
        </div>
        <p class="text-base-content/70 mt-1">
          Here’s your personal overview and recent activity.
        </p>
      </div>
    </div>
  </header>

  <section class="grid grid-cols-1 xl:grid-cols-1 gap-6 mb-8">
    <!-- Recent Submissions -->
    <div class="card bg-base-100 border border-base-300 xl:col-span-1">
      <div class="card-body">
        <div class="flex items-center justify-between gap-2">
          <h2 class="card-title">Recent Submissions</h2>
          <a class="btn btn-xs" href={resolve("/user/submissions")}>View all</a>
        </div>
        {#if recent.cubeSubmissions.length === 0}
          <div class="text-sm opacity-70">
            Share cubes that are missing from the catalog and track their status
            from here. <a class="link" href={resolve("/(private)/submit/cube")}
              >Submit a cube</a
            > to get started.
          </div>
        {:else}
          <ul class="divide-y divide-base-300">
            {#each recent.cubeSubmissions as cubeSubmission (cubeSubmission.id)}
              <li class="py-3 flex items-center gap-3">
                {#if cubeSubmission.image_url}
                  <img
                    src="https://res.cloudinary.com/dc7wdwv4h/image/fetch/f_webp,q_auto,w_403/{cubeSubmission.image_url}"
                    alt={cubeSubmission.name}
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
                    <span class="font-medium hover:underline">
                      {cubeSubmission.name}
                    </span>
                    <span
                      class={`badge badge-sm ${submissionStatusBadge(cubeSubmission.status)}`}
                    >
                      {cubeSubmission.status}
                    </span>
                  </div>
                  <p class="text-xs opacity-70">
                    Submitted {formatDate(cubeSubmission.submitted_at)}
                  </p>
                </div>
              </li>
            {/each}
          </ul>
          <div class="pt-3 flex flex-wrap">
            <a
              class="btn btn-ghost btn-sm"
              href={resolve("/(private)/submit/cube")}
            >
              <i class="fa-solid fa-plus"></i>
              Submit another cube
            </a>
          </div>
        {/if}
      </div>
    </div>
  </section>
</div>
