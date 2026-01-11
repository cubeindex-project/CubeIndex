import {
  message,
  setError,
  superValidate,
  withFiles,
} from "sveltekit-superforms";
import type { PageServerLoad } from "./$types";
import type { Actions } from "./$types";
import { fail } from "@sveltejs/kit";
import { zod4 } from "sveltekit-superforms/adapters";
import { z } from "zod/v4";
import { logError } from "$lib/server/logError";
import { m } from "$lib/paraglide/messages";

const profileSchema = z.object({
  // Accept a file upload for the avatar; optional
  // Note: validated/normalized in the /api/user/avatar endpoint
  profile_picture: z.any().optional(),
  banner: z.any().optional(),
  display_name: z
    .string()
    .min(3, m.user_settings_display_name_length_error_text()),
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
  currentPassword: z
    .string()
    .nonempty(m.user_settings_current_password_required_text()),
  newPassword: z
    .string()
    .nonempty(m.user_settings_new_password_required_text())
    .min(8, m.user_settings_new_password_length_error_text()),
});

export const load = (async ({ locals, setHeaders }) => {
  const { user } = await locals.safeGetSession();

  const { data: profile, error: err } = await locals.supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user?.id)
    .single();

  if (err) {
    return logError(500, "Unable to load profile settings", locals.log, err);
  }

  const profileForm = await superValidate(
    {
      profile_picture: profile.profile_picture,
      banner: profile.banner,
      display_name: profile.display_name,
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

  setHeaders({
    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
  });

  return { profile, profileForm, socialForm, passwordForm };
}) satisfies PageServerLoad;

/** @satisfies {Actions} */
export const actions: Actions = {
  profile: async ({ request, locals, fetch }) => {
    // 1) Parse form data
    const form = await superValidate(request, zod4(profileSchema));
    const data = form.data;

    if (!form.valid)
      return fail(400, {
        form,
        message: m.user_settings_form_error_text(),
      });

    const isFileLike = (v: unknown): v is File =>
      typeof v === "object" &&
      v !== null &&
      "arrayBuffer" in (v as File) &&
      "size" in (v as File);

    const avatarFile = isFileLike(data.profile_picture)
      ? (data.profile_picture as File)
      : null;
    let avatarUrl: string | null = null;

    if (avatarFile && avatarFile.size > 0) {
      // 1) Send to your hardened processor (validates magic bytes, size, pixels, re-encodes to WebP)
      const imgFd = new FormData();
      imgFd.set("file", avatarFile);
      imgFd.set("type", "avatar");
      const resp = await fetch(`/api/user/avatar`, {
        method: "POST",
        body: imgFd,
      });
      if (!resp.ok) {
        const errText = await resp.text();
        form.message = m.user_settings_avatar_processing_error_text({
          error: errText,
        });
        return withFiles(fail(400, { profileForm: form }));
      }
      const processed = new Uint8Array(await resp.arrayBuffer());

      if (!locals.user)
        return fail(400, {
          profileForm: form,
          message: m.user_settings_auth_required_text(),
        });

      // 2) Upload normalized bytes to Storage with a fixed path & content type
      const path = `${locals.user.id}/avatar.webp`;
      const { error: upErr } = await locals.supabase.storage
        .from("avatars")
        .upload(path, processed, {
          contentType: "image/webp", // fixed, known good
          upsert: true,
        });
      if (upErr)
        return withFiles(
          fail(400, {
            profileForm: {
              ...form,
              message: m.user_settings_avatar_upload_error_text({
                error: upErr.message,
              }),
            },
          })
        );

      // 3) Get a URL: public bucket -> getPublicUrl; private -> createSignedUrl
      const { data } = locals.supabase.storage
        .from("avatars")
        .getPublicUrl(path);
      avatarUrl = `${data.publicUrl}`;
    }

    const bannerFile = isFileLike(data.banner) ? (data.banner as File) : null;
    let bannerUrl: string | null = null;

    if (bannerFile && bannerFile.size > 0) {
      const imgFd = new FormData();
      imgFd.set("file", bannerFile);
      imgFd.set("type", "banner");
      const resp = await fetch(`/api/user/avatar`, {
        method: "POST",
        body: imgFd,
      });
      if (!resp.ok) {
        const errText = await resp.text();
        form.message = m.user_settings_banner_processing_error_text({
          error: errText || resp.statusText,
        });
        return withFiles(fail(400, { profileForm: form }));
      }
      const processed = new Uint8Array(await resp.arrayBuffer());

      if (!locals.user)
        return fail(400, {
          profileForm: form,
          message: m.user_settings_auth_required_text(),
        });

      const path = `${locals.user.id}/banner.webp`;
      const { error: upErr } = await locals.supabase.storage
        .from("banners")
        .upload(path, processed, {
          contentType: "image/webp",
          upsert: true,
        });
      if (upErr)
        return withFiles(
          fail(400, {
            profileForm: {
              ...form,
              message: m.user_settings_banner_upload_error_text({
                error: upErr.message,
              }),
            },
          })
        );

      const { data: pub } = locals.supabase.storage
        .from("banners")
        .getPublicUrl(path);
      bannerUrl = `${pub.publicUrl}`;
    }

    // 3) Update the profile row (do not overwrite avatar if not changed)
    const updatePayload: Record<string, unknown> = {
      display_name: data.display_name,
      bio: data.bio,
      private: data.private_profile,
    };

    if (avatarUrl) {
      updatePayload.profile_picture = avatarUrl;
    }

    if (bannerUrl) {
      updatePayload.banner = bannerUrl;
    } else if (typeof data.banner === "string") {
      updatePayload.banner = data.banner;
    }

    const { error: err } = await locals.supabase
      .from("profiles")
      .update(updatePayload)
      .eq("user_id", locals.user?.id);

    if (err) {
      return logError(500, "Failed to update profile", locals.log, err);
    }

    // 4) Success: redirect back or return success data
    return message(form, m.user_settings_profile_success_text());
  },

  socials: async ({ request, locals }) => {
    const form = await superValidate(request, zod4(socialSchema));
    const data = form.data;

    if (!form.valid)
      return fail(400, {
        form,
        message: m.user_settings_form_error_text(),
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
      return logError(
        500,
        "Failed to update social links",
        locals.log,
        err
      );
    }

    // 4) Success: redirect back or return success data
    return message(form, m.user_settings_social_success_text());
  },

  password: async ({ request, locals }) => {
    const form = await superValidate(request, zod4(passwordSchema));
    const data = form.data;

    if (!form.valid)
      return fail(400, {
        form,
        message: m.user_settings_form_error_text(),
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
      return logError(500, "Failed to update password", locals.log, err);
    }

    if (passUpdateData === "incorrect")
      return setError(
        form,
        "currentPassword",
        m.user_settings_password_incorrect_error_text()
      );

    return message(form, m.user_settings_password_success_text());
  },
};
