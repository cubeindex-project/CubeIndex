<script lang="ts">
    import { supabase } from "$lib/supabaseClient";
    import { onMount } from "svelte";

    let isOpen = true;
    type Announcement = {
        id: number;
        purpose: string;
        icon?: string;
        title?: string;
        message: string;
        link?: string;
        linkText?: string;
    };

    let announcements: Announcement[] = [];

    async function getMessages() {
        let { data, error } = await supabase.from("announcement").select("*");

        if (error) {
            console.error("Error while loading announcement:", error);
        } else {
            announcements = data || [];
        }
    }

    onMount(getMessages);
</script>

<div class="fixed z-50 bottom-3 left-3 sm:left-8 flex flex-col-reverse gap-6 pointer-events-none">
  {#each announcements as announcement, i (announcement.id)}
    <div
      class={`relative flex items-start gap-3 min-w-[240px] max-w-xs p-4 pr-8 rounded-xl shadow-xl border border-black/10 transition-all duration-300 pointer-events-auto
        ${
          announcement.purpose === "warning"
            ? "bg-orange-100 text-orange-900 border-orange-300"
          : announcement.purpose === "alert"
            ? "bg-red-100 text-red-900 border-red-300"
          : announcement.purpose === "promo"
            ? "bg-green-100 text-green-900 border-green-300"
          : announcement.purpose === "legal"
            ? "bg-yellow-100 text-yellow-900 border-yellow-300"
          : announcement.purpose === "maintenance"
            ? "bg-blue-100 text-blue-900 border-blue-300"
          : announcement.purpose === "update"
            ? "bg-purple-100 text-purple-900 border-purple-300"
          : "bg-neutral-100 text-neutral-900 border-neutral-300"
        }`}
      style="animation: fadein .25s;"
      role="alert"
      aria-live="polite"
    >
      <span class="icon text-2xl mt-1">{announcement.icon}</span>
      <div class="flex-1 min-w-0">
        {#if announcement.title}
          <div class="font-semibold text-base mb-1">{announcement.title}</div>
        {/if}
        <div class="text-sm">{announcement.message}</div>
        {#if announcement.link}
          <a
            href={announcement.link}
            target="_blank"
            class="inline-block mt-2 text-xs underline font-medium text-inherit hover:opacity-80"
          >
            {announcement.linkText || "Learn more"}
            <i class="fa-solid fa-arrow-up-right-from-square pl-1"></i>
          </a>
        {/if}
      </div>
      <button
        class="absolute top-2 cursor-pointer right-2 p-1 rounded-full hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-black/20 transition"
        aria-label="Close announcement"
        on:click={() => (announcements = announcements.filter((a, j) => j !== i))}
        style="margin-left: 0.25rem;"
      >
        <i class="fa-solid fa-xmark px-2"></i>
      </button>
    </div>
  {/each}
</div>

<style>
    /* Fade-in animation for new cards */
    @keyframes fadein {
        from {
            opacity: 0;
            transform: translateY(1rem);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
