import { supabase } from "$lib/supabaseClient";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load = (async ({ setHeaders }) => {
  const { data: vendors, error: vendorsErr } = await supabase
    .from("vendors")
    .select("*")
    .order("name", { ascending: true });

  if (vendorsErr) throw error(500, vendorsErr.message);

  const { data: cubesSold, error: csErr } = await supabase
    .from("cube_vendor_links")
    .select("*");

  if (csErr) throw error(500, csErr.message);

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

  return { vendors: sortedVendors, cubesSold };
}) satisfies PageLoad;
