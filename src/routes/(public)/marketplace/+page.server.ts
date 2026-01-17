import type {
  MarketplaceListing,
  Profiles,
} from "$lib/components/dbTableTypes";
import { logError } from "$lib/server/logError";
import type { PageServerLoad } from "./$types";

export interface ExpandedMarketplaceListing extends MarketplaceListing {
  seller: Pick<Profiles, "username" | "display_name" | "profile_picture">;
}

export const load = (async ({ locals: { user, supabase, log } }) => {
  const { data: listings, error: listErr } = await supabase
    .from("marketplace_listings")
    .select(`*,seller:profiles(username,display_name,profile_picture)`)
    .order("created_at", { ascending: false });

  if (listErr)
    logError(500, "Failed to load marketplace listings", log, listErr);

  return {
    listings: listings,
    user,
    meta: {
      title: "Cube Marketplace - CubeIndex",
    },
  };
}) satisfies PageServerLoad;
