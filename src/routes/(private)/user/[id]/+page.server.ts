import { supabase } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load = (async ({params}) => {
    const { id } = params;

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq("id", id );

    if (error) console.error(error)
    return { profiles };
}) satisfies PageServerLoad;