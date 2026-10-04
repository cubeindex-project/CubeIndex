drop policy "Enable insert for authenticated users if the event is active" on "public"."awards_user_vote";

drop view if exists "public"."v_awards_category_winners";

alter table "public"."awards_nominee" drop column "extra_info";

create or replace view "public"."v_detailed_awards_category" as  SELECT ac.id,
    ac.event_id,
    ac.name,
    ac.description,
    ac.created_at,
    ac.slug,
    count(auv.id) AS total_votes
   FROM (public.awards_category ac
     LEFT JOIN public.awards_user_vote auv ON ((auv.category_id = ac.id)))
  GROUP BY ac.id;


create or replace view "public"."v_detailed_awards_nominee" as  WITH nominee_votes AS (
         SELECT an.id,
            an.created_at,
            an.category_id,
            an.cube_id,
            count(auv.id) AS vote_count
           FROM (public.awards_nominee an
             LEFT JOIN public.awards_user_vote auv ON ((auv.nominee_id = an.id)))
          GROUP BY an.id, an.category_id, an.cube_id
        ), ranked_nominees AS (
         SELECT nv.id,
            nv.created_at,
            nv.category_id,
            nv.cube_id,
            nv.vote_count,
            dense_rank() OVER (PARTITION BY nv.category_id ORDER BY nv.vote_count DESC) AS rank
           FROM nominee_votes nv
        )
 SELECT rn.id,
    rn.category_id,
    rn.cube_id,
    rn.created_at,
    rn.vote_count,
    rn.rank,
    ((rn.rank = 1) AND (rn.vote_count > 0)) AS winner,
    ac.event_id
   FROM (ranked_nominees rn
     LEFT JOIN public.awards_category ac ON ((ac.id = rn.category_id)))
  GROUP BY rn.id, rn.category_id, rn.cube_id, rn.created_at, rn.vote_count, rn.rank, ac.event_id;



  create policy "Enable insert for authenticated users if the event is active"
  on "public"."awards_user_vote"
  as permissive
  for insert
  to authenticated
with check (((auth.uid() = user_id) AND (EXISTS ( SELECT 1
   FROM ((public.awards_nominee n
     JOIN public.awards_category c ON ((c.id = n.category_id)))
     JOIN public.awards_event ae ON ((ae.id = c.event_id)))
  WHERE ((n.id = awards_user_vote.nominee_id) AND (c.id = awards_user_vote.category_id) AND (now() >= ae.start_at) AND (now() <= ae.end_at))))));



