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


create or replace view "public"."v_detailed_awards_nominee" as  SELECT an.id,
    an.category_id,
    an.cube_id,
    an.created_at,
    count(auv.id) AS vote_count
   FROM (public.awards_nominee an
     LEFT JOIN public.awards_user_vote auv ON ((auv.nominee_id = an.id)))
  GROUP BY an.id;



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



