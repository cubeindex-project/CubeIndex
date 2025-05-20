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

							<!-- Name and Description -->
							<h2 class="text-xl font-bold mb-1">
								{achievement.name}
							</h2>
							<p class="text-sm text-gray-300 mb-4">
								{achievement.description}
							</p>

							<!-- Metadata -->
							<div class="text-xs text-gray-400 space-y-1">
								<p>
									<strong>Category:</strong>
									{achievement.category}
								</p>
								<p>
									<strong>Unlock Method:</strong>
									{achievement.unlock_method}
								</p>
								<a href={idOfUser(achievement.submitted_by)}>
									<strong>Submitted by:</strong>
									<span class="underline"
										>{achievement.submitted_by}</span
									>
								</a>
								<p>
									<strong>Created at:</strong>
									{formatDate(achievement.created_at)}
								</p>
								{#if !achievement.unlockable}
									<p
										class="flex items-center gap-2 mt-3 text-red-100 font-bold bg-red-500 border-2 border-red-600 rounded-lg px-4 py-2 shadow-lg uppercase tracking-wide"
									>
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
