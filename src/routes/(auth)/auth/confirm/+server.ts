import type { EmailOtpType } from "@supabase/supabase-js";
import type { RequestHandler } from "./$types";
import { redirect, error } from "@sveltejs/kit";

export const GET: RequestHandler = async ({
  url,
  locals: { supabase },
  fetch,
}) => {
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const next = url.searchParams.get("next") ?? "/";

  /**
   * Clean up the redirect URL by deleting the Auth flow parameters.
   *
   * `next` is preserved for now, because it's needed in the error case.
   */
  const redirectTo = new URL(url);
  redirectTo.pathname = next;
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");

  if (!token_hash || !type) {
    throw error(400, "Missing token_hash or type");
  }

  const { data, error: err } = await supabase.auth.verifyOtp({
    type,
    token_hash,
  });
  if (err) {
    throw error(500, "Verification failed: " + err.message);
  }

  const { user } = data;

  if (!user) throw error(500, "Failed to retrieve user");

  // Mark profile as verified (idempotent)
  const { data: profileRow, error: profileErr } = await supabase
    .from("profiles")
    .update({ verified: true })
    .eq("id", user.id)
    .select("display_name")
    .single();

  if (profileErr) {
    throw error(500, "Failed to update profile verification:" + profileErr);
  }

  // Compute display name fallback
  const display_name =
    profileRow?.display_name ??
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : user.email?.split("@")[0] || "User";

  // Sync to Brevo via Edge Function
  const res = await fetch(
    // tip: store this in an env var instead of hardcoding
    "https://spsqaktodgqnqbkgilxp.supabase.co/functions/v1/brevo-sync-contact",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: user.email, display_name }),
    }
  );

  if (!res.ok) {
    throw error(500, "Brevo sync failed:" + (await res.text()));
  }

  // Prevent open redirects: only allow same-site relative paths
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  throw redirect(303, safeNext);
};
