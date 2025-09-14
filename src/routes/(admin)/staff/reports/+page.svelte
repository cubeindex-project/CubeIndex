<script lang="ts">
  const { data } = $props();

  const { reports, profiles, user_cube_ratings } = data;

  let showImg: boolean[] = $state([]);
  let showCom: boolean[] = $state([]);
  let showTitle: boolean[] = $state([]);

  // UI state: search, filter, sort
  type ReportType = "all" | "website" | "user" | "cube" | "cube-rating";
  type StatusFilter = "all" | "open" | "resolved";
  type SortOrder = "newest" | "oldest";

  let query: string = $state("");
  let typeFilter: ReportType = $state("all");
  let statusFilter: StatusFilter = $state("all");
  let sortOrder: SortOrder = $state("newest");

  const resetFilters = () => {
    query = "";
    typeFilter = "all";
    statusFilter = "all";
    sortOrder = "newest";
  };

  // Derived list based on search, filters and sort
  let visibleReports = $derived.by(() => {
    let list = Array.isArray(reports) ? [...reports] : [];

    if (typeFilter !== "all") {
      list = list.filter((r: { report_type: string }) => r.report_type === typeFilter);
    }

    if (statusFilter !== "all") {
      list = list.filter((r: { resolved: boolean }) =>
        statusFilter === "open" ? !r.resolved : r.resolved
      );
    }

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((r: any) => {
        const reporter = getUser(r.reporter);
        const reporterName = reporter?.username?.toLowerCase?.() ?? "";
        const title = (r.title ?? "").toLowerCase();
        const comment = (r.comment ?? "").toLowerCase();
        const reported = String(r.reported ?? "").toLowerCase();
        const type = String(r.report_type ?? "").toLowerCase();
        return (
          reporterName.includes(q) ||
          title.includes(q) ||
          comment.includes(q) ||
          reported.includes(q) ||
          type.includes(q)
        );
      });
    }

    list.sort((a: any, b: any) => {
      const aTime = new Date(a.created_at).getTime();
      const bTime = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
    });

    return list;
  });

  function toggleImg(i: number) {
    showImg[i] = !showImg[i];
  }

  function toggleCom(i: number) {
    showCom[i] = !showCom[i];
  }

  function toggleTitle(i: number) {
    showTitle[i] = !showTitle[i];
  }

  async function markResolved(id: number) {
    const res = await fetch("/api/staff/mark-report-resolved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();

    if (!data.success) {
      new Error("Failed: " + data.error);
    }

    location.reload();
  }

  function getUser(reporter: string) {
    const profile = profiles.find((p) => p.user_id === reporter);
    return profile;
  }

  function findRating(reported: number): {
    cube_slug: string;
    rating: number;
    comment: string;
    updated_at: string;
    created_at: string;
    id: number;
    profile: { username: string };
  } {
    let user_cube_rating = user_cube_ratings.find(
      (ucr: { id: number }) => ucr.id === Number(reported)
    );
    return (user_cube_rating = {
      ...user_cube_rating,
      profile:
        profiles.find((p) => p.user_id === user_cube_rating.user_id) ??
        "Not Found",
    });
  }
</script>

<section class="space-y-4 h-screen mx-25">
  <div class="flex flex-wrap items-end justify-between gap-4">
    <div class="min-w-[16rem]">
      <h1 class="text-3xl font-semibold">User Reports</h1>
      <p class="text-sm opacity-70">Monitor and resolve user bug reports and feature requests</p>
    </div>
    <div class="stats shadow">
      <div class="stat">
        <div class="stat-title">Open</div>
        <div class="stat-value text-warning">
          {reports.filter((r: { resolved: boolean }) => !r.resolved).length}
        </div>
      </div>
      <div class="stat">
        <div class="stat-title">Total</div>
        <div class="stat-value">{reports.length}</div>
      </div>
      <div class="stat">
        <div class="stat-title">Showing</div>
        <div class="stat-value text-info">{visibleReports.length}</div>
      </div>
    </div>
  </div>

  <!-- Controls -->
  <div class="card bg-base-100 shadow">
    <div class="card-body gap-3">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <label class="form-control w-full">
          <div class="label"><span class="label-text">Search</span></div>
          <input
            type="text"
            placeholder="Search title, reporter, URL..."
            bind:value={query}
            class="input input-bordered w-full"
            aria-label="Search reports"
          />
        </label>

        <label class="form-control">
          <div class="label"><span class="label-text">Type</span></div>
          <select class="select select-bordered" bind:value={typeFilter} aria-label="Filter by type">
            <option value="all">All</option>
            <option value="website">Website</option>
            <option value="user">User</option>
            <option value="cube">Cube</option>
            <option value="cube-rating">Cube Rating</option>
          </select>
        </label>

        <label class="form-control">
          <div class="label"><span class="label-text">Status</span></div>
          <select class="select select-bordered" bind:value={statusFilter} aria-label="Filter by status">
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
          </select>
        </label>

        <label class="form-control">
          <div class="label"><span class="label-text">Sort</span></div>
          <select class="select select-bordered" bind:value={sortOrder} aria-label="Sort by date">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>
      </div>

      <div class="flex items-center justify-between">
        <div class="text-xs opacity-70">
          Use filters to narrow down reports. Click a cell to view full content.
        </div>
        <button class="btn btn-ghost btn-sm" onclick={resetFilters} aria-label="Reset filters">
          Reset
        </button>
      </div>
    </div>
  </div>

  <div class="card bg-base-100 shadow">
    <div class="card-body p-0">
      <div class="overflow-x-auto max-h-[65vh]">
        <table class="table table-zebra w-full">
          <thead>
            <tr class="sticky top-0 bg-base-200 z-10">
              <th class="w-16">ID</th>
              <th>Reporter</th>
              <th>Reported</th>
              <th>Title</th>
              <th>Comment</th>
              <th>Image</th>
              <th>Type</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#if visibleReports.length === 0}
              <tr>
                <td colspan="10" class="text-center py-10 opacity-70">
                  No reports match the current filters.
                </td>
              </tr>
            {/if}
            {#each visibleReports as r, i}
              <tr>
                <td class="text-sm opacity-70 font-mono">{r.id}</td>
                <td>
                  <a
                    href="/user/{getUser(r.reporter).username}"
                    class="link link-primary link-hover"
                  >
                    {getUser(r.reporter).username}
                  </a>
                </td>
                <td>
                  {#if r.report_type === "user"}
                    <a
                      href="/user/{getUser(r.reported).id}"
                      class="link link-primary link-hover"
                    >
                      {getUser(r.reported).username}'s Account
                    </a>
                  {:else if r.report_type === "website"}
                    <a href={r.reported} class="link link-primary link-hover">
                      {r.reported}
                    </a>
                  {:else if r.report_type === "cube"}
                    <a
                      href="/explore/cubes/{r.reported}"
                      class="link link-primary link-hover"
                    >
                      {r.reported}
                    </a>
                  {:else if r.report_type === "cube-rating"}
                    <a
                      href="/explore/cubes/{findRating(r.reported).cube_slug}"
                      class="link link-primary link-hover"
                    >
                      {findRating(r.reported).profile.username}'s Cube Rating
                    </a>
                  {/if}
                </td>
                <td class="align-top">
                  <div class="flex items-center gap-2 max-w-xs">
                    <span class="truncate" title={r.title}>{r.title}</span>
                    <button
                      class="btn btn-ghost btn-xs"
                      onclick={() => toggleTitle(i)}
                      aria-label="View full title">View</button
                    >
                  </div>

                  {#if showTitle[i]}
                    <button
                      class="fixed inset-0 bg-black/50 z-40"
                      onclick={() => toggleTitle(i)}
                      aria-label="Close modal"
                    ></button>
                    <div
                      class="fixed inset-0 flex items-center justify-center z-50 p-4"
                      role="dialog"
                      aria-modal="true"
                    >
                      <div class="bg-base-100 rounded-xl shadow-xl max-w-md w-full">
                        <div class="p-6 border-b border-base-200">
                          <h3 class="text-lg font-semibold">Title</h3>
                        </div>
                        <div class="p-6">
                          <p class="whitespace-pre-wrap break-words">{r.title}</p>
                        </div>
                        <div class="p-4 border-t border-base-200 text-right">
                          <button class="btn btn-secondary" onclick={() => toggleTitle(i)}>
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  {/if}
                </td>
                <td class="align-top">
                  <button
                    class="btn btn-ghost btn-xs"
                    onclick={() => toggleCom(i)}
                  >
                    View
                  </button>

                  {#if showCom[i]}
                    <button
                      class="fixed inset-0 bg-black/50 z-40"
                      onclick={() => toggleCom(i)}
                      aria-label="Close Modal"
                    ></button>
                    <div
                      class="fixed inset-0 flex items-center justify-center z-50 p-4"
                      role="dialog"
                      aria-modal="true"
                    >
                      <div class="bg-base-100 rounded-xl shadow-xl max-w-md w-full">
                        <div class="p-6 border-b border-base-200">
                          <h3 class="text-lg font-semibold">Comment</h3>
                        </div>
                        <div class="p-6">
                          <p class="whitespace-pre-wrap break-words">{r.comment}</p>
                        </div>
                        <div class="p-4 border-t border-base-200 text-right">
                          <button class="btn btn-secondary" onclick={() => toggleCom(i)}>
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  {/if}
                </td>
                <td class="align-top">
                  {#if r.image_url}
                    <button
                      class="btn btn-ghost btn-xs"
                      onclick={() => toggleImg(i)}
                    >
                      <img
                        src={r.image_url}
                        alt="Report thumbnail"
                        class="w-12 h-12 object-cover rounded"
                      />
                    </button>
                    {#if showImg[i]}
                      <button
                        class="fixed inset-0 bg-black/50 z-40"
                        onclick={() => toggleImg(i)}
                        aria-label="Close modal"
                      ></button>
                      <div
                        class="fixed inset-0 flex items-center justify-center z-50 p-4"
                        role="dialog"
                        aria-modal="true"
                      >
                        <div class="bg-base-100 rounded-xl shadow-xl max-w-3xl w-full">
                          <div class="p-6 border-b border-base-200">
                            <h3 class="text-lg font-semibold">Reported Image</h3>
                          </div>
                          <div class="p-6">
                            <img
                              src={r.image_url}
                              alt="User report"
                              class="max-h-[70vh] mx-auto rounded"
                            />
                          </div>
                          <div class="p-4 border-t border-base-200 text-right">
                            <button class="btn btn-secondary" onclick={() => toggleImg(i)}>
                              Close
                            </button>
                          </div>
                        </div>
                      </div>
                    {/if}
                  {:else}
                    <span class="opacity-60">—</span>
                  {/if}
                </td>
                <td>
                  {#if r.report_type === "website"}
                    <div class="badge badge-info badge-outline">website</div>
                  {:else if r.report_type === "user"}
                    <div class="badge badge-secondary badge-outline">user</div>
                  {:else if r.report_type === "cube"}
                    <div class="badge badge-primary badge-outline">cube</div>
                  {:else if r.report_type === "cube-rating"}
                    <div class="badge badge-accent badge-outline">
                      cube-rating
                    </div>
                  {/if}
                </td>
                <td>
                  {#if r.resolved}
                    <div class="badge badge-success">Resolved</div>
                  {:else}
                    <div class="badge badge-warning">Open</div>
                  {/if}
                </td>
                <td class="whitespace-nowrap text-sm">
                  {new Date(r.created_at).toLocaleString()}
                </td>
                <td class="space-x-2">
                  {#if r.resolved}
                    <div class="btn btn-ghost btn-xs text-success">
                      Resolved
                    </div>
                  {:else}
                    <button
                      onclick={() => markResolved(r.id)}
                      class="btn btn-info btn-xs"
                    >
                      Mark as Resolved
                    </button>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</section>
