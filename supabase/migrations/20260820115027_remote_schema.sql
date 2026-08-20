drop trigger if exists "trg_staff_logs_table_rules" on "public"."staff_logs";

alter table "public"."staff_logs" drop constraint "staff_logs_staff_id_fkey";

drop view if exists "public"."v_detailed_vendors";

alter table "public"."vendors" alter column "currency" drop default;

alter type "public"."currencies" rename to "currencies__old_version_to_be_dropped";

create type "public"."currencies" as enum ('USD', 'GBP', 'EUR', 'ETB', 'AED', 'RON', 'INR', 'RUB', 'TRY', 'VES', 'XAF', 'XOF', 'ZAR', 'PLN', 'MXN', 'BRL', 'CAD', 'CHF', 'NOK', 'JPY');

alter table "public"."vendors" alter column currency type "public"."currencies" using currency::text::"public"."currencies";

alter table "public"."vendors" alter column "currency" set default 'USD'::public.currencies;

drop type "public"."currencies__old_version_to_be_dropped";

alter table "public"."staff_logs" alter column "staff_id" set default '898d0e3a-3465-4c25-9b9f-b498b9884d1d'::uuid;

alter table "public"."staff_logs" add constraint "staff_logs_staff_id_fkey" FOREIGN KEY (staff_id) REFERENCES public.profiles(user_id) ON UPDATE CASCADE ON DELETE SET DEFAULT not valid;

alter table "public"."staff_logs" validate constraint "staff_logs_staff_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.staff_logs_table_rules()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$begin if tg_op = 'UPDATE' then IF (to_jsonb(OLD) - 'staff_id') is distinct from (to_jsonb(NEW) - 'staff_id') then RAISE EXCEPTION 'Update on staff log fields other than staff_id is restricted';

end IF;

end if;

return new;

end;$function$
;

create or replace view "public"."v_detailed_vendors" as  SELECT v.id,
    v.slug,
    v.created_at,
    v.name,
    v.base_url,
    v.country_iso,
    v.updated_at,
    v.is_active,
    v.rating,
    v.logo_url,
    v.currency,
    v.sponsored,
    v.verified,
    ( SELECT count(DISTINCT uc.user_id) AS count
           FROM public.user_cubes uc
          WHERE (uc.bought_from = v.slug)) AS buyer_count
   FROM public.vendors v;


CREATE TRIGGER trg_staff_logs_table_rules BEFORE INSERT OR DELETE OR UPDATE ON public.staff_logs FOR EACH ROW EXECUTE FUNCTION public.staff_logs_table_rules();


