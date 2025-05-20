import { redirect, error } from '@sveltejs/kit';

export const GET = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code') as string;
  const next = url.searchParams.get('next') ?? '/';

  if (code) {
    const { data, error: err } = await supabase.auth.exchangeCodeForSession(code)
    if (!err) {
      const userId = data.user?.id
      const username = data.user.user_metadata.full_name

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({ user_id: userId, username });

      if (profileError) throw error(500, profileError.message);

      throw redirect(303, `/${next.slice(1)}`);
    }
  }

  throw error(500, 'Authorization code is missing.');
};