<script lang="ts">
  const { data } = $props();

  const { reports, profiles, user_cube_ratings } = data;

  let showImg: boolean[] = $state([]);
  let showCom: boolean[] = $state([]);

  function toggleImg(i: number) {
    showImg[i] = !showImg[i];
  }

  function toggleCom(i: number) {
    showCom[i] = !showCom[i];
  }

  async function markResolved(id: number) {
    const res = await fetch("/api/staff/mark-report-resolved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();

    if (!data.success) {
      alert("Failed: " + data.error);
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

<h1 class="text-2xl font-bold my-4">User Reports</h1>

<table class="table w-full">
  <thead>
    <tr>
      <th>ID</th>
      <th>Reporter</th>
      <th>Reported</th>
      <th>Title</th>
      <th>Comment</th>
      <th>Image</th>
      <th>Report Type</th>
      <th>Resolved</th><th>Date</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {#each reports as r, i}
      <tr>
        <td>{r.id}</td>
        <td>
          <a
            href="/user/{getUser(r.reporter).id}"
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
        <td>{r.title}</td>
        <td class="relative">
          <button class="btn btn-primary" onclick={() => toggleCom(i)}>
            {showCom[i] ? "Hide" : "Show"}
          </button>

          {#if showCom[i]}
            <!-- backdrop -->
            <button
              class="fixed inset-0 bg-black/50 bg-opacity-50 z-40"
              onclick={() => toggleCom(i)}
              aria-label="Close Modal"
            ></button>

            <!-- modal -->
            <div
              class="fixed inset-0 flex items-center justify-center z-50 p-4"
              role="dialog"
              aria-modal="true"
            >
              <div
                class="bg-base-200 rounded-xl shadow-xl max-w-md w-full p-6 relative"
              >
                <h3 class="text-lg font-semibold mb-4">Comment</h3>
                <p class="whitespace-pre-wrap">{r.comment}</p>
                <button
                  class="btn btn-secondary mt-6"
                  onclick={() => toggleCom(i)}
                >
                  Close
                </button>
              </div>
            </div>
          {/if}
        </td>
        <td class="relative">
          {#if r.image_url}
            <button class="btn btn-primary" onclick={() => toggleImg(i)}>
              {showImg[i] ? "Hide" : "Show"}
            </button>

            {#if showImg[i]}
              <!-- backdrop -->
              <button
                class="fixed inset-0 bg-black/50 bg-opacity-50 z-40"
                onclick={() => toggleImg(i)}
                aria-label="Close modal"
              ></button>

              <!-- modal -->
              <div
                class="fixed inset-0 flex items-center justify-center z-50 p-4"
                role="dialog"
                aria-modal="true"
              >
                <div
                  class="bg-base-200 rounded-xl shadow-xl max-w-lg w-full p-6 relative"
                >
                  <h3 class="text-lg font-semibold mb-4">Reported Image</h3>
                  <img
                    src={r.image_url}
                    alt="User report"
                    class="max-h-[70vh] mx-auto rounded"
                  />
                  <button
                    class="btn btn-secondary mt-6"
                    onclick={() => toggleImg(i)}
                  >
                    Close
                  </button>
                </div>
              </div>
            {/if}
          {:else}
            <p>No image provided</p>
          {/if}
        </td>
        <td>{r.report_type}</td>
        <td>
          <p class={r.resolved ? "text-success" : "text-error"}>
            {r.resolved ? "Yes" : "No"}
          </p>
        </td>
        <td>{new Date(r.created_at).toLocaleString()}</td>
        <td class="space-x-2 flex flex-row">
          {#if r.resolved}
            <div class="btn btn-sm btn-success">Resolved</div>
          {:else}
            <button
              onclick={() => markResolved(r.id)}
              class="btn btn-sm btn-info"
            >
              Mark as Resolved
            </button>
          {/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>
