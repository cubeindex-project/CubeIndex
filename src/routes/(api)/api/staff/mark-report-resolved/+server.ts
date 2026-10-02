import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, locals }) => {
  const { id }: { id: number } = await request.json();

  const { error: err } = await locals.supabase
    .from("reports")
    .update({ resolved: true, resolved_by: locals.user?.id })
    .eq("id", id);

  if (err) {
    locals.log.error(
      { err, reportID: id, resolverUserID: locals.user?.id },
      "Failed to mark report resolved",
    );
    return json({ success: false, error: err.message }, { status: 500 });
  }

  return json({ success: true });
};
