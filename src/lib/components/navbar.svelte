<script lang="ts">
	import { onMount } from "svelte";
	import { supabase } from "$lib/supabaseClient";

	let isOpen = false;
	let user;

	const navLinks = [
		{ name: "Explore", href: "/explore" },
		{ name: "Badges", href: "/badges"},
		{ name: "Collectors", href: "/collectors" },
		{ name: "About", href: "/about" },
	];

	onMount(async () => {
		const {
			data: { user: currentUser },
		} = await supabase.auth.getUser();
		user = currentUser;

		supabase.auth.onAuthStateChange((event, session) => {
			user = session?.user ?? null;
		});
	});

	// Sign out function
	async function signOut() {
		await supabase.auth.signOut();
	}
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
			{#if user}
				<!-- Show username and sign out -->
				<a
					href="/account" class="text-sm rounded-xl bg-blue-600 px-4 py-2 cursor-pointer transition hover:bg-blue-700"
					>My Account</a>
				<button
					onclick={signOut}
					class="rounded-xl bg-red-600 px-4 py-2 text-sm cursor-pointer transition hover:bg-red-700"
				>
					Sign Out
				</button>
			{:else}
				<!-- Show login button -->
				<a
					href="/login"
					class="rounded-xl bg-blue-600 px-4 py-2 text-sm transition hover:bg-blue-700"
				>
					Login
				</a>
			{/if}
		</nav>

		<!-- Mobile Menu Button -->
		<button
			onclick={() => (isOpen = !isOpen)}
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
				{#if user}
					<li>
						<span
							class="block py-2 text-center rounded-xl bg-blue-600 px-4 cursor-pointer transition hover:bg-blue-700"
							>My Account</span
						>
					</li>
					<li>
						<button
							onclick={signOut}
							class="block w-full rounded-xl bg-red-600 py-2 cursor-pointer text-center text-white transition hover:bg-red-700"
						>
							Sign Out
						</button>
					</li>
				{:else}
					<li>
						<a
							href="/login"
							class="mt-2 block rounded-xl bg-blue-600 py-2 text-center text-white transition hover:bg-blue-700"
						>
							Login
						</a>
					</li>
				{/if}
			</ul>
		</nav>
	{/if}
</header>
