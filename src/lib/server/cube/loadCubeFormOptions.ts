import { Constants } from "$lib/types/database.types.js";

export async function loadCubeFormOptions(supabase: App.Locals["supabase"]) {
  const [brands, types, series, features, vendors, cubes] = await Promise.all([
    supabase.from("brands").select("id, name").order("name").throwOnError(),
    supabase.from("cube_types").select("id, name").order("name").throwOnError(),
    supabase
      .from("cube_series")
      .select("name, id")
      .order("name")
      .throwOnError(),
    supabase
      .from("cube_features")
      .select("label, code")
      .order("label")
      .throwOnError(),
    supabase
      .from("vendors")
      .select("id, name, base_url, currency")
      .order("name")
      .throwOnError(),
    supabase
      .from("v_detailed_cube_models")
      .select("id, name, slug, image_url")
      .eq("version_type", "Base")
      .order("name")
      .throwOnError(),
  ]);

  return {
    cubes: cubes.data,
    brands: brands.data,
    types: types.data,
    series: series.data,
    features: features.data,
    vendors: vendors.data,
    surfaces: [...Constants.public.Enums.cube_surface_finish],
    subTypes: [...Constants.public.Enums.cubes_subtypes],
    cubeVersions: [...Constants.public.Enums.cube_version_type],
  };
}
