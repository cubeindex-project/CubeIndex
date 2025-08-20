import type { PageLoad } from "./$types";
import type { Cube } from "$lib/components/dbTableTypes";
import { error } from "@sveltejs/kit";

export const load = (async ({ parent, params }) => {
  const { supabase } = await parent();
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
    .select("*")
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

  const dateSet = new Set<string>();
  const agg = new Map<string, Map<string, { sum: number; n: number }>>();
  for (const r of priceHistoryRes.data ?? []) {
    const day = new Date(r.created_at).toISOString().slice(0, 10);
    dateSet.add(day);
    if (!agg.has(r.vendor_name)) agg.set(r.vendor_name, new Map());
    const m = agg.get(r.vendor_name)!;
    const prev = m.get(day) ?? { sum: 0, n: 0 };
    m.set(day, { sum: prev.sum + (r.price ?? 0), n: prev.n + 1 });
  }

  const historyByVendor: Record<string, { date: string; price: number }[]> = {};
  for (const [vendor, m] of agg) {
    historyByVendor[vendor] = Array.from(m.entries())
      .map(([date, { sum, n }]) => ({ date, price: +(sum / n).toFixed(2) }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  return {
    cube,
    vendor_links: vendorRes.data ?? [],
	price_history: priceHistoryRes.data ?? [],
    dates: Array.from(dateSet).sort(),
    historyByVendor,
  };
}) satisfies PageLoad;
