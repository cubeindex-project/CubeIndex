import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

const titleMaxLength = 80;
const reviewMinLength = 1000;

export const POST: RequestHandler = async ({
  locals: { supabase, user, log },
  request,
}) => {
  if (!user) return json({ error: "Unauthorized" }, { status: 401 });

  const { slug, title, review } = await request.json();

  if (title.trim().length > titleMaxLength)
    return json(
      { error: "Title can not be longer than 80 characters" },
      { status: 400 },
    );

  if (review.trim().length < reviewMinLength)
    return json(
      { error: "Review must be at least 1000 characters long" },
      { status: 400 },
    );

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
