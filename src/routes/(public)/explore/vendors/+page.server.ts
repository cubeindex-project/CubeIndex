import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ setHeaders, locals: { log, supabase } }) => {
  const { data: vendors, error: vendorsErr } = await supabase
    .from("v_detailed_vendors")
    .select("*")
    .order("name", { ascending: true });

  if (vendorsErr) {
    log.error({ err: vendorsErr, msg: "Unable to load vendors" });
    throw error(500, "Unable to load vendors");
  }

  const sortedVendors = vendors.sort((a, b) => {
    if (a.sponsored && !b.sponsored) return -1;
    if (!a.sponsored && b.sponsored) return 1;
    if (a.verified && !b.verified) return -1;
    if (!a.verified && b.verified) return 1;
    return 0;
  });

  setHeaders({
    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
  });

  return {
    vendors: sortedVendors,
    meta: {
      title: "Explore Vendors - CubeIndex",
      description:
        "Browse vendors on CubeIndex. See each vendor’s location, default currency, and how many users have purchased from them.",
    },
  };
}) satisfies PageServerLoad;
