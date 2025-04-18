import { supabase } from '$lib/supabaseClient';

export async function load() {
  const { data: cubes, error } = await supabase
    .from('cubes')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching cubes:', error);
    return { cubes: [] };
  }

  return { cubes };
}