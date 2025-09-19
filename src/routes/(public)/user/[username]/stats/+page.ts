import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import { supabase } from "$lib/supabaseClient";

type UserCubeRow = {
  cube: string;
  quantity: number | null;
  condition: string;
  status: string;
  created_at: string | null;
  acquired_at: string | null;
  cube_model: {
    slug: string;
    model: string;
    series: string | null;
    type: string | null;
  } | null;
};

type UserCubeRatingRow = {
  cube_slug: string;
  rating: number | null;
  created_at: string | null;
  cube_model: {
    slug: string;
    model: string;
    series: string | null;
    type: string | null;
  } | null;
};

type UserAchievementRow = {
  achievement_slug: string;
  awarded_at: string | null;
  achievement: {
    name: string;
    icon: string | null;
  } | null;
};

type BreakdownEntry = {
  label: string;
  count: number;
};

type TimelinePoint = {
  month: string;
  total: number;
};

type RatingBucket = {
  rating: number;
  count: number;
};

type ActivityItem = {
  type: "collection" | "rating" | "achievement";
  title: string;
  subtitle?: string;
  timestamp: string;
  icon: string;
};

function toMonthKey(input: string | null): { key: string; date: Date } | null {
  if (!input) return null;
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return null;
  const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
  const firstOfMonth = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  return { key, date: firstOfMonth };
}

function asSingleRecord<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value.length > 0 ? value[0]! : null;
  }
  return value ?? null;
}

