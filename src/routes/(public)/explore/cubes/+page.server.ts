import { supabase } from '$lib/supabaseClient';
import { error } from '@sveltejs/kit';

export async function load() {
  const { data: cubes, error: err } = await supabase
    .from('cube_models')
    .select('*');

  if (err) throw error(500, err.message);

  return { cubes };
}