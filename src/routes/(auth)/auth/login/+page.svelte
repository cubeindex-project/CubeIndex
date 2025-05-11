<script lang="ts">
    const data = $props();
    let { error } = data;
    let message = $state("");
    let showPassword = $state(false);
    let email = $state("");

    function togglePasswordVisibility() {
        showPassword = !showPassword;
    }
</script>

<section
    class="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 relative overflow-hidden"
>
    <div
        class="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-2xl shadow-lg p-8 z-10"
    >
        <h1 class="text-3xl font-clash font-bold text-center mb-6 text-white">
            Welcome Back
        </h1>
        <p class="text-center text-gray-400 text-sm mb-8">
            Login to your CubeIndex profile
        </p>
        <form method="POST" action="?/login" class="space-y-6">
            <div>
                <label for="email" class="block text-sm font-medium text-white"
                    >Email</label
                >
                <input
                    name="email"
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
                        name="password"
                        type={showPassword ? "text" : "password"}
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

            <p class="text-sm text-gray-500 -mt-5">
                Forgot your password?
                <button
                    class="text-blue-400 hover:underline ml-1 cursor-pointer"
                >
                    Reset</button
                >
            </p>

            <button
                type="submit"
                class="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 transition rounded-lg px-6 py-3 font-semibold text-white text-lg"
            >
                Log In
            </button>

            {#if error}
                <p class="text-sm text-red-500 text-center mt-2">{error}</p>
            {/if}

            {#if message}
                <p class="text-sm text-green-400 text-center mt-2">{message}</p>
            {/if}
        </form>

        <p class="text-sm text-center text-gray-500 mt-6">
            Don't have an account?
            <a href="/auth/signup" class="text-blue-400 hover:underline ml-1">
                Sign Up
            </a>
        </p>
    </div>
</section>
