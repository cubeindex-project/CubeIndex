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

	const [cubeRes, vendorRes] = await Promise.all([
		cubePromise,
		vendorLinksPromise,
	]);

	const cube = cubeRes.data as Cube | null;

	if (!cube) throw error(404, "Cube not found");
	if (vendorRes.error) {
		throw new Error(
			`Failed to fetch vendor links for cube "${slug}": ${vendorRes.error.message}`
		);
	}

	return {
		cube,
		vendor_links: vendorRes.data ?? [],
	};
}) satisfies PageLoad;

