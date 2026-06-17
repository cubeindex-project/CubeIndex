import type {
  Enums,
  TablesInsert,
  TablesUpdate,
} from "$lib/types/database.types";
import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({
  request,
  locals: { supabase, user },
}) => {
  if (!user)
    return json({ success: false, error: "Unauthorized" }, { status: 401 });

  const {
    cube,
    quantity,
    main,
    condition,
    status,
    bought_from,
    notes,
    acquired_at,
    purchase_price,
  }: {
    cube: string;
    quantity: number;
    main: boolean;
    condition: Enums<"user_cube_condition">;
    status: Enums<"user_cube_status">;
    bought_from: string | null;
    notes: string;
    acquired_at: string;
    purchase_price: number | null;
  } = await request.json();

  const payload: TablesInsert<"user_cubes"> = {
    user_id: user.id,
    cube,
    quantity,
    main,
    condition,
    status,
    bought_from,
    notes,
    acquired_at: acquired_at ? acquired_at : null,
    purchase_price: purchase_price ?? null,
  };

  const { error: userCubesErr } = await supabase
    .from("user_cubes")
    .upsert(payload);

  if (userCubesErr)
    return json(
      { success: false, error: "An error occurred: " + userCubesErr.message },
      { status: 500 },
    );

  return json({ success: true });
};
