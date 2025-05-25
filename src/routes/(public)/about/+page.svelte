<script>
    const features = [
        "📦 Create and manage your cube collection",
        "🏆 Earn badges and show off your collection",
        "🔍 Explore a searchable cube database",
    ];
</script>

<section
    class="min-h-screen bg-black text-white px-6 py-24 relative overflow-hidden"
>
    <div class="relative z-10 max-w-4xl mx-auto space-y-12 text-center">
        <!-- Logo -->
        <div class="flex justify-center">
            <img
                src="/images/CubeIndex.png"
                alt="CubeIndex Logo"
                class="w-20 h-20 sm:w-24 sm:h-24 mb-4 rounded-2xl"
            />
        </div>

        <!-- Heading -->
        <div>
            <h1 class="text-4xl font-bold mb-4">About CubeIndex</h1>
            <p class="text-gray-400 text-lg">
                CubeIndex is your all-in-one hub for speedcubing — whether
                you're a seasoned solver, beginner, or collector.
            </p>
        </div>

        <!-- Features -->
        <div
            class="bg-neutral-900 rounded-2xl p-6 shadow-xl space-y-4 max-w-2xl mx-auto"
        >
            <h2 class="text-2xl font-semibold mb-2">🔧 What You Can Do</h2>
            <ul class="text-left space-y-2 text-gray-300">
                {#each features as item}
                    <li class="flex items-center gap-2">
                        <span>{item}</span>
                    </li>
                {/each}
            </ul>
        </div>

        <!-- Creator Info -->
        <div class="mt-12 text-gray-400">
            <p>
                Built with ❤️‍🔥 by <a
                    href="https://saterz.dev/studio"
                    class="text-blue-400 hover:underline">Saterz Studio</a
                >.
            </p>
            <p class="mt-2">
                Follow progress on
                <a
                    href="https://github.com/Saterz/CubeIndex"
                    class="text-blue-400 hover:underline"
                    target="_blank">GitHub</a
                >
                and join the community on
                <a
                    href="https://discord.gg/76ExrEAE7s"
                    target="_blank"
                    class="text-blue-400 hover:underline">Discord</a
                >.
            </p>
        </div>
    </div>
</section>
