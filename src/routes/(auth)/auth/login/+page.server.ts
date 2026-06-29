import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { setError, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { TURNSTILE_SECRET_KEY } from "$env/static/private";
import { validateTurnstileToken } from "$lib/components/helper_functions/validateTurnstileToken";
import { loginSchema } from "$lib/components/validation/auth";

export const load = (async () => {
  return {
    form: await superValidate(zod4(loginSchema)),
    meta: {
      title: "Login - CubeIndex",
      description:
        "Sign in to CubeIndex to manage your collection, track your progress, and take part in community features like ratings and achievements.",
    },
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async ({ request, locals: { supabase }, url }) => {
    const form = await superValidate(request, zod4(loginSchema));
    if (!form.valid) return fail(400, { form });

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

    if (err) return fail(500, { form: { ...form, message: err.message } });
    if (!user)
      return fail(500, {
        form: { ...form, message: "User not returned by Supabase" },
      });

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("username, onboarded")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileErr)
      return fail(500, { form: { ...form, message: profileErr.message } });

    if (!profile || !profile.onboarded) {
      redirect(303, "/auth/complete-profile");
    }

    const redirect_to = url.searchParams.get("redirect_to");

    if (redirect_to && !redirect_to.includes("\\")) {
      let target: URL | null = null;

      try {
        target = new URL(redirect_to, url.origin);
      } catch {
        // Suppress exception if the URL is malformed.
      }

      if (
        target &&
        target.origin === url.origin &&
        redirect_to.startsWith("/") &&
        !redirect_to.startsWith("//")
      ) {
        redirect(303, `${target.pathname}${target.search}${target.hash}`);
      }
    }

    redirect(303, `/user/${profile.username}`);
  },
};
