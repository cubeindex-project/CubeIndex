import type { PageLoad } from "./$types";
import type { Cube } from "$lib/components/dbTableTypes";
import { error } from "@sveltejs/kit";

export const load = (async ({ parent, params }) => {
	const { supabase } = await parent();
	const { slug } = params;

	const cubePromise = supabase
		.from("cube_models")
		.select("*")
		.eq("slug", slug)
		.single();

	const ratingsPromise = supabase
		.from("user_cube_ratings")
		.select("*, profile:user_id(username, display_name)")
		.eq("cube_slug", slug);

	const [cubeRes, ratingsRes] = await Promise.all([
		cubePromise,
		ratingsPromise,
	]);

	const cube = cubeRes.data as Cube | null;

	if (!cube) throw error(404, "Cube not found");
	if (ratingsRes.error) {
		throw new Error(
			`Failed to fetch user ratings for cube "${slug}": ${ratingsRes.error.message}`
		);
	}

	return {
		cube,
		user_cube_ratings: ratingsRes.data ?? [],
	};
}) satisfies PageLoad;

