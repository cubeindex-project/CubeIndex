

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."accessories_categories" AS ENUM (
    'Timer',
    'Mat',
    'Lube',
    'Storage',
    'Keychain',
    'Charging pod',
    'Bag',
    'Stand'
);


ALTER TYPE "public"."accessories_categories" OWNER TO "postgres";


CREATE TYPE "public"."achievements_categories" AS ENUM (
    'Website',
    'Quantity'
);


ALTER TYPE "public"."achievements_categories" OWNER TO "postgres";


CREATE TYPE "public"."badge-rarity" AS ENUM (
    'Special',
    'Legendary',
    'Mythic',
    'Epic',
    'Rare',
    'Common'
);


ALTER TYPE "public"."badge-rarity" OWNER TO "postgres";


CREATE TYPE "public"."cube_surface_finish" AS ENUM (
    'Matte',
    'Frosted',
    'UV Coated',
    'Glossy',
    'Sculpted'
);


ALTER TYPE "public"."cube_surface_finish" OWNER TO "postgres";


CREATE TYPE "public"."cube_surface_finishes" AS ENUM (
    'Frosted',
    'UV Coated',
    'Glossy',
    'Sculpted'
);


ALTER TYPE "public"."cube_surface_finishes" OWNER TO "postgres";


CREATE TYPE "public"."cube_version_type" AS ENUM (
    'Base',
    'Trim',
    'Limited'
);


ALTER TYPE "public"."cube_version_type" OWNER TO "postgres";


CREATE TYPE "public"."cubes_subtypes" AS ENUM (
    'NxNxN',
    'Square-N',
    'Minx',
    'Shape-Shifting',
    'Cuboid',
    'Non-Twisty',
    'Corner-Turning',
    'Gear',
    'Other'
);


ALTER TYPE "public"."cubes_subtypes" OWNER TO "postgres";


CREATE TYPE "public"."cubes_subtypes__old_version_to_be_dropped" AS ENUM (
    'NxNxN',
    'Square-N',
    'Minx',
    'Shape-Shifting',
    'Cuboid',
    'Non-Twisty',
    'Corner-Turning'
);


ALTER TYPE "public"."cubes_subtypes__old_version_to_be_dropped" OWNER TO "postgres";


CREATE TYPE "public"."disclaimer_purpose" AS ENUM (
    'legal',
    'maintenance',
    'announcement',
    'warning',
    'alert',
    'promo',
    'info',
    'update'
);


ALTER TYPE "public"."disclaimer_purpose" OWNER TO "postgres";


CREATE TYPE "public"."rating_categories" AS ENUM (
    'cube',
    'accessory'
);


ALTER TYPE "public"."rating_categories" OWNER TO "postgres";


CREATE TYPE "public"."report_types" AS ENUM (
    'user',
    'cube',
    'cube-rating',
    'website'
);


ALTER TYPE "public"."report_types" OWNER TO "postgres";


CREATE TYPE "public"."staff_actions" AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE'
);


ALTER TYPE "public"."staff_actions" OWNER TO "postgres";


CREATE TYPE "public"."submission_status" AS ENUM (
    'Approved',
    'Rejected',
    'Pending'
);


ALTER TYPE "public"."submission_status" OWNER TO "postgres";


CREATE TYPE "public"."user_cube_condition" AS ENUM (
    'New in box',
    'New',
    'Good',
    'Fair',
    'Worn',
    'Poor',
    'Broken'
);


ALTER TYPE "public"."user_cube_condition" OWNER TO "postgres";


CREATE TYPE "public"."user_cube_status" AS ENUM (
    'Owned',
    'Wishlist',
    'Loaned',
    'Borrowed',
    'Lost'
);


ALTER TYPE "public"."user_cube_status" OWNER TO "postgres";


CREATE TYPE "public"."users_roles" AS ENUM (
    'Admin',
    'Moderator',
    'Lead Developer',
    'Community Manager',
    'Database Manager',
    'User'
);


ALTER TYPE "public"."users_roles" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."due_vendor_links_capped"("p_limit" integer DEFAULT 100, "p_per_vendor" integer DEFAULT 40, "p_backoff_cap" integer DEFAULT 4, "p_base" interval DEFAULT '12:00:00'::interval) RETURNS TABLE("id" bigint, "url" "text", "vendor_name" "text", "cube_slug" "text", "price" numeric, "available" boolean, "updated_at" timestamp with time zone, "streak_unchanged" integer)
    LANGUAGE "sql" STABLE
    AS $$with base as (
    select *,
      (p_base * power(2, least(streak_unchanged, p_backoff_cap))) as effective_cooldown
    from cube_vendor_links
  ),
  ranked as (
    select
      id, url, vendor_name, cube_slug, price, available, updated_at,
      streak_unchanged,
      row_number() over (partition by vendor_name order by updated_at asc) as rn
    from base
    where (now() at time zone 'utc') - updated_at >= effective_cooldown
  )
  select id,url,vendor_name,cube_slug,price,available,updated_at,streak_unchanged
  from ranked
  where rn <= p_per_vendor
  order by updated_at asc
  limit p_limit;$$;


ALTER FUNCTION "public"."due_vendor_links_capped"("p_limit" integer, "p_per_vendor" integer, "p_backoff_cap" integer, "p_base" interval) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."first_impressions_achi_check"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$declare rating_count int;

begin
select
  count(*) into rating_count
from
  public.user_cube_ratings
where
  user_id = new.user_id;

if rating_count < 5 then return new;

end if;

insert into
  public.user_achievements (user_id, achievement)
values
  (new.user_id, 'First Impressions')
