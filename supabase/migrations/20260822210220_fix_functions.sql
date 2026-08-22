set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.is_database_manager()
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
begin
  return EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = (SELECT auth.uid())) AND (p.role = ANY (ARRAY['Admin'::public.users_roles, 'Database Manager'::public.users_roles]))));
end;
$function$
;

CREATE OR REPLACE FUNCTION public.slugify(value text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE STRICT
AS $function$
  -- removes accents (diacritic signs) from a given string --
  WITH "unaccented" AS (
    SELECT extensions.unaccent("value") AS "value"
  ),
  -- lowercases the string
  "lowercase" AS (
    SELECT lower("value") AS "value"
    FROM "unaccented"
  ),
  -- remove single and double quotes
  "removed_quotes" AS (
    SELECT regexp_replace("value", '[''"]+', '', 'gi') AS "value"
    FROM "lowercase"
  ),
  -- replaces anything that's not a letter, number, hyphen('-'), or underscore('_') with a hyphen('-')
  "hyphenated" AS (
    SELECT regexp_replace("value", '[^a-z0-9\\-_]+', '-', 'gi') AS "value"
    FROM "removed_quotes"
  ),
  -- trims hyphens('-') if they exist on the head or tail of the string
  "trimmed" AS (
    SELECT regexp_replace(regexp_replace("value", '\-+$', ''), '^\-', '') AS "value"
    FROM "hyphenated"
  )
  SELECT "value" FROM "trimmed";
$function$
;
