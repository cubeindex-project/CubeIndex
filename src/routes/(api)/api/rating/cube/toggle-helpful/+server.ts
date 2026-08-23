import { helpfulRatingToggleSchema } from "$lib/schemas/helpfulRating";
import { getZodErrorMessage } from "$lib/utils/getZodErrorMessage";
import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({
	locals: { supabase, user, log },
	request,
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

	const parsedPayload = helpfulRatingToggleSchema.safeParse(body);
	if (!parsedPayload.success) {
		return json(
			{ error: getZodErrorMessage(parsedPayload.error) },
			{ status: 400 },
		);
	}

	const payload = parsedPayload.data;
	const { count, error: countError } = await supabase
		.from("helpful_cube_rating")
		.select("*", { count: "exact", head: true })
		.eq("user_id", user.id)
		.eq("rating_id", payload.rating_id);

	if (countError) {
		log.error({ err: countError }, "Unable to check helpful rating");
		return json(
			{ error: "Unable to update the helpful rating. Please try again." },
			{ status: 500 },
		);
	}

	if (count && count > 0) {
		const { error } = await supabase
			.from("helpful_cube_rating")
			.delete()
			.eq("user_id", user.id)
			.eq("rating_id", payload.rating_id);

		if (error) {
			log.error({ err: error }, "Unable to remove helpful rating");
			return json(
				{ error: "Unable to update the helpful rating. Please try again." },
				{ status: 500 },
			);
		}
	} else {
		const { error } = await supabase.from("helpful_cube_rating").insert({
			user_id: user.id,
			rating_id: payload.rating_id,
		});

		if (error) {
			log.error({ err: error }, "Unable to add helpful rating");
			return json(
				{ error: "Unable to update the helpful rating. Please try again." },
				{ status: 500 },
			);
		}
	}

	return new Response(null, { status: 204 });
};
