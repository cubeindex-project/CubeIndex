import type { LayoutServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';

export const load = (async ({ locals: { supabase } }) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect(303, '/auth/login')

    const { data: profiles, error: err } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id);

    if (err) throw error(500, err.message);
    const profile = profiles[0];

    if (profile.role === "User") redirect(303, '/')

    return { profile, user };
}) satisfies LayoutServerLoad;
