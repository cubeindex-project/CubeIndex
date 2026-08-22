drop view if exists "public"."v_detailed_cube_models";

create or replace view "public"."v_detailed_cube_models" as  SELECT cm.name,
    cm.image_url,
    v.name AS image_source,
    cm.slug,
    cm.created_at,
    cm.updated_at,
    cm.discontinued,
    cm.release_date,
    cm.id,
    cm.sub_type,
    cm.weight,
    cm.related_to,
    cm.version_type,
    cm.surface_finish,
    cm.size,
    cm.submitted_by_id,
    cm.series_id,
    cm.type_id,
    cm.brand_id,
    ( SELECT b.name
           FROM public.brands b
          WHERE (b.id = cm.brand_id)) AS brand,
    ( SELECT ct.name
           FROM public.cube_types ct
          WHERE (ct.id = cm.type_id)) AS type,
    ( SELECT cs.name
           FROM public.cube_series cs
          WHERE (cs.id = cm.series_id)) AS series,
    (EXISTS ( SELECT 1
           FROM public.cubes_model_features f
          WHERE ((f.cube = cm.slug) AND (f.feature = 'ball_core'::text)))) AS ball_core,
    (EXISTS ( SELECT 1
           FROM public.cubes_model_features f
          WHERE ((f.cube = cm.slug) AND (f.feature = 'maglev'::text)))) AS maglev,
    (EXISTS ( SELECT 1
           FROM public.cubes_model_features f
          WHERE ((f.cube = cm.slug) AND (f.feature = 'magnetic'::text)))) AS magnetic,
    (EXISTS ( SELECT 1
           FROM public.cubes_model_features f
          WHERE ((f.cube = cm.slug) AND (f.feature = 'modded'::text)))) AS modded,
    (EXISTS ( SELECT 1
           FROM public.cubes_model_features f
          WHERE ((f.cube = cm.slug) AND (f.feature = 'smart'::text)))) AS smart,
    (EXISTS ( SELECT 1
           FROM public.cubes_model_features f
          WHERE ((f.cube = cm.slug) AND (f.feature = 'stickered'::text)))) AS stickered,
    (EXISTS ( SELECT 1
           FROM public.cubes_model_features f
          WHERE ((f.cube = cm.slug) AND (f.feature = 'wca_legal'::text)))) AS wca_legal,
    (EXTRACT(year FROM cm.release_date))::integer AS year,
    ( SELECT count(*) AS count
           FROM public.user_cubes uc
          WHERE ((uc.cube = cm.slug) AND (uc.status = 'Owned'::public.user_cube_status))) AS owned_count,
    ( SELECT count(*) AS count
           FROM public.user_cubes uc
          WHERE ((uc.cube = cm.slug) AND (uc.status = 'Wishlist'::public.user_cube_status))) AS wishlist_count,
    ( SELECT count(*) AS count
           FROM public.user_cubes uc
          WHERE ((uc.cube = cm.slug) AND (uc.status = 'Lost'::public.user_cube_status))) AS previously_owned_count,
    ( SELECT avg(cvl.price) AS avg
           FROM public.cube_vendor_links cvl
          WHERE ((cvl.cube_id = cm.id) AND (( SELECT v_1.currency
                   FROM public.vendors v_1
                  WHERE (cvl.vendor_id = v_1.id)) = 'USD'::text))) AS avg_price,
    ( SELECT min(cvl.price) AS min
           FROM public.cube_vendor_links cvl
          WHERE ((cvl.cube_id = cm.id) AND (( SELECT v_1.currency
                   FROM public.vendors v_1
                  WHERE (cvl.vendor_id = v_1.id)) = 'USD'::text))) AS low_price,
    ( SELECT avg(ucr.rating) AS avg
           FROM public.user_cube_ratings ucr
          WHERE (ucr.cube_slug = cm.slug)) AS rating,
    ( SELECT count(ucr.rating) AS count
           FROM public.user_cube_ratings ucr
          WHERE (ucr.cube_slug = cm.slug)) AS rating_count
   FROM (public.cube_models cm
     LEFT JOIN public.vendors v ON ((lower(regexp_replace(split_part(regexp_replace(cm.image_url, '^https?://'::text, ''::text), '/'::text, 1), '^www\.'::text, ''::text)) = lower(regexp_replace(split_part(regexp_replace(v.base_url, '^https?://'::text, ''::text), '/'::text, 1), '^www\.'::text, ''::text)))));



