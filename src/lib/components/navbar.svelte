<script>
	let isOpen = false;

	const navLinks = [];
</script>

<header class="bg-black text-white shadow-md">
	<div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
		<!-- Logo -->
		<a href="/" class="flex items-center gap-3">
			<img src="/images/CubeIndex removebg.png" alt="CubeIndex logo" class="h-10 w-10" />
			<span class="font-clash text-xl font-bold">CubeIndex</span>
		</a>

		<!-- Desktop Nav -->
		<nav class="hidden items-center gap-8 md:flex">
			<a href="https://discord.gg/YvhEjgQ7Fq" class="rounded-xl bg-blue-600 px-4 py-2 text-sm transition hover:bg-blue-700">
				Join the Discord
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
						href="https://discord.gg/YvhEjgQ7Fq"
						class="mt-2 block rounded-xl bg-blue-600 py-2 text-center text-white transition hover:bg-blue-700"
					>
						Join the Discord
					</a>
				</li>
			</ul>
		</nav>
	{/if}
</header>
