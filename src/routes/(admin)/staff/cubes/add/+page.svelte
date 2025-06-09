<script lang="ts">
    const { data } = $props();
    const { cubes, profiles } = $derived(data);

    let series = $state();
    let model = $state();
    let slug = $state();
    let brand = $state();
    let type = $state();
    let otherType = $state();
    let image_url = $state();
    let releaseDate = $state();
    let weight = $state();
    let size = $state();
    let modOf = $state();
    let limitedOf = $state();
    let version = $state();
    let cubeVersion = $state();
    let submittedBy = $state();
    let wca_legal = $state(false);
    let magnetic = $state(false);
    let smart = $state(false);
    let discontinued = $state(false);
    let maglev = $state(false);
    let modded = $state(false);
    let error: string | null = $state(null);
    let message: string | null = $state(null);

    // Example: These could come from a load function or API
    const allTypes = () => Array.from(new Set(cubes.map((c) => c.type))).sort();
    const allBrands = () =>
        Array.from(new Set(cubes.map((c) => c.brand))).sort();
    const allSlug = () => Array.from(new Set(cubes.map((c) => c.slug))).sort();
    const allUsernames = () =>
        Array.from(new Set(profiles.map((p) => p.username))).sort();

    async function handleSubmit(e: Event) {
        e.preventDefault();
        error = null;
        message = null;

        // Basic validation
        if (
            !slug ||
            !series ||
            !model ||
            !brand ||
            !type ||
            !releaseDate ||
            !image_url ||
            !weight ||
            !size ||
            !cubeVersion ||
            !submittedBy ||
            brand === "disabled" ||
            type === "disabled" ||
            cubeVersion === "disabled" ||
            submittedBy === "disabled"
        ) {
            error = "Please fill in all required fields.";
            return;
        }

        if (brand === "___other" && !otherType) {
            error = "Please specify the other brand.";
            return;
        }
        if (type === "___other" && !otherType) {
            error = "Please specify the other type.";
            return;
        }
        if ((cubeVersion === "Trim" || cubeVersion === "Limited") && !version) {
            error = "Please specify the version.";
            return;
        }
        if (modded && !modOf) {
            error = "Please select the model this is a mod of.";
            return;
        }
        if (cubeVersion === "Limited" && !limitedOf) {
            error = "Please select the model this is a limited edition of.";
            return;
        }
        if (smart && wca_legal) {
            error = "Smart cubes cannot be WCA legal.";
            return;
        }

        message = "Cube added successfully!";
    }
</script>

<section
    class="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 relative overflow-hidden py-10"
