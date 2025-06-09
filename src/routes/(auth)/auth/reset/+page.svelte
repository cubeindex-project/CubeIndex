<script lang="ts">
    import { supabase } from "$lib/supabaseClient.js";

    let password = $state("");
    let confirm = $state("");
    let error = $state("");
    let message = $state("");

    async function submitNewPassword(e: Event) {
        e.preventDefault();
        if (password.length < 8) {
            error = "Password must be at least 8 characters.";
            return;
        }
        if (password !== confirm) {
            error = "Passwords do not match.";
            return;
        }

        const { error: err } = await supabase.auth.updateUser({
            password: password
        })

        if (err) {
            error = err.message;
            return;
        }

        message = "Your password has been reset! You can now log in with your new password.";
    }
</script>

<section
    class="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 relative overflow-hidden"
>
    <div
        class="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-2xl shadow-lg p-8 z-10"
    >
        <h1 class="text-3xl font-clash font-bold text-center mb-6 text-white">
            Set a New Password
        </h1>
        <p class="text-center text-gray-400 text-sm mb-8">
            Choose a strong new password for your CubeIndex account.
        </p>
        <form class="space-y-6" onsubmit={submitNewPassword}>
            <div>
                <label
                    for="password"
                    class="block text-sm font-medium text-white"
                >
                    New Password
                </label>
                <input
                    id="password"
                    type="password"
                    bind:value={password}
                    class="w-full mt-1 px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                />
            </div>
            <div>
                <label
                    for="confirm"
                    class="block text-sm font-medium text-white"
                >
                    Confirm New Password
                </label>
                <input
                    id="confirm"
                    type="password"
                    bind:value={confirm}
                    class="w-full mt-1 px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                />
            </div>
            <button
                type="submit"
                class="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 transition rounded-lg px-6 py-3 font-semibold text-white text-lg"
            >
                Change Password
            </button>
            {#if error}
                <p class="text-sm text-red-500 text-center mt-2">{error}</p>
            {/if}
            {#if message}
                <p class="text-sm text-green-400 text-center mt-2">{message}</p>
            {/if}
        </form>
        <p class="text-sm text-center text-gray-500 mt-6">
            <a href="/auth/login" class="text-blue-400 hover:underline ml-1">
                Back to Login
            </a>
        </p>
    </div>
</section>
