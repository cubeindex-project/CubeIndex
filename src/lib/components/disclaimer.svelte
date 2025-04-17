<script>
    let isOpen = $state(true);
    function dismiss() {
        isOpen = false;
    }
</script>

{#if isOpen}
    <div
        class="flex items-center justify-between p-4 bg-black text-white w-full"
    >
        <p class="text-center w-full">
            🚧 CubeIndex is in Beta — This is an early version and currently in
            active development. Features and design are still evolving.
        </p>

        <button
            class="absolute right-6 text-xl cursor-pointer hover:text-red-400 transition"
            aria-label="Close"
            onclick={dismiss}
        >
            <i class="fa-solid fa-xmark"></i>
        </button>
    </div>
{/if}
