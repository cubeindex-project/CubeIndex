import { supabase } from "$lib/supabaseClient";
import { error, type Actions, fail } from "@sveltejs/kit";
import { configCatClient } from "$lib/configcatClient";

export const load = async () => {
  let databaseAvailability: boolean = true;
  let cubesAvailability: boolean = true;

  configCatClient.getValueAsync("database", false).then((value) => {
    databaseAvailability = value;
  });

  configCatClient.getValueAsync("cubes", false).then((value) => {
    cubesAvailability = value;
  });

  if (databaseAvailability || cubesAvailability) {
    const { data: cubes, error: err } = await supabase
      .from("cube_models")
      .select("*")
      .order("model", { ascending: true })
      .order("series", { ascending: true });

    if (err) throw error(500, err.message);

    return { cubes, databaseAvailability, cubesAvailability };
  }

  return { databaseAvailability, cubesAvailability };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = await request.formData();
    const username = form.get("username") as string;
    const slug = form.get("slug") as string;
    const quantity = form.get("quantity");
    const main = form.get("main") || false;
    const condition = form.get("condition") as string;
    const status = form.get("status") as string;
    const notes = form.get("notes") as string;
    const acquired_at = form.get("acquiredAt") || null;
    const formattedAcquiredAt = acquired_at
      ? (() => {
          const date = new Date(acquired_at.toString());
          const mm = (date.getMonth() + 1).toString().padStart(2, "0");
          const dd = date.getDate().toString().padStart(2, "0");
          const yyyy = date.getFullYear();
          return `${mm}-${dd}-${yyyy}`;
        })()
      : acquired_at;

    const payload = [
      {
        username,
        cube: slug,
        quantity,
        main,
        condition,
        status,
        notes,
        acquired_at: formattedAcquiredAt,
      },
    ];

    const { error: userCubesErr } = await locals.supabase
      .from("user_cubes")
      .insert(payload)
      .select();

    if (
      userCubesErr?.message ===
      'duplicate key value violates unique constraint "user_cubes_pkey"'
    )
      return fail(400, {
        message: "You have already added this cube to your profile!",
      });
    if (userCubesErr) throw error(500, userCubesErr.message);

    return { message: "Cube added successfully!" };
  },
};
