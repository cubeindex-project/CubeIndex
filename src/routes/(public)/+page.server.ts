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
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("cube_models").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("onboarded", true),
    supabase.from("vendors").select("*", { count: "exact", head: true }),
    supabase
      .from("cube_vendor_links")
      .select("*", { count: "exact", head: true }),
  ]);

  if (cubeErr) {
    log.error({ err: cubeErr, msg: "Failed to fetch cube" });
  }
  if (cubeCountErr) {
    log.error({ err: cubeCountErr, msg: "Failed to fetch cube count" });
  }
  if (userCountErr) {
    log.error({ err: userCountErr, msg: "Failed to fetch user count" });
  }
  if (vendorCountErr) {
    log.error({ err: vendorCountErr, msg: "Failed to fetch vendor count" });
  }
  if (trackedPricesCountErr) {
    log.error({
      err: trackedPricesCountErr,
      msg: "Failed to fetch tracked prices count",
    });
  }

  if (!featuredCube) {
    log.error({
      err: new Error("Featured cube not found"),
      msg: "Featured cube not found",
    });
  }

  return {
    featuredCube,
    totalCubes: totalCubes ?? 0,
    totalUsers: totalUsers ?? 0,
    totalVendors: totalVendors ?? 0,
    totalTrackedPrices: totalTrackedPrices ?? 0,
  };
}) satisfies PageServerLoad;
