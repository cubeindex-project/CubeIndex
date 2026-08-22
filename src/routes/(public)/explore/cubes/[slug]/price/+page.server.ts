import { logError } from "$lib/server/logError";
import type { PageServerLoad } from "./$types";

export const load = (async ({ parent, locals: { supabase, log } }) => {
  const {
    cube,
    cube_vendor_links: raw_cube_vendor_links,
    meta,
  } = await parent();

  const { data: per_vendor_history, error: pvhErr } = await supabase
    .from("v_price_history")
    .select("vendor_name, price_history")
    .eq("cube_id", cube.id);

  if (pvhErr) {
    return logError(500, "Unable to load price history", log, pvhErr);
  }

  const cube_vendor_links = raw_cube_vendor_links.sort((a, b) => {
    const aSupportsPriceTracking = a.vendor.supports_price_scraping === true;
    const bSupportsPriceTracking = b.vendor.supports_price_scraping === true;

    if (aSupportsPriceTracking !== bSupportsPriceTracking) {
      return aSupportsPriceTracking ? -1 : 1;
    }

    if (aSupportsPriceTracking && bSupportsPriceTracking) {
      const priceA = a.price;
      const priceB = b.price;

      return priceA - priceB;
    }

    return 0;
  });

  return {
    cube,
    vendor_links: cube_vendor_links,
    per_vendor_history,
    meta: {
      ...meta,
      title: `${cube.name} - Prices`,
      noindex: true,
    },
  };
}) satisfies PageServerLoad;
