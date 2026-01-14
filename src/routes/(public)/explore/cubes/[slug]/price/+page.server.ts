import type { PageServerLoad } from "./$types";
import type { PriceHistoryRow } from "$lib/components/dbTableTypes";
import { logError } from "$lib/server/logError";

export const load = (async ({ locals: { supabase, log }, parent }) => {
  const { cube, vendorRes } = await parent();

  const { data: per_vendor_history, error: pvhErr } = await supabase
    .from("v_price_history")
    .select("vendor_name, price_history")
    .eq("cube_slug", cube.slug);

  if (pvhErr) {
    return logError(500, "Unable to load price history", log, pvhErr);
  }

  return {
    cube,
    vendor_links: vendorRes.data ?? [],
    per_vendor_history: per_vendor_history as PriceHistoryRow[],
  };
}) satisfies PageServerLoad;
