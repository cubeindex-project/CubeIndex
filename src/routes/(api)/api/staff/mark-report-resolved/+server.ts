import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, locals }) => {
  const { id }: { id: number } = await request.json();

  const { error: err } = await locals.supabase
    .from("reports")
    .update({ resolved: true, resolved_by: locals.user?.id })
    .eq("id", id);

  if (err) return json({ success: false, error: err.message }, { status: 500 });

  return json({ success: true });
};
