import { cubeRatingDeleteSchema } from "$lib/schemas/cubeRating";
import { getZodErrorMessage } from "$lib/utils/getZodErrorMessage";
import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({
  request,
  locals: { supabase, user, log },
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

  const parsedPayload = cubeRatingDeleteSchema.safeParse(body);
  if (!parsedPayload.success) {
    return json(
      { error: getZodErrorMessage(parsedPayload.error) },
      { status: 400 },
    );
  }

  const { error: err } = await supabase
    .from("user_cube_ratings")
    .delete()
    .eq("id", parsedPayload.data.rating_id);

  if (err) {
    log.error({ err }, "An error occurred while deleting rating");
    return json(
      { error: "An error occurred while deleting rating" },
      { status: 500 },
    );
  }

  return new Response(null, { status: 204 });
};
