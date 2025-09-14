import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

// Server-side load to improve SSR performance:
// - Uses server Supabase client (cookies-aware, no client bundle cost)
// - Selects only the fields needed by the explore page
// - Sets cache headers to enable CDN/browser caching
export const load: PageServerLoad = async ({ locals: { supabase }, setHeaders }) => {
  // Keep this list tight — it maps to what the explore list renders
  const selectFields = [
    "id",
    "slug",
    "brand",
    "series",
    "model",
    "image_url",
    "rating",
    "type",
    "sub_type",
    "version_type",
    "version_name",
    "created_at",
    "verified_at",
    // Filters/sort/search metadata coming from the view
    "year",
    "name",
    "wca_legal",
    "magnetic",
    "modded",
    "stickered",
    "smart",
    "popularity",
    "avg_price",
  ].join(",");

  const { data: cubes, error: err } = await supabase
    .from("v_detailed_cube_models")
    .select(selectFields)
    .eq("status", "Approved");

  if (err) throw error(500, err.message);

  // Cache aggressively on the edge, allow stale while revalidating
  setHeaders({
    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
  });

  return { cubes };
};
