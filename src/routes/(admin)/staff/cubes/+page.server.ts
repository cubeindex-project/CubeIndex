import { supabase } from '$lib/supabaseClient';
import { error } from '@sveltejs/kit';

export const load = async () => {

    const { data: cubes, error: err } = await supabase
        .from('cube_models')
        .select('*')
        .order('model', { ascending: true })
        .order('series', { ascending: true });


    if (err) throw error(500, err.message);

    return { cubes };
}