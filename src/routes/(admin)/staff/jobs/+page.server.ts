import { redirect } from "@sveltejs/kit";
import { logError } from "$lib/server/logError";
import type { PageServerLoad } from "./$types";

type CubeScrapRunUrl = {
	id: number;
};

type CubeScrapRunUser = {
	id: string | null;
	username: string | null;
	display_name: string | null;
};

type CubeScrapRun = {
	id: number;
	name: string | null;
	status: string;
	error_message: string | null;
	created_at: string;
	started_at: string | null;
	finished_at: string | null;
	urls: CubeScrapRunUrl[];
	user: CubeScrapRunUser | null;
};

export const load = (async ({ locals, parent }) => {
	const { supabase, log } = locals;
	const { profile } = await parent();

	if (!profile || (profile.role !== "Database Manager" && profile.role !== "Admin")) {
		throw redirect(303, "/staff/dashboard");
	}

	const { data, error } = await supabase
		.from("cube_scrap_runs")
		.select(
			`
			id,
			name,
			status,
			error_message,
			created_at,
			started_at,
			finished_at,
			user:profiles!cube_scrap_runs_user_id_fkey (
				id,
				username,
				display_name
			)
		`
		)
		.order("created_at", { ascending: false })
		.limit(200);

	if (error) {
		return logError(500, "Failed to load cube import jobs", log, error);
	}

	const runs = (data ?? []).map((run) => ({
		...run,
		urls: run.urls ?? [],
		user: run.user ?? null,
	})) satisfies CubeScrapRun[];

	return {
		profile,
		runs,
	};
}) satisfies PageServerLoad;
