import { redirect, error } from '@sveltejs/kit';

export const GET = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/';

  if (!code) {
    throw error(500, 'Authorization code is missing.');
  }

  const { data, error: err } = await supabase.auth.exchangeCodeForSession(code);
  if (!err) {
    const userId = data.user?.id;
    const username = data.user.user_metadata.full_name;

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({ user_id: userId, username, verified: 'TRUE' });

    if (profileError) throw error(500, profileError.message);

    // Ensure next always starts with a slash
    const redirectTo = next.startsWith('/') ? next : `/${next}`;
    throw redirect(303, redirectTo);
  }

  throw error(500, err?.message || 'Failed to exchange code for session.');
};