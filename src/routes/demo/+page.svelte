<script>
	const user = {
		username: 'Saterz_',
		bio: 'A 15yo Caribbean-born, Gabon-based bilingual aspiring developer.',
		location: 'France',
		memberSince: '2025-04-15',
		profilePicture: '/images/Saterz.png',
		bannerImage: '/images/users/default-banner.png',
		cubes: [
			{ name: 'GAN 11 M Pro', condition: 'Lost' },
			{ name: 'GAN 356 Maglev', condition: 'New' },
			{ name: 'GAN 251 v2', condition: 'New' },
			{ name: 'Qiyi MS 5x5', condition: 'Used - Good' },
			{ name: 'GAN 460 M', condition: 'Used - Good' },
			{ name: 'Moyu AYOAN Skewb', condition: 'Used - Good' },
			{ name: 'GAN 365 i3', condition: 'New' }
		],
		badges: [
			{ name: 'Founder', type: 'epic', description: 'Founder and developer of CubeIndex.'},
			{ name: '3x3 Collector', type: 'standard', description: 'Owns multiple 3x3 cubes' },
			{ name: 'GAN Enthusiast', type: 'standard', description: 'Collects GAN brand cubes' },
			{ name: 'Early Cuber', type: 'gold', description: 'Joined CubeIndex during its beta' }
		],
		links: {
			twitter: 'https://twitter.com/Saterz_',
			youtube: 'https://youtube.com/@Saterz_',
			reddit: 'https://reddit.com/u/Intrepid_Definition5',
			website: 'https://saterz.dev'
		}
	};
</script>

<section
	class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black px-6 text-white"
>
	<div class="absolute inset-0 opacity-10">
		<img src="/images/hero-bg.png" alt="" class="h-full w-full object-cover" />
	</div>

	<!-- Profile Card -->
	<div class="relative z-10 mt-16 flex justify-center px-4">
		<div class="w-full max-w-4xl rounded-2xl bg-neutral-800 p-6 text-center shadow-lg sm:p-8">
			<!-- Avatar -->
			<div class="-mt-20 mb-4 flex justify-center">
				<img
					src={user.profilePicture}
					alt="Profile"
					class="h-28 w-28 rounded-full border-4 border-neutral-900 object-cover sm:h-32 sm:w-32"
				/>
			</div>

			<!-- Info -->
			<h1 class="font-clash text-3xl font-bold">{user.username}</h1>
			<p class="text-sm text-gray-400">{user.bio}</p>

			<div class="mt-6 flex flex-col justify-center gap-6 text-sm text-gray-300 sm:flex-row">
				<p><strong>📍 Location:</strong> {user.location}</p>
				<p><strong>📅 Member Since:</strong> {user.memberSince}</p>
				<p><strong>🧩 Puzzles:</strong> {user.cubes.length}</p>
			</div>

			<!-- Social Links -->
			<div class="mt-6 flex flex-wrap justify-center gap-4 text-sm text-blue-400">
				<a href={user.links.twitter} target="_blank"><i class="fa-brands fa-x-twitter fa-2x"></i></a
				>
				<a href={user.links.youtube} target="_blank"><i class="fa-brands fa-youtube fa-2x"></i></a>
				<a href={user.links.reddit} target="_blank"
					><i class="fa-brands fa-reddit-alien fa-2x"></i></a
				>
				<a href={user.links.website} target="_blank"><i class="fa-solid fa-globe fa-2x"></i></a>
			</div>

			<!-- Badges -->
			<div class="mt-6">
				<h3 class="mb-2 text-lg font-semibold">Badges</h3>
				<div class="flex flex-wrap justify-center gap-3">
					{#each user.badges as badge}
						<div class="group relative">
							<!-- Tooltip -->
							<div
								class="absolute bottom-full mb-2 hidden w-max max-w-xs rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:block group-hover:opacity-100"
								style="left: 50%; transform: translateX(-50%); z-index: 10;"
							>
								{badge.description}
							</div>

							<!-- Badge -->
							<span
								class="relative rounded-full px-4 py-1 text-sm font-medium transition duration-300"
								class:bg-blue-600={badge.type !== 'gold'}
								class:text-white={badge.type !== 'gold'}
								class:badge-gold={badge.type === 'gold'}
								class:badge-epic={badge.type === 'epic'}
							>
								{badge.name}
							</span>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- Cube Collection Card -->
	<div class="relative z-10 mt-8 mb-16 w-full max-w-4xl px-4">
		<div class="rounded-2xl bg-neutral-800 p-6 shadow-lg sm:p-8">
			<h2 class="mb-4 text-center text-xl font-semibold text-white">Cube Collection</h2>

			{#if user.cubes.length > 0}
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
					{#each user.cubes as cube}
						<div class="rounded-xl bg-neutral-900 p-4 shadow transition">
							<h3 class="text-lg font-semibold text-blue-400">{cube.name}</h3>
							<p class="text-xs text-gray-500 italic">Condition: {cube.condition}</p>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-center text-gray-500 italic">No cubes in this collection yet.</p>
			{/if}
		</div>
	</div>

	<!-- Disclaimer -->
	<div class="fixed right-4 bottom-4 z-50 text-xs text-gray-500 opacity-80">
		<p>You're viewing a demo build. UI and features are subject to change.</p>
	</div>
</section>

<style>
	.badge-gold {
		background: linear-gradient(90deg, #facc15, #f59e0b);
		color: black;
		box-shadow: 0 0 12px rgba(255, 215, 0, 0.6);
		animation: gold-shimmer-glow 2.5s ease-in-out infinite;
	}

	.badge-epic {
		background: linear-gradient(90deg, #1D4ED8, #8A2BE2);
		color: black;
		box-shadow: 0 0 12px rgba(255, 215, 0, 0.6);
		animation: epic-shimmer-glow 2.5s ease-in-out infinite;
	}

	@keyframes gold-shimmer-glow {
		0%,
		100% {
			box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
		}
		50% {
			box-shadow: 0 0 20px rgba(255, 215, 0, 1);
		}
	}

	@keyframes epic-shimmer-glow {
		0%,
		100% {
			box-shadow: 0 0 10px rgba(29, 78, 216, 0.5);
		}
		50% {
			box-shadow: 0 0 30px rgba(29, 78, 216, 1);
		}
	}
</style>
