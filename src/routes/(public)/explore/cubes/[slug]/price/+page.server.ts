import type { PageServerLoad } from "./$types";
import type {
  DetailedCube,
  PriceHistoryRow,
} from "$lib/components/dbTableTypes";
import { logError } from "$lib/server/logError";
import { clientLogger } from "$lib/logger/client";

export const load = (async ({ locals: { supabase }, params }) => {
  const { slug } = params;

  const [cubeRes, vendorRes, perVendorHistoryRes] = await Promise.all([
    supabase
      .from("v_detailed_cube_models")
      .select(
        "*, verified_by_id(display_name, username), submitted_by_id(display_name, username)",
      )
      .eq("slug", slug)
      .single(),
    supabase
      .from("cube_vendor_links")
      .select("*, vendor:vendor_name(*)")
      .eq("cube_slug", slug),
    supabase
      .from("v_price_history")
      .select("vendor_name, price_history")
      .eq("cube_slug", slug),
  ]);

  const cube: DetailedCube | null = cubeRes.data;

  if (!cube) {
    return logError(
      404,
      "Cube not found",
      clientLogger,
      new Error(`Cube "${slug}" not found`),
    );
  }
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
