alter table "public"."user_cube_ratings" drop constraint "user_ratings_cube_slug_fkey";

alter table "public"."user_cubes" drop constraint "user_cubes_cube_fkey";

drop view if exists "public"."v_detailed_cube_models";

drop view if exists "public"."v_detailed_profiles";

drop view if exists "public"."v_detailed_vendors";

drop view if exists "public"."v_user_stats";

alter table "public"."user_cube_ratings" drop constraint "user_cube_ratings_pkey";

alter table "public"."user_cubes" drop constraint "user_cubes_pkey";

drop index if exists "public"."user_cube_ratings_pkey";

drop index if exists "public"."user_cubes_pkey";

-- Migrate data

alter table "public"."user_cube_ratings" add column "cube_id" bigint;

update user_cube_ratings ucr set cube_id = (select id from cube_models cm where cm.slug = ucr.cube_slug);

alter table "public"."user_cube_ratings" drop column "cube_slug";

alter table "public"."user_cube_ratings" alter column "cube_id" not null;

-- End migration

-- Migrate data

alter table "public"."user_cubes" add column "cube_id" bigint;

update user_cubes uc set cube_id = (select id from cube_models cm where cm.slug = uc.cube);

alter table "public"."user_cubes" drop column "cube";

alter table "public"."user_cubes" alter column "cube_id" not null;

-- End migration