export const load = (async ({ parent }) => {
  const { profile } = await parent();

  const [cubesRes, ratingsRes, achievementsRes] = await Promise.all([
    supabase
      .from("user_cubes")
      .select(
        "cube, quantity, condition, status, created_at, acquired_at, cube_model:cube_models(slug, model, series, type)"
      )
      .eq("user_id", profile.user_id),
    supabase
      .from("user_cube_ratings")
      .select(
        "cube_slug, rating, created_at, cube_model:cube_slug(slug, model, series, type)"
      )
      .eq("user_id", profile.user_id),
    supabase
      .from("user_achievements")
      .select("achievement_slug, awarded_at, achievement:achievement_slug(name, icon)")
      .eq("user_id", profile.user_id),
  ]);

  if (cubesRes.error) {
    throw error(500, `Failed to load collection stats: ${cubesRes.error.message}`);
  }

  if (ratingsRes.error) {
    throw error(500, `Failed to load rating stats: ${ratingsRes.error.message}`);
  }

  if (achievementsRes.error) {
    throw error(500, `Failed to load achievement stats: ${achievementsRes.error.message}`);
  }

  const userCubes: UserCubeRow[] = (cubesRes.data ?? []).map((cube) => ({
    cube: cube.cube,
    quantity: cube.quantity,
    condition: cube.condition,
    status: cube.status,
    created_at: cube.created_at,
    acquired_at: cube.acquired_at,
    cube_model: asSingleRecord(cube.cube_model) ?? null,
  }));

  const userRatings: UserCubeRatingRow[] = (ratingsRes.data ?? []).map((rating) => ({
    cube_slug: rating.cube_slug,
    rating: rating.rating,
    created_at: rating.created_at,
    cube_model: asSingleRecord(rating.cube_model) ?? null,
  }));

  const userAchievements: UserAchievementRow[] = (achievementsRes.data ?? []).map((achievement) => ({
    achievement_slug: achievement.achievement_slug,
    awarded_at: achievement.awarded_at,
    achievement: asSingleRecord(achievement.achievement) ?? null,
  }));

  const totalQuantity = userCubes.reduce((sum, cube) => sum + (cube.quantity ?? 1), 0);
  const uniqueModels = userCubes.length;

  const statusCountsMap = new Map<string, number>();
  const conditionCountsMap = new Map<string, number>();
  const typeCountsMap = new Map<string, number>();

  for (const cube of userCubes) {
    const amount = cube.quantity ?? 1;
    statusCountsMap.set(cube.status, (statusCountsMap.get(cube.status) ?? 0) + amount);

    const conditionKey = cube.condition ?? "Unknown";
    conditionCountsMap.set(conditionKey, (conditionCountsMap.get(conditionKey) ?? 0) + amount);

    const typeKey = cube.cube_model?.type ?? "Unknown";
    typeCountsMap.set(typeKey, (typeCountsMap.get(typeKey) ?? 0) + amount);
  }

  const statusCounts: BreakdownEntry[] = Array.from(statusCountsMap.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  const conditionBreakdown: BreakdownEntry[] = Array.from(conditionCountsMap.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  const typeBreakdown: BreakdownEntry[] = Array.from(typeCountsMap.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  const ownedCount = statusCountsMap.get("Owned") ?? 0;
  const wishlistCount = statusCountsMap.get("Wishlist") ?? 0;

  const ratingsCount = userRatings.length;
  const ratingsTotal = userRatings.reduce((sum, rating) => sum + (rating.rating ?? 0), 0);
  const averageRating = ratingsCount > 0 ? ratingsTotal / ratingsCount : null;

  const achievementsCount = userAchievements.length;

  const timelineByMonth = new Map<string, { point: TimelinePoint; date: Date }>();
  for (const cube of userCubes) {
    const dateSource = cube.acquired_at ?? cube.created_at;
    const month = toMonthKey(dateSource);
    if (!month) continue;
    const existing = timelineByMonth.get(month.key);
    if (existing) {
      existing.point.total += cube.quantity ?? 1;
    } else {
      timelineByMonth.set(month.key, {
        point: { month: month.key, total: cube.quantity ?? 1 },
        date: month.date,
      });
    }
  }

  const sortedTimeline = Array.from(timelineByMonth.values()).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  let runningTotal = 0;
  const collectionGrowth: TimelinePoint[] = sortedTimeline.map(({ point }) => {
    runningTotal += point.total;
    return { month: point.month, total: runningTotal };
  });

  const ratingBucketsMap = new Map<number, number>();
  for (const rating of userRatings) {
    if (rating.rating == null) continue;
    const key = Math.round(rating.rating * 2) / 2;
    ratingBucketsMap.set(key, (ratingBucketsMap.get(key) ?? 0) + 1);
  }

  const ratingDistribution: RatingBucket[] = Array.from(ratingBucketsMap.entries())
    .map(([rating, count]) => ({ rating, count }))
    .sort((a, b) => a.rating - b.rating);

  const recentActivity: ActivityItem[] = [];

  for (const cube of userCubes) {
    const timestamp = cube.created_at ?? cube.acquired_at;
    if (!timestamp) continue;
    const title = cube.cube_model?.model ?? cube.cube;
    const subtitleParts = [cube.status, cube.condition].filter(Boolean);
    recentActivity.push({
      type: "collection",
      title,
      subtitle: subtitleParts.join(" • "),
      timestamp,
      icon: "fa-solid fa-cube",
    });
  }

  for (const rating of userRatings) {
    if (!rating.created_at) continue;
    const title = rating.cube_model?.model ?? rating.cube_slug;
    const subtitle = rating.rating != null ? `${rating.rating.toFixed(1)} ★ rating` : undefined;
    recentActivity.push({
      type: "rating",
      title,
      subtitle,
      timestamp: rating.created_at,
      icon: "fa-solid fa-star",
    });
  }

  for (const achievement of userAchievements) {
    if (!achievement.awarded_at) continue;
    const title = achievement.achievement?.name ?? achievement.achievement_slug;
    recentActivity.push({
      type: "achievement",
      title,
      subtitle: "Achievement unlocked",
      timestamp: achievement.awarded_at,
      icon: achievement.achievement?.icon ?? "fa-solid fa-trophy",
    });
  }

  recentActivity.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const MAX_ACTIVITY_ITEMS = 12;
  const activity = recentActivity.slice(0, MAX_ACTIVITY_ITEMS);

  return {
    stats: {
      totals: {
        totalQuantity,
        uniqueModels,
        ownedCount,
        wishlistCount,
        ratingsCount,
        averageRating,
        achievementsCount,
      },
      breakdowns: {
        byType: typeBreakdown,
        byCondition: conditionBreakdown,
        byStatus: statusCounts,
      },
      charts: {
        collectionGrowth,
        ratingDistribution,
      },
      recentActivity: activity,
    },
  };
}) satisfies PageLoad;
