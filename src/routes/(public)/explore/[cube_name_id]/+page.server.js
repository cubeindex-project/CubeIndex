import { supabase } from '$lib/supabaseClient';

export async function load({ params }) {
  const { cube_name_id } = params;

  const { data: cube, error: cubeError } = await supabase
    .from('cubes')
    .select("*")
    .eq('name_id', cube_name_id)
    .single();


  if (cubeError || !cube) {
    console.error(cubeError);
    return { status: 404 };
  }

  const { data: availability, error: availError } = await supabase
    .from('cubes_availability')
    .select("*")
    .eq('cube_id', cube_name_id);

  if (availError) {
    console.error('Error loading availability:', availError);
  }

  return { cube, availability };
}
