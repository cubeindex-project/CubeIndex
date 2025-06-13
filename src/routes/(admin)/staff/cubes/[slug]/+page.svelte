<script lang="ts">
    import CubeVersionType from "$lib/components/cubeVersionType.svelte";

    let { data } = $props();
    let {
        cube,
        relatedCube,
        cubeTrims,
        sameSeries,
        vendor_links: initialLinks,
        profiles,
    } = $derived(data);

    let imageUrl = $derived(cube.image_url);
    let series = $derived(cube.series);
    let model = $derived(cube.model);
    let versionName = $derived(cube.version_name);
    let brand = $derived(cube.brand);
    let type = $derived(cube.type);
    let weight = $derived(cube.weight);
    let size = $derived(cube.size);
    let surface = $derived(cube.surface_finish);
    let release = $derived(cube.release_date);
    let versionType = $derived(cube.version_type);
    let smart = $derived(cube.smart);
    let magnetic = $derived(cube.magnetic);
    let modded = $derived(cube.modded);
    let wcaLegal = $derived(cube.wca_legal);
    let maglev = $derived(cube.maglev);
    let discontinued = $derived(cube.discontinued);

    let derivedVendorLinks = $state(() => initialLinks)

    function formatDate(dateString: string): string {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(date);
    }

    function idOfUser(user: string) {
        const profile = profiles?.find(
            (p: { username: string }) => p.username === user,
        );
        return profile ? `/user/${profile.id}` : "#";
    }
</script>

