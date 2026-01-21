import { logError } from "$lib/server/logError";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals: { log, supabase } }) => {
  const { data: cubes, error: err } = await supabase
    .from("v_detailed_cube_models")
    .select("*")
    .eq("status", "Approved");

  if (err) logError(500, "Failed to fetch cubes", log, err.message);

  return {
    cubes,
    meta: {
      title: "Compare Cubes - CubeIndex",
      description:
        "Compare cubes side by side on CubeIndex. Review specs, features, sizes, and ratings to choose the best cube for your needs.",
    },
  };
}) satisfies PageServerLoad;
