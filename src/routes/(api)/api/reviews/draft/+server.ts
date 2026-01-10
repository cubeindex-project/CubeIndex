import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({
  locals: { supabase, user, log },
  request,
}) => {
  if (!user) return json({ error: "Unauthorized" }, { status: 401 });

  const { slug, title, review } = await request.json();

  const payload = {
    user_id: user.id,
    cube: slug,
    title,
    review,
    updated_at: new Date().toISOString(),
  };

  const { error: ucrErr } = await supabase
    .from("user_cube_reviews")
    .upsert(payload, {
      onConflict: "user_id,cube",
    });

  if (ucrErr) {
    log.error({ err: ucrErr }, "Failed to create draft review");
    return json({ error: "Failed to create draft review" }, { status: 500 });
  }

  return json({});
};
