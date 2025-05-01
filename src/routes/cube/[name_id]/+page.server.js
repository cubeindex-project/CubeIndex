import { supabase } from '$lib/supabaseClient';

export async function load({ params }) {
  const { name_id } = params;

  const { data: cube, error: cubeError } = await supabase
    .from('cubes')
    .select("*")
    .eq('name_id', name_id)
    .single();


  if (cubeError || !cube) {
    console.error(cubeError);
    return { status: 404 };
  }

  let { data: cubes_availability, error: availError } = await supabase
    .from('cubes_availability')
    .select("*")
    .eq('cube_id', cube.name_id);

  if (availError) {
    console.error('Error loading availability:', availError);
  }

  return { cube, cubes_availability };
}
