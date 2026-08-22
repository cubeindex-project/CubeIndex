drop function if exists "public"."copy_cube_submission"(p_submission_id bigint, p_reviewer_id uuid);

drop view if exists "public"."v_awards_category_winners";

drop view if exists "public"."v_detailed_cube_models";

drop view if exists "public"."v_user_stats";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.approve_submission(p_submission_id bigint)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$declare
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
			v_cube_id := public.copy_cube_submission(p_submission_id);

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
      v_notification_link := '/explore/cubes/' || v_cube_slug;
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
end;$function$
;

CREATE OR REPLACE FUNCTION public.notify_discord_new_cube_model()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$declare payload jsonb;

begin payload := jsonb_build_object(
  'name',
  new.name,
  'image_url',
  new.image_url,
  'slug',
  new.slug,
  'submitted_by',
  (select display_name
  from public.profiles
  where new.submitted_by_id = user_id)
);

perform net.http_post (
  url := 'https://spsqaktodgqnqbkgilxp.supabase.co/functions/v1/discord-new-cubes-notification'::text,
  headers := json_build_object('Content-Type', 'application/json')::jsonb,
  body := payload::jsonb
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
          WHERE ((uc.cube = cm.slug) AND (uc.status = 'Owned'::public.user_cube_status))) AS owned_count,
    ( SELECT count(*) AS count
           FROM public.user_cubes uc
          WHERE ((uc.cube = cm.slug) AND (uc.status = 'Wishlist'::public.user_cube_status))) AS wishlist_count,
    ( SELECT count(*) AS count
           FROM public.user_cubes uc
          WHERE ((uc.cube = cm.slug) AND (uc.status = 'Lost'::public.user_cube_status))) AS previously_owned_count,
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
          WHERE (ucr.cube_slug = cm.slug)) AS rating,
    ( SELECT count(ucr.rating) AS count
           FROM public.user_cube_ratings ucr
          WHERE (ucr.cube_slug = cm.slug)) AS rating_count
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



