import type { Actions, PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { message, setError, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { cubeFormSchema } from "$lib/schemas/cubeForm";
import { loadCubeFormOptions } from "$lib/server/cube/loadCubeFormOptions";
import { StatusError } from "$lib/errors/StatusError";
import { saveCube } from "$lib/server/cube/saveCube";

export const load = (async ({ locals: { log, supabase } }) => {
  const [form, options] = await Promise.all([
    superValidate(zod4(cubeFormSchema), { errors: false }),
    loadCubeFormOptions(supabase, log),
  ]);

  return {
    form,
    formOptions: options,
    meta: {
      title: "New Submission - CubeIndex",
    },
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const { supabase, user } = locals;
    if (!user) throw error(401, "Unauthorized");

    const form = await superValidate(request, zod4(cubeFormSchema));
    if (!form.valid) {
      return message(form, "Please fix the highlighted fields and try again.", {
        status: 400,
      });
    }

    try {
      await saveCube(form.data, supabase, locals.log);
    } catch (cause) {
      if (cause instanceof StatusError) {
        return setError(form, cause.message, { status: cause.status });
      }
      throw cause;
    }

    return message(
      form,
      'Cube submitted for review! Track its status on <a class="link" href="/user/submissions">your submissions page</a>.',
    );
  },
};
