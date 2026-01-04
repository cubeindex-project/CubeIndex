drop view if exists "public"."v_awards_category_winners";

drop view if exists "public"."v_detailed_cube_models";

drop view if exists "public"."v_user_stats";

alter table "public"."vendors" drop column "supports_price_tracking";

create or replace view "public"."v_detailed_vendors" as  SELECT v.id,
    v.slug,
    v.created_at,
    v.name,
    v.base_url,
    v.country_iso,
    v.updated_at,
    v.is_active,
    v.rating,
    v.logo_url,
    v.currency,
    v.sponsored,
    v.verified,
    ( SELECT count(DISTINCT uc.user_id) AS count
           FROM public.user_cubes uc
          WHERE (uc.bought_from = v.slug)) AS buyer_count
   FROM public.vendors v;


create or replace view "public"."v_detailed_cube_models" as  SELECT cm.brand,
    cm.image_url,
    v.name AS image_source,
    cm.model,
    cm.rating,
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
                  WHERE (cvl.vendor_name = v_1.name)) = 'USD'::public.currencies))) AS avg_price
   FROM (public.cube_models cm
     LEFT JOIN public.vendors v ON ((lower(regexp_replace(split_part(regexp_replace(cm.image_url, '^https?://'::text, ''::text), '/'::text, 1), '^www\.'::text, ''::text)) = lower(regexp_replace(split_part(regexp_replace(v.base_url, '^https?://'::text, ''::text), '/'::text, 1), '^www\.'::text, ''::text)))));


create or replace view "public"."v_user_stats" as  WITH cube_stats AS (
         SELECT uc.user_id,
            count(*) AS cube_count,
            sum(uc.purchase_price) AS collection_value
           FROM public.user_cubes uc
          WHERE (uc.status <> 'Wishlist'::public.user_cube_status)
          GROUP BY uc.user_id
        ), rating_stats AS (
         SELECT user_cube_ratings.user_id,
            avg(user_cube_ratings.rating) AS rating_avg,
            count(*) AS rating_count
           FROM public.user_cube_ratings
          GROUP BY user_cube_ratings.user_id
        ), brand_counts AS (
         SELECT uc.user_id,
            cm.brand,
            count(*) AS cnt
           FROM (public.user_cubes uc
             JOIN public.cube_models cm ON ((cm.slug = uc.cube)))
          WHERE (uc.status <> 'Wishlist'::public.user_cube_status)
          GROUP BY cm.brand, uc.user_id
        ), type_counts AS (
         SELECT uc.user_id,
            cm.type,
            count(*) AS cnt
           FROM (public.user_cubes uc
             JOIN public.cube_models cm ON ((cm.slug = uc.cube)))
          WHERE (uc.status <> 'Wishlist'::public.user_cube_status)
          GROUP BY cm.type, uc.user_id
        ), store_counts AS (
         SELECT uc.user_id,
            v.name AS store,
            count(*) AS cnt
           FROM (public.user_cubes uc
             JOIN public.vendors v ON ((v.slug = uc.bought_from)))
          WHERE (uc.status <> 'Wishlist'::public.user_cube_status)
          GROUP BY v.name, uc.user_id
        ), condition_counts AS (
         SELECT uc.user_id,
            uc.condition,
            count(*) AS cnt
           FROM public.user_cubes uc
          WHERE (uc.status <> 'Wishlist'::public.user_cube_status)
          GROUP BY uc.condition, uc.user_id
        ), cubes_over_time_counts AS (
         SELECT user_cubes.user_id,
            (date_trunc('month'::text, (user_cubes.acquired_at)::timestamp with time zone))::date AS month,
            count(*) AS cnt
           FROM public.user_cubes
          WHERE ((user_cubes.acquired_at IS NOT NULL) AND (user_cubes.status <> 'Wishlist'::public.user_cube_status))
          GROUP BY user_cubes.user_id, ((date_trunc('month'::text, (user_cubes.acquired_at)::timestamp with time zone))::date)
        ), brand_grouped AS (
         SELECT t.user_id,
                CASE
                    WHEN (t.rn <= 7) THEN t.brand
                    ELSE 'Other'::text
                END AS brand,
            sum(t.cnt) AS cnt
           FROM ( SELECT brand_counts.user_id,
                    brand_counts.brand,
                    brand_counts.cnt,
                    row_number() OVER (PARTITION BY brand_counts.user_id ORDER BY brand_counts.cnt DESC) AS rn
                   FROM brand_counts
                  WHERE (brand_counts.brand IS NOT NULL)) t
          GROUP BY t.user_id,
                CASE
                    WHEN (t.rn <= 7) THEN t.brand
                    ELSE 'Other'::text
                END
        ), store_grouped AS (
         SELECT t.user_id,
                CASE
                    WHEN (t.rn <= 7) THEN t.store
                    ELSE 'Other'::text
                END AS store,
            sum(t.cnt) AS cnt
           FROM ( SELECT store_counts.user_id,
                    store_counts.store,
                    store_counts.cnt,
                    row_number() OVER (PARTITION BY store_counts.user_id ORDER BY store_counts.cnt DESC) AS rn
                   FROM store_counts
                  WHERE (store_counts.store IS NOT NULL)) t
          GROUP BY t.user_id,
                CASE
                    WHEN (t.rn <= 7) THEN t.store
                    ELSE 'Other'::text
                END
        ), type_grouped AS (
         SELECT t.user_id,
                CASE
                    WHEN (t.rn <= 7) THEN t.type
                    ELSE 'Other'::text
                END AS type,
            sum(t.cnt) AS cnt
           FROM ( SELECT type_counts.user_id,
                    type_counts.type,
                    type_counts.cnt,
                    row_number() OVER (PARTITION BY type_counts.user_id ORDER BY type_counts.cnt DESC) AS rn
                   FROM type_counts
                  WHERE (type_counts.type IS NOT NULL)) t
          GROUP BY t.user_id,
                CASE
                    WHEN (t.rn <= 7) THEN t.type
                    ELSE 'Other'::text
                END
        ), condition_grouped AS (
         SELECT t.user_id,
                CASE
                    WHEN (t.rn <= 7) THEN (t.condition)::text
                    ELSE 'Other'::text
                END AS condition,
            sum(t.cnt) AS cnt
           FROM ( SELECT condition_counts.user_id,
                    condition_counts.condition,
                    condition_counts.cnt,
                    row_number() OVER (PARTITION BY condition_counts.user_id ORDER BY condition_counts.cnt DESC) AS rn
                   FROM condition_counts
                  WHERE (condition_counts.condition IS NOT NULL)) t
          GROUP BY t.user_id,
                CASE
                    WHEN (t.rn <= 7) THEN (t.condition)::text
                    ELSE 'Other'::text
                END
        ), cubes_per_brand AS (
         SELECT brand_grouped.user_id,
            COALESCE(jsonb_object_agg(brand_grouped.brand, brand_grouped.cnt) FILTER (WHERE (brand_grouped.brand IS NOT NULL)), '{}'::jsonb) AS cubes_per_brand
           FROM brand_grouped
          GROUP BY brand_grouped.user_id
        ), cubes_per_store AS (
         SELECT store_grouped.user_id,
            COALESCE(jsonb_object_agg(store_grouped.store, store_grouped.cnt) FILTER (WHERE (store_grouped.store IS NOT NULL)), '{}'::jsonb) AS cubes_per_store
           FROM store_grouped
          GROUP BY store_grouped.user_id
        ), cubes_per_type AS (
         SELECT type_grouped.user_id,
            COALESCE(jsonb_object_agg(type_grouped.type, type_grouped.cnt) FILTER (WHERE (type_grouped.type IS NOT NULL)), '{}'::jsonb) AS cubes_per_type
           FROM type_grouped
          GROUP BY type_grouped.user_id
        ), cubes_per_condition AS (
         SELECT condition_grouped.user_id,
            COALESCE(jsonb_object_agg(condition_grouped.condition, condition_grouped.cnt) FILTER (WHERE (condition_grouped.condition IS NOT NULL)), '{}'::jsonb) AS cubes_per_condition
           FROM condition_grouped
          GROUP BY condition_grouped.user_id
        ), cubes_over_time AS (
         SELECT cubes_over_time_counts.user_id,
            COALESCE(jsonb_object_agg(to_char((cubes_over_time_counts.month)::timestamp with time zone, 'YYYY-MM'::text), cubes_over_time_counts.cnt ORDER BY cubes_over_time_counts.month), '{}'::jsonb) AS cubes_over_time
           FROM cubes_over_time_counts
          GROUP BY cubes_over_time_counts.user_id
        )
 SELECT cs.user_id,
    cs.cube_count,
    cs.collection_value,
    rs.rating_count,
    rs.rating_avg,
    cb.cubes_per_brand,
    cps.cubes_per_store,
    cot.cubes_over_time,
    ct.cubes_per_type,
    cp.cubes_per_condition
   FROM ((((((cube_stats cs
     LEFT JOIN rating_stats rs ON ((rs.user_id = cs.user_id)))
     LEFT JOIN cubes_per_brand cb ON ((cb.user_id = cs.user_id)))
     LEFT JOIN cubes_per_store cps ON ((cps.user_id = cs.user_id)))
     LEFT JOIN cubes_over_time cot ON ((cot.user_id = cs.user_id)))
     LEFT JOIN cubes_per_type ct ON ((ct.user_id = cs.user_id)))
     LEFT JOIN cubes_per_condition cp ON ((cp.user_id = cs.user_id)));


