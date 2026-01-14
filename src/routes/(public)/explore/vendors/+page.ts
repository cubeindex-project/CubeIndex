import { supabase } from "$lib/supabaseClient";
import type { PageLoad } from "./$types";
import { clientLogError } from "$lib/logger/clientLogError";
import { clientLogger } from "$lib/logger/client";

export const load = (async ({ setHeaders }) => {
  const { data: vendors, error: vendorsErr } = await supabase
    .from("v_detailed_vendors")
    .select("*")
    .order("name", { ascending: true });

  if (vendorsErr) {
    return clientLogError("Unable to load vendors", clientLogger, vendorsErr);
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
    meta: { title: "Explore Vendors - CubeIndex" },
  };
}) satisfies PageLoad;
