

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
    'UV Coated'
);


ALTER TYPE "public"."cube_surface_finish" OWNER TO "postgres";


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
    'Corner‑Turning'
);


ALTER TYPE "public"."cubes_subtypes" OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."insert_user_achievement"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN
  INSERT INTO user_achievements (username, achievement, awarded_by)
  VALUES (NEW.username, 'Early Collector', 'CubeIndex');
  RETURN NEW;
END;$$;


ALTER FUNCTION "public"."insert_user_achievement"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_discord_new_cube_model"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$declare payload jsonb;

begin payload := json_build_object(
  'version_type',
  new.version_type,
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
  new.submitted_by,
  'wca_legal',
  new.wca_legal,
  'magnetic',
  new.magnetic,
  'smart',
  new.smart,
  'type',
  new.type,
  'weight',
  new.weight,
  'size',
  new.size
);

perform net.http_post(
  url:='https://spsqaktodgqnqbkgilxp.supabase.co/functions/v1/discord-new-cubes-notification'::text,
  headers:=json_build_object('Content-Type', 'application/json')::jsonb,
  body:=payload::jsonb
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
  new.username
);

perform net.http_post(
  url:='https://spsqaktodgqnqbkgilxp.supabase.co/functions/v1/discord-new-users-notification'::text,
  headers:=json_build_object('Content-Type', 'application/json')::jsonb,
  body:=payload::jsonb
);

return new;

end;$$;


ALTER FUNCTION "public"."notify_discord_new_user"() OWNER TO "postgres";


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
    "submitted_by" "text",
    "rarity" "public"."badge-rarity" DEFAULT 'Common'::"public"."badge-rarity" NOT NULL,
    "category" "public"."achievements_categories",
    "title" "text",
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
    "published_by" "text"
);


ALTER TABLE "public"."announcement" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cube_models" (
    "brand" "text" DEFAULT ''::"text" NOT NULL,
    "image_url" "text" NOT NULL,
    "model" "text" NOT NULL,
    "wca_legal" boolean NOT NULL,
    "magnetic" boolean NOT NULL,
    "rating" real DEFAULT '0'::real,
    "smart" boolean NOT NULL,
    "slug" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "approved" boolean DEFAULT false NOT NULL,
    "modded" boolean DEFAULT false NOT NULL,
    "type" "text" NOT NULL,
    "discontinued" boolean DEFAULT false NOT NULL,
    "release_date" "date",
    "submitted_by" "text" NOT NULL,
    "series" "text" DEFAULT ''::"text",
    "id" bigint NOT NULL,
    "sub_type" "public"."cubes_subtypes" NOT NULL,
    "weight" real NOT NULL,
    "maglev" boolean NOT NULL,
    "related_to" "text",
    "size" real NOT NULL,
    "version_type" "public"."cube_version_type" DEFAULT 'Base'::"public"."cube_version_type" NOT NULL,
    "version_name" "text" DEFAULT ''::"text",
    "surface_finish" "public"."cube_surface_finish",
    "verified_by" "text" DEFAULT ''::"text" NOT NULL,
    "stickered" boolean DEFAULT false NOT NULL
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



