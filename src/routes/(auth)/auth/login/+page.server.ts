import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
  default: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error: e } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (e) return fail(400, { error: e.message });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: profiles, error: err } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user?.id);

    if (err) return fail(500, { error: err.message });

    const profile = profiles?.[0];

    redirect(303, `/user/${profile?.id}`);

    return { message: "Logged in successfully!" };
  },
};
