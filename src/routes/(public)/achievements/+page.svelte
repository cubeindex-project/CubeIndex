<script lang="ts">
	import { configCatClient } from "$lib/configcatClient";
	import FeatureDisabled from "$lib/components/featureDisabled.svelte";
	import { onMount } from "svelte";

	const { data } = $props();
	const { achievements, profiles } = data;
	let achievementsAvailability: boolean = $state(true);

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		}).format(date);
	}

	function idOfUser(user: string) {
		const profile = profiles?.find(
			(p: { username: string }) => p.username === user,
		);
		return profile ? `/user/${profile.id}` : "#";
	}

	onMount(() =>
		configCatClient
			.getValueAsync("achievementsAvailability", false)
			.then((value) => {
				achievementsAvailability = value;
			}),
	);
</script>

{#if achievementsAvailability}
	<section class="min-h-screen bg-black text-white px-6 py-24">
		<div class="max-w-6xl mx-auto">
			<h1 class="text-4xl font-bold text-center mb-6">🏅 Achievements</h1>
			<p class="text-center text-gray-400 mb-12">
				Unlock achievements by participating in the CubeIndex community.
				Collect them all to showcase your journey!
			</p>

			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
				{#each achievements as achievement}
					<div
						class="relative rounded-xl border border-neutral-700 p-0 shadow-md flex overflow-hidden bg-neutral-900"
					>
						<!-- Rarity Color Bar -->
						<div
							class={"w-2 flex-shrink-0 " +
								(achievement.rarity == "Mythic"
									? "bg-red-600"
									: achievement.rarity == "Legendary"
										? "bg-yellow-400"
										: achievement.rarity == "Exotic"
											? "bg-teal-400"
											: achievement.rarity == "Epic"
												? "bg-purple-600"
												: achievement.rarity == "Rare"
													? "bg-blue-600"
													: "bg-neutral-700")}
						></div>
						<!-- Card Content -->
						<div class="flex-1 p-6">
							<!-- Icon and Rarity -->
							<div class="flex items-center justify-between mb-4">
								<div class="text-4xl">{achievement.icon}</div>
								<span
									class="text-sm capitalize px-3 py-1 rounded-full font-semibold bg-gray-700 text-white"
								>
									{achievement.rarity}
								</span>
							</div>

							<h2 class="text-xl font-bold mb-1">
								{achievement.name}
							</h2>
							<p class="text-sm text-gray-300 mb-2">
								{achievement.description}
							</p>

							{#if achievement.title}
								<div
									class="inline-flex items-center gap-2 rounded-full border border-blue-400/60 bg-blue-900/20 px-3 py-1 text-xs font-semibold tracking-wide text-blue-200 mb-2"
								>
									<i class="fa-regular fa-star"></i>
									<span>
										<span class="opacity-80 font-normal"
											>Title Reward:</span
										>
										<span class="font-bold ml-1"
											>"{achievement.title}"</span
										>
									</span>
								</div>
							{/if}

							<div class="space-y-2 text-sm text-gray-300">
								<p class="flex justify-between">
									<span class="font-semibold text-gray-400"
										>Category:</span
									>
									<span>{achievement.category}</span>
								</p>

								<p class="flex justify-between">
									<span class="font-semibold text-gray-400"
										>Unlock Method:</span
									>
									<span>{achievement.unlock_method}</span>
								</p>

								<a
									href={idOfUser(achievement.submitted_by)}
									class="flex justify-between hover:text-indigo-300 transition"
								>
									<span class="font-semibold text-gray-400"
										>Submitted by:</span
									>
									<span class="underline"
										>{achievement.submitted_by}</span
									>
								</a>

								<p class="flex justify-between">
									<span class="font-semibold text-gray-400"
										>Created at:</span
									>
									<span
										>{formatDate(
											achievement.created_at,
										)}</span
									>
								</p>

								{#if !achievement.unlockable}
									<p
										class="inline-flex items-center gap-2 rounded-full bg-red-600/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-200 ring-1 ring-inset ring-red-500"
									>
										<i class="fa-solid fa-xmark"></i>
										Not currently unlockable
									</p>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>
{:else}
	<FeatureDisabled featureName="Achievements are" />
{/if}
