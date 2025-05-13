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
        class="flex items-center justify-center bg-black text-white w-full pt-3 flex-col relative"
    >
        <button
            class="md:absolute md:right-6 text-xl cursor-pointer static self-start mb-2"
            aria-label="Close"
            onclick={dismiss}
        >
            <i class="fa-solid fa-xmark hover:text-red"></i>
        </button>
        {#each disclaimer as disclaimer}
            <p class={`px-5 my-1`}></p>
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
                {disclaimer.icon}
            </p>
        {/each}
    </div>
{/if}
