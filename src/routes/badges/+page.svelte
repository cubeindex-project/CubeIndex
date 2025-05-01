<script lang="ts">
	export let data;

	const { badges } = data;

	const color = {
		black: "bg-black",
		blue: "bg-blue-900",
		purple: "bg-purple-900",
		yellow: "bg-radial from-[#f59e0b] to-[#facc15]",
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
				<div
					class={`rounded-2xl p-6 ${badge.rarity === 'legendary' ? color.yellow : badge.rarity === 'epic' ? color.purple : badge.rarity === 'rare' ? color.blue : color.black} shadow-md border border-white/10 ${badge.legendary ? "text-black" : "text-white"}`}
				>
					<div class="text-4xl mb-3">{badge.icon}</div>
					<h2 class={`text-xl font-bold mb-1 ${badge.rarity === 'legendary' ? 'text-black' : 'text-white/90'}`}>{badge.name}</h2>
					<p
						class={`text-sm ${badge.rarity === 'legendary' ? 'text-black' : 'text-white/90'}`}
					>
						{badge.description}
					</p>
				</div>
			{/each}
		</div>
	</div>
</section>
