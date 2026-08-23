import { cubeRatingUpsertSchema } from "$lib/schemas/cubeRating";
import type { TablesInsert } from "$lib/types/database.types";
import { getZodErrorMessage } from "$lib/utils/getZodErrorMessage";
import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({
	request,
	locals: { supabase, log, user },
}) => {
	if (!user) {
		return json({ error: "Unauthorized" }, { status: 401 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: "Request body must be valid JSON." }, { status: 400 });
	}

	const parsedPayload = cubeRatingUpsertSchema.safeParse(body);
	if (!parsedPayload.success) {
		return json(
			{ error: getZodErrorMessage(parsedPayload.error) },
			{ status: 400 },
		);
	}

	const payload: TablesInsert<"user_cube_ratings"> = {
		user_id: user.id,
		...parsedPayload.data,
	};

	const { error: err } = await supabase
		.from("user_cube_ratings")
		.upsert(payload, { onConflict: "cube_id,user_id" });

	if (err) {
		log.error({ err }, "An error occurred while adding rating");
		return json(
			{ error: "An error occurred while adding rating" },
			{ status: 500 },
		);
	}

	return new Response(null, { status: 204 });
};
