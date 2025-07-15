import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request, locals }) => {
  const {
    slug,
    quantity,
    main,
    condition,
    status,
    notes,
    acquired_at,
  }: {
    slug: string;
    quantity: number;
    main: boolean;
    condition: string;
    status: string;
    notes: string;
    acquired_at: string;
  } = await request.json();

  const { data: profile, error: profileErr } = await locals.supabase
    .from("profiles")
    .select("username")
    .eq("user_id", locals.user?.id)
    .single();

  if (profileErr)
    return json(
      {
        success: false,
        error: "Couldn't find connected user, check that you are logged in!",
      },
      { status: 500 }
    );

  const { error: err } = await locals.supabase
    .from("user_cubes")
    .update({
      cube: slug,
      quantity,
      main,
      condition,
      status,
      notes,
      acquired_at,
    })
    .eq("username", profile.username)
    .eq("cube", slug);

  if (err)
    return json(
      { success: false, error: "An error occured: " + err.message },
      { status: 500 }
    );

  return json({ success: true });
};
