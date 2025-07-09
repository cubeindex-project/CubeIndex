import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request, locals }) => {
  const {
    cube_id,
    status,
    reason = "",
  }: { cube_id: string; status: string; reason: string } = await request.json();

  const { error } = await locals.supabase
    .from("cube_models")
    .update({ status, notes: reason })
    .eq("id", cube_id);

  if (error) {
    return json({ success: false, error: error.message }, { status: 500 });
  }

  return json({ success: true });
};
