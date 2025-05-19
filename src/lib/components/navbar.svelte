<script lang="ts">
	import { supabase } from "$lib/supabaseClient";
	import { onMount } from "svelte";
	import type { User } from "@supabase/supabase-js";
	import ConfirmSignOut from "./confirmSignOut.svelte";

	let loading = $state(true);
	let isOpen = $state(false);
	let profile: { id: any; username: any } | null = $state(null);
	let { session } = $props();
	let signOutConfirmation = $state(false);
	let notificationOpen = $state(false);

	async function loadProfile(user: User) {
		let { data, error } = await supabase
			.from("profiles")
			.select("id, username")
			.eq("user_id", session.user.id)
			.maybeSingle();

		if (error) {
			console.error(error);
		} else {
			profile = data;
		}
	}

	let notifications: any[] = $state([]);

	async function getMessages() {
		let { data, error } = await supabase.from("announcement").select("*");

		if (error) console.error("Error while loading announcement:", error);

		notifications = data || [];
	}

	const navLinks = [
		{ name: "Explore", href: "/explore" },
		{ name: "Achievements", href: "/achievements" },
		{ name: "About", href: "/about" },
	];

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		}).format(date);
	}

	let bellAnimate = $state(false);
	$effect(() => {
		if (bellAnimate) {
			setTimeout(() => (bellAnimate = false), 600);
		}
	});

	onMount(() => {
		getMessages();
		if (session) loadProfile(session);
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

			<div class="relative inline-block">
				<!-- Notification Bell -->
				<button
					class="relative focus:outline-none cursor-pointer hover:text-blue-400 transition"
					aria-label="Notifications"
					style="margin-right: 0.5rem;"
					onclick={() => {
						notificationOpen = !notificationOpen;
						bellAnimate = true;
					}}
				>
					<i
						class="fa-solid fa-bell fa-xl {bellAnimate
							? 'animate-ring'
							: ''}"
					></i>
					{#if notifications.length !== 0}
						<span
							class="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-black"
						></span>
					{/if}
				</button>

				{#if notificationOpen}
					<div
						class="absolute left-1/2 -translate-x-1/2 top-10 mt-2 z-50 w-80 max-w-xs rounded-2xl shadow-2xl ring-1 ring-white/20 bg-neutral-900/95 backdrop-blur-xl border border-neutral-800 transition-all overflow-hidden"
						style="min-width: 320px;"
					>
						<div
							class="flex items-center px-5 py-4 border-b border-neutral-800"
						>
							<i class="fa-solid fa-bell text-blue-400 mr-2"></i>
							<span
								class="font-bold text-lg text-white tracking-tight"
							>
								Notifications
							</span>
							<span class="ml-auto text-xs text-gray-400">
								{notifications.length} total
							</span>
						</div>
						<div class="overflow-y-auto max-h-[50vh]">
							{#if notifications.length === 0}
								<div
									class="py-12 flex items-center justify-center text-gray-400"
								>
									No notifications yet.
								</div>
							{:else}
								{#each notifications as n (n.id)}
									<div
										class="flex flex-col gap-1 px-5 py-4 border-b border-neutral-800 last:border-0 hover:bg-neutral-800/60 transition group"
									>
										<div
											class="flex items-center gap-2 mb-0.5"
										>
											{#if n.icon}
												<span class="text-xl"
													>{n.icon}</span
												>
											{:else if n.purpose === "announcement"}
												<i
													class="fa-solid fa-bullhorn text-purple-400"
												></i>
											{:else if n.purpose === "alert"}
												<i
													class="fa-solid fa-triangle-exclamation text-red-400"
												></i>
											{:else if n.purpose === "warning"}
												<i
													class="fa-solid fa-exclamation-circle text-yellow-400"
												></i>
											{:else}
												<i
													class="fa-solid fa-bell text-blue-300"
												></i>
											{/if}
											<span
												class="font-semibold text-white"
												>{n.title}</span
											>
											<span
												class="ml-auto text-xs text-gray-400"
												>{formatDate(
													n.created_at,
												)}</span
											>
										</div>
										<div class="text-gray-300 text-sm">
											{n.message}
										</div>
										{#if n.link}
											<a
												href={n.link}
												target="_blank"
												rel="noopener noreferrer"
												class="text-blue-400 text-xs mt-1 hover:underline"
											>
												{`${n.linkText === "" ? "More info" : n.linkText}`}
												<i
													class="fa-solid fa-arrow-up-right-from-square ml-1"
												></i>
											</a>
										{/if}
									</div>
								{/each}
							{/if}
						</div>
						<div
							class="px-5 py-3 bg-neutral-900 border-t border-neutral-800 flex justify-end gap-3"
						>
							<button
								class="text-xs text-gray-400 hover:text-blue-400 cursor-pointer"
								onclick={() => (notificationOpen = false)}
							>
								Close
							</button>
						</div>
					</div>
				{/if}
			</div>

			{#if loading}
				<i class="fa-solid fa-spinner animate-spin"></i>
			{:else if session && profile}
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

				<!-- Notification Bell (Mobile) -->
				<li class="relative">
					<a
						class="flex items-center w-full text-left py-2"
						aria-label="Notifications"
						href="/notifications"
					>
						<i class="fa-solid fa-bell fa-xl"></i>
						<span class="ml-2">Notifications</span>
					</a>
					{#if notifications.length !== 0}
						<span
							class="absolute top-1/2 right-2 -translate-y-1/2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-black"
						></span>
					{/if}
				</li>

				{#if session && profile}
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

<style>
	@keyframes ring {
		0% {
			transform: rotate(0);
		}
		15% {
			transform: rotate(-15deg);
		}
		30% {
			transform: rotate(10deg);
		}
		45% {
			transform: rotate(-10deg);
		}
		60% {
			transform: rotate(6deg);
		}
		75% {
			transform: rotate(-4deg);
		}
		100% {
			transform: rotate(0);
		}
	}
	.animate-ring {
		animation: ring 0.6s;
	}
</style>
