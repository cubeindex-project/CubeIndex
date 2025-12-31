import type { PageServerLoad } from "./$types";
import { logError } from "$lib/server/logError";

interface SnapshotRow {
	cube_slug: string;
	vendor_name: string | null;
	price: number | null;
	created_at: string;
}

interface UserCubeRow {
	cube: string;
	quantity: number | null;
	condition: string | null;
	status: string | null;
	bought_from: string | null;
	notes: string | null;
	acquired_at: string | null;
	created_at: string | null;
	cube_model?: {
		slug?: string | null;
		brand?: string | null;
		type?: string | null;
		name?: string | null;
		model?: string | null;
		version_name?: string | null;
	};
	vendor?: { name?: string | null; slug?: string | null } | null;
}

interface RatingRow {
	cube_slug: string;
	rating: number;
}

interface CountEntry {
	[key: string]: string | number | null;
	count: number;
}

interface ValueEntry {
	[key: string]: string | number | null;
	value: number;
}

interface TopValueEntry {
	cube_model_id: string;
	cube_name: string;
	brand: string;
	cube_type: string;
	store_name: string;
	current_value: number;
}

interface TopRatedEntry {
	cube_model_id: string;
	cube_name: string;
	brand: string;
	cube_type: string;
	rating: number;
}

interface TopChangeEntry {
	cube_model_id: string;
	cube_name: string;
	net_change: number;
}

interface AggregatedStats {
	total_count: number;
	total_value: number;
	avg_rating: number;
	rated_count: number;
	total_net_change: number;
	net_change_count: number;
	brand_counts: CountEntry[];
	store_counts: CountEntry[];
	type_counts: CountEntry[];
	monthly_counts: { month_iso: string; count: number }[];
	cadence_counts: { day_iso: string; count: number }[];
	condition_counts: CountEntry[];
	value_by_brand: ValueEntry[];
	value_by_type: ValueEntry[];
	value_by_store: ValueEntry[];
	monthly_spend: { month_iso: string; value: number }[];
	cumulative_spend: { month_iso: string; value: number }[];
	rating_histogram: { rating: number; count: number }[];
	unrated_count: number;
	avg_rating_by_brand: { brand: string; avg_rating: number; rated_count: number }[];
	avg_rating_by_type: { cube_type: string; avg_rating: number; rated_count: number }[];
	rated_vs_unrated: { rated_count: number; unrated_count: number };
	top_most_valuable: TopValueEntry[];
	top_highest_rated: TopRatedEntry[];
	top_brands: CountEntry[];
	top_stores: CountEntry[];
	top_gainers: TopChangeEntry[];
	top_losers: TopChangeEntry[];
}

