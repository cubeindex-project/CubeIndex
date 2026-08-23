drop trigger if exists "trig_awards_user_vote_achi_check" on "public"."awards_user_vote";

drop trigger if exists "trg_user_cube_ratings_achi_check" on "public"."user_cube_ratings";

drop trigger if exists "trg_user_cubes_achi_check" on "public"."user_cubes";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.user_cubes_table_rules()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin if (
  select
    verified
  from
    profiles p
  where
    p.user_id = new.user_id
) = false then raise exception 'Only verified users can add cubes to their collection';
end if;

return new;

end;$function$
;

CREATE TRIGGER trig_awards_user_vote_achi_check AFTER INSERT ON public.awards_user_vote FOR EACH ROW EXECUTE FUNCTION public.awards_user_vote_achi_check();
ALTER TABLE "public"."awards_user_vote" DISABLE TRIGGER "trig_awards_user_vote_achi_check";

CREATE TRIGGER trg_user_cube_ratings_achi_check AFTER INSERT OR UPDATE ON public.user_cube_ratings FOR EACH ROW EXECUTE FUNCTION public.user_cube_ratings_achi_check();
ALTER TABLE "public"."user_cube_ratings" DISABLE TRIGGER "trg_user_cube_ratings_achi_check";

CREATE TRIGGER trg_user_cubes_achi_check AFTER INSERT OR UPDATE ON public.user_cubes FOR EACH ROW EXECUTE FUNCTION public.user_cubes_achi_check();
ALTER TABLE "public"."user_cubes" DISABLE TRIGGER "trg_user_cubes_achi_check";


