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

    return { profile };
});
