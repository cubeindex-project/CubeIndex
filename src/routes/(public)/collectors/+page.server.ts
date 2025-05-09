import { supabase } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load = (async () => {
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('id', { ascending: true });

    if (error) console.error(error)
    return { profiles };
}) satisfies PageServerLoad;