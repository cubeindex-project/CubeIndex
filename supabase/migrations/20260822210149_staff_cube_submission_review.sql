create extension if not exists "unaccent" with schema "extensions";

alter table "public"."cube_models" add column "related_to_id" bigint;

alter table "public"."cube_models" add constraint "cube_models_related_to_id_fkey" FOREIGN KEY (related_to_id) REFERENCES public.cube_models(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."cube_models" validate constraint "cube_models_related_to_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.approve_submission(p_submission_id bigint)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
	v_reviewer_id uuid := auth.uid();
	v_submission public.submissions%rowtype;
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
			perform public.copy_cube_submission(p_submission_id, v_reviewer_id);
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
end;
$function$
;

CREATE OR REPLACE FUNCTION public.copy_cube_submission(p_submission_id bigint, p_reviewer_id uuid)
 RETURNS void
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
end;
$function$
;

CREATE OR REPLACE FUNCTION public.reject_submission(p_submission_id bigint, p_reviewer_note text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
	v_reviewer_id uuid := auth.uid();
	v_submission public.submissions%rowtype;
begin
	if v_reviewer_id is null then
		raise exception 'Authentication required';
	end if;

	if nullif(trim(p_reviewer_note), '') is null then
		raise exception 'A rejection reason is required';
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
		raise exception 'Only pending submissions can be rejected';
	end if;

	update public.submissions
	set
		status = 'Rejected'::public.submission_status,
		reviewer_note = trim(p_reviewer_note),
		reviewed_by_id = v_reviewer_id,
		reviewed_at = now()
	where id = p_submission_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.slugify(value text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE STRICT
AS $function$
  -- removes accents (diacritic signs) from a given string --
  WITH "unaccented" AS (
    SELECT unaccent("value") AS "value"
  ),
  -- lowercases the string
  "lowercase" AS (
    SELECT lower("value") AS "value"
    FROM "unaccented"
  ),
  -- remove single and double quotes
  "removed_quotes" AS (
    SELECT regexp_replace("value", '[''"]+', '', 'gi') AS "value"
    FROM "lowercase"
  ),
  -- replaces anything that's not a letter, number, hyphen('-'), or underscore('_') with a hyphen('-')
  "hyphenated" AS (
    SELECT regexp_replace("value", '[^a-z0-9\\-_]+', '-', 'gi') AS "value"
    FROM "removed_quotes"
  ),
  -- trims hyphens('-') if they exist on the head or tail of the string
  "trimmed" AS (
    SELECT regexp_replace(regexp_replace("value", '\-+$', ''), '^\-', '') AS "value"
    FROM "hyphenated"
  )
  SELECT "value" FROM "trimmed";
$function$
;
