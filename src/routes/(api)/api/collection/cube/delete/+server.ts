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
    log.warn(
      { event: "collection.cube.delete_invalid_json" },
      "Collection cube deletion request contained invalid JSON",
    );
    return json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsedPayload = cubeCollectionDeleteSchema.safeParse(body);
  if (!parsedPayload.success) {
    log.warn(
      {
        event: "collection.cube.delete_validation_failed",
        issueCount: parsedPayload.error.issues.length,
      },
      "Collection cube deletion request failed validation",
    );
    return json(
      { error: getZodErrorMessage(parsedPayload.error) },
      { status: 400 },
    );
  }

  const payload = parsedPayload.data;
  const operationLog = log.child({ collectionID: payload.collection_id });
  operationLog.debug(
    { event: "collection.cube.delete_requested" },
    "Collection cube deletion requested",
  );

  const { error: err } = await supabase
    .from("user_cubes")
    .delete()
    .eq("id", payload.collection_id);

  if (err) {
    operationLog.error(
      {
        event: "collection.cube.delete_failed",
        err,
      },
      "An error occurred while deleting cube from collection",
    );
    return json(
      { error: "An error occorred while deleting cube from collection" },
      { status: 500 },
    );
  }

  operationLog.info(
    { event: "collection.cube.removed" },
    "Cube removed from collection",
  );
  return new Response(null, { status: 204 });
};
