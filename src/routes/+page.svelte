<script lang="ts">
    import { onMount } from "svelte";
    import { supabase } from "$lib/supabaseClient";
    import type { User } from "@supabase/supabase-js";

    let user: User | null = null;
    let profile: { id: string; username: string } | null = null;

    async function isUserConnected() {
        // 1) get current user
        const {
            data: { user: currentUser },
        } = await supabase.auth.getUser();
        user = currentUser;

        if (user) {
            // 2) fetch their single profile row
            const { data: fetchedProfile, error } = await supabase
                .from("profiles")
                .select("id, username")
                .eq("user_id", user.id)
                .single();

            if (!error && fetchedProfile) {
                profile = fetchedProfile;
            } else {
                console.error("couldn't load profile:", error);
            }
        }

        supabase.auth.onAuthStateChange((_event, session) => {
            user = session?.user ?? null;
        });
    }

    onMount(() => {
        isUserConnected();
    });
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

    <div class="relative z-10 text-center max-w-3xl space-y-6">
        <h1 class="text-4xl sm:text-6xl font-clash font-bold">
            Build Your Ultimate Cube Collection
        </h1>
        <p class="text-lg sm:text-xl text-gray-300 max-w-xl mx-auto">
            CubeIndex lets you track every cube you own, unlock collector
            badges, and explore the full speedcubing product database.
        </p>

        <div class="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            {#if user && profile}
                <a
                    href={`/user/${profile.id}`}
                    class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-colors rounded-xl text-white text-lg font-medium"
                >
                    See Your Collection
                </a>
            {:else}
                <a
                    href="/signup"
                    class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-colors rounded-xl text-white text-lg font-medium"
                >
                    Start Collecting
                </a>
            {/if}
            <a
                href="/explore"
                class="px-6 py-3 border border-white rounded-xl text-lg text-white hover:bg-white hover:text-black transition font-medium"
            >
                Explore Cubes
            </a>
        </div>
    </div>
</section>
