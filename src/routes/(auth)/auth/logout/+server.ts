import { error, redirect } from "@sveltejs/kit";
import { SIGN_OUT_SCOPES, type SignOutScope } from "@supabase/supabase-js";

export const GET = async ({ locals: { supabase, log }, url }) => {
  const scope = url.searchParams.get("scope");

  if (
    (scope && !SIGN_OUT_SCOPES.includes(scope as SignOutScope)) ||
    scope === ""
  ) {
    log.error(
      {
        err: new Error("The scope is not correct"),
      },
      "The scope is not correct",
    );
    throw error(400, "The scope is not correct");
  }

  await supabase.auth.signOut({ scope: (scope ?? undefined) as SignOutScope });

  redirect(307, "/");
};
