drop trigger if exists "trg_save_cube_vendor_links_snapshots" on "public"."cube_vendor_links";

alter table "public"."cube_vendor_links" drop constraint "cube_vendor_links_duplicate_id_key";

alter table "public"."vendors" drop constraint "vendors_country_iso_check";

drop view if exists "public"."v_awards_category_winners";

drop view if exists "public"."v_detailed_cube_models";

drop view if exists "public"."v_detailed_vendors";

drop view if exists "public"."v_price_history";

drop view if exists "public"."v_user_stats";

alter table "public"."cube_vendor_links" drop constraint "cube_vendor_links_duplicate_pkey";

drop index if exists "public"."cube_vendor_links_duplicate_id_key";

drop index if exists "public"."cube_vendor_links_duplicate_pkey";

alter table "public"."cube_vendor_links" add column "cube_id" bigint not null;

alter table "public"."cube_vendor_links" add column "is_dead" boolean not null default false;

alter table "public"."cube_vendor_links" add column "vendor_id" bigint not null;

alter table "public"."cube_vendor_links" alter column "price" set data type numeric(12,2) using "price"::numeric(12,2);

alter table "public"."cube_vendor_links_snapshot" add column "cube_id" bigint not null;

alter table "public"."cube_vendor_links_snapshot" add column "vendor_id" bigint not null;

alter table "public"."cube_vendor_links_snapshot" alter column "price" set data type numeric(12,2) using "price"::numeric(12,2);

alter table "public"."vendors" drop column "is_active";

alter table "public"."vendors" drop column "rating";

alter table "public"."vendors" add column "supports_price_scraping" boolean not null default false;

alter table "public"."vendors" add column "supports_product_scraping" boolean not null default false;

alter table "public"."vendors" alter column "currency" set data type text using "currency"::text;

alter table "public"."vendors" alter column "currency" set default 'USD'::text;

CREATE UNIQUE INDEX cube_vendor_links_pkey ON public.cube_vendor_links USING btree (id);

alter table "public"."cube_vendor_links" add constraint "cube_vendor_links_pkey" PRIMARY KEY using index "cube_vendor_links_pkey";

