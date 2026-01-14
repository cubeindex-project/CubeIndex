import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { logError } from "$lib/server/logError";
import type { Cube } from "$lib/components/dbTableTypes";

type SubmissionCube = Cube & {
  verified_at: string | null;
  submitted_by_id: string;
  verified_by_id: string | null;
};

export const load = (async ({ locals }) => {
  const { supabase, user, log } = locals;
  if (!user) throw redirect(302, "/auth/login");

  const { data, error } = await supabase
    .from("cube_models")
    .select(
      `
			id,
			slug,
			brand,
			image_url,
			model,
			rating,
			created_at,
			updated_at,
			type,
			release_date,
			series,
			sub_type,
			weight,
			related_to,
			size,
			version_type,
			version_name,
			surface_finish,
			status,
			notes,
			verified_at
		`,
    )
    .eq("submitted_by_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return logError(500, "Failed to load your cube submissions", log, error);
  }

  const submissions = (data ?? []).map((cube) => ({
    ...cube,
    verified_at: cube.verified_at ?? null,
  })) satisfies SubmissionCube[];

  return {
    submissions,
    meta: {
      title: "My Submissions - CubeIndex",
	  noindex: true
    },
  };
}) satisfies PageServerLoad;
