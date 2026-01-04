drop policy "Enable users to view their own data only" on "public"."awards_user_vote";

drop view if exists "public"."v_awards_category_winners";

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



  create policy "Enable read access for all users"
  on "public"."awards_user_vote"
  as permissive
  for select
  to public
using (true);



