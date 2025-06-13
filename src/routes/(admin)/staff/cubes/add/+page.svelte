<script lang="ts">
    import { enhance } from "$app/forms";
    const { data, form } = $props();
    const { cubes, profiles } = $derived(data);

    let slug = $state("");
    let series = $state("");
    let model = $state("");
    let version = $state("");
    let brand = $state("");
    let otherBrand = $state("");
    let type = $state("");
    let releaseDate = $state("");
    let imageUrl = $state("");
    let surfaceFinish = $state("");
    let weight = $state(0);
    let size = $state(0);
    let cubeVersion = $state("");
    let submittedBy = $state("");
    let relatedTo = $state("");
    let wcaLegal = $state(false);
    let magnetic = $state(false);
    let smart = $state(false);
    let modded = $state(false);
    let discontinued = $state(false);
    let maglev = $state(false);

    // Example: These could come from a load function or API
    const allTypes = () => Array.from(new Set(cubes.map((c) => c.type))).sort();
    const allBrands = () =>
        Array.from(new Set(cubes.map((c) => c.brand))).sort();
    const allUsernames = () =>
        Array.from(new Set(profiles.map((p) => p.username))).sort();
    const allCubes = () =>
        Array.from(
            new Set(
                cubes.map((c) => ({
                    label: `${c.series} ${c.model} ${c.version_name}`,
                    value: c.slug,
                })),
            ),
        ).sort();
</script>

<section
    class="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden py-10"
>
    <div class="w-full p-8 z-10">
        <h1 class="text-3xl font-clash font-bold text-center mb-6">
            Add a Cube
        </h1>
        <form method="POST" use:enhance class="space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                    <label class="block text-sm mb-1"
                        >Series
                        <input
                            name="series"
                            type="text"
                            placeholder="GAN356"
                            bind:value={series}
                            class="input w-full input-lg"
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
                            class="input w-full input-lg"
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
                                class="input w-full input-lg"
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
                            class="select select-lg w-full"
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
                                bind:value={otherBrand}
                                class="input w-full input-lg"
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
                            class="select select-lg w-full"
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
                <div>
                    <label class="block text-sm mb-1"
                        >Release Date <span class="text-red-500">*</span>
                        <input
                            name="releaseDate"
                            type="date"
                            bind:value={releaseDate}
                            class="input w-full input-lg"
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
                            bind:value={imageUrl}
                            class="input w-full input-lg"
                            placeholder="https://..."
                            required
                        />
                    </label>
                </div>
                <div>
                    <label class="block text-sm mb-1"
                        >Surface Finish <span class="text-red-500">*</span>
                        <input
                            name="surfaceFinish"
                            type="text"
                            placeholder="Frosted"
                            bind:value={surfaceFinish}
                            class="input w-full input-lg"
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
                            min="0"
                            step="0.1"
                            bind:value={weight}
                            class="input w-full input-lg"
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
                            min="0"
                            step="0.1"
                            bind:value={size}
                            class="input w-full input-lg"
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
                            class="select select-lg w-full"
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
                        >Submitted By (if not specified it will default to you)
                        <select
                            name="submittedBy"
                            bind:value={submittedBy}
                            class="select select-lg w-full"
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
                {#if modded || cubeVersion === "Trim" || cubeVersion === "Limited"}
                    <div>
                        <label class="block text-sm mb-1"
                            >Related To <span class="text-red-500">*</span>
                            <select
                                name="relatedTo"
                                bind:value={relatedTo}
                                class="select select-lg w-full"
                                required
                            >
                                <option value="disabled" selected
                                    >Select Model</option
                                >
                                {#each allCubes() as c}
                                    <option value={c.value}>{c.label}</option>
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
                        bind:checked={wcaLegal}
                        class="checkbox checkbox-md bg-base-100"
                    />
                    <label for="wca_legal" class="text-sm">WCA Legal</label>
                </div>
                <div class="flex items-center gap-3">
                    <input
                        name="magnetic"
                        type="checkbox"
                        bind:checked={magnetic}
                        class="checkbox checkbox-md bg-base-100"
                    />
                    <label for="magnetic" class="text-sm">Magnetic</label>
                </div>
                <div class="flex items-center gap-3">
                    <input
                        name="smart"
                        type="checkbox"
                        bind:checked={smart}
                        class="checkbox checkbox-md bg-base-100"
                    />
                    <label for="smart" class="text-sm">Smart</label>
                </div>
                <div class="flex items-center gap-3">
                    <input
                        name="modded"
                        type="checkbox"
                        bind:checked={modded}
                        class="checkbox checkbox-md bg-base-100"
                    />
                    <label for="modded" class="text-sm">Modded</label>
                </div>
                <div class="flex items-center gap-3">
                    <input
                        name="discontinued"
                        type="checkbox"
                        bind:checked={discontinued}
                        class="checkbox checkbox-md bg-base-100"
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
                        class="checkbox checkbox-md bg-base-100"
                    />
                    <label for="maglev" class="text-sm">Maglev</label>
                </div>
            </div>

            <button type="submit" class="btn btn-primary btn-lg w-full">
                Add Cube
            </button>
        </form>

        {#if form?.message}
            <p class="text-info text-center mt-4">{form.message}</p>
        {/if}
    </div>
</section>
