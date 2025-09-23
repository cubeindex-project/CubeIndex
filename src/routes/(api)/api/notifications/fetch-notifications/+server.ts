import { json } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals: { supabase, user } }) => {
  if (!user) {
    return json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  // One query: rows where user_id = current user OR user_id IS NULL (broadcast)
  const { data, error } = await supabase
    .from("v_notifications_for_user")
    .select("*")
    .or(`user_id.eq.${user.id},user_id.is.null`)
    .order("created_at", { ascending: false });

  if (error) {
    return json(
      { success: false, error: `Failed to load notifications: ${error.message}` },
      { status: 500 }
    );
  }

  return json({ success: true, data: data ?? [] }, { status: 200 });
};
