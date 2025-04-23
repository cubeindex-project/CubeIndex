<script lang="ts">
    import { onMount } from "svelte";
    import { supabase } from "$lib/supabaseClient";

    let message = "Verifying your account...";
    let loading = true;

    onMount(async () => {
        // Attempt to retrieve the current session
        const {
            data: { session },
            error,
        } = await supabase.auth.getSession();

        if (error || !session) {
            message = "Verification failed. Please try logging in.";
        } else {
            // Optionally, update the user's profile to mark as verified
            const { error: updateError } = await supabase
                .from("profiles")
                .update({ is_verified: true })
                .eq("user_id", session.user.id);

            if (updateError) {
                message = "Verified, but failed to update profile.";
            } else {
                message = "✅ Your account has been successfully verified!";
            }
        }

        loading = false;
    });
</script>

<section
    class="min-h-screen flex items-center justify-center bg-black text-white px-6"
>
    <div class="max-w-md text-center space-y-6">
        <h1 class="text-4xl font-bold">Email Verification</h1>

        {#if loading}
            <div class="flex justify-center items-center mt-6">
                <div
                    class="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"
                ></div>
            </div>
            <p class="text-gray-400 mt-4">{message}</p>
        {:else}
            <p class="text-gray-300 text-lg">{message}</p>
            <a
                href="/login"
                class="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition"
            >
                Continue to Login
            </a>
        {/if}
    </div>
</section>
