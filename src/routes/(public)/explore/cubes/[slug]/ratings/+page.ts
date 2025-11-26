import type { PageLoad } from "./$types";
import type { DetailedCube } from "$lib/components/dbTableTypes";
import { clientLogError } from "$lib/logger/clientLogError";
import { clientLogger } from "$lib/logger/client";

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

	const cube = cubeRes.data as DetailedCube | null;

	if (!cube) {
		return clientLogError(
			"Cube not found",
			clientLogger,
			new Error(`Cube "${slug}" not found`),
			true,
			404
		);
	}
	if (ratingsRes.error) {
		return clientLogError(
			"Unable to load cube ratings",
			clientLogger,
			ratingsRes.error
		);
	}

	return {
		cube,
		user_cube_ratings: ratingsRes.data ?? [],
	};
}) satisfies PageLoad;

