<script lang="ts">
	import { onMount } from "svelte";
	let typed = "";
	let showEasterEgg = false;

	let cubeX = 80; // starting position %
	let cubeY = 20;

	let cubeEl;

	let messages = [
		"Not this time!",
		"Too slow 😏",
		"You missed me!",
		"Gotta be faster!",
		"CubeIndex is life.",
		"Nice try, human.",
		"👀",
		"Catch me if you can!",
		"Scrambling away!",
	];

	let currentMessage = "";
	let showMessage = false;

	function triggerBubble() {
		currentMessage = messages[Math.floor(Math.random() * messages.length)];
		showMessage = true;

		// Hide after 2.5s
		setTimeout(() => (showMessage = false), 5000);
	}

	onMount(() => {
		const listener = (e) => {
			typed += e.key.toUpperCase();
			if (typed.includes("CUBE")) {
				showEasterEgg = true;
				typed = "";
			}
			if (typed.length > 10) typed = typed.slice(-4);
		};
		window.addEventListener("keydown", listener);

		window.addEventListener("mousemove", (e) => {
			if (!showEasterEgg || !cubeEl) return;

			const cubeRect = cubeEl.getBoundingClientRect();
			const dx = e.clientX - (cubeRect.left + cubeRect.width / 2);
			const dy = e.clientY - (cubeRect.top + cubeRect.height / 2);
			const distance = Math.sqrt(dx * dx + dy * dy);

			if (distance < 150) {
				// Move away from cursor
				cubeX += (dx > 0 ? -1 : 1) * 5;
				cubeY += (dy > 0 ? -1 : 1) * 5;

				// Keep within bounds (0–100%)
				cubeX = Math.max(0, Math.min(90, cubeX));
				cubeY = Math.max(0, Math.min(90, cubeY));

				triggerBubble();
			}
		});

		return () => window.removeEventListener("keydown", listener);
	});
</script>

<section
	class="relative flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-white grid-bg overflow-hidden"
>
	<!-- Animated 404 -->
	<div class="relative z-10">
		<h1
			class="font-clash text-[6rem] sm:text-[8rem] font-black text-blue-500 drop-shadow-[0_0_40px_rgba(59,130,246,0.6)] animate-pulse"
		>
			404
		</h1>
		<p class="mb-6 text-xl font-medium text-gray-300 sm:text-2xl">
			<strong>CUBE</strong> not found.
		</p>
	</div>

	<p class="mb-8 max-w-md text-gray-400 relative z-10">
		The page you’re looking for might have been scrambled or doesn’t exist.
		Try a different algorithm.
	</p>

	<a
		href="/"
		class="relative z-10 inline-block rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3 font-semibold text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] transition"
	>
		🏠 Return Home
	</a>

	<!-- 🎁 Easter Egg Cube -->
	{#if showEasterEgg}
		<img
			bind:this={cubeEl}
			src="/images/legendary-cube.png"
			alt="Legendary Cube"
			class="w-20 sm:w-24 fixed z-30 pointer-events-none transition-transform duration-200 ease-in-out"
			style="top: {cubeY}%; left: {cubeX}%; transform: translate(-50%, -50%);"
		/>

		{#if showMessage}
			<div
				class="absolute z-40 bg-white text-black text-sm px-3 py-2 rounded-full shadow-lg border border-neutral-200 max-w-xs transition-opacity duration-300"
				style="top: {cubeY - 10}%; left: {cubeX + 5}%;"
			>
				{currentMessage}
			</div>
		{/if}
	{/if}
</section>

<style>
	.grid-bg::before {
		content: "";
		position: absolute;
		inset: 0;
		background: repeating-linear-gradient(
			45deg,
			rgba(59, 130, 246, 0.3),
			rgba(59, 130, 246, 0.3) 2px,
			transparent 2px,
			transparent 40px
		);
		z-index: 0;
		opacity: 0.2; /* More visible but not overpowering */
	}
</style>
