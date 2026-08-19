create or replace function public.slugify(p_value text) returns text language sql stable strict parallel safe
set search_path = '' as $$
select trim(
        both '-'
        from regexp_replace(
                regexp_replace(
                    lower(
                        extensions.unaccent(regexp_replace(btrim(p_value), '\s+', '-', 'g'))
                    ),
                    '[^a-z0-9 -]',
                    '',
                    'g'
                ),
                '-+',
                '-',
                'g'
            )
    );
$$;
create or replace function private.apply_cube_submission(p_submission_id bigint) returns bigint language plpgsql security invoker
set search_path = '' as $$
declare v_operation public.submission_operation;
v_cube_submission public.cube_submissions;
v_cube_model_id bigint;
begin
select submission.operation into v_operation
from public.submissions as submission
where submission.id = p_submission_id;
select cube_submission.* into v_cube_submission
from public.cube_submissions as cube_submission
where cube_submission.submission_id = p_submission_id;
if not found then raise exception using errcode = '23503',
message = format(
    'Cube submission data is missing for submission %s',
    p_submission_id
);
end if;
if v_cube_submission.brand_id is null then
insert into public.brands (name)
values (v_cube_submission.proposed_brand_name) on conflict (name) do nothing
returning id into v_cube_submission.brand_id;
end if;
if v_cube_submission.type_id is null then
insert into public.cube_types (name)
values (v_cube_submission.proposed_type_name) on conflict (name) do nothing
returning id into v_cube_submission.type_id;
end if;
if v_cube_submission.series_id is null then
insert into public.cube_series (name)
values (v_cube_submission.proposed_series_name) on conflict (name) do nothing
returning id into v_cube_submission.series_id;
end if;
case
    v_operation
    when 'create'::public.submission_operation then begin if p_cube_submission.affected_cube_model_id is not null then raise exception using errcode = '55000',
    message = 'A create submission already has an affected cube model';
end if;
insert into public.cube_models (
        name,
        slug,
        brand_id,
        type_id,
        sub_type,
        series_id,
        release_date,
        release_date_precision,
        image_url,
        surface_finish,
        weight,
        size,
        version_type,
        related_to_id,
        discontinued,
        origin_cube_submission_id
    )
values (
        p_cube_submission.name,
        (public.slugify(p_cube_submission.name))::text,
        p_cube_submission.brand_id,
        p_cube_submission.type_id,
        p_cube_submission.sub_type,
        p_cube_submission.series_id,
        p_cube_submission.release_date,
        p_cube_submission.release_date_precision,
        p_cube_submission.image_url,
        p_cube_submission.surface_finish,
        p_cube_submission.weight,
        p_cube_submission.size,
        p_cube_submission.version_type,
        p_cube_submission.related_to_id,
        p_cube_submission.discontinued,
        p_cube_submission.submission_id
    )
returning id into v_cube_model_id;
insert into public.cubes_model_features (cube_model_id, feature)
select v_cube_model_id,
    proposed_feature.feature
from public.cube_submission_features as proposed_feature
where proposed_feature.cube_submission_id = p_cube_submission.id;
insert into public.cube_vendor_links (
        cube_model_id,
        vendor_id,
        url,
        price,
        available
    )
select v_cube_model_id,
    proposed_link.vendor_id,
    proposed_link.url,
    proposed_link.price,
    proposed_link.available
from public.cube_vendor_link_submissions as proposed_link
where proposed_link.cube_submission_id = p_cube_submission.id;
when 'update'::public.submission_operation then v_cube_model_id := public.apply_cube_update(v_cube_submission);
else raise exception using errcode = '0A000',
message = format(
    'Unsupported cube submission operation: %s',
    v_operation
);
end case
;
update public.cube_submissions
set affected_cube_model_id = v_cube_model_id
where submission_id = p_submission_id;
return v_cube_model_id;
end;
$$;