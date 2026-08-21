import type { Actions, PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { message, setError, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { cubeFormSchema } from "$lib/schemas/cubeForm";
import { loadCubeFormOptions } from "$lib/server/cube/loadCubeFormOptions";
import { StatusError } from "$lib/errors/StatusError";
import { submitCube } from "$lib/server/cube/submitCube";

export const load = (async ({ locals: { supabase, log } }) => {
  const formPromise = superValidate(zod4(cubeFormSchema), { errors: false });

  let options: Awaited<ReturnType<typeof loadCubeFormOptions>>;
  try {
    options = await loadCubeFormOptions(supabase);
  } catch (cause) {
    log.error({ err: cause }, "Failed to load cube form options");
    throw error(500, "Failed to load cube form options");
  }

  return {
    form: await formPromise,
    formOptions: options,
    meta: {
      title: "New Submission - CubeIndex",
    },
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async ({ request, locals: { supabase, user, log } }) => {
    if (!user) throw error(401, "Unauthorized");

    const form = await superValidate(request, zod4(cubeFormSchema));
    if (!form.valid) {
      return message(form, "Please fix the highlighted fields and try again.", {
        status: 400,
      });
    }

    try {
      await submitCube(form.data, supabase);
    } catch (cause) {
      log.error({ err: cause }, "Failed to submit cube");
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
