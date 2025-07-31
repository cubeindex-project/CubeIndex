import { message, setError, superValidate } from "sveltekit-superforms";
import type { PageServerLoad } from "./$types";
import type { Actions } from "./$types";
import { fail } from "@sveltejs/kit";
import { error } from "@sveltejs/kit";
import { zod4 } from "sveltekit-superforms/adapters";
import { z } from "zod/v4";

const profileSchema = z.object({
  profile_picture: z.url().optional(),
  banner: z.url().optional(),
  username: z.string().min(3),
  bio: z.string(),
  private_profile: z.boolean(),
});

const socialSchema = z.object({
  x: z.string().optional(),
  wca: z.string().optional(),
  reddit: z.string().optional(),
  discord: z.string().optional(),
  website: z.url().optional(),
  youtube: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().nonempty(),
  newPassword: z.string().min(8).nonempty(),
});

export const load = (async ({ locals }) => {
  const { user } = await locals.safeGetSession();

  const { data: profile, error: err } = await locals.supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user?.id)
    .single();

  if (err) throw error(500, err.message);

  const profileForm = await superValidate(
    {
      profile_picture: profile.profile_picture,
      banner: profile.banner,
      username: profile.username,
      bio: profile.bio,
      private_profile: profile.private,
    },
    zod4(profileSchema),
    { errors: false }
  );

  const socialForm = await superValidate(profile.socials, zod4(socialSchema), {
    errors: false,
  });

  const passwordForm = await superValidate(zod4(passwordSchema));

  return { profile, profileForm, socialForm, passwordForm };
}) satisfies PageServerLoad;

/** @satisfies {Actions} */
export const actions: Actions = {
  profile: async ({ request, locals }) => {
    // 1) Parse form data
    const form = await superValidate(request, zod4(profileSchema));
    const data = form.data;

    if (!form.valid)
      return fail(400, {
        form,
        message:
          "There are errors in your submission. Please review the highlighted fields and try again.",
      });

    // 3) Update the profile row
    const { error: err } = await locals.supabase
      .from("profiles")
      .update({
        profile_picture: data.profile_picture,
        banner: data.banner,
        username: data.username,
        bio: data.bio,
        private: data.private_profile,
      })
      .eq("user_id", locals.user?.id);

    if (err) {
      throw error(500, err.message);
    }

    // 4) Success: redirect back or return success data
    return message(form, "Profile edited successfully!");
  },

  socials: async ({ request, locals }) => {
    const form = await superValidate(request, zod4(socialSchema));
    const data = form.data;

    if (!form.valid)
      return fail(400, {
        form,
        message:
          "There are errors in your submission. Please review the highlighted fields and try again.",
      });

    const { error: err } = await locals.supabase
      .from("profiles")
      .update({
        socials: {
          website: data.website,
          x: data.x,
          wca: data.wca,
          discord: data.discord,
          youtube: data.youtube,
          reddit: data.reddit,
        },
      })
      .eq("user_id", locals.user?.id);

    if (err) {
      throw error(500, err.message);
    }

    // 4) Success: redirect back or return success data
    return message(form, "Social links edited successfully!");
  },

  password: async ({ request, locals }) => {
    const form = await superValidate(request, zod4(passwordSchema));
    const data = form.data;

    if (!form.valid)
      return fail(400, {
        form,
        message:
          "There are errors in your submission. Please review the highlighted fields and try again.",
      });

    const { data: passUpdateData, error: err } = await locals.supabase.rpc(
      "update_password",
      {
        current_id: locals.user?.id,
        current_plain_password: data.currentPassword,
        new_plain_password: data.newPassword,
      }
    );

    if (err) {
      throw error(500, err.message);
    }

    if (passUpdateData === "incorrect")
      return setError(
        form,
        "currentPassword",
        "The provided password is incorect"
      );

    return message(form, "Password edited successfully!");
  },
};
