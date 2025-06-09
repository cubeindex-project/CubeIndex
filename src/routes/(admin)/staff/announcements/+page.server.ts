import type { PageServerLoad } from './$types';
import { supabase } from '$lib/supabaseClient';
import { error } from '@sveltejs/kit';

export const load = (async () => {
    const { data: announcements, error: err } = await supabase
        .from('announcement')
        .select('*');
    
        if (err) error(500, err.message);

    return { announcements };
}) satisfies PageServerLoad;