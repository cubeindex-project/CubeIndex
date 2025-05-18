<script lang="ts">
	import { supabase } from "$lib/supabaseClient";
	import { onMount } from "svelte";
	import type { User } from "@supabase/supabase-js";
	import ConfirmSignOut from "./confirmSignOut.svelte";

	let loading = $state(true);
	let isOpen = $state(false);
	let profile: { id: any; username: any } | null = $state(null);
	let { user } = $props();
	let signOutConfirmation = $state(false);

	async function loadProfile(user: User) {
		let { data, error } = await supabase
			.from("profiles")
			.select("id, username")
			.eq("user_id", user.id)
			.maybeSingle();

		if (error) {
			console.error(error);
		} else {
			profile = data;
		}
	}

	const navLinks = [
		{ name: "Explore", href: "/explore" },
		{ name: "Achievements", href: "/achievements" },
		{ name: "About", href: "/about" },
	];

	onMount(() => {
		if (user) loadProfile(user);
		loading = false;
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

			{#if loading}
				<i class="fa-solid fa-spinner animate-spin"></i>
			{:else if user && profile}
				<!-- Now uses profile.id -->
				<a
					href={`/user/${profile.id}`}
					class="text-sm rounded-xl bg-blue-600 px-4 py-2 transition hover:bg-blue-700"
				>
					{profile.username}
				</a>
				<button
					onclick={() => (signOutConfirmation = true)}
					class="rounded-xl bg-red-600 px-4 py-2 text-sm transition hover:bg-red-700 cursor-pointer"
				>
					Sign Out
				</button>
			{:else}
				<a
					href="/auth/login"
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
							onclick={() => (signOutConfirmation = true)}
							class="block w-full rounded-xl bg-red-600 py-2 text-center text-white transition hover:bg-red-700 cursor-pointer"
						>
							Sign Out
						</button>
					</li>
				{:else}
					<li>
						<a
							href="/auth/login"
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

{#if signOutConfirmation}
	<ConfirmSignOut
		onCancel={() => {
			signOutConfirmation = false;
		}}
	/>
{/if}
