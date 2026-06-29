import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { zod4 } from "sveltekit-superforms/adapters";
import { superValidate, setError } from "sveltekit-superforms";
import { completeProfileSchema } from "$lib/components/validation/auth";
import { addToEmailList } from "$lib/components/helper_functions/addToEmailList";
import { logError } from "$lib/server/logError";

export const load: PageServerLoad = async ({
  locals: { user, supabase, log },
}) => {
  if (!user) {
    redirect(303, "/auth/login");
  }

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("username, onboarded")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileErr) {
    logError(500, "Failed to fetch error", log, profileErr);
  }

  if (profile?.onboarded && profile?.username) {
    redirect(303, "/dashboard");
  }

  return {
    form: await superValidate(zod4(completeProfileSchema)),
    meta: {
      title: "Complete your profile",
      noindex: true,
    },
  };
};

export const actions: Actions = {
  default: async ({ request, locals: { user, supabase, log } }) => {
    if (!user) {
      return fail(401, { message: "Unauthorized" });
    }

    const form = await superValidate(request, zod4(completeProfileSchema));
    if (!form.valid) {
      return fail(400, { form });
    }

    const { display_name, username } = form.data;

    const { error: profileUpdateError } = await supabase
      .from("profiles")
      .update({
        username,
        display_name,
        onboarded: true,
      })
      .eq("user_id", user.id);

    if (profileUpdateError?.code === "23505") {
      return setError(form, "display_name", "This username is already taken.");
    }

    if (profileUpdateError) {
      log.error(
        { error: profileUpdateError },
        "Failed to update user profile row",
      );
      return fail(500, { form, message: profileUpdateError.message });
    }

    const addToEmailListResponse = await addToEmailList(
      user.email,
      display_name,
    );
    if (!addToEmailListResponse.success) {
      log.warn(`Failed to add user to list: ${addToEmailListResponse.error}`);
    }

    redirect(303, "/auth/signup?step=survey");
  },
};
