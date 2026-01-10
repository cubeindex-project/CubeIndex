import type { PageServerLoad } from "./$types";
import type { PriceHistoryRow } from "$lib/components/dbTableTypes";
import { logError } from "$lib/server/logError";
import { clientLogger } from "$lib/logger/client";

export const load = (async ({ locals: { supabase }, params, parent }) => {
  const { slug } = params;

  const { cube } = await parent();

  const [vendorRes, perVendorHistoryRes] = await Promise.all([
    supabase
      .from("cube_vendor_links")
      .select("*, vendor:vendor_name(*)")
      .eq("cube_slug", slug),
    supabase
      .from("v_price_history")
      .select("vendor_name, price_history")
      .eq("cube_slug", slug),
  ]);

  if (vendorRes.error) {
    return logError(
      500,
      "Unable to load vendor links",
      clientLogger,
      vendorRes.error,
    );
  }
  if (perVendorHistoryRes.error) {
    return logError(
      500,
      "Unable to load price history",
      clientLogger,
      perVendorHistoryRes.error,
    );
  }

  return {
    cube,
    vendor_links: vendorRes.data ?? [],
    per_vendor_history: perVendorHistoryRes.data as PriceHistoryRow[],
  };
}) satisfies PageServerLoad;
