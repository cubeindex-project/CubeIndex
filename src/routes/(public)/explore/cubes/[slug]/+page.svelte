<script lang="ts">
    import FeatureDisabled from "$lib/components/featureDisabled.svelte";
    import StarRating from "$lib/components/starRating.svelte";

    let { data } = $props();
    let {
        cube,
        relatedCube,
        cubeTrims,
        sameSeries,
        vendor_links,
        profiles,
        user_ratings,
        cubesAvailability,
        databaseAvailability,
    } = $derived(data);

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

{#if databaseAvailability}
    <section class="min-h-screen bg-black text-white px-6 py-16">
        <div class="max-w-4xl mx-auto">
            <div class="my-6 flex flex-col sm:flex-row items-center gap-6">
                <img
                    src={cube.image_url}
                    alt={cube.name}
                    class="rounded-2xl bg-neutral-900 p-4 my-4 border border-neutral-700 object-contain w-full max-w-md max-h-96"
                />
            </div>
            <h1
                class="text-4xl font-bold text-white mb-4 flex items-center gap-3"
            >
                <span class="font-clash">
                    {cube.series}
                    {cube.model}
                    {#if cube.version_type !== "Base"}
                        <span class="text-blue-400">{cube.version_name}</span>
                    {/if}
                </span>
                {#if cube.version_type === "Base"}
                    <span
                        class="ml-2 px-2 py-1 rounded bg-blue-700/80 text-xs font-semibold relative group"
                    >
                        <span class="font-clash uppercase">Base</span>
                        <span
                            class="absolute right-0 top-full mt-2 w-max max-w-xs bg-neutral-800 text-white text-xs rounded p-2 shadow-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 pointer-events-none transition-opacity z-20"
                        >
                            The base version is the original or standard version
                            of this cube model.
                        </span>
                    </span>
                {:else if cube.version_type === "Limited"}
                    <span
                        class="ml-2 px-2 py-1 rounded bg-yellow-500/80 text-xs font-semibold relative group"
                    >
                        <span class="font-clash uppercase">Limited Edition</span
                        >
                        <span
                            class="absolute -right-0 top-full mt-2 w-max max-w-xs bg-neutral-800 text-white text-xs rounded p-2 shadow-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 pointer-events-none transition-opacity z-20"
                        >
                            Limited Edition versions are produced in restricted
                            quantities and may feature unique colors, packaging,
                            or other special characteristics.
                        </span>
                    </span>
                {:else}
                    <span
                        class="ml-2 px-2 py-1 rounded bg-green-600/80 text-xs font-semibold relative group"
                    >
                        <span class="font-clash uppercase">Trim</span>
                        <span
                            class="absolute -right-0 top-full mt-2 w-max max-w-xs bg-neutral-800 text-white text-xs rounded p-2 shadow-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 pointer-events-none transition-opacity z-20"
                        >
                            Trim versions are alternate variants of the base
                            model, often with different colors, finishes, or
                            minor features.
                        </span>
                    </span>
                {/if}
            </h1>

            <!-- Highlighted Rating -->
            <div
                class="flex flex-col items-center justify-center sm:items-start mb-5 sm:mt-0"
            >
                <StarRating rating={cube.rating} large={true} />
            </div>

            <div
                class="mb-4 p-4 bg-neutral-900 rounded-xl border border-neutral-800 shadow-sm"
            >
                <p class="text-gray-300 leading-relaxed">
                    Description:
                    <span class="block mt-2 text-white">
                        The <span class="font-bold text-blue-400"
                            >{`${cube.series} ${cube.model} ${cube.version_type !== "Base" ? cube.version_name : ""}`}</span
                        >
                        is a
                        <span class="font-bold text-blue-400">{cube.type}</span>
                        twisty puzzle released on
                        <span class="font-bold text-blue-400"
                            >{formatDate(cube.release_date)}</span
                        >. It is
                        <span class="font-bold text-blue-400"
                            >{cube.magnetic ? "magnetic" : "non-magnetic"}</span
                        >,
                        <span class="font-bold text-blue-400"
                            >{cube.smart ? "smart" : "non-smart"}</span
                        >, and
                        <span class="font-bold text-blue-400"
                            >{cube.wca_legal
                                ? "WCA-legal"
                                : "not WCA-legal"}</span
                        >. Currently, it is
                        <span class="font-bold text-blue-400"
                            >{cube.discontinued
                                ? "discontinued"
                                : "available"}</span
                        >, has a community rating of
                        <span class="font-bold text-blue-400"
                            >{cube.rating}/5</span
                        >, and is
                        <span class="font-bold text-blue-400"
                            >{cube.modded ? "modded" : "original"}</span
                        >.
                    </span>
                </p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 mb-4">
                <div
                    class="bg-neutral-900 rounded-xl p-4 flex flex-col gap-2 border border-neutral-800"
                >
                    <div class="flex items-center justify-between">
                        <span class="text-gray-400">Brand:</span>
                        <span class="text-white font-medium">{cube.brand}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-400">Type:</span>
                        <span class="text-white font-medium">{cube.type}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-400">Weight:</span>
                        <span class="text-white font-medium"
                            >{cube.weight} g</span
                        >
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-400">Surface Finish:</span>
                        <span class="text-white font-medium"
                            >{cube.surface_finish}</span
                        >
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-400">Release Date:</span>
                        <span class="text-white font-medium"
                            >{formatDate(cube.release_date)}</span
                        >
                    </div>
                </div>
                <div
                    class="bg-neutral-900 rounded-xl p-4 flex flex-col gap-2 border border-neutral-800"
                >
                    <div class="flex items-center justify-between">
                        <span class="text-gray-400">Smart:</span>
                        <span class="text-xl">{cube.smart ? "✅" : "❌"}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-400">Magnetic:</span>
                        <span class="text-xl"
                            >{cube.magnetic ? "✅" : "❌"}</span
                        >
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-400">Modded:</span>
                        <span class="text-xl">{cube.modded ? "✅" : "❌"}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-400">WCA Legal:</span>
                        <span class="text-xl"
                            >{cube.wca_legal ? "✅" : "❌"}</span
                        >
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-400">Maglev:</span>
                        <span class="text-xl">{cube.maglev ? "✅" : "❌"}</span>
                    </div>
                </div>
            </div>
            {#if vendor_links && vendor_links.length > 0}
                <div class="my-8">
                    <h2
                        class="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2"
                    >
                        <i class="fa-solid fa-cart-shopping"></i>
                        Available at:
                    </h2>
                    <div class="flex flex-wrap gap-3">
                        {#each vendor_links as shop}
                            <a
                                href={shop.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                class={`flex items-center gap-2 border text-white font-medium px-4 py-2 rounded-xl transition duration-200 ${shop.available ? "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 hover:border-blue-400 " : "bg-red-500/10 hover:bg-red-500/20 border-red-500/30 hover:border-red-400"}shadow-sm hover:shadow-lg`}
                            >
                                {#if shop.available}
                                    <i class="fa-solid fa-check"></i>
                                {:else}
                                    <i class="fa-solid fa-xmark"></i>
                                {/if}
                                {shop.vendor_name} ・ ≃ {shop.price} $
                            </a>
                        {/each}
                    </div>
                </div>
            {/if}

            <div class="my-8">
                <div
                    class="bg-neutral-900 rounded-xl p-4 border border-neutral-800 shadow-sm"
                >
                    <h2
                        class="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2"
                    >
                        <i class="fa-regular fa-clock"></i>
                        Database Info:
                    </h2>
                    <div class="flex flex-col sm:flex-row gap-6">
                        <div class="flex items-center gap-2">
                            <span class="text-gray-400">ID:</span>{cube.id}
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-gray-400">Added:</span>
                            <span class="text-white font-medium">
                                {formatDate(cube.created_at)}
                            </span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-gray-400">Last Updated:</span>
                            <span class="text-white font-medium">
                                {formatDate(cube.updated_at)}
                            </span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-gray-400">Submitted by:</span>
                            <a
                                class="text-white font-medium underline"
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
                        class="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2"
                    >
                        <i class="fa-solid fa-palette"></i>
                        Select Trim:
                    </h2>
                    <div class="flex gap-4">
                        {#each cubeTrims ?? [] as trim}
                            <a
                                class="flex flex-col items-center border rounded-xl px-4 py-2 transition duration-200 focus:outline-none border-neutral-700 bg-neutral-900 hover:bg-neutral-800"
                                href="/explore/cubes/{trim.slug}"
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
                        class="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2"
                    >
                        <i class="fa-solid fa-palette"></i>
                        Related To:
                    </h2>
                    <div class="flex gap-4">
                        <a
                            class="flex flex-col items-center border rounded-xl px-4 py-2 transition duration-200 focus:outline-none border-neutral-700 bg-neutral-900 hover:bg-neutral-800"
                            href="/explore/cubes/{relatedCube.slug}"
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
                        class="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2"
                    >
                        <i class="fa-solid fa-layer-group"></i>
                        In the Same Series:
                    </h2>
                    <div class="flex flex-wrap gap-4">
                        {#each sameSeries as seriesCube}
                            <a
                                class="flex flex-col items-center border rounded-xl px-4 py-2 transition duration-200 focus:outline-none border-neutral-700 bg-neutral-900 hover:bg-neutral-800 w-36"
                                href="/explore/cubes/{seriesCube.slug}"
                            >
                                <img
                                    src={seriesCube.image_url}
                                    alt={seriesCube.version_name}
                                    class="h-24 object-contain mb-2 rounded"
                                />
                                <span class="font-medium text-center">
                                    {seriesCube.series}
                                    {seriesCube.model}
                                    {#if seriesCube.version_type !== "Base"}
                                        <span
                                            class="block text-xs text-blue-400"
                                            >{seriesCube.version_name}</span
                                        >
                                    {/if}
                                </span>
                            </a>
                        {/each}
                    </div>
                </div>
            {/if}
            <div class="mb-8">
                <h2
                    class="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2"
                >
                    <i class="fa-solid fa-star"></i>
                    User Ratings
                </h2>
                {#if user_ratings && user_ratings.length > 0}
                    <div class="flex flex-col gap-4">
                        {#each user_ratings as rating}
                            <div
                                class="bg-neutral-900 rounded-xl p-4 border border-neutral-800 shadow-sm"
                            >
                                <div class="flex items-center gap-3 mb-2">
                                    <StarRating rating={cube.rating} large={false} />
                                    <span class="text-gray-400 text-sm">
                                        by <a
                                            href={idOfUser(rating.username)}
                                            class="underline text-white"
                                            >{rating.username}</a
                                        >
                                    </span>
                                    <span class="text-gray-500 text-xs ml-auto"
                                        >{formatDate(rating.created_at)}</span
                                    >
                                </div>
                                {#if rating.comment}
                                    <div class="text-gray-300">
                                        {rating.comment}
                                    </div>
                                {/if}
                            </div>
                        {/each}
                    </div>
                {:else}
                    <div class="text-gray-400">
                        No user ratings yet. Be the first to rate this cube!
                    </div>
                {/if}
            </div>
            <div class="mt-4">
                <a
                    href="https://discord.gg/76ExrEAE7s"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-block px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition"
                >
                    🚩 Report incorrect/missing data
                </a>
            </div>

            <a
                href="/explore/cubes"
                class="inline-block mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition"
            >
                ← Back to Explore
            </a>
        </div>
    </section>
{:else if !cubesAvailability}
    <FeatureDisabled featureName="The cubes explore page is" />
{:else if !databaseAvailability}
    <FeatureDisabled featureName="The database is" />
{/if}
