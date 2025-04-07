<script>
    let isOpen = false;

    const navLinks = [
        { name: "Explore", href: "/explore" },
        { name: "Badges", href: "/badges" },
        { name: "About", href: "/about" },
    ];
</script>

<header class="bg-black text-white shadow-md">
    <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <!-- Logo -->
        <a href="/" class="flex items-center gap-3">
            <img
                src="/images/CubeIndex removebg.png"
                alt="CubeIndex logo"
                class="w-10 h-10"
            />
            <span class="text-xl font-clash font-bold">CubeIndex</span>
        </a>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-8">
            {#each navLinks as link}
                <a
                    href={link.href}
                    class="text-sm hover:text-blue-400 transition"
                    >{link.name}</a
                >
            {/each}
            <a
                href="/login"
                class="px-4 py-2 bg-blue-600 rounded-xl text-sm hover:bg-blue-700 transition"
            >
                Log In
            </a>
        </nav>

        <!-- Mobile Menu Button -->
        <button on:click={() => (isOpen = !isOpen)} class="md:hidden focus:outline-none" aria-label="Open menu">
            <i class="fa-solid fa-bars"></i>
        </button>
    </div>

    <!-- Mobile Nav -->
    {#if isOpen}
        <nav class="md:hidden bg-black px-6 pb-4">
            <ul class="flex flex-col gap-3">
                {#each navLinks as link}
                    <li>
                        <a
                            href={link.href}
                            class="block py-2 text-sm border-b border-gray-800 hover:text-blue-400"
                        >
                            {link.name}
                        </a>
                    </li>
                {/each}
                <li>
                    <a
                        href="/login"
                        class="block mt-2 py-2 text-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                    >
                        Log In
                    </a>
                </li>
            </ul>
        </nav>
    {/if}
</header>
