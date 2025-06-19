import { fail, error } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
  signup: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const acceptTOS = formData.get("acceptTOS");

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (password.length < 8)
      return fail(400, { message: "Password must be at least 8 characters" });
    if (password !== confirmPassword)
      return fail(400, { message: "Passwords do not match" });
    if (!emailRegex.test(email))
      return fail(400, { message: "Please enter a valid email address" });
    if (username.length <= 2 || username.length >= 12)
      return fail(400, {
        message: "Username must be between 2 and 12 characters",
      });
    if (!acceptTOS)
      return fail(400, {
        message: "You must accept the TOS and Privacy Policy to continue",
      });

    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
    });
    if (err) throw error(500, err.message);

    const userId = data.user?.id;

    const { data: maxData, error: maxError } = await supabase
      .from("profiles")
      .select("id")
      .order("id", { ascending: false })
      .limit(1);

    if (maxError) return fail(500, { message: maxError.message });

    const newId = maxData[0].id + 1;

    const { error: upsertError } = await supabase
      .from("profiles")
      .insert({ id: newId, user_id: userId, username });

    if (
      upsertError?.message ===
      'insert or update on table "profiles" violates foreign key constraint "profiles_user_id_fkey"'
    )
      return fail(400, {
        message:
          "An account with this email already exists. Please log in or use a different email address.",
      });

    if (
      upsertError?.message ===
      'duplicate key value violates unique constraint "profiles_username_key"'
    )
      return fail(400, {
        message:
          "This username is already taken. Please choose a different one.",
      });

    if (upsertError) return fail(400, { message: upsertError.message });

    return { message: "Check your email to verify your account" };
  },
};
