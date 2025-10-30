import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { logError } from "$lib/server/logError";

type ScrapRunUrl = {
	id: number;
	source_url: string;
	normalized_url: string | null;
	status: string;
	created_at: string;
	started_at: string | null;
	finished_at: string | null;
};

type ScrapRun = {
	id: number;
	name: string | null;
	status: string;
	created_at: string;
	started_at: string | null;
	finished_at: string | null;
	urls: ScrapRunUrl[];
};

type JobSummary = {
	totalRuns: number;
	totalUrls: number;
	queued: number;
	inProgress: number;
	completed: number;
	failed: number;
	lastQueuedAt: string | null;
	lastFinishedAt: string | null;
};

const statusBucket = (status: string) => {
	const normalized = status.toLowerCase();
	if (normalized === "running" || normalized === "in_progress") return "inProgress";
	if (normalized === "completed" || normalized === "done") return "completed";
	if (normalized === "failed" || normalized === "error") return "failed";
	return "queued";
};

export const load = (async ({ locals }) => {
	const { supabase, user, log } = locals;
	if (!user) throw redirect(302, "/auth/login");

	const { data, error } = await supabase
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
				source_url,
				normalized_url,
				created_at
			)
		`)
		.eq("user_id", user.id)
		.order("created_at", { ascending: false })
		.limit(25);

	if (error) {
		return logError(500, "Failed to load your queued jobs", log, error);
	}

	const runs = (data ?? []).map((run) => ({
		...run,
		urls: run.urls ?? [],
	})) satisfies ScrapRun[];

	const summary = runs.reduce<JobSummary>(
		(acc, run) => {
			acc.totalRuns += 1;
			const bucket = statusBucket(run.status);
			acc[bucket] += 1;
			acc.totalUrls += run.urls.length;
			if (!acc.lastQueuedAt || run.created_at > acc.lastQueuedAt) {
				acc.lastQueuedAt = run.created_at;
			}
			if (
				run.finished_at &&
				(!acc.lastFinishedAt || run.finished_at > acc.lastFinishedAt)
			) {
				acc.lastFinishedAt = run.finished_at;
			}
			return acc;
		},
		{
			totalRuns: 0,
			totalUrls: 0,
			queued: 0,
			inProgress: 0,
			completed: 0,
			failed: 0,
			lastQueuedAt: null,
			lastFinishedAt: null,
		}
	);

	return {
		runs,
		summary,
	};
}) satisfies PageServerLoad;
