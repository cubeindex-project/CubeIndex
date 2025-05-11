<script lang="ts">
	export let data;

	const { badges } = data;

	const color = {
		black: "bg-black",
		blue: "bg-blue-900",
		purple: "bg-purple-900",
		yellow: "bg-linear-to-r from-[#f59e0b] to-[#facc15]",
		special: "bg-linear-to-r from-blue-600 to-purple-600",
	};
</script>

<section class="min-h-screen bg-black text-white px-6 py-24 relative">
	<div class="absolute inset-0 opacity-10">
		<img
			src="/images/hero-bg.png"
			alt=""
			class="w-full h-full object-cover"
		/>
	</div>

	<div class="relative z-10 max-w-6xl mx-auto">
		<h1 class="text-4xl font-bold text-center mb-6">🏅 Badges</h1>
		<p class="text-center text-gray-400 mb-12">
			Unlock badges by participating in the CubeIndex community. Collect
			them all to showcase your journey!
		</p>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
			{#each badges as badge}
				{#if badge.unlockable}
					<div
						class={`relative rounded-2xl p-6 ${badge.rarity === "special" ? color.special : badge.rarity === "legendary" ? color.yellow : badge.rarity === "epic" ? color.purple : badge.rarity === "rare" ? color.blue : color.black} shadow-md`}
					>
						<div class="flex flex-row justify-between">
							<div class="text-4xl mb-3 grid justify-baseline">
								{badge.icon}
							</div>
							<div
								class={`text-sm ${badge.rarity === "legendary" ? "text-black" : "text-white/90"} justify-end grid`}
							>
								<p class="capitalize p-2">{badge.rarity}</p>
							</div>
						</div>
						<h2
							class={`text-xl font-bold mb-1 ${badge.rarity === "legendary" ? "text-black" : "text-white/90"}`}
						>
							{badge.name}
						</h2>
						<p
							class={`text-sm ${badge.rarity === "legendary" ? "text-black" : "text-white/90"}`}
						>
							{badge.description}
						</p>
						<div
							class="absolute bottom-3 right-3 flex items-center gap-1 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow"
						>
							<span>Unlockable</span>
							<span>✅</span>
						</div>
					</div>
				{:else}
					<div
						class="relative rounded-2xl p-6 bg-gray-600 shadow-md opacity-60"
					>
						<div class="flex flex-row justify-between">
							<div class="text-4xl mb-3 grid justify-baseline">
								{badge.icon}
							</div>
							<div class="text-sm text-white/90 justify-end grid">
								<p class="capitalize p-2">{badge.rarity}</p>
							</div>
						</div>
						<h2 class="text-xl font-bold mb-1 text-white/90">
							{badge.name}
						</h2>
						<p class="text-sm text-white/90">
							{badge.description}
						</p>
						<div class="mt-5">
							<div
								class="absolute bottom-3 right-3 flex items-center gap-1 bg-red-400 text-white text-xs font-semibold px-2 py-1 rounded-full shadow"
							>
								<span>Unlockable</span>
								<span>❌</span>
							</div>
						</div>
					</div>
				{/if}
			{/each}
		</div>
	</div>
</section>
