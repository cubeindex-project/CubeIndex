import { cubeRatingDeleteSchema } from "#lib/schemas/cubeRating.ts";
import { getZodErrorMessage } from "#lib/utils/getZodErrorMessage.ts";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({
  request,
  locals: { supabase, user, log },
}) => {
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    log.warn(
      { event: "rating.cube.delete_invalid_json" },
      "Cube rating deletion request contained invalid JSON",
    );
    return Response.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsedPayload = cubeRatingDeleteSchema.safeParse(body);
  if (!parsedPayload.success) {
    log.warn(
      {
        event: "rating.cube.delete_validation_failed",
        issueCount: parsedPayload.error.issues.length,
      },
      "Cube rating deletion request failed validation",
    );
    return Response.json(
      { error: getZodErrorMessage(parsedPayload.error) },
      { status: 400 },
    );
  }

  const operationLog = log.child({ ratingID: parsedPayload.data.rating_id });
  operationLog.debug(
    { event: "rating.cube.delete_requested" },
    "Cube rating deletion requested",
  );

  const { error: err } = await supabase
    .from("user_cube_ratings")
    .delete()
    .eq("id", parsedPayload.data.rating_id);

  if (err) {
    operationLog.error(
      { event: "rating.cube.delete_failed", err },
      "An error occurred while deleting rating",
    );
    return Response.json(
      { error: "An error occurred while deleting rating" },
      { status: 500 },
    );
  }

  operationLog.info({ event: "rating.cube.deleted" }, "Cube rating deleted");
  return new Response(null, { status: 204 });
};
