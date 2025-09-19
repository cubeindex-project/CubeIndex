import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

interface BodySingle {
  id: string;
}
interface BodyMany {
  ids: string[];
}
type Body = Partial<BodySingle & BodyMany>;

export const POST: RequestHandler = async ({
  request,
  locals: { supabase, user },
}) => {
  if (!user) {
    return json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // Accept either { id: "..." } or { ids: ["...", "..."] }
  const raw = Array.isArray(body.ids) ? body.ids : body.id ? [body.id] : [];

  // Validate: keep only non-empty strings
  const ids = raw.filter((v) => typeof v === "string" && v.trim().length > 0);

  if (ids.length === 0) {
    return json(
      { success: false, error: "Provide 'id' or 'ids' as string(s)" },
      { status: 400 }
    );
  }

  // Build upsert payload: one row per (notification_id, user_id)
  const rows = ids.map((notification_id) => ({
    notification_id,
    user_id: user.id,
    read: true,
  }));

  // Upsert read-state for broadcasts (and it's harmless if used on personal items too)
  // onConflict must match a unique/primary key (notification_id,user_id)
  const { data, error } = await supabase
    .from("user_notification_status")
    .upsert(rows, { onConflict: "notification_id,user_id" }) // Supabase upsert API
    .select("notification_id"); // return affected IDs (optional)

  if (error) {
    return json({ success: false, error: error.message }, { status: 500 });
  }

  return json({ success: true, updated: data?.length ?? 0 }, { status: 200 });
};
