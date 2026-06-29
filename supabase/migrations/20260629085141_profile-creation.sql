alter table "public"."brands" drop constraint "brands_added_by_id_fkey";

alter table "public"."cube_models" drop constraint "cube_models_verified_by_id_fkey";

alter table "public"."brands" alter column "added_by_id" set default '898d0e3a-3465-4c25-9b9f-b498b9884d1d'::uuid;

alter table "public"."cube_models" alter column "verified_by_id" set default '898d0e3a-3465-4c25-9b9f-b498b9884d1d'::uuid;

alter table "public"."profiles" alter column "display_name" set not null;

alter table "public"."profiles" alter column "username" set not null;

alter table "public"."profiles" add constraint "profiles_display_name_check" CHECK ((length(display_name) > 3)) not valid;

alter table "public"."profiles" validate constraint "profiles_display_name_check";

alter table "public"."brands" add constraint "brands_added_by_id_fkey" FOREIGN KEY (added_by_id) REFERENCES public.profiles(user_id) ON UPDATE CASCADE ON DELETE SET DEFAULT not valid;

alter table "public"."brands" validate constraint "brands_added_by_id_fkey";

alter table "public"."cube_models" add constraint "cube_models_verified_by_id_fkey" FOREIGN KEY (verified_by_id) REFERENCES public.profiles(user_id) ON UPDATE CASCADE ON DELETE SET DEFAULT not valid;

alter table "public"."cube_models" validate constraint "cube_models_verified_by_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  insert into public.profiles (user_id, display_name, username, profile_picture)
  values (new.id, 'Username', concat('user_', replace(new.id::text, '-', '')), COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      NEW.raw_user_meta_data->>'avatar',
      ''
    ));
  return new;
end;
$function$
;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
