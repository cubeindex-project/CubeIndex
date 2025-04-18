import { supabase } from '$lib/supabaseClient';

export async function load() {
  const { data: badges, error } = await supabase
    .from('badges')
    .select();

  if (error) {
    console.error('Error fetching badges:', error);
    return { badges: [] };
  }

  return { badges };
}