import { cubeCollectionUpsertSchema } from "$lib/schemas/cubeCollection";
import type { TablesInsert, TablesUpdate } from "$lib/types/database.types";
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
    log.warn(
      { event: "collection.cube.invalid_json" },
      "Collection cube request contained invalid JSON",
    );
    return json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsedPayload = cubeCollectionUpsertSchema.safeParse(body);
  if (!parsedPayload.success) {
    log.warn(
      {
        event: "collection.cube.validation_failed",
        issueCount: parsedPayload.error.issues.length,
      },
      "Collection cube request failed validation",
    );
    return json(
      { error: getZodErrorMessage(parsedPayload.error) },
      { status: 400 },
    );
  }

  const { collection_id, ...cubeData } = parsedPayload.data;
  const operation = collection_id === undefined ? "create" : "update";
  const operationLog = log.child({
    cubeID: cubeData.cube_id,
    collectionID: collection_id,
    operation,
  });

  operationLog.debug(
    { event: "collection.cube.save_requested" },
    "Collection cube save requested",
  );

  if (collection_id === undefined) {
    const payload: TablesInsert<"user_cubes"> = {
      user_id: user.id,
      ...cubeData,
    };

    const { error: userCubesErr } = await supabase
      .from("user_cubes")
      .insert(payload);

    if (userCubesErr) {
      operationLog.error(
        {
          event: "collection.cube.add_failed",
          err: userCubesErr,
        },
        "An error occurred while adding cube to collection",
      );
      return json(
        { error: "An error occorred while adding cube to collection" },
        { status: 500 },
      );
    }

    operationLog.info(
      { event: "collection.cube.added" },
      "Cube added to collection",
    );
  } else {
    const payload: TablesUpdate<"user_cubes"> = cubeData;

    const { data, error: userCubesErr } = await supabase
      .from("user_cubes")
      .update(payload)
      .eq("id", collection_id)
      .eq("user_id", user.id)
      .select("id");

    if (userCubesErr) {
      operationLog.error(
        {
          event: "collection.cube.update_failed",
          err: userCubesErr,
        },
        "An error occurred while editing cube in collection",
      );
      return json(
        { error: "An error occurred while editing cube in collection" },
        { status: 500 },
      );
    }

    if (!data || data.length === 0) {
      operationLog.warn(
        { event: "collection.cube.not_found" },
        "Collection cube entry was not found",
      );
      return json({ error: "Collection entry not found." }, { status: 404 });
    }

    operationLog.info(
      { event: "collection.cube.updated" },
      "Cube collection entry updated",
    );
  }

  return new Response(null, { status: 204 });
};
