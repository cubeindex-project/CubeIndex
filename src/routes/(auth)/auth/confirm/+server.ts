import type { EmailOtpType } from '@supabase/supabase-js';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const token_hash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;
  const next = url.searchParams.get('next') ?? '/';

  const redirectTo = new URL(url);
  redirectTo.pathname = next;
  redirectTo.searchParams.delete('token_hash');
  redirectTo.searchParams.delete('type');

  if (token_hash && type) {
    /**
     * 1. Verify the OTP / token-hash.  Supabase v2 returns `{ data: { session }, error }`.
     */
    const { data: { session }, error } = await supabase.auth.verifyOtp({
      type,
      token_hash
    });

    if (!error && session?.user) {
      /**
       * 2. Mark the profile row as verified.
       *    (Assumes `profiles.user_id` is a FK to `auth.users.id`)
       */
      const { error: upError } = await supabase
        .from('profiles')
        .update({ is_verified: true })
        .eq('user_id', session.user.id);

      if (upError) console.error('Profile update failed', upError);
      // optional: you could surface an error banner here instead of redirecting
    }

    // 3. Success → clear ?next and bounce away
    redirectTo.searchParams.delete('next');
    throw redirect(303, redirectTo.toString());
  }

  // 4. Failure → send to generic auth-error page
  redirectTo.pathname = '/auth/error';
  throw redirect(303, redirectTo.toString());
};
