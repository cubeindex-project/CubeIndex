import { logError } from "$lib/server/logError";
import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import type { ExpandedMarketplaceListing } from "../+page.server";

export const load = (async ({ locals: { log, supabase }, params }) => {
  const { id } = params;

  const { data: listing, error: listingError } = await supabase
    .from("marketplace_listings")
    .select(
      `*,seller:profiles!marketplace_listings_seller_id_fkey (username,display_name,profile_picture)`,
    )
    .eq("id", id)
    .maybeSingle();

  if (listingError) {
    logError(500, "Failed to load marketplace listing", log, listingError);
  }

  if (!listing) throw error(404, "Listing not found");

  return {
    listing: listing as ExpandedMarketplaceListing,
    meta: {
      title: `${listing.cube} - CubeIndex`,
    },
  };
}) satisfies PageServerLoad;