create or replace view "public"."v_awards_category_winners" as  WITH vote_counts AS (
         SELECT n_1.id AS nominee_id,
            n_1.category_id,
            (count(v.id))::integer AS votes
           FROM (public.awards_nominee n_1
             LEFT JOIN public.awards_user_vote v ON ((v.nominee_id = n_1.id)))
          GROUP BY n_1.id, n_1.category_id
        ), ranked AS (
         SELECT vc.nominee_id,
            vc.category_id,
            vc.votes,
            row_number() OVER (PARTITION BY vc.category_id ORDER BY vc.votes DESC, vc.nominee_id) AS rn
           FROM vote_counts vc
        ), nominees_per_category AS (
         SELECT awards_nominee.category_id,
            (count(*))::integer AS nominees_count
           FROM public.awards_nominee
          GROUP BY awards_nominee.category_id
        )
 SELECT e.id AS event_id,
    e.year AS event_year,
    e.title AS event_title,
    e.start_at,
    e.end_at,
    c.id AS category_id,
    c.name AS category_name,
    c.slug AS category_slug,
    c.description AS category_description,
    c.created_at AS category_created_at,
    r.nominee_id,
    r.votes,
    npc.nominees_count,
    cm.id AS cube_id,
    cm.brand,
    cm.slug AS cube_slug,
    cm.image_url,
    cm.version_type,
    cm.name AS cube_name
   FROM (((((ranked r
     JOIN public.awards_category c ON ((c.id = r.category_id)))
     JOIN public.awards_event e ON ((e.id = c.event_id)))
     JOIN public.awards_nominee n ON ((n.id = r.nominee_id)))
     JOIN public.v_detailed_cube_models cm ON ((cm.id = n.cube_id)))
     JOIN nominees_per_category npc ON ((npc.category_id = c.id)))
  WHERE (r.rn = 1);