function toDay(dateStr: string | null | undefined) {
	if (!dateStr) return null;
	const d = new Date(dateStr);
	return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

function groupSnapshots(rows: SnapshotRow[]) {
	const map = new Map<string, SnapshotRow[]>();
	for (const row of rows) {
		const key = row.cube_slug;
		if (!map.has(key)) map.set(key, []);
		map.get(key)!.push(row);
	}
	for (const list of map.values()) {
		list.sort((a, b) => a.created_at.localeCompare(b.created_at));
	}
	return map;
}

function pickSnapshotForDate(
	list: SnapshotRow[],
	referenceDate: string | null,
	storeSlug: string | null
) {
	if (!referenceDate || list.length === 0) return null;
	const targetDay = toDay(referenceDate);
	if (!targetDay) return null;

	let relevant = storeSlug
		? list.filter((snap) => snap.vendor_name === storeSlug)
		: list;

	if (relevant.length === 0 && storeSlug) relevant = list;

	const dayMatches = relevant.filter((snap) => toDay(snap.created_at) === targetDay);
	if (dayMatches.length > 0) {
		if (storeSlug) {
			const latest = [...dayMatches].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
			return latest;
		}
		return [...dayMatches].sort((a, b) => (a.price ?? 0) - (b.price ?? 0))[0];
	}

	const before = relevant.filter((snap) => toDay(snap.created_at)! < targetDay);
	if (before.length > 0) {
		return [...before].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
	}

	const after = relevant.filter((snap) => toDay(snap.created_at)! > targetDay);
	if (after.length > 0) {
		return [...after].sort((a, b) => a.created_at.localeCompare(b.created_at))[0];
	}

	return null;
}

function pickLatestSnapshot(list: SnapshotRow[], storeSlug: string | null) {
	if (list.length === 0) return null;
	let relevant = storeSlug
		? list.filter((snap) => snap.vendor_name === storeSlug)
		: list;
	if (relevant.length === 0 && storeSlug) relevant = list;
	if (relevant.length === 0) return null;

	const latestDay = toDay(
		[...relevant].sort((a, b) => b.created_at.localeCompare(a.created_at))[0]?.created_at ?? null
	);
	if (!latestDay) return null;
	const sameDay = relevant.filter((snap) => toDay(snap.created_at) === latestDay);
	if (!storeSlug) {
		return [...sameDay].sort((a, b) => (a.price ?? 0) - (b.price ?? 0))[0];
	}
	return [...sameDay].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
}

function cubeName(cube: UserCubeRow) {
	const model = cube.cube_model;
	const nameParts = [model?.brand, model?.model, model?.version_name].filter(Boolean);
	const fallbackName = nameParts.join(" ").trim();
	return ((model?.name ?? fallbackName) || cube.cube).trim();
}

function sumBy<T>(items: T[], selector: (item: T) => number) {
	return items.reduce((acc, item) => acc + selector(item), 0);
}

function aggregateStats(
	cubes: UserCubeRow[],
	snapshots: SnapshotRow[],
	ratings: RatingRow[]
): AggregatedStats {
	const ratingsMap = new Map<string, number>();
	for (const r of ratings) {
		if (Number.isFinite(r.rating)) ratingsMap.set(r.cube_slug, Number(r.rating));
	}

	const groupedSnapshots = groupSnapshots(snapshots);
	const nonWishlisted = cubes.filter((uc) => uc.status !== "Wishlist");

	interface PerCube {
		slug: string;
		brand: string;
		cube_type: string;
		store_name: string;
		condition: string;
		quantity: number;
		value: number;
		current_value: number;
		acquired_value: number | null;
		net_change: number | null;
		reference_month: string | null;
		reference_day: string | null;
		rating: number | null;
		cube_name: string;
	}

	const perCube: PerCube[] = [];

	for (const uc of nonWishlisted) {
		const slug = uc.cube_model?.slug ?? uc.cube;
		if (!slug) continue;
		const snapshotList = groupedSnapshots.get(slug) ?? [];
		const storeSlug = uc.bought_from;
		const refDate = uc.acquired_at ?? uc.created_at;
		const refSnap = pickSnapshotForDate(snapshotList, refDate, storeSlug);
		const refPrice = Number(refSnap?.price ?? 0);
		const currentSnap = pickLatestSnapshot(snapshotList, storeSlug);
		const currentPrice = Number(currentSnap?.price ?? 0);
		const acquiredSnap = uc.acquired_at
			? pickSnapshotForDate(snapshotList, uc.acquired_at, storeSlug)
			: null;
		const acquiredPrice = Number(acquiredSnap?.price ?? refPrice);
		const qty = uc.quantity ?? 1;
		const storeName = uc.vendor?.name ?? uc.bought_from ?? "Unknown";
		const brand = uc.cube_model?.brand ?? "Unknown";
		const cubeType = uc.cube_model?.type ?? "Unknown";
		const condition = uc.condition ?? "Unknown";
		const cubeRating = ratingsMap.get(slug) ?? null;
		const referenceDay = toDay(refDate);
		const referenceMonth = referenceDay ? `${referenceDay.slice(0, 7)}-01` : null;

		const valueUsed = refPrice * qty;
		const acquiredValue = uc.acquired_at ? acquiredPrice * qty : null;
		const net = uc.acquired_at ? (currentPrice - acquiredPrice) * qty : null;
		const currentValue = currentPrice * qty;

		perCube.push({
			slug,
			brand,
			cube_type: cubeType,
			store_name: storeName,
			condition,
			quantity: qty,
			value: valueUsed,
			current_value: currentValue,
			acquired_value: acquiredValue,
			net_change: net,
			reference_month: referenceMonth,
			reference_day: referenceDay,
			rating: cubeRating,
			cube_name: cubeName(uc),
		});
	}

	const totalValue = sumBy(perCube, (c) => c.value);
	const totalCount = perCube.length;
	const ratedEntries = perCube.filter((c) => c.rating != null);
	const ratedCount = ratedEntries.length;
	const avgRating = ratedCount
		? sumBy(ratedEntries, (c) => c.rating ?? 0) / ratedCount
		: 0;
	const nettable = perCube.filter((c) => c.net_change != null);
	const totalNetChange = sumBy(nettable, (c) => c.net_change ?? 0);
	const netChangeCount = nettable.length;

	function countBy<T extends keyof PerCube>(key: T): CountEntry[] {
		const map = new Map<string, number>();
		for (const c of perCube) {
			const v = (c[key] as string | null | undefined) ?? "Unknown";
			map.set(v, (map.get(v) ?? 0) + 1);
		}
		return [...map.entries()]
			.map(([k, v]) => ({ [key]: k, count: v }))
			.sort((a, b) => b.count - a.count);
	}

	function valueBy<T extends keyof PerCube>(key: T): ValueEntry[] {
		const map = new Map<string, number>();
		for (const c of perCube) {
			const v = (c[key] as string | null | undefined) ?? "Unknown";
			map.set(v, (map.get(v) ?? 0) + c.value);
		}
		return [...map.entries()]
			.map(([k, v]) => ({ [key]: k, value: v }))
			.sort((a, b) => b.value - a.value);
	}

	const monthlyCountsMap = new Map<string, number>();
	const cadenceMap = new Map<string, number>();
	for (const c of perCube) {
		if (c.reference_month) {
			monthlyCountsMap.set(
				c.reference_month,
				(monthlyCountsMap.get(c.reference_month) ?? 0) + 1
			);
		}
		if (c.reference_day) {
			cadenceMap.set(c.reference_day, (cadenceMap.get(c.reference_day) ?? 0) + 1);
		}
	}

	const monthlyCounts = [...monthlyCountsMap.entries()]
		.map(([month_iso, count]) => ({ month_iso, count }))
		.sort((a, b) => a.month_iso.localeCompare(b.month_iso));

	const cadenceCounts = [...cadenceMap.entries()]
		.map(([day_iso, count]) => ({ day_iso, count }))
		.sort((a, b) => a.day_iso.localeCompare(b.day_iso));

	const monthlySpendMap = new Map<string, number>();
	for (const c of perCube) {
		if (!c.reference_month) continue;
		monthlySpendMap.set(
			c.reference_month,
			(monthlySpendMap.get(c.reference_month) ?? 0) + c.value
		);
	}

	const monthlySpend = [...monthlySpendMap.entries()]
		.map(([month_iso, value]) => ({ month_iso, value }))
		.sort((a, b) => a.month_iso.localeCompare(b.month_iso));

	let running = 0;
	const cumulativeSpend = monthlySpend.map((m) => {
		running += m.value;
		return { month_iso: m.month_iso, value: running };
	});

	const histogram: { rating: number; count: number }[] = [];
	for (let r = 1; r <= 5; r += 1) {
		histogram.push({ rating: r, count: 0 });
	}
	for (const c of ratedEntries) {
		const bucket = Math.min(5, Math.max(1, Math.round(c.rating ?? 0)));
		histogram[bucket - 1].count += 1;
	}

	const avgRatingByBrandMap = new Map<string, { total: number; count: number }>();
	const avgRatingByTypeMap = new Map<string, { total: number; count: number }>();
	for (const c of ratedEntries) {
		const brandKey = c.brand ?? "Unknown";
		const typeKey = c.cube_type ?? "Unknown";
		avgRatingByBrandMap.set(brandKey, {
			total: (avgRatingByBrandMap.get(brandKey)?.total ?? 0) + (c.rating ?? 0),
			count: (avgRatingByBrandMap.get(brandKey)?.count ?? 0) + 1,
		});
		avgRatingByTypeMap.set(typeKey, {
			total: (avgRatingByTypeMap.get(typeKey)?.total ?? 0) + (c.rating ?? 0),
			count: (avgRatingByTypeMap.get(typeKey)?.count ?? 0) + 1,
		});
	}

	const avgRatingByBrand = [...avgRatingByBrandMap.entries()]
		.map(([brand, { total, count }]) => ({
			brand,
			avg_rating: count ? total / count : 0,
			rated_count: count,
		}))
		.sort((a, b) => b.avg_rating - a.avg_rating);

	const avgRatingByType = [...avgRatingByTypeMap.entries()]
		.map(([cube_type, { total, count }]) => ({
			cube_type,
			avg_rating: count ? total / count : 0,
			rated_count: count,
		}))
		.sort((a, b) => b.avg_rating - a.avg_rating);

	const topMostValuable = [...perCube]
		.filter((c) => c.current_value > 0)
		.sort((a, b) => b.current_value - a.current_value)
		.slice(0, 10)
		.map<TopValueEntry>((c) => ({
			cube_model_id: c.slug,
			cube_name: c.cube_name,
			brand: c.brand,
			cube_type: c.cube_type,
			store_name: c.store_name,
			current_value: c.current_value,
		}));

	const topHighestRated = [...ratedEntries]
		.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
		.slice(0, 10)
		.map<TopRatedEntry>((c) => ({
			cube_model_id: c.slug,
			cube_name: c.cube_name,
			brand: c.brand,
			cube_type: c.cube_type,
			rating: c.rating ?? 0,
		}));

	const topBrands = countBy("brand").slice(0, 10);
	const topStores = countBy("store_name").slice(0, 10);

	const gainers = nettable
		.filter((c) => (c.net_change ?? 0) > 0)
		.sort((a, b) => (b.net_change ?? 0) - (a.net_change ?? 0))
		.slice(0, 10)
		.map<TopChangeEntry>((c) => ({
			cube_model_id: c.slug,
			cube_name: c.cube_name,
			net_change: c.net_change ?? 0,
		}));

	const losers = nettable
		.filter((c) => (c.net_change ?? 0) < 0)
		.sort((a, b) => (a.net_change ?? 0) - (b.net_change ?? 0))
		.slice(0, 10)
		.map<TopChangeEntry>((c) => ({
			cube_model_id: c.slug,
			cube_name: c.cube_name,
			net_change: c.net_change ?? 0,
		}));

	return {
		total_count: totalCount,
		total_value: totalValue,
		avg_rating: avgRating,
		rated_count: ratedCount,
		total_net_change: totalNetChange,
		net_change_count: netChangeCount,
		brand_counts: countBy("brand"),
		store_counts: countBy("store_name"),
		type_counts: countBy("cube_type"),
		monthly_counts: monthlyCounts,
		cadence_counts: cadenceCounts,
		condition_counts: countBy("condition"),
		value_by_brand: valueBy("brand"),
		value_by_type: valueBy("cube_type"),
		value_by_store: valueBy("store_name"),
		monthly_spend: monthlySpend,
		cumulative_spend: cumulativeSpend,
		rating_histogram: histogram,
		unrated_count: totalCount - ratedCount,
		avg_rating_by_brand: avgRatingByBrand,
		avg_rating_by_type: avgRatingByType,
		rated_vs_unrated: { rated_count: ratedCount, unrated_count: totalCount - ratedCount },
		top_most_valuable: topMostValuable,
		top_highest_rated: topHighestRated,
		top_brands: topBrands,
		top_stores: topStores,
		top_gainers: gainers,
		top_losers: losers,
	};
}

export const load = (async ({ params, locals }) => {
	const { supabase, log } = locals;
	const { username } = params;

	const { data: profile, error: profileErr } = await supabase
		.from("profiles")
		.select("user_id, username, display_name")
		.eq("username", username)
		.single();

	if (profileErr || !profile) {
		return logError(404, "User not found", log, profileErr ?? new Error("Profile not found"));
	}

	const { data: userCubes, error: cubesErr } = await supabase
		.from("user_cubes")
		.select(
			"id, cube, quantity, main, condition, status, bought_from, notes, acquired_at, created_at, cube_model:cube(*), vendor:bought_from(slug, name)"
		)
		.eq("user_id", profile.user_id)
		.neq("status", "Wishlist");

	if (cubesErr || !userCubes) {
		return logError(
			500,
			"Unable to load collection for stats",
			log,
			cubesErr ?? new Error("Missing collection data")
		);
	}

	const cubeSlugs = Array.from(
		new Set(
			userCubes
				.map((uc) => uc.cube_model?.slug ?? uc.cube)
				.filter((slug): slug is string => Boolean(slug))
		)
	);

	const snapshotsPromise = cubeSlugs.length
		? supabase
				.from("cube_vendor_links_snapshot")
				.select("cube_slug, vendor_name, price, created_at")
				.in("cube_slug", cubeSlugs)
		: Promise.resolve({ data: [] as SnapshotRow[], error: null });

	const ratingsPromise = supabase
		.from("user_cube_ratings")
		.select("cube_slug, rating")
		.eq("user_id", profile.user_id);

	const [snapshotsRes, ratingsRes] = await Promise.all([snapshotsPromise, ratingsPromise]);

	if (snapshotsRes.error) {
		return logError(500, "Unable to load price snapshots", log, snapshotsRes.error);
	}
	if (ratingsRes.error) {
		return logError(500, "Unable to load ratings", log, ratingsRes.error);
	}

	const stats = aggregateStats(userCubes as UserCubeRow[], (snapshotsRes.data ?? []) as SnapshotRow[], (ratingsRes.data ?? []) as RatingRow[]);

	return { profile, stats };
}) satisfies PageServerLoad;
