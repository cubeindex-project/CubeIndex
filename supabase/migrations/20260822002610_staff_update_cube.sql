set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_cube(p_cube_id bigint, p_cube jsonb DEFAULT '{}'::jsonb, p_feature_ids bigint[] DEFAULT '{}'::bigint[], p_vendor_links jsonb DEFAULT '[]'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_cube record;
  v_vendor_link jsonb;
	v_cube_slug text;
	v_brand_id bigint;
	v_type_id bigint;
	v_series_id bigint;
begin
	if v_user_id is null then
		raise exception 'Authentication required';
	end if;

  if not public.is_database_manager() then
    raise exception 'Database manager role required';
  end if;

  select * into v_cube
  from jsonb_to_record(p_cube) as cube_data (
          name text,
          version_type public.cube_version_type,
          image_url text,
          related_to_id bigint,
          release_date date,
          release_date_precision public.date_precision,
          sub_type public.cubes_subtypes,
          weight numeric,
          size text,
          surface_finish public.cube_surface_finish,
          discontinued boolean,

          brand_id bigint,
          proposed_brand_name text,

          type_id bigint,
          proposed_type_name text,

          series_id bigint,
          proposed_series_name text
      );

	if v_cube.proposed_brand_name is not null then
		insert into public.brands (name)
		values (v_cube.proposed_brand_name)
		on conflict (name) do update set name = excluded.name
		returning id into v_brand_id;
	else
		v_brand_id := v_cube.brand_id;
	end if;

	if v_brand_id is null then
		raise exception 'Cube submission must specify a brand';
	end if;

	if v_cube.proposed_type_name is not null then
		insert into public.cube_types (name)
		values (v_cube.proposed_type_name)
		on conflict (name) do update set name = excluded.name
		returning id into v_type_id;
	else
		v_type_id := v_cube.type_id;
	end if;

	if v_type_id is null then
		raise exception 'Cube submission must specify a type';
	end if;

	if v_cube.proposed_series_name is not null then
		insert into public.cube_series (name)
		values (v_cube.proposed_series_name)
		on conflict (name) do update set name = excluded.name
		returning id into v_series_id;
	else
		v_series_id := v_cube.series_id;
	end if;

	v_cube_slug := public.slugify(v_cube.name);
	if v_cube_slug is null or v_cube_slug = '' then
		raise exception 'Cube name cannot produce a valid slug';
	end if;

	update public.cube_models
	set
		brand_id = v_brand_id,
		name = v_cube.name,
		image_url = v_cube.image_url,
		related_to_id = v_cube.related_to_id,
		release_date = v_cube.release_date,
		release_date_precision = v_cube.release_date_precision,
		series_id = v_series_id,
		size = v_cube.size,
		slug = v_cube_slug,
		sub_type = v_cube.sub_type,
		surface_finish = v_cube.surface_finish,
		type_id = v_type_id,
		version_type = v_cube.version_type,
		weight = v_cube.weight,
		discontinued = v_cube.discontinued
	where id = p_cube_id;

	if not found then
		raise exception 'Target cube % does not exist', p_cube_id;
	end if;

	delete from public.cubes_model_features
	where cube = (select slug from public.cube_models where id = p_cube_id);

  insert into public.cubes_model_features (cube, feature)
  select v_cube_slug,
      proposed.code
  from (
          select distinct cube_features.code
          from unnest(p_feature_ids) as values_list(feature_id)
          join public.cube_features on cube_features.id = feature_id
          where feature_id is not null
      ) proposed;

	delete from public.cube_vendor_links
	where cube_id = p_cube_id;

  for v_vendor_link in
  select value
  from jsonb_array_elements(p_vendor_links) loop
  insert into public.cube_vendor_links (
          cube_id,
          vendor_id,
          url,
          price,
          available
      )
  values (
          p_cube_id,
          (v_vendor_link->>'vendor_id')::bigint,
          (v_vendor_link->>'url')::text,
          (v_vendor_link->>'price')::numeric,
          (v_vendor_link->>'available')::boolean
      );
  end loop;
end;
$function$
;
