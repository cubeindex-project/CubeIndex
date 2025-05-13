import { supabase } from '$lib/supabaseClient';

export async function load() {
    const { data: accessories, error } = await supabase
        .from('accessories')
        .select('*')
        .order('name', { ascending: true })

    if (error) {
        console.error('Error fetching accessories:', error);
        return { accessories: [] };
    }

    return { accessories };
}