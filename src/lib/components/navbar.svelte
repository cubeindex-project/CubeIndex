<script lang="ts">
	import { onMount } from "svelte";
	import { supabase } from "$lib/supabaseClient";
	import type { User } from "@supabase/supabase-js";

	let isOpen = false;
	let user: User | null = null;
	let profile: { id: string; username: string } | null = null;

	const navLinks = [
		{ name: "Explore", href: "/explore" },
		{ name: "Badges", href: "/badges" },
		{ name: "Collectors", href: "/collectors" },
		{ name: "About", href: "/about" },
	];

	async function isUserConnected() {
		// 1) get current user
		const {
			data: { user: currentUser },
		} = await supabase.auth.getUser();
		user = currentUser;

		if (user) {
			// 2) fetch their single profile row
			const { data: fetchedProfile, error } = await supabase
				.from("profiles")
				.select("id, username")
				.eq("user_id", user.id)
				.single();

			if (!error && fetchedProfile) {
				profile = fetchedProfile;
			} else {
				console.error("couldn't load profile:", error);
			}
		}

		// 3) listen for future auth changes
		supabase.auth.onAuthStateChange((_event, session) => {
			user = session?.user ?? null;
			if (!user) {
				profile = null;
			}
		});
	}

	// sign out
	async function signOut() {
		await supabase.auth.signOut();
	}

	onMount(() => {
		isUserConnected();
	});
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
			{#each navLinks as { name, href }}
				<a {href} class="text-sm hover:text-blue-400 transition">
					{name}
				</a>
			{/each}

			{#if user && profile}
				<!-- Now uses profile.id -->
				<a
					href={`/user/${profile.id}`}
					class="text-sm rounded-xl bg-blue-600 px-4 py-2 transition hover:bg-blue-700"
				>
					{profile.username}
				</a>
				<button
					on:click={signOut}
					class="rounded-xl bg-red-600 px-4 py-2 text-sm transition hover:bg-red-700 cursor-pointer"
				>
					Sign Out
				</button>
			{:else}
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
				{#each navLinks as { name, href }}
					<li>
						<a
							{href}
							class="block py-2 text-sm border-b border-gray-800 hover:text-blue-400"
						>
							{name}
						</a>
					</li>
				{/each}

				{#if user && profile}
					<li>
						<a
							href={`/user/${profile.id}`}
							class="block py-2 text-center rounded-xl bg-blue-600 px-4 transition hover:bg-blue-700"
						>
							{profile.username}
						</a>
					</li>
					<li>
						<button
							on:click={signOut}
							class="block w-full rounded-xl bg-red-600 py-2 text-center text-white transition hover:bg-red-700 cursor-pointer"
						>
							Sign Out
						</button>
					</li>
				{:else}
					<li>
						<a
							href="/login"
							class="block rounded-xl bg-blue-600 py-2 text-center text-white transition hover:bg-blue-700"
						>
							Login
						</a>
					</li>
				{/if}
			</ul>
		</nav>
	{/if}
</header>
