import { supabase } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load = (async () => {
    const { data: vendors, error } = await supabase
        .from('vendors')
        .select('*')
        .order('name', { ascending: true })

    if(error) console.error("Error while loading vendors:", error);

    return { vendors };
}) satisfies PageServerLoad;