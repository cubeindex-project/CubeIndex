import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request, locals }) => {
  const {
    cube_id,
    status,
    reason = "",
    verified_by = "",
  }: {
    cube_id: string;
    status: string;
    reason: string;
    verified_by: string;
  } = await request.json();

  const { error } = await locals.supabase
    .from("cube_models")
    .update({ status, notes: reason, verified_by })
    .eq("id", cube_id);

  if (error) {
    return json({ success: false, error: error.message }, { status: 500 });
  }

  return json({ success: true });
};
