import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
  signup: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const display_name = formData.get("display_name") as string;
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const acceptTOS = formData.get("acceptTOS");

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (password.length < 8)
      return fail(400, { error: "Password must be at least 8 characters" });
    if (password !== confirmPassword)
      return fail(400, { error: "Passwords do not match" });
    if (!emailRegex.test(email))
      return fail(400, { error: "Please enter a valid email address" });
    if (display_name.length <= 3)
      return fail(400, {
        error: "The display name must have more than 3 characters",
      });
    if (username.length <= 3)
      return fail(400, {
        error: "The username must have more than 3 characters",
      });
    if (!acceptTOS)
      return fail(400, {
        error: "You must accept the TOS and Privacy Policy to continue",
      });

    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
    });
    if (err) return fail(500, { error: err.message });

    const userId = data.user?.id;

    const { data: maxData, error: maxError } = await supabase
      .from("profiles")
      .select("id")
      .order("id", { ascending: false })
      .limit(1);

    if (maxError) return fail(500, { error: maxError.message });

    const newId = maxData?.length ? maxData[0].id + 1 : 1;

    const { error: upsertError } = await supabase
      .from("profiles")
      .insert({ id: newId, user_id: userId, username: username.toLowerCase(), display_name });

    if (
      upsertError?.message ===
      'insert or update on table "profiles" violates foreign key constraint "profiles_user_id_fkey"'
    )
      return fail(400, {
        error:
          "An account with this email already exists. Please log in or use a different email address.",
      });

    if (
      upsertError?.message ===
      'duplicate key value violates unique constraint "profiles_username_key"'
    )
      return fail(400, {
        error: "This username is already taken. Please choose a different one.",
      });

    if (upsertError) return fail(400, { error: upsertError.message });

    return { message: "Check your email to verify your account" };
  },
};