alter table "public"."user_cube_ratings" add constraint "user_cube_ratings_cube_id_fkey" FOREIGN KEY (cube_id) REFERENCES public.cube_models(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_cube_ratings" validate constraint "user_cube_ratings_cube_id_fkey";

alter table "public"."user_cubes" add constraint "user_cubes_cube_id_fkey" FOREIGN KEY (cube_id) REFERENCES public.cube_models(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_cubes" validate constraint "user_cubes_cube_id_fkey";

create or replace view "public"."v_detailed_cube_models" as  SELECT cm.name,
    cm.image_url,
    v.name AS image_source,
    cm.slug,
    cm.created_at,
    cm.updated_at,
    cm.discontinued,
    cm.release_date,
    cm.release_date_precision,
    cm.id,
    cm.sub_type,
    cm.weight,
    cm.related_to_id,
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
          WHERE ((uc.cube_id = cm.id) AND (uc.status = 'Owned'::public.user_cube_status))) AS owned_count,
    ( SELECT count(*) AS count
           FROM public.user_cubes uc
          WHERE ((uc.cube_id = cm.id) AND (uc.status = 'Wishlist'::public.user_cube_status))) AS wishlist_count,
    ( SELECT count(*) AS count
           FROM public.user_cubes uc
          WHERE ((uc.cube_id = cm.id) AND (uc.status = 'Lost'::public.user_cube_status))) AS previously_owned_count,
    ( SELECT avg(cvl.price) AS avg
           FROM public.cube_vendor_links cvl
          WHERE ((cvl.cube_id = cm.id) AND (NOT cvl.is_dead) AND (( SELECT v_1.currency
                   FROM public.vendors v_1
                  WHERE (cvl.vendor_id = v_1.id)) = 'USD'::text))) AS avg_price,
    ( SELECT min(cvl.price) AS min
           FROM public.cube_vendor_links cvl
          WHERE ((cvl.cube_id = cm.id) AND (NOT cvl.is_dead) AND (( SELECT v_1.currency
                   FROM public.vendors v_1
                  WHERE (cvl.vendor_id = v_1.id)) = 'USD'::text))) AS low_price,
    ( SELECT avg(ucr.rating) AS avg
           FROM public.user_cube_ratings ucr
          WHERE (ucr.cube_id = cm.id)) AS rating,
    ( SELECT count(ucr.rating) AS count
           FROM public.user_cube_ratings ucr
          WHERE (ucr.cube_id = cm.id)) AS rating_count
   FROM (public.cube_models cm
     LEFT JOIN public.vendors v ON ((lower(regexp_replace(split_part(regexp_replace(cm.image_url, '^https?://'::text, ''::text), '/'::text, 1), '^www\.'::text, ''::text)) = lower(regexp_replace(split_part(regexp_replace(v.base_url, '^https?://'::text, ''::text), '/'::text, 1), '^www\.'::text, ''::text)))));


create or replace view "public"."v_detailed_profiles" as  SELECT p.id,
    p.created_at,
    p.user_id,
    p.username,
    p.private,
    p.profile_picture,
    p.bio,
    p.socials,
    p.banner,
    p.verified,
    p.certified,
    p.role,
    p.display_name,
    p.onboarded,
    COALESCE(uc.cube_count, (0)::bigint) AS user_cubes_count,
    COALESCE(ua.achievement_count, (0)::bigint) AS user_achievements_count,
    COALESCE(fwing.following_count, (0)::bigint) AS user_following_count,
    COALESCE(fwer.follower_count, (0)::bigint) AS user_follower_count,
    COALESCE(ur.ratings_count, (0)::bigint) AS user_cube_ratings_count,
    COALESCE(ur.rating_avg, (0)::double precision) AS user_avg_rating_count,
    COALESCE((ucr.reviews_count)::double precision, (0)::double precision) AS cube_reviews_count
   FROM ((((((public.profiles p
     LEFT JOIN ( SELECT user_cubes.user_id,
            count(*) AS cube_count
           FROM public.user_cubes
          GROUP BY user_cubes.user_id) uc ON ((uc.user_id = p.user_id)))
     LEFT JOIN ( SELECT user_achievements.user_id,
            count(*) AS achievement_count
           FROM public.user_achievements
          GROUP BY user_achievements.user_id) ua ON ((ua.user_id = p.user_id)))
     LEFT JOIN ( SELECT user_follows.follower_id,
            count(*) AS following_count
           FROM public.user_follows
          GROUP BY user_follows.follower_id) fwing ON ((fwing.follower_id = p.user_id)))
     LEFT JOIN ( SELECT user_follows.following_id,
            count(*) AS follower_count
           FROM public.user_follows
          GROUP BY user_follows.following_id) fwer ON ((fwer.following_id = p.user_id)))
     LEFT JOIN ( SELECT user_cube_ratings.user_id,
            count(*) AS ratings_count,
            avg(user_cube_ratings.rating) AS rating_avg
           FROM public.user_cube_ratings
          GROUP BY user_cube_ratings.user_id) ur ON ((ur.user_id = p.user_id)))
     LEFT JOIN ( SELECT ucr_1.user_id,
            count(*) AS reviews_count
           FROM public.user_cube_reviews ucr_1
          WHERE (ucr_1.status = 'published'::public.cube_review_status)
          GROUP BY ucr_1.user_id) ucr ON ((ucr.user_id = p.user_id)));


create or replace view "public"."v_detailed_vendors" as  SELECT v.id,
    v.slug,
    v.created_at,
    v.name,
    v.base_url,
    v.country_iso,
    v.updated_at,
    v.logo_url,
    v.currency,
    v.sponsored,
    v.verified,
    ( SELECT count(DISTINCT uc.user_id) AS count
           FROM public.user_cubes uc
          WHERE (uc.bought_from = v.slug)) AS buyer_count
   FROM public.vendors v;


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
            b.name AS brand,
            count(*) AS cnt
           FROM ((public.user_cubes uc
             JOIN public.cube_models cm ON ((cm.id = uc.cube_id)))
             JOIN public.brands b ON ((b.id = cm.brand_id)))
          WHERE (uc.status <> 'Wishlist'::public.user_cube_status)
          GROUP BY b.name, uc.user_id
        ), type_counts AS (
         SELECT uc.user_id,
            ct_1.name AS type,
            count(*) AS cnt
           FROM ((public.user_cubes uc
             JOIN public.cube_models cm ON ((cm.id = uc.cube_id)))
             JOIN public.cube_types ct_1 ON ((ct_1.id = cm.type_id)))
          WHERE (uc.status <> 'Wishlist'::public.user_cube_status)
          GROUP BY ct_1.name, uc.user_id
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



