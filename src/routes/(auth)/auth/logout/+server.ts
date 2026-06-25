import { redirect } from "@sveltejs/kit";
import { SIGN_OUT_SCOPES, type SignOutScope } from "@supabase/supabase-js";
import { logError } from "$lib/server/logError.js";

export const GET = async ({ locals: { supabase, log }, url }) => {
  const scope = url.searchParams.get("scope");

  if (scope && !SIGN_OUT_SCOPES.includes(scope as SignOutScope)) {
    throw logError(
      400,
      "The scope is not correct",
      log,
      new Error("The scope is not correct"),
    );
  }

  await supabase.auth.signOut({ scope: (scope ?? undefined) as SignOutScope });

  redirect(307, "/");
};
