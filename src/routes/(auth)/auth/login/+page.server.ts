import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
  default: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const {
      data: { user },
      error: err,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (err) return fail(400, { error: err.message });
    if (!user) return fail(500, { error: "User not returned by Supabase" });

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user?.id)
      .single();

    if (profileErr) return fail(500, { error: profileErr.message });

    redirect(303, `/user/${profile?.id}`);

    return { message: "Logged in successfully!" };
  },
};
