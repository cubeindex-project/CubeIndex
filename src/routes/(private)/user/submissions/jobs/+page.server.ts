import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { logError } from "$lib/server/logError";

export const load = (async ({ locals }) => {
	const { supabase, user, log } = locals;
	if (!user) throw redirect(302, "/auth/login");

	const { data: runs, error } = await supabase
		.from("cube_scrap_runs")
		.select(`
			id,
			name,
			status,
			created_at,
			started_at,
			finished_at,
			url
		`)
		.eq("user_id", user.id)
		.order("created_at", { ascending: false })
		.limit(25);

	if (error) {
		return logError(500, "Failed to load your queued jobs", log, error);
	}

	return {
		runs,
	};
}) satisfies PageServerLoad;
