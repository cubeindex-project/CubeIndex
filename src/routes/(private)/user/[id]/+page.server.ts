import { supabase } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load = (async ({params, locals}) => {
    const { id } = params;

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq("id", id );

    const { user } = await locals.safeGetSession()

    if (error) console.error(error)
    return { profiles, user };
}) satisfies PageServerLoad;