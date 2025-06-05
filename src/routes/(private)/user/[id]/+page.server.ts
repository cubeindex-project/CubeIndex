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

    const { data: user_achievements, error: userAchieveError } = await locals.supabase
        .from('user_achievements')
        .select('*')
        .eq('username', profile.username);

    if (userAchieveError) throw error(500, userAchieveError.message);

    const { data: achievements, error: achieveError } = await locals.supabase
        .from('achievements')
        .select('*');

    if (achieveError) throw error(500, achieveError.message);

    return { profile, user_achievements, achievements };
});