<section class="min-h-screen px-6 py-16">
    <div class="flex">
        <div class="flex-1">
            <h1 class="mb-4 font-clash text-5xl flex items-center gap-3">
                Edit:
            </h1>
            <form class="space-y-6">
                <div>
                    <label class="block mb-1 font-medium"
                        >Version Type
                        <select bind:value={versionType} class="select w-full">
                            <option value="Base">Base</option>
                            <option value="Trim">Trim</option>
                            <option value="Limited">Limited Edition</option>
                        </select>
                    </label>
                </div>
                <div>
                    <label class="block mb-1 font-medium" for="series"
                        >Series</label
                    >
                    <input
                        id="series"
                        type="text"
                        class="input input-bordered w-full"
                        bind:value={series}
                    />
                </div>
                <div>
                    <label class="block mb-1 font-medium" for="model"
                        >Model</label
                    >
                    <input
                        id="model"
                        type="text"
                        class="input input-bordered w-full"
                        bind:value={model}
                    />
                </div>
                <div>
                    <label class="block mb-1 font-medium" for="versionName"
                        >Version Name</label
                    >
                    <input
                        id="versionName"
                        type="text"
                        class="input input-bordered w-full"
                        bind:value={versionName}
                    />
                </div>
                <div>
                    <label class="block mb-1 font-medium" for="brand"
                        >Brand</label
                    >
                    <input
                        id="brand"
                        type="text"
                        class="input input-bordered w-full"
                        bind:value={brand}
                    />
                </div>
                <div>
                    <label class="block mb-1 font-medium" for="type">Type</label
                    >
                    <input
                        id="type"
                        type="text"
                        class="input input-bordered w-full"
                        bind:value={type}
                    />
                </div>
                <div>
                    <label class="block mb-1 font-medium" for="weight"
                        >Weight (g)</label
                    >
                    <input
                        id="weight"
                        type="number"
                        step="0.1"
                        class="input input-bordered w-full"
                        bind:value={weight}
                    />
                </div>
                <div>
                    <label class="block mb-1 font-medium" for="weight"
                        >Size (mm3)</label
                    >
                    <input
                        id="size"
                        type="number"
                        step="0.1"
                        class="input input-bordered w-full"
                        bind:value={size}
                    />
                </div>
                <div>
                    <label class="block mb-1 font-medium" for="surface"
                        >Surface Finish</label
                    >
                    <input
                        id="surface"
                        type="text"
                        class="input input-bordered w-full"
                        bind:value={surface}
                    />
                </div>
                <div>
                    <label class="block mb-1 font-medium" for="release"
                        >Release Date</label
                    >
                    <input
                        id="release"
                        type="date"
                        class="input input-bordered w-full"
                        bind:value={release}
                    />
                </div>
                <div class="divider"></div>
                <div class="grid grid-cols-2 gap-4">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            bind:checked={smart}
                            class="checkbox"
                        />
                        <span>Smart</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            bind:checked={magnetic}
                            class="checkbox"
                        />
                        <span>Magnetic</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            bind:checked={modded}
                            class="checkbox"
                        />
                        <span>Modded</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            bind:checked={wcaLegal}
                            class="checkbox"
                        />
                        <span>WCA Legal</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            bind:checked={maglev}
                            class="checkbox"
                        />
                        <span>Maglev</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            bind:checked={discontinued}
                            class="checkbox"
                        />
                        <span>Discontinued</span>
                    </label>
                </div>
                <div class="divider"></div>
                <div>
                    <table class="table w-full mb-4">
                        <thead>
                            <tr>
                                <th>Vendor Name</th>
                                <th>URL</th>
                                <th>Price ($)</th>
                                <th>Available</th>
                                <th>Remove</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each derivedVendorLinks() as link, i (link.vendorName)}
                                <tr>
                                    <td>
                                        <input
                                            type="text"
                                            class="input input-bordered w-full"
                                            bind:value={link.vendorName}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="url"
                                            class="input input-bordered w-full"
                                            bind:value={link.url}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            step="0.01"
                                            class="input input-bordered w-full"
                                            bind:value={link.price}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="checkbox"
                                            class="checkbox"
                                            bind:checked={link.available}
                                        />
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            class="btn btn-error btn-sm"
                                            aria-label="Remove Vendor Link"
                                            onclick={() =>
                                                derivedVendorLinks().splice(i, 1)}
                                        >
                                            <i class="fa-solid fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                    <button
                        type="button"
                        class="btn btn-primary btn-sm"
                        onclick={() =>
                            derivedVendorLinks().push({
                                vendor_name: "",
                                url: "",
                                price: "",
                                available: false,
                            })}
                    >
                        <i class="fa-solid fa-plus"></i> Add Vendor
                    </button>
                </div>
            </form>
        </div>
        <div class="divider divider-horizontal"></div>
        <div class="max-w-4xl mx-auto flex-1">
            <h1 class="mb-4 font-clash text-5xl flex items-center gap-3">
                Preview:
            </h1>
            <div class="my-6 flex flex-col sm:flex-row items-center gap-6">
                <img
                    src={imageUrl}
                    alt="{series} {model} {versionName}"
                    class="rounded-2xl bg-base-200 p-4 my-4 border border-base-300 object-contain w-full max-w-md max-h-96"
                />
            </div>
            <h1 class="text-4xl font-bold mb-4 flex items-center gap-3">
                <span class="font-clash">
                    {series}
                    {model}
                    {#if versionType !== "Base"}
                        <span class="text-secondary">{versionName}</span>
                    {/if}
                    <CubeVersionType
                        version_type={versionType}
                        moreInfo={true}
                    />
                </span>
            </h1>

            <div
                class="mb-4 p-4 bg-base-200 rounded-xl border border-base-300 shadow-sm"
            >
                <p class="leading-relaxed">
                    Description:
                    <span class="block mt-2">
                        The <span class="font-bold text-primary"
                            >{`${series} ${model} ${versionType !== "Base" ? versionName : ""}`}</span
                        >
                        is a
                        <span class="font-bold text-primary">{type}</span>
                        twisty puzzle released on
                        <span class="font-bold text-primary"
                            >{formatDate(release)}</span
                        >. It is
                        <span class="font-bold text-primary"
                            >{magnetic ? "magnetic" : "non-magnetic"}</span
                        >,
                        <span class="font-bold text-primary"
                            >{smart ? "smart" : "non-smart"}</span
                        >, and
                        <span class="font-bold text-primary"
                            >{wcaLegal ? "WCA-legal" : "not WCA-legal"}</span
                        >. Currently, it is
                        <span class="font-bold text-primary"
                            >{discontinued ? "discontinued" : "available"}</span
                        >, has a community rating of
                        <span class="font-bold text-primary"
                            >{cube.rating}/5</span
                        >, and is
                        <span class="font-bold text-primary"
                            >{modded ? "modded" : "original"}</span
                        >.
                    </span>
                </p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 mb-4">
                <div
                    class="bg-base-200 rounded-xl p-4 flex flex-col gap-2 border border-base-300"
                >
                    <div class="flex items-center justify-between">
                        <span>Brand:</span>
                        <span class="font-medium">{brand}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span>Type:</span>
                        <span class="font-medium">{type}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span>Weight:</span>
                        <span class="font-medium">{weight} g</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span>Size:</span>
                        <span class="font-medium">{size} mm3</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span>Surface Finish:</span>
                        <span class="font-medium">{surface}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span>Release Date:</span>
                        <span class="font-medium">{formatDate(release)}</span>
                    </div>
                </div>
                <div
                    class="bg-base-200 rounded-xl p-4 flex flex-col gap-2 border border-base-300"
                >
                    <div class="flex items-center justify-between">
                        <span>Smart:</span>
                        <span class="text-xl">{smart ? "✅" : "❌"}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span>Magnetic:</span>
                        <span class="text-xl">{magnetic ? "✅" : "❌"}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span>Modded:</span>
                        <span class="text-xl">{modded ? "✅" : "❌"}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span>WCA Legal:</span>
                        <span class="text-xl">{wcaLegal ? "✅" : "❌"}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span>Maglev:</span>
                        <span class="text-xl">{maglev ? "✅" : "❌"}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span>Discontinued:</span>
                        <span class="text-xl">{discontinued ? "✅" : "❌"}</span
                        >
                    </div>
                </div>
            </div>
            {#if derivedVendorLinks() && derivedVendorLinks().length > 0}
                <div class="my-8">
                    <h2
                        class="text-lg font-semibold mb-3 flex items-center gap-2"
                    >
                        <i class="fa-solid fa-cart-shopping"></i>
                        Available at:
                    </h2>
                    <div class="flex flex-wrap gap-3">
                        {#each derivedVendorLinks() as shop}
                            <a
                                href={shop.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="btn btn-outline {shop.available
                                    ? 'btn-primary'
                                    : 'btn-error'}"
                            >
                                {#if shop.available}
                                    <i class="fa-solid fa-check"></i>
                                {:else}
                                    <i class="fa-solid fa-xmark"></i>
                                {/if}
                                {shop.vendorName} ・ ≃ {shop.price} $
                            </a>
                        {/each}
                    </div>
                </div>
            {/if}

            <div class="my-8">
                <div class="bg-base-200 rounded-xl p-4 border border-base-300">
                    <h2
                        class="text-lg font-semibold mb-3 flex items-center gap-2"
                    >
                        <i class="fa-regular fa-clock"></i>
                        Database Info:
                    </h2>
                    <div class="flex flex-col sm:flex-row gap-6">
                        <div class="flex items-center gap-2">
                            <span>ID:</span>{cube.id}
                        </div>
                        <div class="flex items-center gap-2">
                            <span>Added:</span>
                            <span class="font-medium">
                                {formatDate(cube.created_at)}
                            </span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span>Last Updated:</span>
                            <span class="font-medium">
                                {formatDate(cube.updated_at)}
                            </span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span>Submitted by:</span>
                            <a
                                class="font-medium underline"
                                href={idOfUser(cube.submitted_by)}
                            >
                                {cube.submitted_by || "Unknown"}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            {#if cube.version_type === "Base" && cubeTrims && cubeTrims.length > 0}
                <div class="mb-8">
                    <h2
                        class="text-lg font-semibold mb-3 flex items-center gap-2"
                    >
                        <i class="fa-solid fa-palette"></i>
                        Select Trim:
                    </h2>
                    <div class="flex gap-4">
                        {#each cubeTrims ?? [] as trim}
                            <a
                                class="flex flex-col items-center border rounded-xl px-4 py-2 transition duration-200 focus:outline-none border-base-300 bg-base-200 hover:bg-base-300"
                                href="/staff/cubes/{trim.slug}"
                            >
                                <img
                                    src={trim.image_url}
                                    alt={trim.version_name}
                                    class="h-16 object-contain mb-2 rounded"
                                />
                                <span class="font-medium"
                                    >{trim.version_name}</span
                                >
                            </a>
                        {/each}
                    </div>
                </div>
            {/if}
            {#if cube.version_type !== "Base" || cube.modded === true}
                <div class="mb-8">
                    <h2
                        class="text-lg font-semibold mb-3 flex items-center gap-2"
                    >
                        <i class="fa-solid fa-palette"></i>
                        Related To:
                    </h2>
                    <div class="flex gap-4">
                        <a
                            class="flex flex-col items-center border rounded-xl px-4 py-2 transition duration-200 focus:outline-none border-base-300 bg-base-200 hover:bg-base-300"
                            href="/staff/cubes/{relatedCube.slug}"
                        >
                            <img
                                src={relatedCube.image_url}
                                alt={relatedCube.version_name}
                                class="h-16 object-contain mb-2 rounded"
                            />
                            <span class="font-medium"
                                >{relatedCube.series}
                                {relatedCube.model}</span
                            >
                        </a>
                    </div>
                </div>
            {/if}
            {#if sameSeries && sameSeries.length > 0 && sameSeries[0]?.series !== ""}
                <div class="mb-8">
                    <h2
                        class="text-lg font-semibold mb-3 flex items-center gap-2"
                    >
                        <i class="fa-solid fa-layer-group"></i>
                        In the Same Series:
                    </h2>
                    <div class="flex flex-wrap gap-4">
                        {#each sameSeries as seriesCube}
                            <a
                                class="flex flex-col items-center border rounded-xl px-4 py-2 transition duration-200 focus:outline-none border-base-300 bg-base-200 hover:bg-base-300 w-36"
                                href="/staff/cubes/{seriesCube.slug}"
                            >
                                <img
                                    src={seriesCube.image_url}
                                    alt={seriesCube.version_name}
                                    class="h-24 object-contain mb-2 rounded"
                                />
                                <span class="font-medium text-center">
                                    {seriesCube.series}
                                    {seriesCube.model}
                                </span>
                            </a>
                        {/each}
                    </div>
                </div>
            {/if}

            <a href="/staff/cubes" class="btn btn-lg btn-primary mt-6">
                ← Back to Explore
            </a>
        </div>
    </div>
</section>
