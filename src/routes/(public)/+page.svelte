<script lang="ts">
    type Partner = {
        name: string;
        emoji: string;
        description: string;
        links: { label: string; url: string; color: string }[];
        border?: boolean; // true if you want a right border on desktop
    };

    const partners: Partner[] = [
        {
            name: "CubingPanda",
            emoji: "🐼",
            description:
                "CubingPanda is the go-to community for Rubik's Cube fans at every skill level—whether you're a veteran speedcuber or someone who's never solved a single face.",
            links: [
                {
                    label: "Join Discord",
                    url: "https://discord.gg/VHhYR6nyzs",
                    color: "blue",
                },
            ],
            border: true,
        },
        {
            name: "AlgArchive",
            emoji: "📚",
            description:
                "The open archive for cube algorithms. Browse community-vetted solutions across every puzzle type, tag them with your average-of-5, and share your PB-crushing secrets.",
            links: [
                {
                    label: "Visit Site",
                    url: "https://alg-archive.vercel.app/",
                    color: "green",
                },
                {
                    label: "Join Discord",
                    url: "https://discord.gg/NYPG43xe9t",
                    color: "blue",
                },
            ],
            border: false,
        },
    ];
</script>

<section
    class="px-5 relative flex min-h-screen flex-col items-center justify-center bg-black text-white overflow-hidden"
>
    <div class="relative z-10 text-center max-w-3xl space-y-6">
        <h1 class="text-5xl sm:text-7xl font-clash font-bold">
            Build Your Ultimate Cube Collection
        </h1>
        <p class="text-lg sm:text-xl text-gray-300">
            Track your cubes, unlock badges, and explore the world's largest
            cube database.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a
                href="/auth/signup"
                class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 rounded-xl text-white text-lg font-medium"
            >
                Start Collecting
            </a>
            <a
                href="/explore"
                class="px-6 py-3 border border-white rounded-xl text-lg hover:bg-white hover:text-black transition"
            >
                Explore Database
            </a>
        </div>
    </div>
</section>

<section
    class="bg-black text-white pb-24 px-5 relative flex flex-col items-center justify-center overflow-hidden"
>
    <h2 class="text-4xl font-clash font-bold text-center mb-12">
        Our Partners
    </h2>
    <div
        class="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-y-12 gap-x-8 w-full"
    >
        {#each partners as partner, i}
            <div
                class="flex flex-col sm:flex-row items-center sm:items-start gap-6
          {partner.border &&
                    'border-b border-neutral-700 pb-10 sm:pb-0 sm:border-b-0 sm:border-r pr-0 sm:pr-8'}"
            >
                <span class="text-6xl sm:text-5xl">{partner.emoji}</span>
                <div class="flex-1 flex flex-col items-center sm:items-start">
                    <h3 class="text-2xl font-semibold mb-1">{partner.name}</h3>
                    <p class="text-gray-400 mb-4 text-center sm:text-left">
                        {partner.description}
                    </p>
                    <div class="flex gap-3 flex-wrap">
                        {#each partner.links as link}
                            <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="px-4 py-2 rounded-lg font-medium shadow transition
                  {link.color === 'blue'
                                    ? 'bg-blue-600 hover:bg-blue-700'
                                    : link.color === 'green'
                                      ? 'bg-green-600 hover:bg-green-700'
                                      : 'bg-neutral-700 hover:bg-neutral-800'}"
                            >
                                {link.label}
                            </a>
                        {/each}
                    </div>
                </div>
            </div>
        {/each}
    </div>
</section>
