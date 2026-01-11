import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 48;

export const load = (async ({ locals, url }) => {
	const pageParam = Number(url.searchParams.get("page") ?? "1");
	const sizeParam = Number(url.searchParams.get("size") ?? DEFAULT_PAGE_SIZE);
	const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
	const size = Number.isFinite(sizeParam)
		? Math.min(Math.max(sizeParam, 6), MAX_PAGE_SIZE)
		: DEFAULT_PAGE_SIZE;
	const query = url.searchParams.get("q")?.trim() ?? "";
	const condition = url.searchParams.get("condition")?.trim() ?? "";
	const country = url.searchParams.get("country")?.trim().toUpperCase() ?? "";

	const { user } = await locals.safeGetSession();

	let listingsQuery = locals.supabase
		.from("marketplace_listings")
		.select(
			`
				id,
				created_at,
				cube_name,
				cube_slug,
				condition,
				price_amount,
				price_currency,
				location_country,
				location_region,
				image_url,
				status,
				seller:profiles!marketplace_listings_seller_id_fkey (
					username,
					display_name,
					profile_picture
				),
				cube:cube_models (
					slug,
					model,
					brand,
					image_url
				)
			`,
			{ count: "exact" }
		)
		.eq("status", "active")
		.order("created_at", { ascending: false });

	if (query.length > 0) {
		listingsQuery = listingsQuery.ilike("cube_name", `%${query}%`);
	}

	if (condition.length > 0) {
		listingsQuery = listingsQuery.eq("condition", condition);
	}

	if (country.length > 0) {
		listingsQuery = listingsQuery.eq("location_country", country);
	}

	const from = (page - 1) * size;
	const to = from + size - 1;

	const { data: listings, error: listingsError, count } = await listingsQuery.range(
		from,
		to
	);

	if (listingsError) {
		locals.log.error(
			{ err: listingsError.message },
			"Failed to load marketplace listings"
		);
		throw error(500, "Failed to load marketplace listings");
	}

	return {
		listings: listings ?? [],
		page,
		size,
		count: count ?? 0,
		query,
		condition,
		country,
		user,
	};
}) satisfies PageServerLoad;
