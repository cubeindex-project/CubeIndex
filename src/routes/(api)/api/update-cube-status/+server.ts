import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request, locals }) => {
  const {
    cube_id,
    status,
    notes = "",
    verified_by = "",
  }: {
    cube_id: string;
    status: string;
    notes: string;
    verified_by: string;
  } = await request.json();

  const payload: {
    status: string;
    notes: string;
    verified_by: string;
    verified_at: string | null;
  } = {
    status,
    notes,
    verified_by,
    verified_at: null,
  };
  if (status === "Approved" || status === "Rejected") {
    payload.verified_at = (new Date()).toISOString();
  }

  const { error } = await locals.supabase
    .from("cube_models")
    .update(payload)
    .eq("id", cube_id);

  if (error) {
    return json({ success: false, error: error.message }, { status: 500 });
  }

  return json({ success: true });
};
