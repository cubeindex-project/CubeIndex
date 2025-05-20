import { supabase } from '$lib/supabaseClient';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
  const { slug } = params;

  const { data: cube, error: cubeError } = await supabase
    .from('cube_models')
    .select("*")
    .eq('slug', slug)
    .single();

  if (cubeError) throw error(500, cubeError.message);

  const { data: vendor_links, error: vendorError } = await supabase
    .from('cube_vendor_links')
    .select("*")
    .eq('cube', cube.models);

  if (vendorError) throw error(500, vendorError.message);

  return { cube, vendor_links };
}
