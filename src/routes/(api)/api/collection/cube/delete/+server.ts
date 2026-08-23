import { cubeCollectionDeleteSchema } from "$lib/schemas/cubeCollection";
import { getZodErrorMessage } from "$lib/utils/getZodErrorMessage";
import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({
  request,
  locals: { user, supabase, log },
}) => {
  if (!user)
    return json({ success: false, error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsedPayload = cubeCollectionDeleteSchema.safeParse(body);
  if (!parsedPayload.success) {
    return json(
      { error: getZodErrorMessage(parsedPayload.error) },
      { status: 400 },
    );
  }

  const payload = parsedPayload.data;

  const { error: err } = await supabase
    .from("user_cubes")
    .delete()
    .eq("id", payload.collection_id);

  if (err) {
    log.error({ err }, "An error occorred while deleting cube from collection");
    return json(
      { error: "An error occorred while deleting cube from collection" },
      { status: 500 },
    );
  }

  return new Response(null, { status: 204 });
};
