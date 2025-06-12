drop trigger if exists "on_cube_model_insert" on "public"."cube_models";

drop trigger if exists "trg_insert_user_achievement" on "public"."profiles";

drop policy "Enable read access for all users" on "public"."user_roles";

revoke delete on table "public"."user_roles" from "anon";

revoke insert on table "public"."user_roles" from "anon";

revoke references on table "public"."user_roles" from "anon";

revoke select on table "public"."user_roles" from "anon";

revoke trigger on table "public"."user_roles" from "anon";

revoke truncate on table "public"."user_roles" from "anon";

revoke update on table "public"."user_roles" from "anon";

revoke delete on table "public"."user_roles" from "authenticated";

revoke insert on table "public"."user_roles" from "authenticated";

revoke references on table "public"."user_roles" from "authenticated";

revoke select on table "public"."user_roles" from "authenticated";

revoke trigger on table "public"."user_roles" from "authenticated";

revoke truncate on table "public"."user_roles" from "authenticated";

revoke update on table "public"."user_roles" from "authenticated";

revoke delete on table "public"."user_roles" from "service_role";

revoke insert on table "public"."user_roles" from "service_role";

revoke references on table "public"."user_roles" from "service_role";

revoke select on table "public"."user_roles" from "service_role";

revoke trigger on table "public"."user_roles" from "service_role";

revoke truncate on table "public"."user_roles" from "service_role";

revoke update on table "public"."user_roles" from "service_role";

alter table "public"."profiles" drop constraint "profiles_user_id_fkey";

alter table "public"."user_roles" drop constraint "user_roles_user_fkey";

drop function if exists "public"."notify_discord_new_cube_model"();

alter table "public"."user_roles" drop constraint "user_roles_pkey";

drop index if exists "public"."user_roles_pkey";

drop table "public"."user_roles";

alter table "public"."profiles" alter column "user_id" drop default;

CREATE TRIGGER trg_insert_user_achievement AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION insert_user_achievement();
ALTER TABLE "public"."profiles" DISABLE TRIGGER "trg_insert_user_achievement";


