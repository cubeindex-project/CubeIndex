<script lang="ts">
  const { data } = $props();

  const { reports, profiles, user_cube_ratings } = data;

  let showImg: boolean[] = $state([]);

  function toggleImg(i: number) {
    showImg[i] = !showImg[i];
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
        <td>{r.comment}</td>
        <td>
          <button
            class="cursor-pointer btn btn-primary"
            onclick={() => toggleImg(i)}
          >
            {showImg[i] ? "Hide" : "Show"}
          </button>
          {#if showImg[i]}
            <img src={r.image_url} alt="User report" />
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
          {#if !r.resolved}
            <button
              onclick={() => markResolved(r.id)}
              class="btn btn-sm btn-success"
            >
              Mark as Resolved
            </button>
          {/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>
