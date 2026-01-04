create type "public"."currencies" as enum ('USD', 'GBP', 'EUR', 'ETB', 'AED', 'RON', 'INR', 'RUB', 'TRY', 'VES', 'XAF', 'XOF', 'ZAR', 'PLN', 'MXN', 'BRL', 'CAD', 'CHF');

alter table "public"."vendors" drop constraint "vendors_currency_check";

drop view if exists "public"."v_awards_category_winners";

drop view if exists "public"."v_detailed_cube_models";

alter table "public"."user_cubes" add column "purchase_price" double precision;

alter table "public"."vendors" alter column "currency" set default 'USD'::public.currencies;

alter table "public"."vendors" alter column "currency" set data type public.currencies using "currency"::public.currencies;

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



