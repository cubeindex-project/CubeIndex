<script lang="ts">
    import { onMount } from "svelte";
    import type { PageData } from "./$types";
    import { supabase } from "$lib/supabaseClient";

    let { data }: { data: PageData } = $props();

    // Your notifications array should come from your load function or state
    let notifications: any[] = $state([]);

    async function getMessages() {
        let { data, error } = await supabase.from("announcement").select("*");

        if (error) console.error("Error while loading announcement:", error);

        notifications = data || [];
    }

    function formatDate(iso: string) {
        return new Date(iso).toLocaleString(undefined, {
            dateStyle: "short",
            timeStyle: "short",
        });
    }

    onMount(getMessages);
</script>

<section class="min-h-screen bg-black text-white px-4 py-12">
  <div class="max-w-2xl mx-auto">
    <h1 class="text-4xl font-clash font-bold text-center mb-8">Notifications</h1>
    <div class="rounded-2xl bg-neutral-900/90 shadow-lg border border-neutral-800 overflow-hidden">
      {#if notifications.length === 0}
        <div class="py-16 text-center text-gray-400 text-lg">
          <i class="fa-solid fa-bell-slash text-3xl mb-2"></i><br />
          You have no notifications yet.
        </div>
      {:else}
        <ul class="flex flex-col gap-4 px-4 py-8">
          {#each notifications as n, i (n.id)}
            <li class="rounded-xl bg-neutral-800/80 hover:bg-neutral-700/90 transition group p-5 shadow flex flex-col gap-2 relative">
              <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                <!-- Icon and Title -->
                <div class="flex items-center gap-2">
                  {#if n.icon}
                    <span class="text-2xl">{n.icon}</span>
                  {:else if n.purpose === "announcement"}
                    <i class="fa-solid fa-bullhorn text-purple-400 text-2xl"></i>
                  {:else if n.purpose === "alert"}
                    <i class="fa-solid fa-triangle-exclamation text-red-400 text-2xl"></i>
                  {:else if n.purpose === "warning"}
                    <i class="fa-solid fa-exclamation-circle text-yellow-400 text-2xl"></i>
                  {:else}
                    <i class="fa-solid fa-bell text-blue-300 text-2xl"></i>
                  {/if}
                  <span class="font-semibold text-lg text-white">{n.title}</span>
                </div>
                <!-- Date: Below title on mobile, right on desktop -->
                <span class="text-sm text-gray-400 sm:ml-auto sm:mt-0 mt-1">{formatDate(n.created_at)}</span>
              </div>
              <div class="text-base text-gray-200">{n.message}</div>
              {#if n.link}
                <a
                  href={n.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-blue-400 text-sm mt-1 hover:underline"
                >
                  {`${n.linkText === "" ? "More info" : n.linkText}`}
                  <i class="fa-solid fa-arrow-up-right-from-square ml-1"></i>
                </a>
              {/if}
              <!-- Separator: not after the last notification -->
              {#if i < notifications.length - 1}
                <div class="absolute left-6 right-6 bottom-0 h-px bg-neutral-700/80"></div>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
</section>
