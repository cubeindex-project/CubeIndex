import { error } from '@sveltejs/kit';

export const load = (async ({ params, locals }) => {
    const { id } = params;

    const { data: profiles, error: err } = await locals.supabase
        .from('profiles')
        .select('*')
        .eq('id', id);

    if (err) throw error(500, err.message);
    if (!profiles?.length) throw error(404, 'User not found');
    const profile = profiles[0]

    const { data: user_roles, error: rolesErr } = await locals.supabase
        .from('user_roles')
        .select('*')
        .eq("user", profile.username);

    if (rolesErr) throw error(500, rolesErr.message);
    const user_role = user_roles[0]

    return { profile, user_role };
});
