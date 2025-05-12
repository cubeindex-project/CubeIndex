<script>
    import { supabase } from "$lib/supabaseClient";
    import { onMount } from "svelte";

    /** @type {any[]} */
    let disclaimer = [];

    async function getMessages() {
        let { data, error } = await supabase.from("disclaimer").select("*");

        disclaimer = data || [];
    }

    let isOpen = true;

    function dismiss() {
        isOpen = false;
    }

    onMount(getMessages);
</script>

{#if isOpen}
    <div
        class="flex flex-col items-center justify-between p-4 bg-black text-white w-full"
    >
        {#each disclaimer as disclaimer}
            <p class={`text-center w-full mb-5`}></p>
            <p
                class={disclaimer.purpose === "warning"
                    ? "text-red-400"
                    : disclaimer.purpose === "legal"
                      ? "text-yellow-300"
                      : disclaimer.purpose === "maintenance"
                        ? "text-orange-400"
                        : disclaimer.purpose === "announcement"
                          ? "text-blue-400"
                          : disclaimer.purpose === "alert"
                            ? "text-red-600 font-bold"
                            : disclaimer.purpose === "promo"
                              ? "text-green-400"
                              : disclaimer.purpose === "update"
                                ? "text-purple-400"
                                : "text-white"}
            >
                {disclaimer.icon}
                {disclaimer.message}
            </p>
        {/each}
        <button
            class="absolute right-6 text-xl cursor-pointer"
            aria-label="Close"
            onclick={dismiss}
        >
            <i class="fa-solid fa-xmark"></i>
        </button>
    </div>
{/if}
