import { json } from "@sveltejs/kit";
import { z } from "zod";
import type { RequestHandler } from "./$types";

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  cubeSlug: z.string().min(1, "Cube slug is required"),
  desiredPrice: z
    .number({ invalid_type_error: "Desired price must be a number" })
    .nonnegative("Desired price cannot be negative"),
  channel: z.enum(["in_app", "email"]),
  active: z.boolean().optional(),
});

export const GET: RequestHandler = async ({
  url,
  locals: { supabase, user },
}) => {
  if (!user) {
    return json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const cubeFilter = url.searchParams.get("cube_slug");

  let query = supabase
    .from("cube_price_alert_subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (cubeFilter) {
    query = query.eq("cube_slug", cubeFilter);
  }

  const { data, error } = await query;

  if (error) {
    return json(
      {
        success: false,
        error: `Failed to load alert subscriptions: ${error.message}`,
      },
      { status: 500 },
    );
  }

  return json({ success: true, data: data ?? [] });
};

export const POST: RequestHandler = async ({
  request,
  locals: { supabase, user },
}) => {
  if (!user) {
    return json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);

  const parsed = upsertSchema.safeParse(raw);
  if (!parsed.success) {
    return json(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid request body",
      },
      { status: 400 },
    );
  }

  const { id, cubeSlug, desiredPrice, channel, active } = parsed.data;

  if (desiredPrice <= 0) {
    return json(
      {
        success: false,
        error: "Desired price must be greater than zero",
      },
      { status: 400 },
    );
  }

  if (id) {
    const { data, error } = await supabase
      .from("cube_price_alert_subscriptions")
      .update({
        cube_slug: cubeSlug,
        desired_price: desiredPrice,
        channel,
        active: active ?? true,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return json(
        {
          success: false,
          error: `Failed to update alert: ${error.message}`,
        },
        { status: 400 },
      );
    }

    return json({ success: true, data });
  }

  const { data, error } = await supabase
    .from("cube_price_alert_subscriptions")
    .upsert(
      {
        user_id: user.id,
        cube_slug: cubeSlug,
        desired_price: desiredPrice,
        channel,
        active: active ?? true,
      },
      { onConflict: "user_id,cube_slug,desired_price,channel" },
    )
    .select()
    .single();

  if (error) {
    return json(
      {
        success: false,
        error: `Failed to save alert: ${error.message}`,
      },
      { status: 400 },
    );
  }

  return json({ success: true, data });
};
