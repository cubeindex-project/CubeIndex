import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const DELETE: RequestHandler = async ({
  params,
  locals: { supabase, user },
}) => {
  if (!user) {
    return json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  if (!id) {
    return json(
      { success: false, error: "Alert ID is required" },
      { status: 400 },
    );
  }

  const { error, count } = await supabase
    .from("cube_price_alert_subscriptions")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return json(
      { success: false, error: `Failed to remove alert: ${error.message}` },
      { status: 400 },
    );
  }

  if (!count) {
    return json(
      { success: false, error: "Alert not found" },
      { status: 404 },
    );
  }

  return json({ success: true });
};
