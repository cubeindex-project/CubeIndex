<script lang="ts">
    let nameId: string;
    let name: string;
    let brand: string;
    let type: string;
    let image_url: string;
    let wca_legal: boolean;
    let magnetic: boolean;
    let smart: boolean;
    let release_year: number = new Date().getFullYear();
    let error: string;
    let success: string;

    function submitCube() {}
</script>

<section
    class="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 relative overflow-hidden"
>
    <div class="absolute inset-0 opacity-10">
        <img
            src="/images/hero-bg.png"
            alt=""
            class="w-full h-full object-cover"
        />
    </div>

    <div
        class="z-10 text-3xl p-5 bg-neutral-900 rounded-2xl border-neutral-700 border"
    >
        <h1 class="font-clash m-6">Add New Cube to Database</h1>
        <form on:submit|preventDefault={submitCube} class="space-y-6">
            <div>
                <label class="block text-sm mb-1"
                    >Name *
                    <input
                        bind:value={name}
                        required
                        class="w-full bg-neutral-800 text-white px-4 py-2 rounded-lg border border-neutral-700 focus:ring focus:ring-blue-600"
                    />
                </label>
            </div>

            <div>
                <label class="block text-sm mb-1"
                    >Brand *
                    <input
                        bind:value={brand}
                        required
                        class="w-full bg-neutral-800 text-white px-4 py-2 rounded-lg border border-neutral-700"
                    />
                </label>
            </div>

            <div>
                <label class="block text-sm mb-1"
                    >Type *
                    <input
                        bind:value={type}
                        required
                        placeholder="e.g. 3x3, 2x2, Skewb"
                        class="w-full bg-neutral-800 text-white px-4 py-2 rounded-lg border border-neutral-700"
                    />
                </label>
            </div>

            <div>
                <label class="block text-sm mb-1"
                    >Release Year
                    <input
                        type="number"
                        min="1974"
                        max={new Date().getFullYear()}
                        bind:value={release_year}
                        class="w-full bg-neutral-800 text-white px-4 py-2 rounded-lg border border-neutral-700"
                    />
                </label>
            </div>

            <div>
                <label class="block text-sm mb-1"
                    >Image URL *
                    <input
                        bind:value={image_url}
                        required
                        class="w-full bg-neutral-800 text-white px-4 py-2 rounded-lg border border-neutral-700"
                    />
                </label>
            </div>

            <div class="flex flex-col gap-4 text-sm mt-4">
                <label class="flex items-center gap-2">
                    <input type="checkbox" bind:checked={wca_legal} /> WCA Legal
                </label>
                <label class="flex items-center gap-2">
                    <input type="checkbox" bind:checked={magnetic} /> Magnetic
                </label>
                <label class="flex items-center gap-2">
                    <input type="checkbox" bind:checked={smart} /> Smart Cube
                </label>
            </div>

            <button
                type="submit"
                class="mt-6 w-full rounded-lg bg-blue-600 py-3 font-semibold hover:bg-blue-700 transition"
            >
                Add Cube
            </button>
        </form>
    </div>
</section>
