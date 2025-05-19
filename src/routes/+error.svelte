<script lang="ts">
	import { onMount } from "svelte";
	import { page } from '$app/state';
	
	// DVD‐logo bouncing cube state
	let cubeX = $state(50);
	let cubeY = $state(50);
	let velX = 0.8;
	let velY = 0.6;
	let rafId: number;

	function bounce() {
		cubeX += velX;
		cubeY += velY;
		if (cubeX <= 0 || cubeX >= 100) velX = -velX;
		if (cubeY <= 0 || cubeY >= 100) velY = -velY;
		cubeX = Math.min(100, Math.max(0, cubeX));
		cubeY = Math.min(100, Math.max(0, cubeY));
		rafId = requestAnimationFrame(bounce);
	}

	onMount(() => {
		rafId = requestAnimationFrame(bounce);
	});
</script>

<section
	class="relative flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-white grid-bg overflow-hidden"
>
	<div class="relative z-10">
		<h1
			class="font-clash text-[6rem] sm:text-[8rem] font-black text-blue-500 drop-shadow-[0_0_40px_rgba(59,130,246,0.6)] animate-pulse"
		>
			{page.status}
		</h1>
		<p class="mb-6 text-xl font-medium text-gray-300 sm:text-2xl">
			<strong>{page.error?.message}</strong>
		</p>
	</div>

	<p class="mb-8 max-w-md text-gray-400 relative z-10">
		It seems you encountered an error.<br>
		If you think this is a bug, please let us know!
	</p>

	<div class="flex flex-col sm:flex-row gap-4 justify-center mb-4 z-10 relative">
		<a
			href="/"
			class="inline-block rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3 font-semibold text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] transition"
		>
			🏠 Return Home
		</a>
		<a
			href="https://discord.gg/VHhYR6nyzs"
			target="_blank"
			rel="noopener noreferrer"
			class="inline-block rounded-xl bg-purple-600 hover:bg-purple-700 px-6 py-3 font-semibold text-white shadow-[0_0_20px_rgba(149,76,233,0.5)] transition"
		>
			🐞 Report the Bug on Discord
		</a>
	</div>

	<!-- Bouncing Cube -->
	<img
		src="/images/legendary-cube.png"
		alt="Legendary Cube"
		class="w-20 sm:w-24 fixed z-30 pointer-events-none"
		style="top: {cubeY}%; left: {cubeX}%; transform: translate(-50%, -50%);"
	/>
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
		opacity: 0.2;
	}
</style>
