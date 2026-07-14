import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals: { supabase, log } }) => {
  const { data: vendors, error: vendorsError } = await supabase
    .from("vendors")
    .select("*,submitter:profiles!submitted_by_id(display_name,username)")
    .order("created_at", { ascending: false });

  if (vendorsError) {
    log.error(
      { err: vendorsError.message },
      "Failed to load vendor submissions",
    );
    throw error(500, "Failed to load vendor submissions");
  }

  return {
    vendors,
    meta: { title: "Manage Vendors - CubeIndex", noindex: true },
  };
}) satisfies PageServerLoad;
