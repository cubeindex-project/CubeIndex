import type { PageServerLoad } from "./$types";
import { logError } from "$lib/server/logError";

export interface PriceHistoryPoint {
  date: string;
  price: number;
}

export const load = (async ({ locals: { supabase, log }, parent }) => {
  const { cube, cube_vendor_links } = await parent();

  const { data: per_vendor_history, error: pvhErr } = await supabase
    .from("v_price_history")
    .select("vendor_name, price_history")
    .eq("cube_slug", cube.slug);

  if (pvhErr) {
    return logError(500, "Unable to load price history", log, pvhErr);
  }

  return {
    cube,
    vendor_links: cube_vendor_links,
    per_vendor_history: (per_vendor_history ?? []).map((row) => ({
      vendor_name: row.vendor_name ?? "",
      price_history: (row.price_history as any as PriceHistoryPoint[]) ?? [],
    })),
    meta: {
      title: `${cube.name} - Prices`,
      description:
        "Compare prices for this cube across stores. View the latest listings, track price changes over time, and find the best deal in your currency.",
    },
  };
}) satisfies PageServerLoad;
