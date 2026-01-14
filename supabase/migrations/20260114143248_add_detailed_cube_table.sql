drop view if exists "public"."v_detailed_cube_models";

create or replace view "public"."v_detailed_cube_models" as  SELECT cm.brand,
    cm.image_url,
    v.name AS image_source,
    cm.model,
    cm.slug,
    cm.created_at,
    cm.updated_at,
    cm.type,
    cm.discontinued,
    cm.release_date,
    cm.series,
    cm.id,
    cm.sub_type,
    cm.weight,
    cm.related_to,
    cm.version_type,
    cm.version_name,
    cm.status,
    cm.notes,
    cm.surface_finish,
    cm.verified_at,
    cm.size,
    cm.submitted_by_id,
    cm.verified_by_id,
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
    TRIM(BOTH FROM ((((COALESCE(cm.series, ''::text) || ' '::text) || COALESCE(cm.model, ''::text)) || ' '::text) || COALESCE(cm.version_name, ''::text))) AS name,
    (EXTRACT(year FROM cm.release_date))::integer AS year,
    ( SELECT count(*) AS count
           FROM public.user_cubes uc
          WHERE (uc.cube = cm.slug)) AS popularity,
    ( SELECT avg(cvl.price) AS avg
           FROM public.cube_vendor_links cvl
          WHERE ((cvl.cube_slug = cm.slug) AND (( SELECT v_1.currency
                   FROM public.vendors v_1
                  WHERE (cvl.vendor_name = v_1.name)) = 'USD'::public.currencies))) AS avg_price,
    ( SELECT min(cvl.price) AS min
           FROM public.cube_vendor_links cvl
          WHERE ((cvl.cube_slug = cm.slug) AND (( SELECT v_1.currency
                   FROM public.vendors v_1
                  WHERE (cvl.vendor_name = v_1.name)) = 'USD'::public.currencies))) AS low_price,
    ( SELECT avg(ucr.rating) AS avg
           FROM public.user_cube_ratings ucr
          WHERE (ucr.cube_slug = cm.slug)) AS rating,
    ( SELECT count(ucr.rating) AS count
           FROM public.user_cube_ratings ucr
          WHERE (ucr.cube_slug = cm.slug)) AS rating_count
   FROM (public.cube_models cm
     LEFT JOIN public.vendors v ON ((lower(regexp_replace(split_part(regexp_replace(cm.image_url, '^https?://'::text, ''::text), '/'::text, 1), '^www\.'::text, ''::text)) = lower(regexp_replace(split_part(regexp_replace(v.base_url, '^https?://'::text, ''::text), '/'::text, 1), '^www\.'::text, ''::text)))));


grant delete on table "public"."helpful_review" to "postgres";

grant insert on table "public"."helpful_review" to "postgres";

grant references on table "public"."helpful_review" to "postgres";

grant select on table "public"."helpful_review" to "postgres";

grant trigger on table "public"."helpful_review" to "postgres";

grant truncate on table "public"."helpful_review" to "postgres";

grant update on table "public"."helpful_review" to "postgres";

grant delete on table "public"."user_cube_reviews" to "postgres";

grant insert on table "public"."user_cube_reviews" to "postgres";

grant references on table "public"."user_cube_reviews" to "postgres";

grant select on table "public"."user_cube_reviews" to "postgres";

grant trigger on table "public"."user_cube_reviews" to "postgres";

grant truncate on table "public"."user_cube_reviews" to "postgres";

grant update on table "public"."user_cube_reviews" to "postgres";

grant delete on table "public"."user_cube_reviews_categories" to "postgres";

grant insert on table "public"."user_cube_reviews_categories" to "postgres";

grant references on table "public"."user_cube_reviews_categories" to "postgres";

grant select on table "public"."user_cube_reviews_categories" to "postgres";

grant trigger on table "public"."user_cube_reviews_categories" to "postgres";

grant truncate on table "public"."user_cube_reviews_categories" to "postgres";

grant update on table "public"."user_cube_reviews_categories" to "postgres";

grant delete on table "public"."user_cube_reviews_ratings" to "postgres";

grant insert on table "public"."user_cube_reviews_ratings" to "postgres";

grant references on table "public"."user_cube_reviews_ratings" to "postgres";

grant select on table "public"."user_cube_reviews_ratings" to "postgres";

grant trigger on table "public"."user_cube_reviews_ratings" to "postgres";

grant truncate on table "public"."user_cube_reviews_ratings" to "postgres";

grant update on table "public"."user_cube_reviews_ratings" to "postgres";


