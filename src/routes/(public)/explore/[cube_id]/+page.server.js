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

  const { data: availability, error: availError } = await supabase
    .from('cube_vendor_links')
    .select("*")
    .eq('cube_id', cube_id);

  if (availError) {
    console.error('Error loading vendor links:', availError);
  }

  return { cube, availability };
}
