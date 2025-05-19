import { supabase } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load = (async () => {
    const { data: profiles, error: err } = await supabase
        .from('profiles')
        .select('*')
        .order('id', { ascending: true });

    if (err) throw error(500, err.message);
    return { profiles };
}) satisfies PageServerLoad;