>
    <div
        class="w-full max-w-xl bg-neutral-900 border border-neutral-700 rounded-2xl shadow-lg p-8 z-10"
    >
        <h1 class="text-3xl font-clash font-bold text-center mb-6">
            Add a Cube
        </h1>
        <form class="space-y-6" onsubmit={handleSubmit} method="POST">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                    <label class="block text-sm mb-1"
                        >Slug <span class="text-red-500">*</span>
                        <input
                            name="slug"
                            type="text"
                            placeholder="gan-356-maglev"
                            bind:value={slug}
                            class="w-full bg-neutral-800 text-white p-3 rounded-lg border border-neutral-700 focus:border-blue-500 outline-none transition"
                            required
                        />
                    </label>
                </div>
                <div>
                    <label class="block text-sm mb-1"
                        >Series <span class="text-red-500">*</span>
                        <input
                            name="series"
                            type="text"
                            placeholder="GAN356"
                            bind:value={series}
                            class="w-full bg-neutral-800 text-white p-3 rounded-lg border border-neutral-700 focus:border-blue-500 outline-none transition"
                            required
                        />
                    </label>
                </div>
                <div>
                    <label class="block text-sm mb-1"
                        >Model <span class="text-red-500">*</span>
                        <input
                            name="model"
                            type="text"
                            placeholder="Maglev"
                            bind:value={model}
                            class="w-full bg-neutral-800 text-white p-3 rounded-lg border border-neutral-700 focus:border-blue-500 outline-none transition"
                            required
                        />
                    </label>
                </div>
                {#if cubeVersion === "Trim" || cubeVersion === "Limited"}
                    <div>
                        <label class="block text-sm mb-1"
                            >Version <span class="text-red-500">*</span>
                            <input
                                name="version"
                                type="text"
                                placeholder="UV / 10 Year Edition"
                                bind:value={version}
                                class="w-full bg-neutral-800 text-white p-3 rounded-lg border border-neutral-700 focus:border-blue-500 outline-none transition"
                                required
                            />
                        </label>
                    </div>
                {/if}
                <div>
                    <label class="block text-sm mb-1"
                        >Brand <span class="text-red-500">*</span>
                        <select
                            name="brand"
                            bind:value={brand}
                            class="w-full bg-neutral-800 text-white p-3 rounded-lg border border-neutral-700 focus:border-blue-500 outline-none transition"
                            required
                        >
                            <option value="disabled" selected
                                >Select Brand</option
                            >
                            {#each allBrands() as b}
                                <option value={b}>{b}</option>
                            {/each}
                            <option value="___other">Other...</option>
                        </select>
                    </label>
                </div>
                {#if brand === "___other"}
                    <div>
                        <label class="block text-sm mb-1"
                            >Other Brand <span class="text-red-500">*</span>
                            <input
                                name="otherBrand"
                                type="text"
                                bind:value={otherType}
                                class="w-full bg-neutral-800 text-white p-3 rounded-lg border border-neutral-700 focus:border-blue-500 outline-none transition"
                                required
                            />
                        </label>
                    </div>
                {/if}
                <div>
                    <label class="block text-sm mb-1"
                        >Type <span class="text-red-500">*</span>
                        <select
                            name="type"
                            bind:value={type}
                            class="w-full bg-neutral-800 text-white p-3 rounded-lg border border-neutral-700 focus:border-blue-500 outline-none transition"
                            required
                        >
                            <option value="disabled" selected
                                >Select Type</option
                            >
                            {#each allTypes() as t}
                                <option value={t}>{t}</option>
                            {/each}
                            <option value="___other">Other...</option>
                        </select>
                    </label>
                </div>
                {#if type === "___other"}
                    <div>
                        <label class="block text-sm mb-1"
                            >Other Type <span class="text-red-500">*</span>
                            <input
                                name="otherType"
                                type="text"
                                bind:value={otherType}
                                class="w-full bg-neutral-800 text-white p-3 rounded-lg border border-neutral-700 focus:border-blue-500 outline-none transition"
                                required
                            />
                        </label>
                    </div>
                {/if}
                <div>
                    <label class="block text-sm mb-1"
                        >Release Date <span class="text-red-500">*</span>
                        <input
                            name="releaseDate"
                            type="date"
                            bind:value={releaseDate}
                            class="w-full bg-neutral-800 text-white p-3 rounded-lg border border-neutral-700 focus:border-blue-500 outline-none transition"
                            required
                        />
                    </label>
                </div>
                <div>
                    <label class="block text-sm mb-1"
                        >Image URL <span class="text-red-500">*</span>
                        <input
                            name="imageUrl"
                            type="url"
                            bind:value={image_url}
                            class="w-full bg-neutral-800 text-white p-3 rounded-lg border border-neutral-700 focus:border-blue-500 outline-none transition"
                            placeholder="https://..."
                            required
                        />
                    </label>
                </div>
                <div>
                    <label class="block text-sm mb-1"
                        >Weight <span class="text-red-500">*</span>
                        <input
                            name="weight"
                            type="number"
                            min=0
                            bind:value={weight}
                            class="w-full bg-neutral-800 text-white p-3 rounded-lg border border-neutral-700 focus:border-blue-500 outline-none transition"
                            required
                        />
                    </label>
                </div>
                <div>
                    <label class="block text-sm mb-1"
                        >Size <span class="text-red-500">*</span>
                        <input
                            name="size"
                            type="number"
                            min=0
                            bind:value={size}
                            class="w-full bg-neutral-800 text-white p-3 rounded-lg border border-neutral-700 focus:border-blue-500 outline-none transition"
                            required
                        />
                    </label>
                </div>
                <div>
                    <label class="block text-sm mb-1"
                        >Cube Type <span class="text-red-500">*</span>
                        <select
                            name="cubeVersion"
                            bind:value={cubeVersion}
                            class="w-full bg-neutral-800 text-white p-3 rounded-lg border border-neutral-700 focus:border-blue-500 outline-none transition"
                            required
                        >
                            <option value="disabled" selected
                                >Select Cube Type</option
                            >
                            <option value="Base">Base</option>
                            <option value="Trim">Trim</option>
                            <option value="Limited">Limited Edition</option>
                        </select>
                    </label>
                </div>
                <div>
                    <label class="block text-sm mb-1"
                        >Submitted By <span class="text-red-500">*</span>
                        <select
                            name="submittedBy"
                            bind:value={submittedBy}
                            class="w-full bg-neutral-800 text-white p-3 rounded-lg border border-neutral-700 focus:border-blue-500 outline-none transition"
                            required
                        >
                            <option value="disabled" selected
                                >Select User</option
                            >
                            {#each allUsernames() as u}
                                <option value={u}>{u}</option>
                            {/each}
                        </select>
                    </label>
                </div>
                {#if modded === true}
                    <div>
                        <label class="block text-sm mb-1"
                            >Mod Of <span class="text-red-500">*</span>
                            <select
                                name="modOf"
                                bind:value={modOf}
                                class="w-full bg-neutral-800 text-white p-3 rounded-lg border border-neutral-700 focus:border-blue-500 outline-none transition"
                                required
                            >
                                <option value="disabled" selected
                                    >Select Model</option
                                >
                                {#each allSlug() as s}
                                    <option value={s}>{s}</option>
                                {/each}
                            </select>
                        </label>
                    </div>
                {/if}
                {#if cubeVersion === "Limited"}
                    <div>
                        <label class="block text-sm mb-1"
                            >Limited Edition Of <span class="text-red-500"
                                >*</span
                            >
                            <select
                                name="limitedOf"
                                bind:value={limitedOf}
                                class="w-full bg-neutral-800 text-white p-3 rounded-lg border border-neutral-700 focus:border-blue-500 outline-none transition"
                                required
                            >
                                <option value="disabled" selected
                                    >Select Model</option
                                >
                                {#each allSlug() as s}
                                    <option value={s}>{s}</option>
                                {/each}
                            </select>
                        </label>
                    </div>
                {/if}
            </div>

            <!-- Toggles and rating -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div class="flex items-center gap-3">
                    <input
                        name="wcaLegal"
                        type="checkbox"
                        bind:checked={wca_legal}
                        class="h-5 w-5 rounded border-neutral-700 bg-neutral-800 text-blue-500 focus:ring-blue-500"
                    />
                    <label for="wca_legal" class="text-sm">WCA Legal</label>
                </div>
                <div class="flex items-center gap-3">
                    <input
                        name="magnetic"
                        type="checkbox"
                        bind:checked={magnetic}
                        class="h-5 w-5 rounded border-neutral-700 bg-neutral-800 text-blue-500 focus:ring-blue-500"
                    />
                    <label for="magnetic" class="text-sm">Magnetic</label>
                </div>
                <div class="flex items-center gap-3">
                    <input
                        name="smart"
                        type="checkbox"
                        bind:checked={smart}
                        class="h-5 w-5 rounded border-neutral-700 bg-neutral-800 text-blue-500 focus:ring-blue-500"
                    />
                    <label for="smart" class="text-sm">Smart</label>
                </div>
                <div class="flex items-center gap-3">
                    <input
                        name="modded"
                        type="checkbox"
                        bind:checked={modded}
                        class="h-5 w-5 rounded border-neutral-700 bg-neutral-800 text-blue-500 focus:ring-blue-500"
                    />
                    <label for="modded" class="text-sm">Modded</label>
                </div>
                <div class="flex items-center gap-3">
                    <input
                        name="discontinued"
                        type="checkbox"
                        bind:checked={discontinued}
                        class="h-5 w-5 rounded border-neutral-700 bg-neutral-800 text-blue-500 focus:ring-blue-500"
                    />
                    <label for="discontinued" class="text-sm"
                        >Discontinued</label
                    >
                </div>
                <div class="flex items-center gap-3">
                    <input
                        name="maglev"
                        type="checkbox"
                        bind:checked={maglev}
                        class="h-5 w-5 rounded border-neutral-700 bg-neutral-800 text-blue-500 focus:ring-blue-500"
                    />
                    <label for="maglev" class="text-sm">Maglev</label>
                </div>
            </div>

            <button
                type="submit"
                class="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 transition rounded-lg px-6 py-3 font-semibold text-white text-lg"
            >
                Add Cube
            </button>

            {#if error}
                <p class="text-sm text-red-500 text-center mt-2">{error}</p>
            {/if}
            {#if message}
                <p class="text-sm text-green-400 text-center mt-2">{message}</p>
            {/if}
        </form>
    </div>
</section>
