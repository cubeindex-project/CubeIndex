import type { Cube } from "$lib/components/dbTableTypes.js";
import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals }) => {
  const BATCH = 2000;
  let start = 0;
  let allCubes: Cube[];

  while (true) {
    const { data, error } = await locals.supabase
      .from("cube_models")
      .select("*")
      .eq("status", "Approved")
      .range(start, start + BATCH - 1);

    if (error) throw error;
    const cubes: Cube[] = data;
    if (cubes.length === 0) {
      break;
    }

    allCubes = cubes.concat(cubes);
    start += BATCH;

    return json(allCubes);
  }

  return new Response()
};
