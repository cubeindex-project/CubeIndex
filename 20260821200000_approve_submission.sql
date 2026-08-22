create or replace function public.approve_submission(p_submission_id bigint)
returns void
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
	v_reviewer_id uuid := auth.uid();
	v_submission public.submissions%rowtype;
	v_cube_submission public.cube_submissions%rowtype;
	v_cube_id bigint;
	v_brand_id bigint;
	v_type_id bigint;
	v_series_id bigint;
	v_related_to_slug text;
	v_slug_base text;
	v_slug text;
	v_slug_suffix integer := 0;
begin
	if v_reviewer_id is null then
		raise exception 'Authentication required' using errcode = '42501';
	end if;

	if public.is_database_manager() then
		raise exception 'Database manager role required' using errcode = '42501';
	end if;

	select *
	into v_submission
	from public.submissions
	where id = p_submission_id
	for update;

	if not found then
		raise exception 'Submission % does not exist', p_submission_id using errcode = 'P0002';
	end if;

	if v_submission.type <> 'cube'::public.submission_type then
		raise exception 'Submission % is not a cube submission', p_submission_id using errcode = '22023';
	end if;

	if v_submission.status <> 'Pending'::public.submission_status then
		raise exception 'Only pending submissions can be approved' using errcode = '22023';
	end if;

	select *
	into v_cube_submission
	from public.cube_submissions
	where submission_id = p_submission_id
	for update;

	if not found then
		raise exception 'Cube submission data is missing for submission %', p_submission_id using errcode = 'P0002';
	end if;

	if v_cube_submission.proposed_brand_name is not null then
		insert into public.brands (name, added_by_id)
		values (v_cube_submission.proposed_brand_name, v_submission.submitted_by_id)
		on conflict (name) do update set name = excluded.name
		returning id into v_brand_id;
	else
		v_brand_id := v_cube_submission.brand_id;
	end if;

	if v_brand_id is null then
		raise exception 'Cube submission must specify a brand' using errcode = '22023';
	end if;

	if v_cube_submission.proposed_type_name is not null then
		insert into public.cube_types (name, added_by_id)
		values (v_cube_submission.proposed_type_name, v_submission.submitted_by_id)
		on conflict (name) do update set name = excluded.name
		returning id into v_type_id;
	else
		v_type_id := v_cube_submission.type_id;
	end if;

	if v_type_id is null then
		raise exception 'Cube submission must specify a type' using errcode = '22023';
	end if;

	if v_cube_submission.proposed_series_name is not null then
		insert into public.cube_series (name)
		values (v_cube_submission.proposed_series_name)
		on conflict (name) do update set name = excluded.name
		returning id into v_series_id;
	else
		v_series_id := v_cube_submission.series_id;
	end if;

	if v_cube_submission.related_to_id is not null then
		select slug
		into v_related_to_slug
		from public.cube_models
		where id = v_cube_submission.related_to_id;

		if not found then
			raise exception 'Related cube % does not exist', v_cube_submission.related_to_id using errcode = '22023';
		end if;
	end if;

	if v_submission.operation = 'create'::public.submission_operation then
		if v_cube_submission.target_cube_id is not null then
			raise exception 'Create submissions cannot target an existing cube' using errcode = '22023';
		end if;

		v_slug_base := trim(both '-' from regexp_replace(lower(v_cube_submission.name), '[^a-z0-9]+', '-', 'g'));
		if v_slug_base = '' then
			raise exception 'Cube name cannot produce a valid slug' using errcode = '22023';
		end if;

		perform pg_advisory_xact_lock(hashtext(v_slug_base));
		v_slug := v_slug_base;
		while exists (select 1 from public.cube_models where slug = v_slug) loop
			v_slug_suffix := v_slug_suffix + 1;
			v_slug := v_slug_base || '-' || v_slug_suffix;
		end loop;

		insert into public.cube_models (
			brand_id,
			name,
			image_url,
			related_to,
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
			verified_at,
			verified_by_id,
			version_type,
			weight,
			discontinued
		)
		values (
			v_brand_id,
			v_cube_submission.name,
			v_cube_submission.image_url,
			v_related_to_slug,
			v_cube_submission.related_to_id,
			v_cube_submission.release_date,
			v_cube_submission.release_date_precision,
			v_series_id,
			v_cube_submission.size,
			v_slug,
			v_cube_submission.sub_type,
			v_submission.submitted_by_id,
			v_cube_submission.surface_finish,
			v_type_id,
			now(),
			v_reviewer_id,
			v_cube_submission.version_type,
			v_cube_submission.weight,
			v_cube_submission.discontinued
		)
		returning id into v_cube_id;
	elsif v_submission.operation = 'update'::public.submission_operation then
		if v_cube_submission.target_cube_id is null then
			raise exception 'Update submissions require a target cube' using errcode = '22023';
		end if;

		update public.cube_models
		set
			brand_id = v_brand_id,
			name = v_cube_submission.name,
			image_url = v_cube_submission.image_url,
			related_to = v_related_to_slug,
			related_to_id = v_cube_submission.related_to_id,
			release_date = v_cube_submission.release_date,
			release_date_precision = v_cube_submission.release_date_precision,
			series_id = v_series_id,
			size = v_cube_submission.size,
			sub_type = v_cube_submission.sub_type,
			surface_finish = v_cube_submission.surface_finish,
			type_id = v_type_id,
			verified_at = now(),
			verified_by_id = v_reviewer_id,
			version_type = v_cube_submission.version_type,
			weight = v_cube_submission.weight,
			discontinued = v_cube_submission.discontinued
		where id = v_cube_submission.target_cube_id
		returning id into v_cube_id;

		if not found then
			raise exception 'Target cube % does not exist', v_cube_submission.target_cube_id using errcode = 'P0002';
		end if;
	else
		raise exception 'Unsupported submission operation: %', v_submission.operation using errcode = '22023';
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

	update public.submissions
	set
		status = 'Approved'::public.submission_status,
		reviewed_by_id = v_reviewer_id,
		reviewed_at = now()
	where id = p_submission_id;
end;
$function$;

revoke all on function public.approve_submission(bigint) from public;
grant execute on function public.approve_submission(bigint) to authenticated;
