drop policy "Admin and Database Managers can see all rows" on "public"."cube_submissions";

drop policy "Admins and Database Managers can select submissions" on "public"."submissions";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.is_database_manager()
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
begin
  return EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.user_id = (SELECT auth.uid())) AND (p.role = ANY (ARRAY['Admin'::users_roles, 'Database Manager'::users_roles]))));
end;
$function$
;


  create policy "Admin and Database Manager can see all rows"
  on "public"."cube_submission_features"
  as permissive
  for select
  to authenticated
using (public.is_database_manager());



  create policy "Admin and Database Managers can see all rows"
  on "public"."cube_vendor_link_submissions"
  as permissive
  for select
  to authenticated
using (public.is_database_manager());



  create policy "Admin and Database Managers can see all rows"
  on "public"."cube_submissions"
  as permissive
  for select
  to authenticated
using (public.is_database_manager());



  create policy "Admins and Database Managers can select submissions"
  on "public"."submissions"
  as permissive
  for select
  to authenticated
using (public.is_database_manager());
