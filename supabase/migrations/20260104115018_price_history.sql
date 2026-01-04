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



