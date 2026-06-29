import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { zod4 } from "sveltekit-superforms/adapters";
import { superValidate } from "sveltekit-superforms";
import { accountSchema, surveySchema } from "$lib/components/validation/auth";
import { setError } from "sveltekit-superforms";
import { TURNSTILE_SECRET_KEY } from "$env/static/private";
import { validateTurnstileToken } from "$lib/components/helper_functions/validateTurnstileToken";
import { resolve } from "$app/paths";

export const load: PageServerLoad = async ({ url }) => {
  const step = (url.searchParams.get("step") ?? "account") as
    | "account"
    | "survey"
    | "done";

  return {
    step,
    accountForm: await superValidate(zod4(accountSchema)),
    surveyForm: await superValidate(zod4(surveySchema)),
    meta: {
      title: "Signup - CubeIndex",
      description:
        "Create a CubeIndex account to build your collection, track progress, and join the community with ratings, reviews, and achievements.",
    },
  };
};

export const actions: Actions = {
  createAccount: async ({ request, locals: { supabase, log }, url }) => {
    const form = await superValidate(request, zod4(accountSchema));
    if (!form.valid) return fail(400, { accountForm: form });

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

    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${url.origin}/auth/confirm`,
      },
    });
    if (err) {
      log.error(err);
      return fail(500, { accountForm: { ...form, message: err.message } });
    }

    redirect(303, resolve("/auth/complete-profile"));
  },

  submitSurvey: async ({ request, locals: { supabase, user }, url }) => {
    const form = await superValidate(request, zod4(surveySchema));
    if (!user) {
      return fail(401, {
        surveyForm: {
          ...form,
          message: `Authenticated user not found`,
        },
      });
    }

    if (!form.valid) return fail(400, { surveyForm: form });

    const { discovered_via, other_text } = form.data;
    const interested_features = JSON.stringify(form.data.interested_features);

    const { error: insErr } = await supabase.from("user_onboarding").insert({
      user_id: user.id,
      discovered_via,
      interested_features,
      other_text,
    });

    if (insErr) {
      return fail(500, { surveyForm: { ...form, message: insErr.message } });
    }

    redirect(303, `${url.pathname}?step=done`);
  },
};
