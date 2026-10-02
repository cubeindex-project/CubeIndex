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
    return json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsedPayload = cubeCollectionUpsertSchema.safeParse(body);
  if (!parsedPayload.success) {
    return json(
      { error: getZodErrorMessage(parsedPayload.error) },
      { status: 400 },
    );
  }

  const { collection_id, ...cubeData } = parsedPayload.data;

  if (collection_id === undefined) {
    const payload: TablesInsert<"user_cubes"> = {
      user_id: user.id,
      ...cubeData,
    };

    const { error: userCubesErr } = await supabase
      .from("user_cubes")
      .insert(payload);

    if (userCubesErr) {
      log.error(
        { err: userCubesErr },
        "An error occorred while adding cube to collection",
      );
      return json(
        { error: "An error occorred while adding cube to collection" },
        { status: 500 },
      );
    }
  } else {
    const payload: TablesUpdate<"user_cubes"> = cubeData;

    const { data, error: userCubesErr } = await supabase
      .from("user_cubes")
      .update(payload)
      .eq("id", collection_id)
      .eq("user_id", user.id)
      .select("id");

    if (userCubesErr) {
      log.error(
        { err: userCubesErr },
        "An error occorred while editing cube in collection",
      );
      return json(
        { error: "An error occurred while editing cube in collection" },
        { status: 500 },
      );
    }

    if (!data || data.length === 0) {
      return json({ error: "Collection entry not found." }, { status: 404 });
    }
  }

  return new Response(null, { status: 204 });
};
