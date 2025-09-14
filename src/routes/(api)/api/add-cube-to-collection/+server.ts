import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request, locals }) => {
  const {
    cube,
    quantity,
    main,
    condition,
    status,
    bought_from,
    notes,
    acquired_at,
  }: {
    cube: string;
    quantity: number;
    main: boolean;
    condition: string;
    status: string;
    bought_from: string;
    notes: string;
    acquired_at: string;
  } = await request.json();

  const { error: userCubesErr } = await locals.supabase
    .from("user_cubes")
    .upsert({
      user_id: locals.user?.id,
      cube,
      quantity,
      main,
      condition,
      status,
      bought_from,
      notes,
      acquired_at: acquired_at ? acquired_at : null,
    });

  if (userCubesErr)
    return json(
      { success: false, error: "An error occured: " + userCubesErr.message },
      { status: 500 }
    );

  return json({ success: true });
};