CREATE TABLE IF NOT EXISTS "public"."cube_submissions" (
    "brand" "text" DEFAULT ''::"text" NOT NULL,
    "image_url" "text" NOT NULL,
    "model" "text" NOT NULL,
    "wca_legal" boolean NOT NULL,
    "magnetic" boolean NOT NULL,
    "smart" boolean NOT NULL,
    "slug" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "public"."submission_status" DEFAULT 'Pending'::"public"."submission_status" NOT NULL,
    "modded" boolean DEFAULT false NOT NULL,
    "type" "text" NOT NULL,
    "discontinued" boolean DEFAULT false NOT NULL,
    "release_date" "date" NOT NULL,
    "submitted_by" "text",
    "series" "text" DEFAULT ''::"text",
    "id" bigint NOT NULL,
    "sub_type" "public"."cubes_subtypes" NOT NULL,
    "weight" real NOT NULL,
    "maglev" boolean NOT NULL,
    "related_to" "text",
    "size" real NOT NULL,
    "version_type" "public"."cube_version_type" DEFAULT 'Base'::"public"."cube_version_type" NOT NULL,
    "version_name" "text" DEFAULT ''::"text",
    "surface_finish" "text" NOT NULL,
    "stickered" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."cube_submissions" OWNER TO "postgres";


ALTER TABLE "public"."cube_submissions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."cube_submissions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."cube_types" (
    "id" bigint NOT NULL,
    "type" "text" NOT NULL,
    "popularity" bigint DEFAULT '0'::bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "shape_family" "text" DEFAULT ''::"text" NOT NULL
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
    "price" double precision DEFAULT '0'::double precision NOT NULL
);


ALTER TABLE "public"."cube_vendor_links" OWNER TO "postgres";


ALTER TABLE "public"."cube_vendor_links" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."cubes_availability_id_seq"
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
    "role" "public"."users_roles" DEFAULT 'User'::"public"."users_roles" NOT NULL
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



CREATE TABLE IF NOT EXISTS "public"."user_achievements" (
    "username" "text" NOT NULL,
    "achievement" "text" NOT NULL,
    "awarded_by" "text" DEFAULT 'CubeIndex'::"text" NOT NULL,
    "awarded_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_achievements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_cubes" (
    "cube" "text" NOT NULL,
    "username" "text" NOT NULL,
    "main" boolean DEFAULT false NOT NULL,
    "quantity" bigint DEFAULT '1'::bigint NOT NULL,
    "condition" "public"."user_cube_condition" NOT NULL,
    "status" "public"."user_cube_status" NOT NULL,
    "notes" "text" DEFAULT ''::"text",
    "modified_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "acquired_at" "date"
);


ALTER TABLE "public"."user_cubes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_ratings" (
    "username" "text" NOT NULL,
    "cube_slug" "text" NOT NULL,
    "rating" smallint NOT NULL,
    "comment" "text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_ratings" OWNER TO "postgres";


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
    CONSTRAINT "vendors_base_url_check" CHECK (("base_url" ~ '^https?://'::"text")),
    CONSTRAINT "vendors_country_iso_check" CHECK (("length"("country_iso") <= 2))
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
    ADD CONSTRAINT "badges_description_key" UNIQUE ("description");



ALTER TABLE ONLY "public"."achievements"
    ADD CONSTRAINT "badges_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."achievements"
    ADD CONSTRAINT "badges_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."accessories"
    ADD CONSTRAINT "cube_models_duplicate_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."cube_models"
    ADD CONSTRAINT "cube_models_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."cube_submissions"
    ADD CONSTRAINT "cube_submissions_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."cube_submissions"
    ADD CONSTRAINT "cube_submissions_name_id_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."cube_submissions"
    ADD CONSTRAINT "cube_submissions_pkey" PRIMARY KEY ("slug");



ALTER TABLE ONLY "public"."cube_types"
    ADD CONSTRAINT "cube_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cube_types"
    ADD CONSTRAINT "cube_types_type_key" UNIQUE ("type");



ALTER TABLE ONLY "public"."cube_vendor_links"
    ADD CONSTRAINT "cube_vendor_links_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cube_vendor_links"
    ADD CONSTRAINT "cubes_availability_id_key" UNIQUE ("id");



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



ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("username", "achievement");



ALTER TABLE ONLY "public"."user_cubes"
    ADD CONSTRAINT "user_cubes_pkey" PRIMARY KEY ("username", "cube");



ALTER TABLE ONLY "public"."user_ratings"
    ADD CONSTRAINT "user_ratings_pkey" PRIMARY KEY ("username", "cube_slug");



ALTER TABLE ONLY "public"."vendors"
    ADD CONSTRAINT "vendors_base_url_key" UNIQUE ("base_url");



ALTER TABLE ONLY "public"."vendors"
    ADD CONSTRAINT "vendors_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."vendors"
    ADD CONSTRAINT "vendors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vendors"
    ADD CONSTRAINT "vendors_vendor_id_key" UNIQUE ("slug");



CREATE OR REPLACE TRIGGER "on_cube_model_insert" AFTER INSERT ON "public"."cube_models" FOR EACH ROW EXECUTE FUNCTION "public"."notify_discord_new_cube_model"();



CREATE OR REPLACE TRIGGER "trg_insert_user_achievement" AFTER INSERT ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."insert_user_achievement"();



CREATE OR REPLACE TRIGGER "trg_update_rating_after_delete" AFTER DELETE ON "public"."user_ratings" FOR EACH ROW EXECUTE FUNCTION "public"."update_cube_average_rating"();



CREATE OR REPLACE TRIGGER "trg_update_rating_after_insert" AFTER INSERT ON "public"."user_ratings" FOR EACH ROW EXECUTE FUNCTION "public"."update_cube_average_rating"();



CREATE OR REPLACE TRIGGER "trg_update_rating_after_update" AFTER UPDATE ON "public"."user_ratings" FOR EACH ROW EXECUTE FUNCTION "public"."update_cube_average_rating"();



CREATE OR REPLACE TRIGGER "when_new_user_joins" AFTER INSERT ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."notify_discord_new_user"();



ALTER TABLE ONLY "public"."announcement"
    ADD CONSTRAINT "announcement_published_by_fkey" FOREIGN KEY ("published_by") REFERENCES "public"."profiles"("username") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."achievements"
    ADD CONSTRAINT "badges_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "public"."profiles"("username") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."cube_models"
    ADD CONSTRAINT "cube_models_related_to_fkey" FOREIGN KEY ("related_to") REFERENCES "public"."cube_models"("slug") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."cube_models"
    ADD CONSTRAINT "cube_models_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "public"."profiles"("username") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."cube_models"
    ADD CONSTRAINT "cube_models_type_fkey" FOREIGN KEY ("type") REFERENCES "public"."cube_types"("type") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."cube_models"
    ADD CONSTRAINT "cube_models_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "public"."profiles"("username") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."cube_submissions"
    ADD CONSTRAINT "cube_submissions_related_to_fkey" FOREIGN KEY ("related_to") REFERENCES "public"."cube_models"("slug") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."cube_submissions"
    ADD CONSTRAINT "cube_submissions_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "public"."profiles"("username") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."cube_submissions"
    ADD CONSTRAINT "cube_submissions_type_fkey" FOREIGN KEY ("type") REFERENCES "public"."cube_types"("type") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."cube_vendor_links"
    ADD CONSTRAINT "cube_vendor_links_cube_slug_fkey" FOREIGN KEY ("cube_slug") REFERENCES "public"."cube_models"("slug") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cube_vendor_links"
    ADD CONSTRAINT "cubes_availability_vendor_name_fkey" FOREIGN KEY ("vendor_name") REFERENCES "public"."vendors"("name") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievement_achievement_fkey" FOREIGN KEY ("achievement") REFERENCES "public"."achievements"("name") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievement_awarded_by_fkey" FOREIGN KEY ("awarded_by") REFERENCES "public"."profiles"("username") ON UPDATE CASCADE ON DELETE SET DEFAULT;



ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievement_username_fkey" FOREIGN KEY ("username") REFERENCES "public"."profiles"("username") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_cubes"
    ADD CONSTRAINT "user_cubes_cube_fkey" FOREIGN KEY ("cube") REFERENCES "public"."cube_models"("slug") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_cubes"
    ADD CONSTRAINT "user_cubes_username_fkey" FOREIGN KEY ("username") REFERENCES "public"."profiles"("username") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_ratings"
    ADD CONSTRAINT "user_ratings_cube_slug_fkey" FOREIGN KEY ("cube_slug") REFERENCES "public"."cube_models"("slug") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_ratings"
    ADD CONSTRAINT "user_ratings_username_fkey" FOREIGN KEY ("username") REFERENCES "public"."profiles"("username") ON UPDATE CASCADE ON DELETE CASCADE;



CREATE POLICY "Enable delete for all" ON "public"."user_cubes" FOR DELETE USING (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."cube_submissions" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."user_cubes" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."accessories" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."achievements" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."announcement" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."cube_models" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."cube_submissions" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."cube_vendor_links" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."user_achievements" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."user_cubes" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."user_ratings" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."vendors" FOR SELECT USING (true);



CREATE POLICY "Enable update to all users" ON "public"."user_cubes" FOR UPDATE USING (true) WITH CHECK (true);



CREATE POLICY "Everyone can insert" ON "public"."profiles" FOR INSERT WITH CHECK (true);



CREATE POLICY "Everyone can insert into user_achievements" ON "public"."user_achievements" FOR INSERT WITH CHECK (true);



CREATE POLICY "Everyone can update" ON "public"."announcement" FOR UPDATE USING (true) WITH CHECK (true);



CREATE POLICY "Only Community Managers and Admins can insert" ON "public"."announcement" FOR INSERT WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = ANY (ARRAY['Community Manager'::"public"."users_roles", 'Admin'::"public"."users_roles"])));



CREATE POLICY "Only Database Manager's and Admin's can insert" ON "public"."cube_models" FOR INSERT WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = ANY (ARRAY['Database Manager'::"public"."users_roles", 'Admin'::"public"."users_roles"])));



