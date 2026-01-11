import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load = (async ({ locals, params }) => {
	const { data: listing, error: listingError } = await locals.supabase
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
				description,
				contact_method,
				contact_value,
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
			`
		)
		.eq("id", params.id)
		.single();

	if (listingError || !listing) {
		locals.log.error(
			{ err: listingError?.message },
			"Failed to load marketplace listing"
		);
		throw error(404, "Listing not found");
	}

	return { listing };
}) satisfies PageServerLoad;
