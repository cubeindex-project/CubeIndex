<script lang="ts">
  const { user_id, isFollowing }: { user_id: string; isFollowing: boolean } =
    $props();

  async function follow(following_id: string) {
    const payload: { following_id: string } = { following_id };

    try {
      const res = await fetch("/api/social/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        location.reload();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      throw new Error(err.message);
    }
  }

  async function unfollow(following_id: string) {
    const payload: { following_id: string } = { following_id };

    try {
      const res = await fetch("/api/social/unfollow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        location.reload();
      } else {
        new Error(data.error);
      }
    } catch (err: any) {
      new Error(err.message);
    }
  }
</script>

{#if isFollowing}
  <button class="btn btn-primary" onclick={() => follow(user_id)}>
    <i class="fa-solid fa-user-plus"></i>
    <span>Follow</span>
  </button>
{:else}
  <button class="btn btn-primary" onclick={() => unfollow(user_id)}>
    <i class="fa-solid fa-user-minus"></i>
    <span>Unfollow</span>
  </button>
{/if}
