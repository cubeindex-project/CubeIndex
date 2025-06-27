<script lang="ts">
  import { blur } from "svelte/transition";
  import { m } from "$lib/paraglide/messages";

  let { notificationOpen, notifications } = $props();

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  }
</script>

<div
  class="absolute -right-0 top-10 mt-2 z-50 w-80 max-w-xs rounded-2xl shadow-2xl ring-1 ring-white/20 bg-base-200 backdrop-blur-xl border border-base-300 transition-all overflow-hidden"
  style="min-width: 320px;"
  transition:blur
>
  <div class="flex items-center px-5 py-4 border-b border-base-300">
    <i class="fa-solid fa-bell text-primary mr-2"></i>
    <span class="font-bold text-lg tracking-tight">{m.notifications()}</span>
    <span class="ml-auto text-xs">
      {notifications.length} {m.total()}
    </span>
  </div>
  <div class="overflow-y-auto max-h-[50vh]">
    {#if notifications.length === 0}
      <div class="py-12 flex items-center justify-center">
        {m.no_notifications_yet()}
      </div>
    {:else}
      {#each notifications as n (n.id)}
        <div
          class="flex flex-col gap-1 px-5 py-4 border-b border-base-300 last:border-0 hover:bg-base-200 transition group"
        >
          <div class="flex items-center gap-2 mb-0.5">
            {#if n.icon}
              <span class="text-xl">{n.icon}</span>
            {:else if n.purpose === "announcement"}
              <i class="fa-solid fa-bullhorn text-info"></i>
            {:else if n.purpose === "alert"}
              <i class="fa-solid fa-triangle-exclamation text-error"></i>
            {:else if n.purpose === "warning"}
              <i class="fa-solid fa-exclamation-circle text-warning"></i>
            {:else}
              <i class="fa-solid fa-bell text-primary"></i>
            {/if}
            <span class="font-semibold">
              {n.title}
            </span>
            <span class="ml-auto text-xs">
              {formatDate(n.created_at)}
            </span>
          </div>
          <div class="text-sm">
            {n.message}
          </div>
          {#if n.link}
            <a
              href={n.link}
              target="_blank"
              rel="noopener noreferrer"
              class="link link-hover link-primary text-xs mt-1"
            >
              {`${n.linkText === "" ? m.more_info() : n.linkText}`}
              <i class="fa-solid fa-arrow-up-right-from-square ml-1"></i>
            </a>
          {/if}
        </div>
      {/each}
    {/if}
  </div>
  <div
    class="px-5 py-3 bg-base-200 border-t border-base-300 flex justify-end gap-3"
  >
    <button
      class="text-xs link link-hover cursor-pointer"
      onclick={() => (notificationOpen = false)}
    >
      {m.close()}
    </button>
  </div>
</div>
