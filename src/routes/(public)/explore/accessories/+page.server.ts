import { supabase } from '$lib/supabaseClient';
import { error } from '@sveltejs/kit';

export async function load() {
    const { data: accessories, error: err } = await supabase
        .from('accessories')
        .select('*')
        .order('name', { ascending: true })

    if (err) throw error(500, err.message);

    return { accessories };
}