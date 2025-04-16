<script lang="ts">
    let email = "";
    let password = "";

    const handleLogin = (e: Event) => {
        e.preventDefault();
        // Replace this with your Supabase auth logic
        console.log("Logging in with", email, password);
    };
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
            Welcome Back
        </h1>
        <p class="text-center text-gray-400 text-sm mb-8">
            Login to your CubeIndex profile
        </p>

        <form on:submit={handleLogin} class="space-y-6">
            <div>
                <label for="email" class="block text-sm font-medium text-white"
                    >Email</label
                >
                <input
                    id="email"
                    type="email"
                    bind:value={email}
                    class="w-full mt-1 px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="you@example.com"
                    required
                />
            </div>

            <div>
                <label
                    for="password"
                    class="block text-sm font-medium text-white">Password</label
                >
                <input
                    id="password"
                    type="password"
                    bind:value={password}
                    class="w-full mt-1 px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="••••••••"
                    required
                />
            </div>

            <button
                type="submit"
                class="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition rounded-lg px-6 py-3 font-semibold text-white text-lg"
            >
                Log In
            </button>
        </form>

        <p class="text-sm text-center text-gray-500 mt-6">
            Don't have an account?
            <a href="/signup" class="text-blue-400 hover:underline">Sign up</a>
        </p>
    </div>
</section>
