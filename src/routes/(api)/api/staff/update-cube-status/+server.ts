import type { TablesUpdate } from "$lib/types/database.types";
import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({
  request,
  locals: { user, supabase },
}) => {
  const { cube_id, status, notes } = await request.json();

  if (!user)
    return json(
      { success: false, error: "You are not logged in!" },
      { status: 401 },
    );

  const payload: TablesUpdate<"cube_models"> = {
    status,
    notes,
    verified_by_id: user.id,
    verified_at: null,
  };
  if (status === "Approved" || status === "Rejected") {
    payload.verified_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("cube_models")
    .update(payload)
    .eq("id", cube_id);

  if (error) {
    return json({ success: false, error: error.message }, { status: 500 });
  }

  return json({ success: true });
};
