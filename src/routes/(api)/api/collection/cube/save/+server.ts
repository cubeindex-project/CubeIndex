import { cubeCollectionUpsertSchema } from "$lib/schemas/cubeCollection";
import type { TablesInsert } from "$lib/types/database.types";
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

  const payload: TablesInsert<"user_cubes"> = {
    user_id: user.id,
    ...parsedPayload.data,
  };

  const { error: userCubesErr } = await supabase
    .from("user_cubes")
    .upsert(payload, { onConflict: "cube_id,user_id" });

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

  return new Response(null, { status: 204 });
};
