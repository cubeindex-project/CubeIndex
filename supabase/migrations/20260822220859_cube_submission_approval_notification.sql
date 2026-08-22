set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.copy_cube_submission(p_submission_id bigint)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
	v_submission public.submissions%rowtype;
	v_cube_submission public.cube_submissions%rowtype;
	v_cube_id bigint;
	v_brand_id bigint;
	v_type_id bigint;
	v_series_id bigint;
	v_cube_slug text;
begin
	select *
	into v_submission
	from public.submissions
	where id = p_submission_id
		and type = 'cube'::public.submission_type;

	if not found then
		raise exception 'Cube submission % does not exist', p_submission_id;
	end if;

	select *
	into v_cube_submission
	from public.cube_submissions
	where submission_id = p_submission_id;

	if not found then
		raise exception 'Cube submission data is missing for submission %', p_submission_id;
	end if;

	if v_cube_submission.proposed_brand_name is not null then
		insert into public.brands (name)
		values (v_cube_submission.proposed_brand_name)
		on conflict (name) do update set name = excluded.name
		returning id into v_brand_id;
	else
		v_brand_id := v_cube_submission.brand_id;
	end if;

	if v_brand_id is null then
		raise exception 'Cube submission must specify a brand';
	end if;

	if v_cube_submission.proposed_type_name is not null then
		insert into public.cube_types (name)
		values (v_cube_submission.proposed_type_name)
		on conflict (name) do update set name = excluded.name
		returning id into v_type_id;
	else
		v_type_id := v_cube_submission.type_id;
	end if;

	if v_type_id is null then
		raise exception 'Cube submission must specify a type';
	end if;

	if v_cube_submission.proposed_series_name is not null then
		insert into public.cube_series (name)
		values (v_cube_submission.proposed_series_name)
		on conflict (name) do update set name = excluded.name
		returning id into v_series_id;
	else
		v_series_id := v_cube_submission.series_id;
	end if;

	v_cube_slug := public.slugify(v_cube_submission.name);
	if v_cube_slug = '' then
		raise exception 'Cube name cannot produce a valid slug';
	end if;

	if v_submission.operation = 'create'::public.submission_operation then
		if v_cube_submission.target_cube_id is not null then
			raise exception 'Create submissions cannot target an existing cube';
		end if;

		insert into public.cube_models (
			brand_id,
			name,
			image_url,
			related_to_id,
			release_date,
			release_date_precision,
			series_id,
			size,
			slug,
			sub_type,
			submitted_by_id,
			surface_finish,
			type_id,
			version_type,
			weight,
			discontinued
		)
		values (
			v_brand_id,
			v_cube_submission.name,
			v_cube_submission.image_url,
			v_cube_submission.related_to_id,
			v_cube_submission.release_date,
			v_cube_submission.release_date_precision,
			v_series_id,
			v_cube_submission.size,
			v_cube_slug,
			v_cube_submission.sub_type,
			v_submission.submitted_by_id,
			v_cube_submission.surface_finish,
			v_type_id,
			v_cube_submission.version_type,
			v_cube_submission.weight,
			v_cube_submission.discontinued
		)
		returning id into v_cube_id;
	elsif v_submission.operation = 'update'::public.submission_operation then
		if v_cube_submission.target_cube_id is null then
			raise exception 'Update submissions require a target cube';
		end if;

		update public.cube_models
		set
			brand_id = v_brand_id,
			name = v_cube_submission.name,
			image_url = v_cube_submission.image_url,
			related_to_id = v_cube_submission.related_to_id,
			release_date = v_cube_submission.release_date,
			release_date_precision = v_cube_submission.release_date_precision,
			series_id = v_series_id,
			size = v_cube_submission.size,
			slug = v_cube_slug,
			sub_type = v_cube_submission.sub_type,
			surface_finish = v_cube_submission.surface_finish,
			type_id = v_type_id,
			version_type = v_cube_submission.version_type,
			weight = v_cube_submission.weight,
			discontinued = v_cube_submission.discontinued
		where id = v_cube_submission.target_cube_id
		returning id into v_cube_id;

		if not found then
			raise exception 'Target cube % does not exist', v_cube_submission.target_cube_id;
		end if;
	else
		raise exception 'Unsupported submission operation: %', v_submission.operation;
	end if;

	delete from public.cubes_model_features
	where cube = (select slug from public.cube_models where id = v_cube_id);

	insert into public.cubes_model_features (cube, feature)
	select cube.slug, feature.code
	from public.cube_models cube
	cross join public.cube_submission_features submission_feature
	join public.cube_features feature on feature.id = submission_feature.feature_id
	where cube.id = v_cube_id
		and submission_feature.cube_submission_id = v_cube_submission.id;

	delete from public.cube_vendor_links
	where cube_id = v_cube_id;

	insert into public.cube_vendor_links (cube_id, vendor_id, url, price, available)
	select v_cube_id, vendor_id, url, price, available
	from public.cube_vendor_link_submissions
	where cube_submission_id = v_cube_submission.id;

	return v_cube_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.approve_submission(p_submission_id bigint)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
	v_reviewer_id uuid := auth.uid();
	v_submission public.submissions%rowtype;

	v_cube_id bigint;
  v_cube_name text;
  v_cube_slug text;

  v_notification_message text;
  v_notification_link text;
  v_notification_link_text text;
begin
	if v_reviewer_id is null then
		raise exception 'Authentication required';
	end if;

	if not public.is_database_manager() then
		raise exception 'Database manager role required';
	end if;

	select *
	into v_submission
	from public.submissions
	where id = p_submission_id
	for update;

	if not found then
		raise exception 'Submission % does not exist', p_submission_id;
	end if;

	if v_submission.status <> 'Pending'::public.submission_status then
		raise exception 'Only pending submissions can be approved';
	end if;

	case v_submission.type
		when 'cube'::public.submission_type then
			v_cube_id := public.copy_cube_submission(p_submission_id, v_reviewer_id);

			select name, slug
			into v_cube_name, v_cube_slug
      from public.cube_models
      where id = v_cube_id;

      if not found then
        raise exception 'Copied cube % could not be found', v_cube_id;
      end if;

      v_notification_message := format(
          'Your cube submission "%s" was approved.',
          v_cube_name
      );
      v_notification_link := '/cube/' || v_cube_slug;
      v_notification_link_text := 'View cube';
--		when 'vendor'::public.submission_type then
--			perform public.copy_vendor_submission(p_submission_id);
		else
			raise exception 'Unsupported submission type: %', v_submission.type;
	end case;

	update public.submissions
	set
		status = 'Approved'::public.submission_status,
		reviewed_by_id = v_reviewer_id,
		reviewed_at = now()
	where id = p_submission_id;

	insert into public.notifications (
		message,
		icon,
		link,
		link_text,
		user_id
	) values (
  	v_notification_message,
		'fa-solid fa-circle-check',
		v_notification_link,
		v_notification_link_text,
    v_submission.submitted_by_id
	);
end;
$function$
;


