import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals: { supabase }, url }) => {
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user?.email)
    return new Response(JSON.stringify({ message: "Not signed in." }), {
      status: 400,
    });

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: user.email,
    options: { emailRedirectTo: `${url.origin}/auth/confirm` },
  });

  if (error)
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    });

  redirect(307, "/");
};
