<script>
	let isOpen = false;

	const navLinks = [
		{ name: "Explore", href: "/explore" },
		{ name: "Collectors", href: "/collectors" },
		{ name: "About", href: "/about" },
	];
</script>

<header class="bg-black text-white shadow-md">
	<div class="mx-auto flex max-w-7xl items-center justify-between px-2 py-4">
		<!-- Logo -->
		<a href="/" class="flex items-center gap-2">
			<img
				src="/images/CubeIndex removebg.png"
				alt="CubeIndex logo"
				class="h-12 w-12"
			/>
			<span class="font-clash text-3xl font-bold">CubeIndex</span>
		</a>

		<!-- Desktop Nav -->
		<nav class="hidden items-center gap-8 md:flex">
			{#each navLinks as link}
				<a
					href={link.href}
					class="text-sm hover:text-blue-400 transition"
					>{link.name}</a
				>
			{/each}
			<a
				href="/login"
				class="rounded-xl bg-blue-600 px-4 py-2 text-sm transition hover:bg-blue-700"
			>
				Login
			</a>
		</nav>

		<!-- Mobile Menu Button -->
		<button
			on:click={() => (isOpen = !isOpen)}
			class="focus:outline-none md:hidden cursor-pointer"
			aria-label="Open menu"
		>
			<i class="fa-solid fa-bars"></i>
		</button>
	</div>

	<!-- Mobile Nav -->
	{#if isOpen}
		<nav class="bg-black px-6 pb-4 md:hidden">
			<ul class="flex flex-col gap-3">
				<li>
					<a
						href="/login"
						class="mt-2 block rounded-xl bg-blue-600 py-2 text-center text-white transition hover:bg-blue-700"
					>
						Login
					</a>
				</li>
			</ul>
		</nav>
	{/if}
</header>