alter table "public"."cube_vendor_links" add constraint "cube_vendor_links_cube_id_fkey" FOREIGN KEY (cube_id) REFERENCES public.cube_models(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."cube_vendor_links" validate constraint "cube_vendor_links_cube_id_fkey";

alter table "public"."cube_vendor_links" add constraint "cube_vendor_links_vendor_id_fkey" FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."cube_vendor_links" validate constraint "cube_vendor_links_vendor_id_fkey";

alter table "public"."cube_vendor_links_snapshot" add constraint "cube_vendor_links_snapshot_cube_id_fkey" FOREIGN KEY (cube_id) REFERENCES public.cube_models(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."cube_vendor_links_snapshot" validate constraint "cube_vendor_links_snapshot_cube_id_fkey";

alter table "public"."cube_vendor_links_snapshot" add constraint "cube_vendor_links_snapshot_vendor_id_fkey" FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."cube_vendor_links_snapshot" validate constraint "cube_vendor_links_snapshot_vendor_id_fkey";

alter table "public"."vendors" add constraint "vendors_currency_check" CHECK ((currency ~ '^[A-Z]{3}$'::text)) not valid;

alter table "public"."vendors" validate constraint "vendors_currency_check";

alter table "public"."vendors" add constraint "vendors_country_iso_check" CHECK ((country_iso ~ '^[A-Z]{2}$'::text)) not valid;

alter table "public"."vendors" validate constraint "vendors_country_iso_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.notify_discord_price_alert()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$declare
  latest numeric;
  previous numeric;
  cube jsonb;
  vendor jsonb;
  payload jsonb;
begin
  latest := new.price;

  select price
  into previous
  from cube_vendor_links_snapshot
  where vendor_id = new.vendor_id
    and cube_id = new.cube_id
    and id <> new.id
  order by created_at desc, id desc
  limit 1;

  if previous is not null and latest < previous then
    select jsonb_build_object(
      'slug', slug,
      'name', name
    )
    into cube
    from cube_models
    where id = new.cube_id;

    select jsonb_build_object('name', name, 'currency', currency)
    into vendor
    from vendors v
    where v.id = new.vendor_id;

    payload := jsonb_build_object(
      'cube', cube,
      'vendor', vendor,
      'old_price',  previous,
      'new_price',  latest,
      'shop_link',  new.url
    );

    perform net.http_post(
      url     := 'https://spsqaktodgqnqbkgilxp.supabase.co/functions/v1/cube-price-alerts',
      headers := jsonb_build_object('Content-Type','application/json'),
      body    := payload
    );
  end if;

  return new;
end;$function$
;

CREATE OR REPLACE FUNCTION public.save_cube_vendor_links_snapshots()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$begin
  insert into public.cube_vendor_links_snapshot (
    cube_id, vendor_id, url, available, price
  ) values (
    new.cube_id,
    new.vendor_id,
    new.url,
    new.available,
    new.price
  );

  return new;
end;$function$
;

create or replace view "public"."v_awards_category_winners" as  WITH votes AS (
         SELECT an.category_id,
            cm.slug AS nominee_slug,
            count(DISTINCT auv.user_id) AS vote_count
           FROM ((public.awards_nominee an
             JOIN public.cube_models cm ON ((cm.id = an.cube_id)))
             LEFT JOIN public.awards_user_vote auv ON ((auv.nominee_id = an.id)))
          GROUP BY an.category_id, cm.slug
        ), ranked AS (
         SELECT v.category_id,
            v.nominee_slug,
            v.vote_count,
            dense_rank() OVER (PARTITION BY v.category_id ORDER BY v.vote_count DESC) AS rnk
           FROM votes v
        )
 SELECT r.category_id,
    r.nominee_slug,
    r.vote_count,
    ( SELECT count(*) AS count
           FROM public.awards_nominee an
          WHERE (an.category_id = r.category_id)) AS nominee_count
   FROM ranked r
  WHERE (r.rnk = 1);


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
    cm.verified_at,
    cm.size,
    cm.submitted_by_id,
    cm.verified_by_id,
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
          WHERE (uc.cube = cm.slug)) AS popularity,
    ( SELECT avg(cvl.price) AS avg
           FROM public.cube_vendor_links cvl
          WHERE ((cvl.cube_slug = cm.slug) AND (( SELECT v_1.currency
                   FROM public.vendors v_1
                  WHERE (cvl.vendor_name = v_1.name)) = 'USD'::text))) AS avg_price,
    ( SELECT min(cvl.price) AS min
           FROM public.cube_vendor_links cvl
          WHERE ((cvl.cube_slug = cm.slug) AND (( SELECT v_1.currency
                   FROM public.vendors v_1
                  WHERE (cvl.vendor_name = v_1.name)) = 'USD'::text))) AS low_price,
    ( SELECT avg(ucr.rating) AS avg
           FROM public.user_cube_ratings ucr
          WHERE (ucr.cube_slug = cm.slug)) AS rating,
    ( SELECT count(ucr.rating) AS count
           FROM public.user_cube_ratings ucr
          WHERE (ucr.cube_slug = cm.slug)) AS rating_count
   FROM (public.cube_models cm
     LEFT JOIN public.vendors v ON ((lower(regexp_replace(split_part(regexp_replace(cm.image_url, '^https?://'::text, ''::text), '/'::text, 1), '^www\.'::text, ''::text)) = lower(regexp_replace(split_part(regexp_replace(v.base_url, '^https?://'::text, ''::text), '/'::text, 1), '^www\.'::text, ''::text)))));


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


create or replace view "public"."v_price_history" as  WITH daily_rows AS (
         SELECT DISTINCT ON (cube_vendor_links_snapshot.cube_slug, cube_vendor_links_snapshot.vendor_name, ((cube_vendor_links_snapshot.created_at)::date)) cube_vendor_links_snapshot.cube_slug,
            cube_vendor_links_snapshot.vendor_name,
            (cube_vendor_links_snapshot.created_at)::date AS day,
            cube_vendor_links_snapshot.price
           FROM public.cube_vendor_links_snapshot
          WHERE (cube_vendor_links_snapshot.vendor_name = ANY (ARRAY['GANCUBE'::text, 'TheCubicle'::text, 'SpeedCubeShop'::text]))
          ORDER BY cube_vendor_links_snapshot.cube_slug, cube_vendor_links_snapshot.vendor_name, ((cube_vendor_links_snapshot.created_at)::date), cube_vendor_links_snapshot.created_at DESC
        )
 SELECT daily_rows.cube_slug,
    daily_rows.vendor_name,
    jsonb_agg(jsonb_build_object('date', to_char((daily_rows.day)::timestamp with time zone, 'YYYY-MM-DD'::text), 'price', daily_rows.price) ORDER BY daily_rows.day) AS price_history
   FROM daily_rows
  GROUP BY daily_rows.cube_slug, daily_rows.vendor_name;


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
             JOIN public.cube_models cm ON ((cm.slug = uc.cube)))
             JOIN public.brands b ON ((b.id = cm.brand_id)))
          WHERE (uc.status <> 'Wishlist'::public.user_cube_status)
          GROUP BY b.name, uc.user_id
        ), type_counts AS (
         SELECT uc.user_id,
            ct_1.name AS type,
            count(*) AS cnt
           FROM ((public.user_cubes uc
             JOIN public.cube_models cm ON ((cm.slug = uc.cube)))
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


CREATE TRIGGER trg_save_cube_vendor_links_snapshots AFTER INSERT OR UPDATE ON public.cube_vendor_links FOR EACH ROW EXECUTE FUNCTION public.save_cube_vendor_links_snapshots();
