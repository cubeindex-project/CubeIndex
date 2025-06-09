import type { PageServerLoad, Actions } from './$types';
import { supabase } from '$lib/supabaseClient';
import { error } from '@sveltejs/kit';

export const load = (async () => {
    const { data: cubes, error: err } = await supabase
        .from('cube_models')
        .select('*');

    if (err) throw error(500, err.message);

    const { data: profiles, error: profilesErr } = await supabase
        .from('profiles')
        .select('username');

    if (profilesErr) throw error(500, profilesErr.message);

    return { cubes, profiles };
}) satisfies PageServerLoad;

/** @satisfies {Actions} */
export const actions: Actions = {
    default: async ({ request, locals }) => {
        const form = await request.formData();

    }
};