CREATE POLICY "Users can delete their own profile" ON "public"."profiles" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."accessories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."achievements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."announcement" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cube_models" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cube_submissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cube_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cube_vendor_links" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_achievements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_cubes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_ratings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vendors" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."insert_user_achievement"() TO "anon";
GRANT ALL ON FUNCTION "public"."insert_user_achievement"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_user_achievement"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_discord_new_cube_model"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_discord_new_cube_model"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_discord_new_cube_model"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_discord_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_discord_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_discord_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_cube_average_rating"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_cube_average_rating"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_cube_average_rating"() TO "service_role";



























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



GRANT ALL ON TABLE "public"."cube_models" TO "anon";
GRANT ALL ON TABLE "public"."cube_models" TO "authenticated";
GRANT ALL ON TABLE "public"."cube_models" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cube_models_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cube_models_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cube_models_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."cube_submissions" TO "anon";
GRANT ALL ON TABLE "public"."cube_submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."cube_submissions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cube_submissions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cube_submissions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cube_submissions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."cube_types" TO "anon";
GRANT ALL ON TABLE "public"."cube_types" TO "authenticated";
GRANT ALL ON TABLE "public"."cube_types" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cube_types_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cube_types_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cube_types_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."cube_vendor_links" TO "anon";
GRANT ALL ON TABLE "public"."cube_vendor_links" TO "authenticated";
GRANT ALL ON TABLE "public"."cube_vendor_links" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cubes_availability_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cubes_availability_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cubes_availability_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."disclaimer_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."disclaimer_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."disclaimer_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."profiles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."profiles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."profiles_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_achievements" TO "anon";
GRANT ALL ON TABLE "public"."user_achievements" TO "authenticated";
GRANT ALL ON TABLE "public"."user_achievements" TO "service_role";



GRANT ALL ON TABLE "public"."user_cubes" TO "anon";
GRANT ALL ON TABLE "public"."user_cubes" TO "authenticated";
GRANT ALL ON TABLE "public"."user_cubes" TO "service_role";



GRANT ALL ON TABLE "public"."user_ratings" TO "anon";
GRANT ALL ON TABLE "public"."user_ratings" TO "authenticated";
GRANT ALL ON TABLE "public"."user_ratings" TO "service_role";



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
