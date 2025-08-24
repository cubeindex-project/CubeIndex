import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { zod4 } from "sveltekit-superforms/adapters";
import { superValidate } from "sveltekit-superforms";
import {
  accountSchema,
  profileSchema,
  surveySchema,
} from "$lib/components/validation/signup";
import { withFiles } from "sveltekit-superforms";

export const load: PageServerLoad = async ({ url }) => {
  const step = (url.searchParams.get("step") ?? "account") as
    | "account"
    | "profile"
    | "survey"
    | "done";

  return {
    step,
    accountForm: await superValidate(zod4(accountSchema)),
    profileForm: await superValidate(zod4(profileSchema)),
    surveyForm: await superValidate(zod4(surveySchema)),
  };
};

export const actions: Actions = {
  createAccount: async ({ request, locals: { supabase }, url }) => {
    const form = await superValidate(request, zod4(accountSchema));
    if (!form.valid) return fail(400, { accountForm: form });

    const { email, password } = form.data;

    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${url.origin}/auth/confirm` },
    });
    if (err)
      return fail(500, { accountForm: { ...form, message: err.message } });

    throw redirect(303, `${url.pathname}?step=profile`);
  },

  createProfile: async ({ request, locals: { supabase }, url, fetch }) => {
    const form = await superValidate(request, zod4(profileSchema));
    if (!form.valid) return withFiles(fail(400, { profileForm: form }));

    // Supabase user
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      return withFiles(
        fail(401, {
          profileForm: { ...form, message: "Failed to retrieve user data: " + userErr ? userErr : "No user found" },
        })
      );
    }

    const file = form.data.avatar ?? null;

    let avatarUrl: string = "";

    if (file && file.size > 0) {
      // 1) Send to your hardened processor (validates magic bytes, size, pixels, re-encodes to WebP)
      const imgFd = new FormData();
      imgFd.set("file", file);
      imgFd.set("type", "avatar");
      const resp = await fetch(`/api/user/avatar`, {
        method: "POST",
        body: imgFd,
      });
      if (!resp.ok) {
        const errText = await resp.text();
        form.message =
          "Avatar processing failed: " + errText || resp.statusText;
        return withFiles(fail(400, { profileForm: form }));
      }
      const processed = new Uint8Array(await resp.arrayBuffer());

      // 2) Upload normalized bytes to Storage with a fixed path & content type
      const path = `${user.id}/avatar.webp`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, processed, {
          contentType: "image/webp", // fixed, known good
          cacheControl: "public, max-age=31536000, immutable",
        });
      if (upErr)
        return withFiles(
          fail(400, {
            profileForm: {
              ...form,
              message: "Avatar upload failed: " + upErr.message,
            },
          })
        );

      // 3) Get a URL: public bucket -> getPublicUrl; private -> createSignedUrl
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      avatarUrl = data.publicUrl;
    }

    // Create incremental profile id (kept from your existing approach)
    const { display_name, username } = form.data;

    const { error: upsertError } = await supabase.from("profiles").insert({
      user_id: user.id,
      username,
      display_name,
      profile_picture: avatarUrl,
    });

    if (
      upsertError?.message ===
      'insert or update on table "profiles" violates foreign key constraint "profiles_user_id_fkey"'
    ) {
      return withFiles(
        fail(400, {
          profileForm: {
            ...form,
            message:
              "An account with this email already exists. Please log in or use a different email address.",
          },
        })
      );
    }

    if (
      upsertError?.message ===
      'duplicate key value violates unique constraint "profiles_username_key"'
    ) {
      return withFiles(
        fail(400, {
          profileForm: {
            ...form,
            errors: { username: ["This username is already taken."] },
          },
        })
      );
    }

    if (upsertError) {
      return withFiles(
        fail(400, {
          profileForm: { ...form, message: upsertError.message },
        })
      );
    }

    // Next: survey step
    throw redirect(303, `${url.pathname}?step=survey`);
  },

  submitSurvey: async ({ request, locals: { supabase }, url }) => {
    const form = await superValidate(request, zod4(surveySchema));
    if (!form.valid) return fail(400, { surveyForm: form });

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      return fail(401, {
        surveyForm: { ...form, message: "You must be signed in to continue." },
      });
    }

    // Persist preferences (create a table like user_onboarding)
    const { discovered_via, other_text } = form.data;
    const interested_features = JSON.stringify(form.data.interested_features);
    const { error: insErr } = await supabase.from("user_onboarding").insert({
      user_id: user.id,
      discovered_via,
      interested_features,
      other_text,
    });

    if (insErr) {
      return fail(400, { surveyForm: { ...form, message: insErr.message } });
    }

    // Done
    throw redirect(303, `${url.pathname}?step=done`);
  },
};
