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
    log.warn(
      { event: "rating.helpful.invalid_json" },
      "Helpful rating request contained invalid JSON",
    );
    return json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsedPayload = helpfulRatingToggleSchema.safeParse(body);
  if (!parsedPayload.success) {
    log.warn(
      {
        event: "rating.helpful.validation_failed",
        issueCount: parsedPayload.error.issues.length,
      },
      "Helpful rating request failed validation",
    );
    return json(
      { error: getZodErrorMessage(parsedPayload.error) },
      { status: 400 },
    );
  }

  const payload = parsedPayload.data;
  const operationLog = log.child({ ratingID: payload.rating_id });
  operationLog.debug(
    { event: "rating.helpful.toggle_requested" },
    "Helpful rating toggle requested",
  );
  const { count, error: countError } = await supabase
    .from("helpful_cube_rating")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("rating_id", payload.rating_id);

  if (countError) {
    operationLog.error(
      { event: "rating.helpful.check_failed", err: countError },
      "Unable to check helpful rating",
    );
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
      operationLog.error(
        { event: "rating.helpful.remove_failed", err: error },
        "Unable to remove helpful rating",
      );
      return json(
        { error: "Unable to update the helpful rating. Please try again." },
        { status: 500 },
      );
    }

    operationLog.info(
      { event: "rating.helpful.removed" },
      "Helpful rating removed",
    );
  } else {
    const { error } = await supabase.from("helpful_cube_rating").insert({
      user_id: user.id,
      rating_id: payload.rating_id,
    });

    if (error) {
      operationLog.error(
        { event: "rating.helpful.add_failed", err: error },
        "Unable to add helpful rating",
      );
      return json(
        { error: "Unable to update the helpful rating. Please try again." },
        { status: 500 },
      );
    }

    operationLog.info(
      { event: "rating.helpful.added" },
      "Helpful rating added",
    );
  }

  return new Response(null, { status: 204 });
};
