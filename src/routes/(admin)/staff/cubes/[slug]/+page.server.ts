import { supabase } from '$lib/supabaseClient';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
  const { slug } = params;

  const { data: cube, error: cubeError } = await supabase
    .from('cube_models')
    .select("*")
    .eq('slug', slug)
    .single();

  if (cubeError) throw error(500, `Failed to fetch cube with slug "${slug}": ${cubeError.message}`);

  let relatedCube = null;
  if (cube.version_type !== "Base" || cube.modded === true) {
    const { data, error: relatedError } = await supabase
      .from('cube_models')
      .select("*")
      .eq('slug', cube.related_to)
      .single();

    if (relatedError) throw error(500, `Failed to fetch related cube with slug "${cube.related_to}": ${relatedError.message}`);
    relatedCube = data;
  }

  const { data: sameSeries, error: seriesError } = await supabase
    .from('cube_models')
    .select("*")
    .match({
      'series': cube.series,
      'version_type': 'Base'
    })
    .neq('model', cube.model);

  if (seriesError) throw error(500, `Failed to fetch cube with slug "${slug}": ${seriesError.message}`);

  const { data: cubeTrims, error: trimsErr } = await supabase
    .from('cube_models')
    .select('*')
    .eq('related_to', slug);

  if (trimsErr) throw error(500, `Failed to fetch cube trims related to slug "${slug}": ${trimsErr.message}`);

  const { data: vendor_links, error: vendorError } = await supabase
    .from('cube_vendor_links')
    .select("*")
    .eq('cube_slug', cube.slug);

  if (vendorError) throw error(500, `Failed to fetch vendor links for cube "${cube.slug}": ${vendorError.message}`);

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username');

  if (profilesError) throw error(500, `Failed to fetch profiles: ${profilesError.message}`);

  return { cube, cubeTrims, relatedCube, sameSeries, vendor_links, profiles };

}
