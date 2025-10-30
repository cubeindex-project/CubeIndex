import { supabase } from "$lib/supabaseClient";
import type { PageLoad } from "./$types";
import { clientLogError } from "$lib/logger/clientLogError";
import { clientLogger } from "$lib/logger/client";

export const load = (async ({ setHeaders }) => {
  const { data: vendors, error: vendorsErr } = await supabase
    .from("vendors")
    .select("*")
    .order("name", { ascending: true });

  if (vendorsErr) {
    return clientLogError("Unable to load vendors", clientLogger, vendorsErr);
  }

  const { data: cubesSold, error: csErr } = await supabase
    .from("cube_vendor_links")
    .select("*");

  if (csErr) {
    return clientLogError(
      "Unable to load vendor inventory",
      clientLogger,
      csErr
    );
  }

  const { data: user_cubes, error: ucErr } = await supabase
    .from("user_cubes")
    .select("*");

  if (ucErr) {
    return clientLogError(
      "Unable to load user cube data",
      clientLogger,
      ucErr
    );
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

  return { vendors: sortedVendors, cubesSold, user_cubes };
}) satisfies PageLoad;
