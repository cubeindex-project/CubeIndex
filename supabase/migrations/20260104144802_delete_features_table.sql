drop policy "Enable read access for all users" on "public"."features";

revoke delete on table "public"."features" from "anon";

revoke insert on table "public"."features" from "anon";

revoke references on table "public"."features" from "anon";

revoke select on table "public"."features" from "anon";

revoke trigger on table "public"."features" from "anon";

revoke truncate on table "public"."features" from "anon";

revoke update on table "public"."features" from "anon";

revoke delete on table "public"."features" from "authenticated";

revoke insert on table "public"."features" from "authenticated";

revoke references on table "public"."features" from "authenticated";

revoke select on table "public"."features" from "authenticated";

revoke trigger on table "public"."features" from "authenticated";

revoke truncate on table "public"."features" from "authenticated";

revoke update on table "public"."features" from "authenticated";

revoke delete on table "public"."features" from "service_role";

revoke insert on table "public"."features" from "service_role";

revoke references on table "public"."features" from "service_role";

revoke select on table "public"."features" from "service_role";

revoke trigger on table "public"."features" from "service_role";

revoke truncate on table "public"."features" from "service_role";

revoke update on table "public"."features" from "service_role";

alter table "public"."features" drop constraint "features_title_key";

alter table "public"."features" drop constraint "features_pkey";

drop index if exists "public"."features_pkey";

drop index if exists "public"."features_title_key";

drop table "public"."features";


