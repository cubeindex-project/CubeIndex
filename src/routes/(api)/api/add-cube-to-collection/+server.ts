import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request, locals }) => {
  const {
    cube,
    quantity,
    main,
    condition,
    status,
    notes,
    acquired_at,
  }: {
    cube: string;
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

  console.log({
    username: profile.username,
    cube,
    quantity,
    main,
    condition,
    status,
    notes,
    acquired_at: acquired_at ? acquired_at : null,
  });

  const { error: userCubesErr } = await locals.supabase
    .from("user_cubes")
    .insert({
      username: profile.username,
      cube,
      quantity,
      main,
      condition,
      status,
      notes,
      acquired_at: acquired_at ? acquired_at : null,
    })
    .select();

  if (
    userCubesErr?.message ===
    'duplicate key value violates unique constraint "user_cubes_pkey"'
  )
    return json(
      {
        success: false,
        error: "You already added this cube to your collection!",
      },
      { status: 500 }
    );
  if (userCubesErr)
    return json(
      { success: false, error: "An error occured: " + userCubesErr.message },
      { status: 500 }
    );

  return json({ success: true });
};
