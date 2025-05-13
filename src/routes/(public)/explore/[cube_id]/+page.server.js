import { supabase } from '$lib/supabaseClient';

export async function load({ params }) {
  const { cube_id } = params;

  const { data: cube, error: cubeError } = await supabase
    .from('cube_models')
    .select("*")
    .eq('name_id', cube_id)
    .single();


  if (cubeError || !cube) {
    console.error(cubeError);
    return { status: 404 };
  }

  const { data: vendor_links, error: vendorError } = await supabase
    .from('cube_vendor_links')
    .select("*")
    .eq('cube_id', cube_id);

  if (vendorError) {
    console.error('Error loading vendor links:', vendorError);
  }

  return { cube, vendor_links };
}