on conflict do nothing;

return new;

end$$;


ALTER FUNCTION "public"."first_impressions_achi_check"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_types"("enum_type" "text") RETURNS "json"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  json_data json;
  text_query text;
BEGIN 
  text_query := format (
    'SELECT array_to_json(enum_range(NULL::%s))',
    enum_type
  );

  EXECUTE text_query INTO json_data;

  RETURN json_data;
END 
$$;


ALTER FUNCTION "public"."get_types"("enum_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."insert_user_achievement"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN
  INSERT INTO user_achievements (username, achievement, awarded_by)
  VALUES (NEW.username, 'Early Collector', 'CubeIndex');
  RETURN NEW;
END;$$;


ALTER FUNCTION "public"."insert_user_achievement"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_data_changes"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$declare
  jwt_sub text;
  actor uuid;
begin
  jwt_sub := current_setting('request.jwt.claim.sub', true);
  if jwt_sub is not null and jwt_sub <> '' then
    actor := jwt_sub::uuid;
  else
    actor := '898d0e3a-3465-4c25-9b9f-b498b9884d1d'::uuid; -- system user
  end if;

if (tg_op = 'INSERT') then
insert into
  public.staff_logs (staff_id, action, target_table, old_data, new_data)
values
  (
    actor,
    TG_OP::public.staff_actions,
    TG_TABLE_NAME,
    null,
    to_jsonb(NEW)
  );

return new;

elsif (tg_op = 'UPDATE') then if to_jsonb(OLD) <> to_jsonb(NEW) then
insert into
  public.staff_logs (staff_id, action, target_table, old_data, new_data)
values
  (
    actor,
    TG_OP::public.staff_actions,
    TG_TABLE_NAME,
    to_jsonb(OLD),
    to_jsonb(NEW)
  );

end if;

return new;

elsif (tg_op = 'DELETE') then
insert into
  public.staff_logs (staff_id, action, target_table, old_data, new_data)
values
  (
    actor,
    TG_OP::public.staff_actions,
    TG_TABLE_NAME,
    to_jsonb(OLD),
    null
  );

return new;

else return null;

end if;

end;$$;


ALTER FUNCTION "public"."log_data_changes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_discord_new_cube_model"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$declare payload jsonb;

begin payload := jsonb_build_object(
  'version_type',
  new.version_type,
  'version_name',
  new.version_name,
  'series',
  new.series,
  'model',
  new.model,
  'brand',
  new.brand,
  'image_url',
  new.image_url,
  'slug',
  new.slug,
  'submitted_by',
  (select display_name
  from profiles
  where new.submitted_by_id = user_id),
  'type',
  new."type",
  'weight',
  new.weight,
  'size',
  new.size,
  'smart',
  exists (
    select
      1
    from
      cubes_model_features mf
    where
      mf.cube = NEW.slug
      and mf.feature = 'smart'
  ),
  'magnetic',
  exists (
    select
      1
    from
      cubes_model_features mf
    where
      mf.cube = NEW.slug
      and mf.feature = 'magnetic'
  ),
  'wca_legal',
  exists (
    select
      1
    from
      cubes_model_features mf
    where
      mf.cube = NEW.slug
      and mf.feature = 'wca_legal'
  ),
  'status',
  new.status,
  'old_status',
  case
    when TG_OP = 'UPDATE' then OLD.status
    else null
  end
);

perform net.http_post (
  url := 'https://spsqaktodgqnqbkgilxp.supabase.co/functions/v1/discord-new-cubes-notification'::text,
  headers := json_build_object('Content-Type', 'application/json')::jsonb,
  body := payload::jsonb
);

return new;

end;$$;


ALTER FUNCTION "public"."notify_discord_new_cube_model"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_discord_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$declare payload jsonb;

begin payload := json_build_object(
  'id',
  new.id,
  'username',
  new.username,
  'display_name',
  new.display_name
);

perform net.http_post(
  url:='https://spsqaktodgqnqbkgilxp.supabase.co/functions/v1/discord-new-users-notification'::text,
  headers:=json_build_object('Content-Type', 'application/json')::jsonb,
  body:=payload::jsonb
);

return new;

end;$$;


ALTER FUNCTION "public"."notify_discord_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_discord_new_user_report"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$declare payload jsonb;

begin payload := jsonb_build_object(
  'report_type',
  new.report_type,
  'id',
  new.id,
  'title',
  new.title,
  'created_at',
  new.created_at,
  'reported',
  new.reported,
  'image_url',
  new.image_url,
  'reporter',
  (select p.username
  from profiles as p
  where p.user_id = new.reporter),
  'comment',
  new.comment
);

perform net.http_post (
  url := 'https://spsqaktodgqnqbkgilxp.supabase.co/functions/v1/user-report-discord-notification'::text,
  headers := json_build_object('Content-Type', 'application/json')::jsonb,
  body := payload::jsonb
);

return new;

end;$$;


ALTER FUNCTION "public"."notify_discord_new_user_report"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."save_cube_vendor_links_snapshots"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$begin IF TG_OP in ('INSERT', 'UPDATE') then
insert into
  public.cube_vendor_links_snapshot (
    cube_slug,
    vendor_name,
    url,
    available,
    price
  )
values
  (
    NEW.cube_slug,
    NEW.vendor_name,
    NEW.url,
    NEW.available,
    NEW.price
  );

RETURN NEW;

ELSIF TG_OP = 'DELETE' then
delete from public.cube_vendor_links_snapshot
where
  cube_slug = OLD.cube_slug
  and vendor_name = OLD.vendor_name
  and url = OLD.url;

RETURN OLD;

end IF;

RETURN null;

end;$$;


ALTER FUNCTION "public"."save_cube_vendor_links_snapshots"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_average_cube_rating"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$DECLARE
  target_slug text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_slug := OLD.cube_slug;
  ELSE
    target_slug := NEW.cube_slug;
  END IF;

  UPDATE cube_models
  SET rating = (
    SELECT ROUND(AVG(rating)::numeric, 2)
    FROM user_cube_ratings
    WHERE cube_slug = target_slug
  )
  WHERE slug = target_slug;

    RETURN NEW;
END;$$;


ALTER FUNCTION "public"."update_average_cube_rating"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_cube_average_rating"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN
  UPDATE cube_models
  SET rating = (
    SELECT ROUND(AVG(rating)::numeric, 2)
    FROM user_ratings
    WHERE cube_slug = NEW.cube_slug
  )
  WHERE slug = NEW.cube_slug;

  RETURN NEW;
END;$$;


ALTER FUNCTION "public"."update_cube_average_rating"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_password"("current_plain_password" "text", "new_plain_password" "text", "current_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE encpass auth.users.encrypted_password %TYPE;
BEGIN
SELECT encrypted_password
FROM auth.users INTO encpass
WHERE id = current_id
  AND encrypted_password = crypt(
    current_plain_password,
    auth.users.encrypted_password
  );

IF encpass IS NULL THEN RETURN 'incorrect';
ELSE
UPDATE auth.users
SET encrypted_password = crypt(new_plain_password, gen_salt('bf'))
WHERE id = current_id;
RETURN 'success';
END IF;
END;
$$;


ALTER FUNCTION "public"."update_password"("current_plain_password" "text", "new_plain_password" "text", "current_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."achievements" (
    "id" smallint NOT NULL,
    "name" "text" NOT NULL,
    "icon" "text" NOT NULL,
    "description" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "unlockable" boolean DEFAULT false NOT NULL,
    "slug" "text" DEFAULT ''::"text" NOT NULL,
    "unlock_method" "text" DEFAULT '''Manual''::text'::"text" NOT NULL,
    "rarity" "public"."badge-rarity" DEFAULT 'Common'::"public"."badge-rarity" NOT NULL,
    "category" "public"."achievements_categories",
    "title" "text",
    "evolutive" boolean DEFAULT false NOT NULL,
    "evolves_from" "text",
    "submitted_by_id" "uuid" DEFAULT '898d0e3a-3465-4c25-9b9f-b498b9884d1d'::"uuid" NOT NULL,
    CONSTRAINT "achievements_unlock_method_check" CHECK (("unlock_method" = ANY (ARRAY['Automatic'::"text", 'Manual'::"text"])))
);


ALTER TABLE "public"."achievements" OWNER TO "postgres";


COMMENT ON TABLE "public"."achievements" IS 'All available badges';



ALTER TABLE "public"."achievements" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."Badges_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."accessories" (
    "release_date" "date" NOT NULL,
    "brand" "text" DEFAULT ''::"text",
    "image_url" "text",
    "name" "text" NOT NULL,
    "rating" real DEFAULT '0'::real,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "approved" boolean DEFAULT false NOT NULL,
    "discontinued" boolean DEFAULT false NOT NULL,
    "id" integer NOT NULL,
    "slug" "text" NOT NULL,
    "category" "public"."accessories_categories",
    "compatibility" "text"
);


ALTER TABLE "public"."accessories" OWNER TO "postgres";


ALTER TABLE "public"."accessories" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."accessories_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."announcement" (
    "id" bigint NOT NULL,
    "message" "text" NOT NULL,
    "icon" "text" DEFAULT ''::"text",
    "purpose" "public"."disclaimer_purpose" DEFAULT 'info'::"public"."disclaimer_purpose" NOT NULL,
    "link" "text",
    "title" "text" NOT NULL,
    "linkText" "text" DEFAULT ''::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "archived" boolean DEFAULT false NOT NULL,
    "published_by_id" "uuid" DEFAULT "auth"."uid"()
);


ALTER TABLE "public"."announcement" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."brands" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" DEFAULT ''::"text" NOT NULL,
    "added_by_id" "uuid"
);


ALTER TABLE "public"."brands" OWNER TO "postgres";


ALTER TABLE "public"."brands" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."brands_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."cube_features" (
    "id" bigint NOT NULL,
    "code" "text" NOT NULL,
    "label" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."cube_features" OWNER TO "postgres";


ALTER TABLE "public"."cube_features" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."cube_features_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."cube_models" (
    "brand" "text" DEFAULT ''::"text" NOT NULL,
    "image_url" "text" NOT NULL,
    "model" "text" NOT NULL,
    "rating" real DEFAULT '0'::real,
    "slug" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "type" "text" NOT NULL,
    "discontinued" boolean DEFAULT false NOT NULL,
    "release_date" "date",
    "series" "text" DEFAULT ''::"text",
    "id" bigint NOT NULL,
    "sub_type" "public"."cubes_subtypes",
    "weight" real NOT NULL,
    "related_to" "text",
    "version_type" "public"."cube_version_type" DEFAULT 'Base'::"public"."cube_version_type" NOT NULL,
    "version_name" "text" DEFAULT ''::"text",
    "status" "public"."submission_status" DEFAULT 'Pending'::"public"."submission_status" NOT NULL,
    "notes" "text",
    "surface_finish" "public"."cube_surface_finishes",
    "verified_at" timestamp with time zone,
    "size" "text",
    "submitted_by_id" "uuid" DEFAULT '898d0e3a-3465-4c25-9b9f-b498b9884d1d'::"uuid" NOT NULL,
    "verified_by_id" "uuid",
    CONSTRAINT "cube_models_size_new_check" CHECK (("size" ~ '^[0-9]+(\.[0-9]+)?\sx\s[0-9]+(\.[0-9]+)?\sx\s[0-9]+(\.[0-9]+)?$'::"text"))
);


ALTER TABLE "public"."cube_models" OWNER TO "postgres";


COMMENT ON TABLE "public"."cube_models" IS 'All the cubes in the explore tab';



ALTER TABLE "public"."cube_models" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."cube_models_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."cube_types" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "popularity" bigint DEFAULT '0'::bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "shape_family" "text" DEFAULT ''::"text" NOT NULL,
    "added_by_id" "uuid"
);


ALTER TABLE "public"."cube_types" OWNER TO "postgres";


ALTER TABLE "public"."cube_types" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."cube_types_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."cube_vendor_links" (
    "vendor_name" "text" NOT NULL,
    "url" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "id" bigint NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "available" boolean DEFAULT true NOT NULL,
    "cube_slug" "text" NOT NULL,
    "price" double precision DEFAULT '0'::double precision NOT NULL,
    "etag" "text",
    "last_modified" timestamp with time zone DEFAULT "now"() NOT NULL,
    "streak_unchanged" bigint DEFAULT '0'::bigint NOT NULL
);


ALTER TABLE "public"."cube_vendor_links" OWNER TO "postgres";


COMMENT ON TABLE "public"."cube_vendor_links" IS 'This is a duplicate of cube_vendor_links';



ALTER TABLE "public"."cube_vendor_links" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."cube_vendor_links_duplicate_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."cube_vendor_links_snapshot" (
    "vendor_name" "text" NOT NULL,
    "url" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "id" bigint NOT NULL,
    "available" boolean DEFAULT true NOT NULL,
    "cube_slug" "text" NOT NULL,
    "price" double precision DEFAULT '0'::double precision NOT NULL
);


ALTER TABLE "public"."cube_vendor_links_snapshot" OWNER TO "postgres";


ALTER TABLE "public"."cube_vendor_links_snapshot" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."cube_vendor_links_snapshot_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."cubes_model_features" (
    "id" bigint NOT NULL,
    "cube" "text" DEFAULT ''::"text" NOT NULL,
    "feature" "text" DEFAULT ''::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."cubes_model_features" OWNER TO "postgres";


ALTER TABLE "public"."cubes_model_features" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."cubes_model_features_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."announcement" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."disclaimer_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."helpful_rating" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "rating" bigint NOT NULL,
    "rating_category" "public"."rating_categories" NOT NULL,
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."helpful_rating" OWNER TO "postgres";


ALTER TABLE "public"."helpful_rating" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."helpful_rating_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "username" "text" NOT NULL,
    "private" boolean DEFAULT false NOT NULL,
    "profile_picture" "text" DEFAULT ''::"text",
    "bio" "text",
    "socials" "jsonb" DEFAULT '{}'::"jsonb",
    "banner" "text",
    "verified" boolean DEFAULT false NOT NULL,
    "certified" boolean DEFAULT false NOT NULL,
    "role" "public"."users_roles" DEFAULT 'User'::"public"."users_roles" NOT NULL,
    "display_name" "text",
    CONSTRAINT "profiles_username_check" CHECK (("username" ~ '^[a-z0-9._]{3,}$'::"text"))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


ALTER TABLE "public"."profiles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."profiles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."reports" (
    "id" bigint NOT NULL,
    "reported" "text" NOT NULL,
    "report_type" "public"."report_types" NOT NULL,
    "comment" "text" DEFAULT ''::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "reporter" "uuid" NOT NULL,
    "title" "text" DEFAULT ''::"text" NOT NULL,
    "image_url" "text",
    "resolved" boolean DEFAULT false NOT NULL,
    "resolved_by" "uuid"
);


ALTER TABLE "public"."reports" OWNER TO "postgres";


ALTER TABLE "public"."reports" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."reports_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."staff_logs" (
    "id" bigint NOT NULL,
    "action" "public"."staff_actions" NOT NULL,
    "target_table" "text" NOT NULL,
    "old_data" "jsonb",
    "new_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "staff_id" "uuid" NOT NULL
);


ALTER TABLE "public"."staff_logs" OWNER TO "postgres";


ALTER TABLE "public"."staff_logs" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."staff_logs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_achievements" (
    "achievement" "text" NOT NULL,
    "awarded_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "awarded_by_id" "uuid" DEFAULT '898d0e3a-3465-4c25-9b9f-b498b9884d1d'::"uuid" NOT NULL,
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."user_achievements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_cube_ratings" (
    "cube_slug" "text" NOT NULL,
    "rating" double precision NOT NULL,
    "comment" "text" DEFAULT ''::"text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    CONSTRAINT "user_ratings_rating_check" CHECK ((("rating" >= (0.5)::double precision) AND ("rating" <= (5)::double precision)))
);


ALTER TABLE "public"."user_cube_ratings" OWNER TO "postgres";


ALTER TABLE "public"."user_cube_ratings" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_cube_ratings_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_cubes" (
    "cube" "text" NOT NULL,
    "main" boolean DEFAULT false NOT NULL,
    "quantity" bigint DEFAULT '1'::bigint NOT NULL,
    "condition" "public"."user_cube_condition" NOT NULL,
    "status" "public"."user_cube_status" NOT NULL,
    "notes" "text" DEFAULT ''::"text",
    "modified_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "acquired_at" "date",
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."user_cubes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_follows" (
    "id" bigint NOT NULL,
    "follower_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "following_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "followed_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_follows" OWNER TO "postgres";


ALTER TABLE "public"."user_follows" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_follows_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."vendors" (
    "id" bigint NOT NULL,
    "slug" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "base_url" "text" NOT NULL,
    "country_iso" "text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "rating" real DEFAULT '0'::real NOT NULL,
    "logo_url" "text",
    "currency" "text" DEFAULT 'USD'::"text" NOT NULL,
    "sponsored" boolean DEFAULT false NOT NULL,
    "supports_price_tracking" boolean DEFAULT false NOT NULL,
    "verified" boolean DEFAULT true NOT NULL,
    CONSTRAINT "vendors_base_url_check" CHECK (("base_url" ~ '^https?://'::"text")),
    CONSTRAINT "vendors_country_iso_check" CHECK (("length"("country_iso") <= 2)),
    CONSTRAINT "vendors_currency_check" CHECK (("length"("currency") <= 3))
);


ALTER TABLE "public"."vendors" OWNER TO "postgres";


ALTER TABLE "public"."vendors" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."vendors_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."achievements"
    ADD CONSTRAINT "Badges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."accessories"
    ADD CONSTRAINT "accessories_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."accessories"
    ADD CONSTRAINT "accessories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."accessories"
    ADD CONSTRAINT "accessories_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."achievements"
    ADD CONSTRAINT "achievements_evolves_from_key" UNIQUE ("evolves_from");



ALTER TABLE ONLY "public"."achievements"
    ADD CONSTRAINT "badges_description_key" UNIQUE ("description");



ALTER TABLE ONLY "public"."achievements"
    ADD CONSTRAINT "badges_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."achievements"
    ADD CONSTRAINT "badges_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cube_features"
    ADD CONSTRAINT "cube_features_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."cube_features"
    ADD CONSTRAINT "cube_features_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."accessories"
    ADD CONSTRAINT "cube_models_duplicate_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."cube_models"
    ADD CONSTRAINT "cube_models_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."cube_types"
    ADD CONSTRAINT "cube_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cube_types"
    ADD CONSTRAINT "cube_types_type_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."cube_vendor_links"
    ADD CONSTRAINT "cube_vendor_links_duplicate_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."cube_vendor_links"
    ADD CONSTRAINT "cube_vendor_links_duplicate_pkey" PRIMARY KEY ("cube_slug", "vendor_name");



ALTER TABLE ONLY "public"."cube_vendor_links_snapshot"
    ADD CONSTRAINT "cube_vendor_links_snapshot_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."cube_vendor_links_snapshot"
    ADD CONSTRAINT "cube_vendor_links_snapshot_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cubes_model_features"
    ADD CONSTRAINT "cubes_model_features_pkey" PRIMARY KEY ("id", "cube", "feature");



ALTER TABLE ONLY "public"."cube_models"
    ADD CONSTRAINT "cubes_name_id_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."cube_models"
    ADD CONSTRAINT "cubes_pkey" PRIMARY KEY ("slug");



ALTER TABLE ONLY "public"."announcement"
    ADD CONSTRAINT "disclaimer_message_key" UNIQUE ("message");



ALTER TABLE ONLY "public"."announcement"
    ADD CONSTRAINT "disclaimer_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."staff_logs"
    ADD CONSTRAINT "staff_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("achievement", "user_id");



ALTER TABLE ONLY "public"."user_cube_ratings"
    ADD CONSTRAINT "user_cube_ratings_pkey" PRIMARY KEY ("cube_slug", "user_id");



ALTER TABLE ONLY "public"."user_cubes"
    ADD CONSTRAINT "user_cubes_pkey" PRIMARY KEY ("cube", "user_id");



ALTER TABLE ONLY "public"."user_follows"
    ADD CONSTRAINT "user_follows_pkey" PRIMARY KEY ("follower_id", "following_id");



ALTER TABLE ONLY "public"."user_cube_ratings"
    ADD CONSTRAINT "user_ratings_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."vendors"
    ADD CONSTRAINT "vendors_base_url_key" UNIQUE ("base_url");



ALTER TABLE ONLY "public"."vendors"
    ADD CONSTRAINT "vendors_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."vendors"
    ADD CONSTRAINT "vendors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vendors"
    ADD CONSTRAINT "vendors_vendor_id_key" UNIQUE ("slug");



CREATE OR REPLACE TRIGGER "log_brands_insert" AFTER INSERT ON "public"."brands" FOR EACH ROW EXECUTE FUNCTION "public"."log_data_changes"();



CREATE OR REPLACE TRIGGER "log_cube_models" AFTER INSERT OR DELETE OR UPDATE ON "public"."cube_models" FOR EACH ROW EXECUTE FUNCTION "public"."log_data_changes"();



CREATE OR REPLACE TRIGGER "log_cube_types_insert" AFTER INSERT ON "public"."cube_types" FOR EACH ROW EXECUTE FUNCTION "public"."log_data_changes"();



CREATE OR REPLACE TRIGGER "log_vendors" AFTER INSERT OR UPDATE ON "public"."vendors" FOR EACH ROW EXECUTE FUNCTION "public"."log_data_changes"();



CREATE OR REPLACE TRIGGER "notify_discord_new_cube" AFTER INSERT OR UPDATE ON "public"."cube_models" FOR EACH ROW EXECUTE FUNCTION "public"."notify_discord_new_cube_model"();



CREATE OR REPLACE TRIGGER "notify_discord_new_user_report" AFTER INSERT ON "public"."reports" FOR EACH ROW EXECUTE FUNCTION "public"."notify_discord_new_user_report"();



CREATE OR REPLACE TRIGGER "trg_early_collector_achievement_insert" AFTER INSERT ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."insert_user_achievement"();

ALTER TABLE "public"."profiles" DISABLE TRIGGER "trg_early_collector_achievement_insert";



CREATE OR REPLACE TRIGGER "trg_first_impressions_check" AFTER INSERT OR UPDATE ON "public"."user_cube_ratings" FOR EACH ROW EXECUTE FUNCTION "public"."first_impressions_achi_check"();



CREATE OR REPLACE TRIGGER "trg_save_cube_vendor_links_snapshots" AFTER INSERT OR DELETE OR UPDATE ON "public"."cube_vendor_links" FOR EACH ROW EXECUTE FUNCTION "public"."save_cube_vendor_links_snapshots"();



CREATE OR REPLACE TRIGGER "trg_update_rating" AFTER INSERT OR DELETE OR UPDATE ON "public"."user_cube_ratings" FOR EACH ROW EXECUTE FUNCTION "public"."update_average_cube_rating"();



CREATE OR REPLACE TRIGGER "when_new_user_joins" AFTER INSERT ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."notify_discord_new_user"();



ALTER TABLE ONLY "public"."achievements"
    ADD CONSTRAINT "achievements_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE SET DEFAULT;



ALTER TABLE ONLY "public"."announcement"
    ADD CONSTRAINT "announcement_published_by_id_fkey" FOREIGN KEY ("published_by_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE RESTRICT NOT VALID;



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_added_by_id_fkey" FOREIGN KEY ("added_by_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE RESTRICT NOT VALID;



ALTER TABLE ONLY "public"."cube_models"
    ADD CONSTRAINT "cube_models_related_to_fkey" FOREIGN KEY ("related_to") REFERENCES "public"."cube_models"("slug") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."cube_models"
    ADD CONSTRAINT "cube_models_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE SET DEFAULT;



ALTER TABLE ONLY "public"."cube_models"
    ADD CONSTRAINT "cube_models_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."cube_types"
    ADD CONSTRAINT "cube_types_added_by_id_fkey" FOREIGN KEY ("added_by_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE SET DEFAULT;



ALTER TABLE ONLY "public"."cube_vendor_links"
    ADD CONSTRAINT "cube_vendor_links_duplicate_cube_slug_fkey" FOREIGN KEY ("cube_slug") REFERENCES "public"."cube_models"("slug") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cube_vendor_links"
    ADD CONSTRAINT "cube_vendor_links_duplicate_vendor_name_fkey" FOREIGN KEY ("vendor_name") REFERENCES "public"."vendors"("name") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cube_vendor_links_snapshot"
    ADD CONSTRAINT "cube_vendor_links_snapshot_cube_slug_fkey" FOREIGN KEY ("cube_slug") REFERENCES "public"."cube_models"("slug") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cube_vendor_links_snapshot"
    ADD CONSTRAINT "cube_vendor_links_snapshot_vendor_name_fkey" FOREIGN KEY ("vendor_name") REFERENCES "public"."vendors"("name") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cubes_model_features"
    ADD CONSTRAINT "cubes_model_features_cube_fkey" FOREIGN KEY ("cube") REFERENCES "public"."cube_models"("slug") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cubes_model_features"
    ADD CONSTRAINT "cubes_model_features_feature_fkey" FOREIGN KEY ("feature") REFERENCES "public"."cube_features"("code") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."helpful_rating"
    ADD CONSTRAINT "helpful_cube_rating_rating_fkey" FOREIGN KEY ("rating") REFERENCES "public"."user_cube_ratings"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."helpful_rating"
    ADD CONSTRAINT "helpful_rating_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_reporter_fkey" FOREIGN KEY ("reporter") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE SET DEFAULT;



ALTER TABLE ONLY "public"."staff_logs"
    ADD CONSTRAINT "staff_logs_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievement_achievement_fkey" FOREIGN KEY ("achievement") REFERENCES "public"."achievements"("name") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_awarded_by_id_fkey" FOREIGN KEY ("awarded_by_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE SET DEFAULT;



ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_cubes"
    ADD CONSTRAINT "user_cubes_cube_fkey" FOREIGN KEY ("cube") REFERENCES "public"."cube_models"("slug") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_cubes"
    ADD CONSTRAINT "user_cubes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_follows"
    ADD CONSTRAINT "user_follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_follows"
    ADD CONSTRAINT "user_follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_cube_ratings"
    ADD CONSTRAINT "user_ratings_cube_slug_fkey" FOREIGN KEY ("cube_slug") REFERENCES "public"."cube_models"("slug") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_cube_ratings"
    ADD CONSTRAINT "user_ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE CASCADE;



CREATE POLICY "Can't modify ID and created_at" ON "public"."cube_models" FOR UPDATE USING ((("id" = "id") AND ("created_at" = "created_at")));



CREATE POLICY "Enable delete for Admins and Community Managers" ON "public"."cube_models" FOR DELETE TO "authenticated" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = ANY (ARRAY['Database Manager'::"public"."users_roles", 'Admin'::"public"."users_roles"])));



CREATE POLICY "Enable delete for Database Managers and Admins" ON "public"."cubes_model_features" FOR DELETE TO "authenticated" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = ANY (ARRAY['Database Manager'::"public"."users_roles", 'Admin'::"public"."users_roles"])));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."user_follows" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = ANY (ARRAY["follower_id", "following_id"])));



CREATE POLICY "Enable delete for users based on username" ON "public"."helpful_rating" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Enable insert for Admins and Database Managers only" ON "public"."cube_types" FOR INSERT WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = ANY (ARRAY['Database Manager'::"public"."users_roles", 'Admin'::"public"."users_roles"])));



CREATE POLICY "Enable insert for Database Managers and Admins" ON "public"."brands" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = ANY (ARRAY['Database Manager'::"public"."users_roles", 'Admin'::"public"."users_roles"])));



CREATE POLICY "Enable insert for Database Managers and Admins" ON "public"."cubes_model_features" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = ANY (ARRAY['Database Manager'::"public"."users_roles", 'Admin'::"public"."users_roles"])));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."helpful_rating" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."reports" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."staff_logs" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."user_cube_ratings" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."user_cubes" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."user_follows" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."accessories" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."achievements" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."announcement" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."brands" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."cube_models" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."cube_types" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."cubes_model_features" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."helpful_rating" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."staff_logs" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."user_achievements" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."user_cube_ratings" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."user_cubes" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."user_follows" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."vendors" FOR SELECT USING (true);



CREATE POLICY "Enable update for users based on email" ON "public"."cube_types" FOR UPDATE USING (true);



CREATE POLICY "Everyone can insert" ON "public"."profiles" FOR INSERT WITH CHECK (true);



CREATE POLICY "Everyone can insert into user_achievements" ON "public"."user_achievements" FOR INSERT WITH CHECK (true);



CREATE POLICY "Everyone can update" ON "public"."announcement" FOR UPDATE USING (true) WITH CHECK (true);



CREATE POLICY "Insert for everyone" ON "public"."cube_vendor_links_snapshot" FOR INSERT WITH CHECK (true);



CREATE POLICY "Only Admins and Database Managers can insert" ON "public"."cube_vendor_links" FOR INSERT WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = ANY (ARRAY['Database Manager'::"public"."users_roles", 'Admin'::"public"."users_roles"])));



CREATE POLICY "Only Admins and Database Managers can insert" ON "public"."vendors" FOR INSERT WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = ANY (ARRAY['Database Manager'::"public"."users_roles", 'Admin'::"public"."users_roles"])));



CREATE POLICY "Only Admins and Database Managers can update" ON "public"."cube_vendor_links" FOR UPDATE USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = ANY (ARRAY['Database Manager'::"public"."users_roles", 'Admin'::"public"."users_roles"])));



CREATE POLICY "Only Community Managers and Admins can insert" ON "public"."announcement" FOR INSERT WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = ANY (ARRAY['Community Manager'::"public"."users_roles", 'Admin'::"public"."users_roles"])));



CREATE POLICY "Only Database Manager's and Admin's can insert" ON "public"."cube_models" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = ANY (ARRAY['Database Manager'::"public"."users_roles", 'Admin'::"public"."users_roles"])));



CREATE POLICY "Only Database Manager's and Admin's can update" ON "public"."cube_models" FOR UPDATE TO "authenticated" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = ANY (ARRAY['Database Manager'::"public"."users_roles", 'Admin'::"public"."users_roles"])));



CREATE POLICY "Only Database Managers and Admins can update" ON "public"."vendors" FOR UPDATE USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = ANY (ARRAY['Database Manager'::"public"."users_roles", 'Admin'::"public"."users_roles"])));



CREATE POLICY "Only Staff can read" ON "public"."reports" FOR SELECT USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) <> 'User'::"public"."users_roles"));



CREATE POLICY "Only staff can update" ON "public"."reports" FOR UPDATE TO "authenticated" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) <> 'User'::"public"."users_roles"));



CREATE POLICY "Read access for all users" ON "public"."cube_vendor_links" FOR SELECT USING (true);



CREATE POLICY "Select for everyone" ON "public"."cube_vendor_links_snapshot" FOR SELECT USING (true);



CREATE POLICY "Users can delete their own cubes" ON "public"."user_cubes" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete their own profile" ON "public"."profiles" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own ratings" ON "public"."user_cube_ratings" FOR DELETE TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR (( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = ANY (ARRAY['Moderator'::"public"."users_roles", 'Admin'::"public"."users_roles"]))));



CREATE POLICY "Users can modify their own cubes" ON "public"."user_cubes" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update their own ratings" ON "public"."user_cube_ratings" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."accessories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."achievements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."announcement" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."brands" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cube_features" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cube_models" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cube_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cube_vendor_links" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cube_vendor_links_snapshot" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cubes_model_features" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."helpful_rating" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."staff_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_achievements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_cube_ratings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_cubes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_follows" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vendors" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";












GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";









































































































































































































GRANT ALL ON FUNCTION "public"."due_vendor_links_capped"("p_limit" integer, "p_per_vendor" integer, "p_backoff_cap" integer, "p_base" interval) TO "anon";
GRANT ALL ON FUNCTION "public"."due_vendor_links_capped"("p_limit" integer, "p_per_vendor" integer, "p_backoff_cap" integer, "p_base" interval) TO "authenticated";
GRANT ALL ON FUNCTION "public"."due_vendor_links_capped"("p_limit" integer, "p_per_vendor" integer, "p_backoff_cap" integer, "p_base" interval) TO "service_role";



GRANT ALL ON FUNCTION "public"."first_impressions_achi_check"() TO "anon";
GRANT ALL ON FUNCTION "public"."first_impressions_achi_check"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."first_impressions_achi_check"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_types"("enum_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_types"("enum_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_types"("enum_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."insert_user_achievement"() TO "anon";
GRANT ALL ON FUNCTION "public"."insert_user_achievement"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_user_achievement"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_data_changes"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_data_changes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_data_changes"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_discord_new_cube_model"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_discord_new_cube_model"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_discord_new_cube_model"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_discord_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_discord_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_discord_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_discord_new_user_report"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_discord_new_user_report"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_discord_new_user_report"() TO "service_role";



GRANT ALL ON FUNCTION "public"."save_cube_vendor_links_snapshots"() TO "anon";
GRANT ALL ON FUNCTION "public"."save_cube_vendor_links_snapshots"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."save_cube_vendor_links_snapshots"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_average_cube_rating"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_average_cube_rating"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_average_cube_rating"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_cube_average_rating"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_cube_average_rating"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_cube_average_rating"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_password"("current_plain_password" "text", "new_plain_password" "text", "current_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."update_password"("current_plain_password" "text", "new_plain_password" "text", "current_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_password"("current_plain_password" "text", "new_plain_password" "text", "current_id" "uuid") TO "service_role";

































GRANT ALL ON TABLE "public"."achievements" TO "anon";
GRANT ALL ON TABLE "public"."achievements" TO "authenticated";
GRANT ALL ON TABLE "public"."achievements" TO "service_role";



GRANT ALL ON SEQUENCE "public"."Badges_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Badges_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Badges_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."accessories" TO "anon";
GRANT ALL ON TABLE "public"."accessories" TO "authenticated";
GRANT ALL ON TABLE "public"."accessories" TO "service_role";



GRANT ALL ON SEQUENCE "public"."accessories_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."accessories_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."accessories_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."announcement" TO "anon";
GRANT ALL ON TABLE "public"."announcement" TO "authenticated";
GRANT ALL ON TABLE "public"."announcement" TO "service_role";



GRANT ALL ON TABLE "public"."brands" TO "anon";
GRANT ALL ON TABLE "public"."brands" TO "authenticated";
GRANT ALL ON TABLE "public"."brands" TO "service_role";



GRANT ALL ON SEQUENCE "public"."brands_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."brands_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."brands_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."cube_features" TO "anon";
GRANT ALL ON TABLE "public"."cube_features" TO "authenticated";
GRANT ALL ON TABLE "public"."cube_features" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cube_features_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cube_features_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cube_features_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."cube_models" TO "anon";
GRANT ALL ON TABLE "public"."cube_models" TO "authenticated";
GRANT ALL ON TABLE "public"."cube_models" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cube_models_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cube_models_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cube_models_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."cube_types" TO "anon";
GRANT ALL ON TABLE "public"."cube_types" TO "authenticated";
GRANT ALL ON TABLE "public"."cube_types" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cube_types_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cube_types_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cube_types_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."cube_vendor_links" TO "anon";
GRANT ALL ON TABLE "public"."cube_vendor_links" TO "authenticated";
GRANT ALL ON TABLE "public"."cube_vendor_links" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cube_vendor_links_duplicate_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cube_vendor_links_duplicate_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cube_vendor_links_duplicate_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."cube_vendor_links_snapshot" TO "anon";
GRANT ALL ON TABLE "public"."cube_vendor_links_snapshot" TO "authenticated";
GRANT ALL ON TABLE "public"."cube_vendor_links_snapshot" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cube_vendor_links_snapshot_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cube_vendor_links_snapshot_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cube_vendor_links_snapshot_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."cubes_model_features" TO "anon";
GRANT ALL ON TABLE "public"."cubes_model_features" TO "authenticated";
GRANT ALL ON TABLE "public"."cubes_model_features" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cubes_model_features_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cubes_model_features_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cubes_model_features_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."disclaimer_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."disclaimer_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."disclaimer_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."helpful_rating" TO "anon";
GRANT ALL ON TABLE "public"."helpful_rating" TO "authenticated";
GRANT ALL ON TABLE "public"."helpful_rating" TO "service_role";



GRANT ALL ON SEQUENCE "public"."helpful_rating_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."helpful_rating_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."helpful_rating_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."profiles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."profiles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."profiles_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."reports" TO "anon";
GRANT ALL ON TABLE "public"."reports" TO "authenticated";
GRANT ALL ON TABLE "public"."reports" TO "service_role";



GRANT ALL ON SEQUENCE "public"."reports_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."reports_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."reports_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."staff_logs" TO "anon";
GRANT ALL ON TABLE "public"."staff_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."staff_logs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."staff_logs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."staff_logs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."staff_logs_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_achievements" TO "anon";
GRANT ALL ON TABLE "public"."user_achievements" TO "authenticated";
GRANT ALL ON TABLE "public"."user_achievements" TO "service_role";



GRANT ALL ON TABLE "public"."user_cube_ratings" TO "anon";
GRANT ALL ON TABLE "public"."user_cube_ratings" TO "authenticated";
GRANT ALL ON TABLE "public"."user_cube_ratings" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_cube_ratings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_cube_ratings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_cube_ratings_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_cubes" TO "anon";
GRANT ALL ON TABLE "public"."user_cubes" TO "authenticated";
GRANT ALL ON TABLE "public"."user_cubes" TO "service_role";



GRANT ALL ON TABLE "public"."user_follows" TO "anon";
GRANT ALL ON TABLE "public"."user_follows" TO "authenticated";
GRANT ALL ON TABLE "public"."user_follows" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_follows_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_follows_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_follows_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."vendors" TO "anon";
GRANT ALL ON TABLE "public"."vendors" TO "authenticated";
GRANT ALL ON TABLE "public"."vendors" TO "service_role";



GRANT ALL ON SEQUENCE "public"."vendors_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."vendors_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."vendors_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
