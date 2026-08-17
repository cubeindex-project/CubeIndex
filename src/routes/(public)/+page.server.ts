import { logError } from "$lib/server/logError";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals: { supabase, log } }) => {
  const [
    { data: featuredCube, error: cubeErr },
    { count: totalCubes, error: cubeCountErr },
    { count: totalUsers, error: userCountErr },
    { count: totalVendors, error: vendorCountErr },
    { count: totalTrackedPrices, error: trackedPricesCountErr },
  ] = await Promise.all([
    supabase
      .from("v_detailed_cube_models")
      .select("*")
      .eq("status", "Approved")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("cube_models")
      .select("*", { count: "exact", head: true })
      .eq("status", "Approved"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("vendors").select("*", { count: "exact", head: true }),
    supabase
      .from("cube_vendor_links")
      .select("*", { count: "exact", head: true }),
  ]);

  if (cubeErr) {
    logError(500, "Failed to fetch cube", log, cubeErr, false);
  }
  if (cubeCountErr) {
    logError(500, "Failed to fetch cube count", log, cubeCountErr, false);
  }
  if (userCountErr) {
    logError(500, "Failed to fetch user count", log, userCountErr, false);
  }
  if (vendorCountErr) {
    logError(500, "Failed to fetch vendor count", log, vendorCountErr, false);
  }
  if (trackedPricesCountErr) {
    logError(
      500,
      "Failed to fetch tracked prices count",
      log,
      trackedPricesCountErr,
      false,
    );
  }

  if (!featuredCube) {
    logError(
      400,
      "Featured cube not found",
      log,
      new Error("Featured cube not found"),
      false,
    );
  }

  return {
    featuredCube,
    totalCubes: totalCubes ?? 0,
    totalUsers: totalUsers ?? 0,
    totalVendors: totalVendors ?? 0,
    totalTrackedPrices: totalTrackedPrices ?? 0,
  };
}) satisfies PageServerLoad;
