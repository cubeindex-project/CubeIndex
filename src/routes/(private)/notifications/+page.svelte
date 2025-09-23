<script lang="ts">
  import { onMount } from "svelte";
  import type { Notifications } from "$lib/components/dbTableTypes";
  import { formatDate } from "$lib/components/helper_functions/formatDate.svelte";
  import { toast } from "svelte-sonner";

  // Page state
  let notifications: Notifications[] = $state([]);
  let loading = $state(true);
  let loadError: string | null = $state(null);
  let markingAll = $state(false);
  let markingIds = $state<Set<string>>(new Set());

  const { data } = $props();
  const { user, profile } = data;

  // Email verification/resend state
  const isVerified = $derived(profile?.verified ?? false);
  let isResending = $state(false);

  async function resendVerification() {
    try {
      isResending = true;
      const res = await fetch("/auth/resend");
      if (!res.ok) {
        const msg = await res
          .json()
          .then((d) => d?.message)
          .catch(() => "Failed to resend verification email.");
        toast.error(msg ?? "Failed to resend verification email.");
        return;
      }
      toast.success("Verification email sent. Check your inbox.");
    } catch {
      toast.error("Network error while resending email.");
    } finally {
      isResending = false;
    }
  }

  async function getMessages() {
    loading = true;
    loadError = null;
    const res = await fetch("/api/notifications/fetch-notifications", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();

    if (res.ok && data.success) {
      notifications = data.data;
    } else {
      loadError = data.error;
    }
    loading = false;
  }

  onMount(getMessages);

  const unreadCount = $derived(
    (notifications ?? []).filter((n) => !n.read).length
  );

  async function markNotificationsAsRead(ids: string[]) {
    if (!ids.length) return;
    try {
      // Update local state optimistically
      notifications = notifications.map((n) =>
        ids.includes(n.id) ? { ...n, read: true } : n
      );
      ids.forEach((id) => markingIds.add(id));
      const res = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }
      const body = (await res.json()) as {
        success: boolean;
        updated?: number;
        error?: string;
      };
      if (!body.success)
        throw new Error(body.error || "Failed to update notifications");
    } catch (e) {
      toast.error("Failed to mark notifications as read.");
      // Revert local state if update fails
      notifications = notifications.map((n) =>
        ids.includes(n.id) ? { ...n, read: false } : n
      );
      throw e;
    } finally {
      ids.forEach((id) => markingIds.delete(id));
    }
  }

  async function markOneAsRead(id: string) {
    if (!id) return;
    if (markingIds.has(id)) return;
    await markNotificationsAsRead([id]);
  }

  async function markAllAsRead() {
    if (markingAll) return;
    const ids = notifications.filter((n) => !n.read).map((n) => n.id);
    if (ids.length === 0) return;
    try {
      markingAll = true;
      await markNotificationsAsRead(ids);
      toast.success("All notifications marked as read.");
    } catch {
      /* handled in helper */
    } finally {
      markingAll = false;
    }
  }
</script>

