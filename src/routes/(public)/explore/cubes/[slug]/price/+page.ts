import type { PageLoad } from "./$types";
import type {
  Cube,
  CubePriceAlertSubscriptions,
} from "$lib/components/dbTableTypes";
import { error } from "@sveltejs/kit";

export const load = (async ({ parent, params }) => {
  const { supabase, user } = await parent();
  const { slug } = params;

  const cubePromise = supabase
    .from("cube_models")
    .select(
      "*, verified_by_id(display_name, username), submitted_by_id(display_name, username)"
    )
    .eq("slug", slug)
    .single();

  const vendorLinksPromise = supabase
    .from("cube_vendor_links")
    .select("*, vendor:vendor_name(*)")
    .eq("cube_slug", slug);

  const priceHistoryPromise = supabase
    .from("cube_vendor_links_snapshot")
    .select("vendor_name, created_at, price")
    .eq("cube_slug", slug)
    .order("created_at", { ascending: true });

  const [cubeRes, vendorRes, priceHistoryRes] = await Promise.all([
    cubePromise,
    vendorLinksPromise,
    priceHistoryPromise,
  ]);

  const cube = cubeRes.data as Cube | null;

  if (!cube) throw error(404, "Cube not found");
  if (vendorRes.error) {
    throw new Error(
      `Failed to fetch vendor links for cube "${slug}": ${vendorRes.error.message}`
    );
  }
  if (priceHistoryRes.error) {
    throw new Error(
      `Failed to fetch price history for cube "${slug}": ${priceHistoryRes.error.message}`
    );
  }

  // Collect all dates we see (useful if you align series later)
  const dateSet = new Set<string>();

  // Aggregator: vendor -> day -> { ts: epochMillis, price: number }
  const latestByVendorDay = new Map<
    string,
    Map<string, { ts: number; price: number }>
  >();

  for (const r of priceHistoryRes.data ?? []) {
    // Normalize to UTC date (YYYY-MM-DD). If you need local-day grouping,
    // replace toISOString() with a local-date formatter.
    const created = new Date(r.created_at);
    const day = created.toISOString().slice(0, 10);
    dateSet.add(day);

    // Guard: need a vendor and a numeric price
    if (!r.vendor_name) continue;
    const price = Number(r.price);
    if (!Number.isFinite(price)) continue;

    // Ensure vendor map exists
    if (!latestByVendorDay.has(r.vendor_name)) {
      latestByVendorDay.set(r.vendor_name, new Map());
    }
    const vendorMap = latestByVendorDay.get(r.vendor_name)!;

    // Keep the record with the greatest timestamp for that day
    const ts = created.getTime();
    const prev = vendorMap.get(day);
    if (!prev || ts > prev.ts) {
      vendorMap.set(day, { ts, price });
    }
  }

  // Build the final structure: for each vendor, a date-sorted series
  // with the *latest* price of that day (rounded to 2 decimals).
  const historyByVendor: Record<string, { date: string; price: number }[]> = {};
  for (const [vendor, m] of latestByVendorDay) {
    historyByVendor[vendor] = Array.from(m.entries())
      .map(([date, { price }]) => ({ date, price: +price.toFixed(2) }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  let subscriptions: CubePriceAlertSubscriptions[] = [];
  let wishlistCubes: { slug: string; label: string }[] = [];
  let cubeNameMap: Record<string, string> = {};
  let isWishlisted = false;

  if (user) {
    const [subsRes, wishlistRes] = await Promise.all([
      supabase
        .from("cube_price_alert_subscriptions")
        .select("*")
        .eq("user_id", user.id),
      supabase
        .from("user_cubes")
        .select("cube")
        .eq("user_id", user.id)
        .eq("status", "Wishlist"),
    ]);

    if (subsRes.error) {
      console.error(
        `Failed to load price alert subscriptions: ${subsRes.error.message}`,
      );
    } else {
      subscriptions = (subsRes.data ?? []).map((row) => ({
        ...row,
        desired_price: Number(row.desired_price),
      }));
    }

    const wishlistSlugs = (wishlistRes.data ?? []).map((row) => row.cube);
    isWishlisted = wishlistSlugs.includes(slug);

    const metaSlugs = Array.from(
      new Set([
        slug,
        ...wishlistSlugs,
        ...subscriptions.map((sub) => sub.cube_slug),
      ]),
    );

    if (metaSlugs.length > 0) {
      const { data: cubeMeta, error: cubeMetaError } = await supabase
        .from("cube_models")
        .select("slug, series, model, version_name")
        .in("slug", metaSlugs);

      if (cubeMetaError) {
        console.error(
          `Failed to load cube names for price alerts: ${cubeMetaError.message}`,
        );
      } else {
        cubeNameMap = Object.fromEntries(
          (cubeMeta ?? []).map((c) => [
            c.slug,
            `${c.series} ${c.model}${c.version_name ? ` ${c.version_name}` : ""}`,
          ]),
        );
      }
    }

    wishlistCubes = wishlistSlugs.map((slug) => ({
      slug,
      label: cubeNameMap[slug] ?? slug,
    }));
  }

  return {
    cube,
    vendor_links: vendorRes.data ?? [],
    dates: Array.from(dateSet).sort(),
    historyByVendor,
    subscriptions,
    wishlistCubes,
    cubeNameMap,
    isWishlisted,
  };
}) satisfies PageLoad;
