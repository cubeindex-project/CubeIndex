import { supabase } from '$lib/supabaseClient';

export async function load() {
  const { data: cubes, error } = await supabase
    .from('cube_models')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching cubes:', error);
    return { cubes: [] };
  }

  return { cubes };
}