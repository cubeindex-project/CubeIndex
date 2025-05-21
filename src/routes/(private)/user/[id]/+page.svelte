<script lang="ts">
    const { data } = $props();
    const { user, profile } = data;

    const default_profile_picture = "/images/default-profile.png";

    function formatJoinDate(dateString: string): string {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(date);
    }

    const formattedJoinDate = formatJoinDate(profile?.created_at);
</script>

<section class="min-h-screen bg-black text-white px-0 py-12 pt-0">
    <!-- Banner full width -->
    {#if profile.banner}
        <div
            class="relative w-full h-60 sm:h-72 md:h-80 shadow-2xl overflow-hidden rounded-b-2xl"
        >
            <img
                src={profile.banner}
                alt="User banner"
                class="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
                loading="lazy"
            />
            <div
                class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none"
            ></div>
        </div>
    {:else}
        <div
            class="relative w-full h-44 sm:h-56 bg-gradient-to-tr from-blue-700 via-blue-500 to-cyan-400 shadow-2xl"
        ></div>
    {/if}

    <div class="relative max-w-4xl mx-auto -mt-24 px-4">
        <!-- Card-like area: Profile header with avatar, username, settings, socials -->
        <div
            class="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl px-4 sm:px-10 py-10 flex flex-col sm:flex-row items-center gap-8"
        >
            <!-- Avatar left -->
            <div
                class="flex flex-col items-center sm:items-start min-w-[120px]"
            >
                <img
                    src={`${profile?.profile_picture && profile.profile_picture !== "" ? profile.profile_picture : default_profile_picture}`}
                    alt="Avatar"
                    class="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-blue-500 shadow-xl bg-black object-cover transition-transform duration-200"
                />
            </div>
            <!-- Info & Socials right -->
            <div class="flex-1 w-full">
                <div class="flex items-center justify-between w-full gap-2">
                    <h2
                        class="text-3xl sm:text-4xl flex flex-row font-extrabold gap-4 break-all items-center tracking-tight text-white"
                    >
                        <span class="font-clash">{profile?.username}</span>
                        <!-- Badge Section -->
                        <span class="flex flex-row gap-2 ml-2">
                            {#if profile.role === "Admin"}
                                <span
                                    class="inline-flex items-center px-2 py-1 rounded bg-red-600 text-sm font-semibold text-white"
                                    title="Admin"
                                >
                                    <i class="fa-solid fa-shield-halved mr-1"></i> Admin
                                </span>
                            {/if}
                        </span>
                    </h2>
                    {#if user?.id === profile?.user_id}
                        <a
                            href="settings"
                            class="ml-4 flex-shrink-0 bg-neutral-950 border border-blue-500 rounded-xl flex items-center gap-2 px-5 py-2 shadow-lg hover:bg-blue-950 hover:border-cyan-400 transition font-medium"
                            aria-label="User Settings"
                            title="User Settings"
                        >
                            <i class="fa-solid fa-gear"></i>
                            <span>Settings</span>
                        </a>
                    {/if}
                </div>
                <p class="text-gray-400 mt-2">
                    Member since: <span class="font-mono text-white"
                        >{formattedJoinDate}</span
                    >
                </p>

                <!-- Bio (no card, just text, spaced below join date) -->
                <div class="mt-3 mb-4">
                    <h4 class="text-lg font-bold mb-1 text-white">Bio</h4>
                    <p class="text-gray-200 break-words">
                        {profile?.bio || "No bio provided."}
                    </p>
                </div>

                <!-- Socials Section -->
                {#if profile?.socials}
                    <div class="mt-4">
                        <h4 class="text-lg font-bold text-white mb-2">
                            Socials
                        </h4>
                        <div class="flex flex-wrap items-center gap-3">
                            {#if profile?.socials?.website}
                                <a
                                    href={`${profile.socials.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow transition"
                                    aria-label="Website"
                                >
                                    <i class="fa-solid fa-globe"></i>
                                    <span class="hidden sm:inline">Website</span
                                    >
                                </a>
                            {/if}
                            {#if profile?.socials?.wca}
                                <a
                                    href={`https://www.worldcubeassociation.org/persons/${profile.socials.wca}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0051BA] hover:bg-[#003f94] text-white font-medium shadow transition"
                                    aria-label="Youtube"
                                >
                                    <img
                                        src="/icons/WCA Logo.svg"
                                        alt="WCA Logo"
                                        class="h-5 w-5"
                                    />
                                    <span class="hidden sm:inline">WCA</span>
                                </a>
                            {/if}
                            {#if profile?.socials?.instagram}
                                <a
                                    href={`https://www.instagram.com/${profile.socials.instagram}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-medium shadow transition"
                                    aria-label="Instagram"
                                >
                                    <i class="fa-brands fa-instagram"></i>
                                    <span class="hidden sm:inline"
                                        >Instagram</span
                                    >
                                </a>
                            {/if}
                            {#if profile?.socials?.discord}
                                <a
                                    href={`https://discord.com/users/${profile.socials.discord}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="flex items-center gap-2 px-4 py-2 rounded-full bg-[#5865F2] hover:bg-[#4855c8] text-white font-medium shadow transition"
                                    aria-label="Discord"
                                >
                                    <i class="fa-brands fa-discord"></i>
                                    <span class="hidden sm:inline">Discord</span
                                    >
                                </a>
                            {/if}
                            {#if profile?.socials?.x}
                                <a
                                    href={`https://twitter.com/${profile.socials.x}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-400 hover:bg-blue-500 text-white font-medium shadow transition"
                                    aria-label="Twitter"
                                >
                                    <i class="fa-brands fa-x-twitter"></i>
                                    <span class="hidden sm:inline"
                                        >Twitter/X</span
                                    >
                                </a>
                            {/if}
                            {#if profile?.socials?.youtube}
                                <a
                                    href={`https://www.youtube.com/${profile.socials.youtube}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium shadow transition"
                                    aria-label="Youtube"
                                >
                                    <i class="fa-brands fa-youtube"></i>
                                    <span class="hidden sm:inline">Youtube</span
                                    >
                                </a>
                            {/if}
                            {#if profile?.socials?.reddit}
                                <a
                                    href={`https://www.reddit.com/user/${profile.socials.reddit}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-medium shadow transition"
                                    aria-label="Youtube"
                                >
                                    <i class="fa-brands fa-reddit-alien"></i>
                                    <span class="hidden sm:inline">Reddit</span>
                                </a>
                            {/if}
                            <!-- Add more platforms as needed, just duplicate the pattern above -->
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
    {#if !profile.private || user?.id === profile.user_id}
        <!-- Badges Section -->
        <div class="max-w-4xl mx-auto mt-16 px-4">
            <h3 class="text-2xl font-bold mb-4 text-white">
                Achievements Earned
            </h3>
            <div
                class="bg-gradient-to-r from-neutral-800 via-blue-950 to-neutral-800 rounded-xl p-6 text-center text-gray-300 shadow-lg border border-neutral-700"
            >
                <span class="text-lg font-medium"
                    >Achievements coming soon!</span
                >
            </div>
        </div>

        <!-- Cube Collection -->
        <div class="max-w-4xl mx-auto mt-12 px-4">
            <h3 class="text-2xl font-bold mb-4 text-white">Cube Collection</h3>
            <div
                class="bg-gradient-to-r from-neutral-800 via-blue-950 to-neutral-800 rounded-xl p-6 text-center text-gray-300 shadow-lg border border-neutral-700"
            >
                <span class="text-lg font-medium">Cubes coming soon!</span>
            </div>
        </div>
    {:else}
        <section
            class="bg-black text-white px-4 py-12 flex items-center justify-center"
        >
            <div class="text-center">
                <h1 class="text-3xl font-bold mb-4">This profile is private</h1>
                <p class="text-gray-400">
                    You do not have permission to view this user's profile.
                </p>
            </div>
        </section>
    {/if}
</section>
