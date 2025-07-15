import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request, locals }) => {
  const {
    cube_id,
    status,
    notes = "",
    verified_by = "",
    reason,
  }: {
    cube_id: string;
    status: string;
    notes: string;
    verified_by: string;
    reason: "Accept" | "Reject" | "Edit";
  } = await request.json();

  const payload: {
    status: string;
    notes: string;
    verified_by: string;
    verified_at?: string;
  } = {
    status,
    notes,
    verified_by,
  };
  if (reason !== "Edit") {
    const now = new Date();
    const isoString = now.toISOString();
    const datePart = isoString.split("T")[0];
    payload.verified_at = datePart;
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