<section class="min-h-screen px-4 py-12">
  <div class="max-w-2xl mx-auto">
    <div class="flex items-start sm:items-center justify-between mb-6 gap-3 flex-wrap">
      <div class="flex items-center gap-2">
        <h1 class="text-3xl sm:text-4xl font-clash font-bold">Notifications</h1>
        {#if unreadCount > 0}
          <span class="badge badge-info badge-sm sm:badge-md">{unreadCount} unread</span>
        {/if}
      </div>
      <div class="flex items-center gap-2 flex-wrap w-full sm:w-fit">
        {#if unreadCount > 0}
          <button
            class="btn btn-sm btn-outline w-full sm:w-auto"
            disabled={markingAll}
            onclick={markAllAsRead}
          >
            {#if markingAll}
              <span class="loading loading-spinner loading-xs mr-2"></span>
            {/if}
            Mark all as read
          </button>
        {/if}
        <button class="btn btn-sm w-full sm:w-auto" onclick={getMessages} aria-label="Refresh">
          <i class="fa-solid fa-rotate"></i>
          <span class="ml-2">Refresh</span>
        </button>
      </div>
    </div>
    {#if user && !isVerified}
      <div class="alert alert-error mb-4">
        <i class="fa-solid fa-circle-exclamation"></i>
        <div>
          <h3 class="font-bold">Email not verified</h3>
          <div class="text-sm">
            Please verify your email to unlock all features.
          </div>
        </div>
        <div class="ml-auto">
          <button
            class="btn btn-sm btn-error"
            disabled={isResending}
            onclick={resendVerification}
          >
            {#if isResending}
              <span class="loading loading-spinner loading-xs mr-2"></span>
            {/if}
            Resend email
          </button>
        </div>
      </div>
    {/if}
    <div class="overflow-hidden">
      {#if loadError}
        <div class="alert alert-error m-4">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <span>{loadError}</span>
        </div>
      {/if}

      {#if loading}
        <div class="p-6 space-y-4">
          <div class="skeleton h-8 w-1/3"></div>
          <div class="skeleton h-20 w-full"></div>
          <div class="skeleton h-20 w-full"></div>
        </div>
      {:else if notifications.length === 0}
        <div class="py-16 text-center text-base-content/50 text-lg">
          <i class="fa-solid fa-bell-slash text-3xl mb-2"></i><br />
          You have no notifications yet.
        </div>
      {:else}
        <ul class="flex flex-col gap-3 px-2 sm:px-4 py-4 sm:py-6">
          {#each notifications as n (n.id)}
            <li class="flex items-stretch">
              <!-- Left: content card -->
              <div
                class="flex-1 min-w-0 rounded-xl md:rounded-r-none md:rounded-l-xl border border-base-300 bg-base-200 p-4 sm:p-5 transition hover:bg-base-300/70"
                class:opacity-70={n.read}
              >
                <div class="flex gap-3">
                  <!-- Icon -->
                  <div class="shrink-0 size-10 rounded-full grid place-items-center bg-primary/10 text-primary">
                    {#if n.icon}
                      <i class="{n.icon} text-lg"></i>
                    {:else}
                      <i class="fa-solid fa-bell text-lg"></i>
                    {/if}
                  </div>

                  <!-- Text content -->
                  <div class="min-w-0 flex-1">
                    <div class="flex items-start gap-2">
                      <p class="text-base leading-snug break-words flex-1">
                        {n.message}
                      </p>
                      {#if !n.read}
                        <span class="mt-1 size-2 rounded-full bg-info" aria-label="Unread"></span>
                      {/if}
                    </div>
                    <div class="mt-2 flex items-center gap-3 text-xs text-base-content/70">
                      <span>{formatDate(n.created_at)}</span>
                      {#if n.link}
                        <a
                          href={n.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="link link-hover inline-flex items-center gap-1"
                        >
                          {`${n.link_text === "" ? "Open link" : n.link_text}`}
                          <i class="fa-solid fa-arrow-up-right-from-square"></i>
                        </a>
                      {/if}
                    </div>
                    <!-- Mobile action row -->
                    <div class="mt-3 flex justify-end md:hidden">
                      {#if !n.read}
                        <button
                          class="btn btn-primary btn-sm"
                          disabled={markingIds.has(n.id)}
                          onclick={() => markOneAsRead(n.id)}
                          aria-label="Mark notification as read"
                          title="Mark as read"
                        >
                          {#if markingIds.has(n.id)}
                            <span class="loading loading-spinner loading-xs mr-2"></span>
                          {/if}
                          Mark read
                        </button>
                      {:else}
                        <span class="badge badge-ghost">Read</span>
                      {/if}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right: tall action button (outside card) -->
              <div class="shrink-0 hidden md:block">
                {#if !n.read}
                  <button
                    class="btn btn-primary h-full rounded-l-none rounded-r-xl px-4 md:px-6 whitespace-nowrap"
                    disabled={markingIds.has(n.id)}
                    onclick={() => markOneAsRead(n.id)}
                    aria-label="Mark notification as read"
                    title="Mark as read"
                  >
                    {#if markingIds.has(n.id)}
                      <span class="loading loading-spinner loading-xs mr-2"></span>
                    {/if}
                    Mark read
                  </button>
                {:else}
                  <button class="btn btn-primary h-full rounded-l-none rounded-r-xl px-4 md:px-6 whitespace-nowrap" disabled>
                    <i class="fa-solid fa-check mr-2"></i>
                    Read
                  </button>
                {/if}
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
</section>
