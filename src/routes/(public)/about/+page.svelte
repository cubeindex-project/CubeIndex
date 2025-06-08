<script>
    const features = [
        "📦 Create and manage your cube collection",
        "🏆 Earn badges and show off your collection",
        "🔍 Explore a searchable cube database",
    ];
</script>

<section class="min-h-screen px-6 py-24 relative overflow-hidden">
    <div class="relative z-10 max-w-4xl mx-auto space-y-12 text-center">
        <div class="flex justify-center">
            <img
                src="/images/CubeIndex.png"
                alt="CubeIndex Logo"
                class="avatar w-32 rounded-xl"
            />
        </div>

        <div>
            <h1 class="text-4xl font-bold mb-4">About CubeIndex</h1>
            <p class="text-lg">
                CubeIndex is your all-in-one hub for speedcubing — whether
                you're a seasoned solver, beginner, or collector.
            </p>
        </div>

        <div class="card p-6 bg-base-300">
            <h2 class="text-2xl font-semibold mb-2">🔧 What You Can Do</h2>
            <ul class="text-left space-y-2">
                {#each features as item}
                    <li class="flex items-center gap-2">
                        <span>{item}</span>
                    </li>
                {/each}
            </ul>
        </div>

        <div class="mt-12">
            <p>
                Built with ❤️‍🔥 by <a
                    href="https://saterz.dev/studio"
                    class="link link-primary link-hover">Saterz Studio</a
                >.
            </p>
            <p class="mt-2">
                Follow progress on
                <a
                    href="https://github.com/Saterz/CubeIndex"
                    class="link link-primary link-hover"
                    target="_blank">GitHub</a
                >
                and join the community on
                <a
                    href="https://discord.gg/76ExrEAE7s"
                    target="_blank"
                    class="link link-primary link-hover">Discord</a
                >.
            </p>
        </div>
    </div>
</section>
