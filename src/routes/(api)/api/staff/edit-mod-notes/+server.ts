import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ locals, request }) => {
  const {
    cube_id,
    notes = "",
  }: {
    cube_id: string;
    notes: string;
  } = await request.json();

  const { error } = await locals.supabase
    .from("cube_models")
    .update({ notes })
    .eq("id", cube_id);

  if (error) {
    return json({ success: false, error: error.message }, { status: 500 });
  }

  return json({ success: true });
};
