<script lang="ts">
    const { data } = $props();
    const { profiles } = data;
    const default_profile_picture = "/images/default-profile.png";
</script>

<section
    class="min-h-screen bg-black text-white px-6 py-12 flex flex-col items-center"
>
    <!-- Page Header -->
    <div class="w-full max-w-3xl text-center mb-12">
        <h1 class="text-4xl sm:text-5xl font-clash font-bold mb-4">
            Top Collectors
        </h1>
        <p class="text-gray-400 text-lg">
            Meet our most dedicated cube collectors and see how many cubes and
            badges they've earned.
        </p>
    </div>

    <!-- Collectors Grid -->
    <div
        class="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
    >
        {#each profiles ?? [] as collector}
            <div
                class="bg-neutral-900 border border-neutral-700 rounded-2xl shadow-lg p-6 flex flex-col items-center"
            >
                <img
                    src={`${collector?.profile_picture && collector.profile_picture !== "" ? collector.profile_picture : default_profile_picture}`}
                    alt="{collector.username} avatar"
                    class="w-24 h-24 rounded-full border-4 border-blue-600 object-cover mb-4"
                />
                <h2 class="text-2xl font-semibold mb-1">
                    {collector.username}
                </h2>
                <p class="text-gray-400 text-sm mb-4">ID: {collector.id}</p>
                <div class="w-full flex justify-between text-center mb-4">
                    <div>
                        <div class="text-xl font-bold">
                            0
                        </div>
                        <div class="text-gray-400 text-sm">Cubes</div>
                    </div>
                    <div>
                        <div class="text-xl font-bold">
                            0
                        </div>
                        <div class="text-gray-400 text-sm">Badges</div>
                    </div>
                </div>
                <a
                    href={`/user/${collector.id}`}
                    class="mt-auto inline-block bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg text-white font-medium transition"
                >
                    View Profile
                </a>
            </div>
        {/each}
    </div>
</section>
