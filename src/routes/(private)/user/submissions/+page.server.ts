import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

const SUBMISSION_SELECT = [
	"id",
	"slug",
	"brand",
	"series",
	"model",
	"version_type",
	"version_name",
	"image_url",
	"rating",
	"type",
	"status",
	"notes",
	"created_at",
	"updated_at",
	"verified_at",
].join(",");

export const load = (async ({ locals: { supabase, user } }) => {
	if (!user) throw error(401, "You must be logged in to view your submissions.");

	const [{ data: profile, error: profileErr }, { data: submissionRows, error: submissionsErr }] = await Promise.all([
		supabase
			.from("profiles")
			.select("user_id, username, display_name, profile_picture, banner, private, verified, certified")
			.eq("user_id", user.id)
			.single(),
		supabase
			.from("cube_models")
			.select(SUBMISSION_SELECT)
			.eq("submitted_by_id", user.id)
			.order("created_at", { ascending: false }),
	]);

	if (profileErr) throw error(500, "Failed to load profile: " + profileErr.message);
	if (submissionsErr) throw error(500, "Failed to load submissions: " + submissionsErr.message);

	return {
		user,
		profile,
		submittedCubes: submissionRows ?? [],
	};
}) satisfies PageServerLoad;
