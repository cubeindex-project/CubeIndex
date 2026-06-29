import type { Actions, PageServerLoad } from "./$types";
import { resetPasswordSchema } from "$lib/components/validation/auth";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { fail } from "@sveltejs/kit";

export const load = (async () => {
  return {
    form: await superValidate(zod4(resetPasswordSchema)),
    meta: { title: "Reset Password - CubeIndex", noindex: true },
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async ({ request, locals: { supabase } }) => {
    const form = await superValidate(request, zod4(resetPasswordSchema));
    if (!form.valid) {
      return fail(400, { form });
    }
    const { password } = form.data;

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return fail(500, {
        form: {
          ...form,
          message: "An error occured while updating your password",
        },
      });
    }

    return message(form, "Password updated. You can now log in.");
  },
};
