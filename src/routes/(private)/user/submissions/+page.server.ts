import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { logError } from "$lib/server/logError";
import type { Cube } from "$lib/components/dbTableTypes";

type SubmissionCube = Cube & {
	verified_at: string | null;
	submitted_by_id: string;
	verified_by_id: string | null;
};

type SubmissionSummary = {
	total: number;
	approved: number;
	pending: number;
	rejected: number;
	lastSubmittedAt: string | null;
	lastUpdatedAt: string | null;
};

type ImportRun = {
	id: number;
	name: string | null;
	status: string;
	created_at: string;
	started_at: string | null;
	finished_at: string | null;
	urls: Array<{
		id: number;
		status: string;
		source_url: string;
	}>;
};

const statusKey = (status: string) =>
	status.toLowerCase() as "approved" | "pending" | "rejected";

export const load = (async ({ locals }) => {
	const { supabase, user, log } = locals;
	if (!user) throw redirect(302, "/auth/login");

	const { data, error } = await supabase
		.from("cube_models")
		.select(`
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
			submitted_by_id,
			verified_by_id,
			verified_at
		`)
		.eq("submitted_by_id", user.id)
		.order("created_at", { ascending: false });

	if (error) {
		return logError(
			500,
			"Failed to load your cube submissions",
			log,
			error
		);
	}

	const submissions = (data ?? []).map((cube) => ({
		...cube,
		submitted_by: cube.submitted_by_id,
		verified_by: cube.verified_by_id ?? "",
		verified_at: cube.verified_at ?? null,
	})) satisfies SubmissionCube[];

	const summary = submissions.reduce<SubmissionSummary>(
		(acc, cube) => {
			acc.total += 1;
			const key = statusKey(cube.status);
			acc[key] += 1;
			if (!acc.lastSubmittedAt || cube.created_at > acc.lastSubmittedAt) {
				acc.lastSubmittedAt = cube.created_at;
			}
			if (!acc.lastUpdatedAt || cube.updated_at > acc.lastUpdatedAt) {
				acc.lastUpdatedAt = cube.updated_at;
			}
			return acc;
		},
		{
			total: 0,
			approved: 0,
			pending: 0,
			rejected: 0,
			lastSubmittedAt: null,
			lastUpdatedAt: null,
		}
	);

	let importPreview: ImportRun[] = [];

	const { data: runs, error: runsError } = await supabase
		.from("cube_scrap_runs")
		.select(`
			id,
			name,
			status,
			created_at,
			started_at,
			finished_at,
			urls:cube_scrap_runs_url (
				id,
				status,
				source_url
			)
		`)
		.eq("user_id", user.id)
		.order("created_at", { ascending: false })
		.limit(3);

	if (runsError) {
		log.error(
			{ err: runsError.message },
			"Failed to load recent import jobs preview"
		);
	} else {
		importPreview = (runs ?? []).map((run) => ({
			...run,
			urls: run.urls ?? [],
		}));
	}

	return {
		submissions,
		summary,
		importPreview,
	};
}) satisfies PageServerLoad;
