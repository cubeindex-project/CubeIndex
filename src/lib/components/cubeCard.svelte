<script lang="ts">
    import StarRating from "./starRating.svelte";
    let { cube, rate, add, details, badges } = $props();
</script>

<div
    class="bg-neutral-900 border border-neutral-700 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition flex flex-col"
>
    <img
        src={cube.image_url}
        alt={cube.name}
        class="w-full h-48 object-cover"
    />
    <div class="p-5 flex-1 flex flex-col">
        <h2 class="text-xl font-bold mb-1">
            {cube.series}
            {cube.model}
            {#if cube.version_type !== "Base"}
                <span class="text-blue-400">{cube.version_name}</span>
            {/if}
            {#if badges}
                {#if cube.version_type === "Base"}
                    <span
                        class="ml-2 px-2 py-1 rounded bg-blue-700/80 text-xs font-semibold relative group"
                    >
                        <span class="font-clash uppercase">Base</span>
                    </span>
                {:else if cube.version_type === "Limited"}
                    <span
                        class="ml-2 px-2 py-1 rounded bg-yellow-500/80 text-xs font-semibold relative group"
                    >
                        <span class="font-clash uppercase">Limited Edition</span
                        >
                    </span>
                {:else}
                    <span
                        class="ml-2 px-2 py-1 rounded bg-green-600/80 text-xs font-semibold relative group"
                    >
                        <span class="font-clash uppercase">Trim</span>
                    </span>
                {/if}
            {/if}
        </h2>
        <p class="text-sm text-gray-400">
            {cube.type} ・ {cube.brand}
        </p>
        <div class="mt-3">
            <StarRating rating={cube.rating} large={false} />
        </div>
        <div class="mt-4 flex gap-2">
            {#if add}
                <button
                    class="flex-1 px-3 py-2 cursor-pointer rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold transition text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    type="button"
                    aria-label="Add to Collection"
                    disabled
                >
                    <i class="fa-solid fa-plus mr-2"></i>
                    Add to Collection
                </button>
            {/if}
            {#if rate}
                <button
                    class="flex-1 px-3 py-2 cursor-pointer rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white font-semibold transition text-sm"
                    type="button"
                    aria-label="Rate this Cube"
                    onclick={() => alert(`Rate ${cube.series} ${cube.model}`)}
                >
                    <i class="fa-solid fa-star mr-2"></i>
                    Rate this Cube
                </button>
            {/if}
        </div>
        {#if details}
            <a
                href={`/explore/cubes/${cube.slug}`}
                class="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow transition duration-150"
                aria-label="View Cube Details"
            >
                View Details
                <i class="fa-solid fa-arrow-right"></i>
            </a>
        {/if}
    </div>
</div>
