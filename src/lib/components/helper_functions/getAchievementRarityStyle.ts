import type { AchievementRarity } from "$lib/components/dbTableTypes";

/** Tailwind utility classes describing how to render an achievement rarity. */
interface AchievementRarityPalette {
	readonly bg: string;
	readonly text: string;
	readonly dot: string;
	readonly bar: string;
	readonly badge: string;
	readonly badgeText: string;
}

const ACHIEVEMENT_RARITY_STYLES: Record<AchievementRarity, AchievementRarityPalette> =
	{
		Special: {
			bg: "bg-gradient-to-b from-yellow-400 via-pink-500 to-purple-600",
			text: "text-neutral-900",
			dot: "bg-yellow-300",
			bar: "bg-gradient-to-b from-yellow-400 via-pink-500 to-purple-600",
			badge:
				"bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600",
			badgeText: "text-neutral-900",
		},
		Mythic: {
			bg: "bg-gradient-to-r from-red-600 to-rose-700",
			text: "text-white",
			dot: "bg-rose-400",
			bar: "bg-red-600",
			badge: "bg-red-600",
			badgeText: "text-white",
		},
		Legendary: {
			bg: "bg-gradient-to-r from-yellow-300 to-yellow-500",
			text: "text-neutral-900",
			dot: "bg-yellow-400",
			bar: "bg-yellow-400",
			badge: "bg-yellow-400",
			badgeText: "text-neutral-900",
		},
		Exotic: {
			bg: "bg-teal-400",
			text: "text-neutral-900",
			dot: "bg-teal-300",
			bar: "bg-teal-400",
			badge: "bg-teal-400",
			badgeText: "text-neutral-900",
		},
		Epic: {
			bg: "bg-purple-600",
			text: "text-white",
			dot: "bg-purple-400",
			bar: "bg-purple-600",
			badge: "bg-purple-600",
			badgeText: "text-white",
		},
		Rare: {
			bg: "bg-blue-600",
			text: "text-white",
			dot: "bg-blue-400",
			bar: "bg-blue-600",
			badge: "bg-blue-600",
			badgeText: "text-white",
		},
		Uncommon: {
			bg: "bg-green-600",
			text: "text-white",
			dot: "bg-green-400",
			bar: "bg-green-600",
			badge: "bg-green-600",
			badgeText: "text-white",
		},
		Common: {
			bg: "bg-neutral-700",
			text: "text-white",
			dot: "bg-neutral-400",
			bar: "bg-neutral-700",
			badge: "bg-neutral-700",
			badgeText: "text-white",
		},
		Unknown: {
			bg: "bg-base-300",
			text: "text-neutral-900",
			dot: "bg-neutral-400",
			bar: "bg-base-300",
			badge: "bg-base-300",
			badgeText: "text-neutral-900",
		},
	};

/**
 * Returns a reusable palette of classes for the provided achievement rarity.
 *
 * @param rarity - The rarity string from the database or undefined
 */
export function getAchievementRarityStyle(
	rarity?: AchievementRarity
): AchievementRarityPalette {
	const key = rarity ?? "Common";
	return ACHIEVEMENT_RARITY_STYLES[key] ?? ACHIEVEMENT_RARITY_STYLES.Common;
}
