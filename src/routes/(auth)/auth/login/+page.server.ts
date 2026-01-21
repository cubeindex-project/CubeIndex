import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { z } from "zod/v4";
import { setError, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { TURNSTILE_SECRET_KEY } from "$env/static/private";
import { validateTurnstileToken } from "$lib/components/helper_functions/validateTurnstileToken";

const schema = z.object({
  email: z.email().nonempty(),
  password: z.string().nonempty(),
  "cf-turnstile-response": z.string().nonempty("Please complete the Captcha"),
});

export const load = (async () => {
  return {
    form: await superValidate(zod4(schema)),
    meta: {
      title: "Login - CubeIndex",
      description:
        "Sign in to CubeIndex to manage your collection, track your progress, and take part in community features like ratings and achievements.",
    },
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async ({ request, locals: { supabase } }) => {
    const form = await superValidate(request, zod4(schema));
    if (!form.valid) return fail(400, { profileForm: form });

    const { success } = await validateTurnstileToken(
      form.data["cf-turnstile-response"],
      TURNSTILE_SECRET_KEY,
    );

    if (!success) {
      return setError(
        form,
        "cf-turnstile-response",
        "Invalid turnstile, please try again",
      );
    }

    const { email, password } = form.data;

    const {
      data: { user },
      error: err,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (err) error(500, { message: err.message });
    if (!user) error(500, { message: "User not returned by Supabase" });

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("username")
      .eq("user_id", user?.id)
      .single();

    if (profileErr) error(500, { message: profileErr.message });

    redirect(303, `/user/${profile.username}`);
  },
};
