import { type Actions, fail } from "@sveltejs/kit";
import { configCatClient } from "$lib/configcatClient";
import type { Profiles } from "$lib/components/types/profile.js";

export const load = async ({ locals }) => {
  let databaseAvailability: boolean = true;
  let cubesAvailability: boolean = true;

  configCatClient.getValueAsync("database", false).then((value) => {
    databaseAvailability = value;
  });

  configCatClient.getValueAsync("cubes", false).then((value) => {
    cubesAvailability = value;
  });

  const { data, error: pErr } = await locals.supabase
    .from("profiles")
    .select("username")
    .eq("user_id", locals.user?.id)
    .single();

  if (pErr) {
    console.error(500, `Failed to fetch profiles: ${pErr.message}`);
    return;
  }

  const profile: Profiles = data;

  return { databaseAvailability, cubesAvailability, profile };
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
    if (userCubesErr) return fail(500, { message: userCubesErr.message });

    return { message: "Cube added successfully!" };
  },
};
