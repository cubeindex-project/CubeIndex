import type { PageLoad } from "./$types";
import type { DetailedCube } from "$lib/components/dbTableTypes";
import { clientLogError } from "$lib/logger/clientLogError";
import { clientLogger } from "$lib/logger/client";

export const load = (async ({ parent, params }) => {
  const { supabase } = await parent();
  const { slug } = params;

  const cubePromise = supabase
    .from("v_detailed_cube_models")
    .select(
      "*, verified_by_id(display_name, username), submitted_by_id(display_name, username)",
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

  const cube = cubeRes.data as DetailedCube | null;

  if (!cube) {
    return clientLogError(
      "Cube not found",
      clientLogger,
      new Error(`Cube "${slug}" not found`),
      true,
      404,
    );
  }
  if (vendorRes.error) {
    return clientLogError(
      "Unable to load vendor links",
      clientLogger,
      vendorRes.error,
    );
  }
  if (priceHistoryRes.error) {
    return clientLogError(
      "Unable to load price history",
      clientLogger,
      priceHistoryRes.error,
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

  return {
    cube,
    vendor_links: vendorRes.data ?? [],
    dates: Array.from(dateSet).sort(),
    historyByVendor,
  };
}) satisfies PageLoad;
