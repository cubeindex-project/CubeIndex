<script lang="ts">
    import { supabase } from "$lib/supabaseClient";

    let username: string;
    let email: string;
    let password: string;
    let confirmPassword: string;
    let error: string;
    let message: string;
    let showPassword: boolean;

    async function handleAuth(e: Event) {
        e.preventDefault();
        error = "";
        message = "";

        if (password === confirmPassword) {
            // Sign up the user
            const { data: signUpData, error: signUpError } =
                await supabase.auth.signUp({
                    email,
                    password
                });

            if (signUpError) {
                error = signUpError.message;
            } else {
                // Retrieve the user ID from the signUpData
                const userId = signUpData.user?.id;

                if (userId) {
                    // Upsert into the profiles table with the user ID
                    const { error: upsertError } = await supabase
                        .from("profiles")
                        .upsert({ user_id: userId, username: username });

                    if (upsertError) {
                        error = upsertError.message;
                    } else {
                        message = "Check your email to verify your account.";
                    }
                } else {
                    error = "User ID not found after sign-up.";
                }
            }
        } else {
            error = "Passwords do not match.";
        }
    }

    function togglePasswordVisibility() {
        showPassword = !showPassword;
    }
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
        class="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-2xl shadow-lg p-8 z-10"
    >
        <h1 class="text-3xl font-clash font-bold text-center mb-6 text-white">
            Join CubeIndex
        </h1>
        <p class="text-center text-gray-400 text-sm mb-8">
            Create a free account to start tracking your collection
        </p>
        <form onsubmit={handleAuth} class="space-y-6">
            <div>
                <label
                    for="username"
                    class="block text-sm font-medium text-white">Username</label
                >
                <input
                    id="username"
                    type="username"
                    bind:value={username}
                    class="w-full mt-1 px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                />
            </div>
            <div>
                <label for="email" class="block text-sm font-medium text-white"
                    >Email</label
                >
                <input
                    id="email"
                    type="email"
                    bind:value={email}
                    class="w-full mt-1 px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                />
            </div>

            <div>
                <label
                    for="password"
                    class="block text-sm font-medium text-white">Password</label
                >
                <div class="flex flex-row items-center">
                    <input
                        type={showPassword ? "text" : "password"}
                        bind:value={password}
                        class="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                        type="button"
                        class="fa-solid {showPassword
                            ? 'fa-eye-slash'
                            : 'fa-eye'} ml-4 cursor-pointer text-white"
                        onclick={togglePasswordVisibility}
                        aria-label="Toggle Password Visibility"
                    ></button>
                </div>
            </div>

            <div>
                <label
                    for="confirmPassword"
                    class="block text-sm font-medium text-white"
                    >Confirm Password</label
                >
                <input
                    type="password"
                    bind:value={confirmPassword}
                    class="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
            </div>

            <button
                type="submit"
                class="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition rounded-lg px-6 py-3 font-semibold text-white text-lg"
            >
                Sign Up
            </button>

            {#if error}
                <p class="text-sm text-red-500 text-center mt-2">{error}</p>
            {/if}

            {#if message}
                <p class="text-sm text-green-400 text-center mt-2">{message}</p>
            {/if}
        </form>

        <p class="text-sm text-center text-gray-500 mt-6">
            Already have an account?
            <a href="/auth/login" class="text-blue-400 hover:underline ml-1">
                Log in
            </a>
        </p>
    </div>
</section>
