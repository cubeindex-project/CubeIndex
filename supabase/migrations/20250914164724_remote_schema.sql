set check_function_bodies = off;

CREATE OR REPLACE FUNCTION extensions.grant_pg_cron_access()
 RETURNS event_trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION extensions.grant_pg_net_access()
 RETURNS event_trigger
 LANGUAGE plpgsql
AS $function$
  BEGIN
    IF EXISTS (
      SELECT 1
      FROM pg_event_trigger_ddl_commands() AS ev
      JOIN pg_extension AS ext
      ON ev.objid = ext.oid
      WHERE ext.extname = 'pg_net'
    )
    THEN
      GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

      IF EXISTS (
        SELECT FROM pg_extension
        WHERE extname = 'pg_net'
        -- all versions in use on existing projects as of 2025-02-20
        -- version 0.12.0 onwards don't need these applied
        AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
      ) THEN
        ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
        ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

        ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
        ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

        REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
        REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

        GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
        GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      END IF;
    END IF;
  END;
  $function$
;

create type "public"."accessories_categories" as enum ('Timer', 'Mat', 'Lube', 'Storage', 'Keychain', 'Charging pod', 'Bag', 'Stand');

create type "public"."achievements_categories" as enum ('Website', 'Quantity');

create type "public"."badge-rarity" as enum ('Special', 'Legendary', 'Mythic', 'Epic', 'Rare', 'Common');

create type "public"."cube_surface_finish" as enum ('Matte', 'Frosted', 'UV Coated', 'Glossy', 'Sculpted');

create type "public"."cube_surface_finishes" as enum ('Frosted', 'UV Coated', 'Glossy', 'Sculpted');

create type "public"."cube_version_type" as enum ('Base', 'Trim', 'Limited');

create type "public"."cubes_subtypes" as enum ('NxNxN', 'Square-N', 'Minx', 'Shape-Shifting', 'Cuboid', 'Non-Twisty', 'Corner-Turning', 'Gear', 'Other');

create type "public"."cubes_subtypes__old_version_to_be_dropped" as enum ('NxNxN', 'Square-N', 'Minx', 'Shape-Shifting', 'Cuboid', 'Non-Twisty', 'Corner-Turning');

create type "public"."rating_categories" as enum ('cube', 'accessory');

create type "public"."report_types" as enum ('user', 'cube', 'cube-rating', 'website');

create type "public"."staff_actions" as enum ('INSERT', 'UPDATE', 'DELETE');

create type "public"."submission_status" as enum ('Approved', 'Rejected', 'Pending');

create type "public"."user_cube_condition" as enum ('New in box', 'New', 'Good', 'Fair', 'Worn', 'Poor', 'Broken');

create type "public"."user_cube_status" as enum ('Owned', 'Wishlist', 'Loaned', 'Borrowed', 'Lost');

create type "public"."users_roles" as enum ('Admin', 'Moderator', 'Lead Developer', 'Community Manager', 'Database Manager', 'User');


  create table "public"."accessories" (
    "release_date" date not null,
    "brand" text default ''::text,
    "image_url" text,
    "name" text not null,
    "rating" real default '0'::real,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "approved" boolean not null default false,
    "discontinued" boolean not null default false,
    "id" integer generated by default as identity not null,
    "slug" text not null,
    "category" accessories_categories,
    "compatibility" text
      );


alter table "public"."accessories" enable row level security;


  create table "public"."achievements" (
    "id" smallint generated by default as identity not null,
    "name" text not null,
    "icon" text not null,
    "description" text not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "unlockable" boolean not null default false,
    "slug" text not null default ''::text,
    "unlock_method" text not null default '''Manual''::text'::text,
    "rarity" "badge-rarity" not null default 'Common'::"badge-rarity",
    "category" achievements_categories,
    "title" text,
    "evolutive" boolean not null default false,
    "evolves_from" text,
    "submitted_by_id" uuid not null default '898d0e3a-3465-4c25-9b9f-b498b9884d1d'::uuid,
    "hidden" boolean not null default false,
    "is_special" boolean not null default false
      );


alter table "public"."achievements" enable row level security;


  create table "public"."brands" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "name" text not null default ''::text,
    "added_by_id" uuid
      );


alter table "public"."brands" enable row level security;


  create table "public"."cube_features" (
    "id" bigint generated by default as identity not null,
    "code" text not null,
    "label" text not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."cube_features" enable row level security;


  create table "public"."cube_models" (
    "brand" text not null default ''::text,
    "image_url" text not null,
    "model" text not null,
    "rating" real default '0'::real,
    "slug" text not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "type" text not null,
    "discontinued" boolean not null default false,
    "release_date" date,
    "series" text default ''::text,
    "id" bigint generated by default as identity not null,
    "sub_type" cubes_subtypes,
    "weight" real not null,
    "related_to" text,
    "version_type" cube_version_type not null default 'Base'::cube_version_type,
    "version_name" text default ''::text,
    "status" submission_status not null default 'Pending'::submission_status,
    "notes" text,
    "surface_finish" cube_surface_finishes,
    "verified_at" timestamp with time zone,
    "size" text,
    "submitted_by_id" uuid not null default '898d0e3a-3465-4c25-9b9f-b498b9884d1d'::uuid,
    "verified_by_id" uuid
      );


alter table "public"."cube_models" enable row level security;


  create table "public"."cube_types" (
    "id" bigint generated by default as identity not null,
    "name" text not null,
    "popularity" bigint not null default '0'::bigint,
    "created_at" timestamp with time zone not null default now(),
    "shape_family" text not null default ''::text,
    "added_by_id" uuid
      );


alter table "public"."cube_types" enable row level security;


  create table "public"."cube_vendor_links" (
    "vendor_name" text not null,
    "url" text not null,
    "created_at" timestamp with time zone not null default now(),
    "id" bigint generated by default as identity not null,
    "updated_at" timestamp with time zone not null default now(),
    "available" boolean not null default true,
    "cube_slug" text not null,
    "price" double precision not null default '0'::double precision,
    "etag" text,
    "last_modified" timestamp with time zone not null default now(),
    "streak_unchanged" bigint not null default '0'::bigint
      );


alter table "public"."cube_vendor_links" enable row level security;


  create table "public"."cube_vendor_links_snapshot" (
    "vendor_name" text not null,
    "url" text not null,
    "created_at" timestamp with time zone not null default now(),
    "id" bigint generated by default as identity not null,
    "available" boolean not null default true,
    "cube_slug" text not null,
    "price" double precision not null default '0'::double precision
      );


alter table "public"."cube_vendor_links_snapshot" enable row level security;


  create table "public"."cubes_model_features" (
    "id" bigint generated by default as identity not null,
    "cube" text not null default ''::text,
    "feature" text not null default ''::text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."cubes_model_features" enable row level security;


  create table "public"."features" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "title" text not null,
    "icon" text not null,
    "description" text,
    "implemented" boolean not null default false
      );


alter table "public"."features" enable row level security;


  create table "public"."helpful_rating" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "rating" bigint not null,
    "rating_category" rating_categories not null,
    "user_id" uuid not null
      );


alter table "public"."helpful_rating" enable row level security;


  create table "public"."notifications" (
    "id" bigint generated by default as identity not null,
    "message" text not null,
    "icon" text default ''::text,
    "link" text,
    "link_text" text default ''::text,
    "created_at" timestamp with time zone not null default now(),
    "published_by_id" uuid default auth.uid(),
    "user_id" uuid
      );


alter table "public"."notifications" enable row level security;


  create table "public"."profiles" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid not null default auth.uid(),
    "username" text,
    "private" boolean not null default false,
    "profile_picture" text default ''::text,
    "bio" text,
    "socials" jsonb default '{}'::jsonb,
    "banner" text,
    "verified" boolean not null default false,
    "certified" boolean not null default false,
    "role" users_roles not null default 'User'::users_roles,
    "display_name" text,
    "onboarded" boolean not null default false
      );


alter table "public"."profiles" enable row level security;


  create table "public"."reports" (
    "id" bigint generated by default as identity not null,
    "reported" text not null,
    "report_type" report_types not null,
    "comment" text default ''::text,
    "created_at" timestamp with time zone not null default now(),
    "reporter" uuid not null,
    "title" text not null default ''::text,
    "image_url" text,
    "resolved" boolean not null default false,
    "resolved_by" uuid
      );


alter table "public"."reports" enable row level security;


  create table "public"."staff_logs" (
    "id" bigint generated by default as identity not null,
    "action" staff_actions not null,
    "target_table" text not null,
    "old_data" jsonb,
    "new_data" jsonb,
    "created_at" timestamp with time zone not null default now(),
    "staff_id" uuid not null
      );


alter table "public"."staff_logs" enable row level security;


  create table "public"."user_achievements" (
    "achievement" text not null,
    "awarded_at" timestamp with time zone not null default now(),
    "awarded_by_id" uuid not null default '898d0e3a-3465-4c25-9b9f-b498b9884d1d'::uuid,
    "user_id" uuid not null,
    "achievement_slug" text not null
      );


alter table "public"."user_achievements" enable row level security;


  create table "public"."user_cube_ratings" (
    "cube_slug" text not null,
    "rating" double precision not null,
    "comment" text default ''::text,
    "updated_at" timestamp with time zone not null default now(),
    "created_at" timestamp with time zone not null default now(),
    "id" bigint generated by default as identity not null,
    "user_id" uuid not null
      );


alter table "public"."user_cube_ratings" enable row level security;


  create table "public"."user_cubes" (
    "cube" text not null,
    "main" boolean not null default false,
    "quantity" bigint not null default '1'::bigint,
    "condition" user_cube_condition not null,
    "status" user_cube_status not null,
    "notes" text default ''::text,
    "modified_at" timestamp with time zone not null default now(),
    "created_at" timestamp with time zone not null default now(),
    "acquired_at" date,
    "user_id" uuid not null,
    "bought_from" text
      );


alter table "public"."user_cubes" enable row level security;


  create table "public"."user_follows" (
    "id" bigint generated by default as identity not null,
    "follower_id" uuid not null default gen_random_uuid(),
    "following_id" uuid not null default gen_random_uuid(),
    "followed_at" timestamp with time zone not null default now()
      );


alter table "public"."user_follows" enable row level security;


  create table "public"."user_notification_status" (
    "notification_id" bigint not null,
    "user_id" uuid not null,
    "read" boolean not null default false
      );


alter table "public"."user_notification_status" enable row level security;


  create table "public"."user_onboarding" (
    "id" bigint generated by default as identity not null,
    "user_id" uuid not null default '898d0e3a-3465-4c25-9b9f-b498b9884d1d'::uuid,
    "discovered_via" text not null,
    "interested_features" jsonb not null default '{}'::jsonb,
    "other_text" text
      );


alter table "public"."user_onboarding" enable row level security;


  create table "public"."vendors" (
    "id" bigint generated by default as identity not null,
    "slug" text not null,
    "created_at" timestamp with time zone not null default now(),
    "name" text not null,
    "base_url" text not null,
    "country_iso" text not null,
    "updated_at" timestamp with time zone not null default now(),
    "is_active" boolean not null default true,
    "rating" real not null default '0'::real,
    "logo_url" text,
    "currency" text not null default 'USD'::text,
    "sponsored" boolean not null default false,
    "supports_price_tracking" boolean not null default false,
    "verified" boolean not null default true
      );


alter table "public"."vendors" enable row level security;

CREATE UNIQUE INDEX "Badges_pkey" ON public.achievements USING btree (id);

CREATE UNIQUE INDEX accessories_id_key ON public.accessories USING btree (id);

CREATE UNIQUE INDEX accessories_pkey ON public.accessories USING btree (id);

CREATE UNIQUE INDEX accessories_slug_key ON public.accessories USING btree (slug);

CREATE UNIQUE INDEX achievements_evolves_from_key ON public.achievements USING btree (evolves_from);

CREATE UNIQUE INDEX achievements_slug_key ON public.achievements USING btree (slug);

CREATE UNIQUE INDEX badges_description_key ON public.achievements USING btree (description);

CREATE UNIQUE INDEX badges_id_key ON public.achievements USING btree (id);

CREATE UNIQUE INDEX badges_name_key ON public.achievements USING btree (name);

CREATE UNIQUE INDEX brands_name_key ON public.brands USING btree (name);

CREATE UNIQUE INDEX brands_pkey ON public.brands USING btree (id);

CREATE UNIQUE INDEX cube_features_code_key ON public.cube_features USING btree (code);

CREATE UNIQUE INDEX cube_features_pkey ON public.cube_features USING btree (id);

CREATE UNIQUE INDEX cube_models_duplicate_name_key ON public.accessories USING btree (name);

CREATE UNIQUE INDEX cube_models_id_key ON public.cube_models USING btree (id);

CREATE UNIQUE INDEX cube_types_pkey ON public.cube_types USING btree (id);

CREATE UNIQUE INDEX cube_types_type_key ON public.cube_types USING btree (name);

CREATE UNIQUE INDEX cube_vendor_links_duplicate_id_key ON public.cube_vendor_links USING btree (id);

CREATE UNIQUE INDEX cube_vendor_links_duplicate_pkey ON public.cube_vendor_links USING btree (cube_slug, vendor_name);

CREATE UNIQUE INDEX cube_vendor_links_snapshot_id_key ON public.cube_vendor_links_snapshot USING btree (id);

CREATE UNIQUE INDEX cube_vendor_links_snapshot_pkey ON public.cube_vendor_links_snapshot USING btree (id);

CREATE UNIQUE INDEX cubes_model_features_pkey ON public.cubes_model_features USING btree (id, cube, feature);

CREATE UNIQUE INDEX cubes_name_id_key ON public.cube_models USING btree (slug);

CREATE UNIQUE INDEX cubes_pkey ON public.cube_models USING btree (slug);

CREATE UNIQUE INDEX disclaimer_pkey ON public.notifications USING btree (id);

CREATE UNIQUE INDEX features_pkey ON public.features USING btree (id);

CREATE UNIQUE INDEX features_title_key ON public.features USING btree (title);

CREATE UNIQUE INDEX helpful_rating_pkey ON public.helpful_rating USING btree (id);

CREATE UNIQUE INDEX profiles_id_key ON public.profiles USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX profiles_user_id_key ON public.profiles USING btree (user_id);

CREATE UNIQUE INDEX profiles_username_key ON public.profiles USING btree (username);

CREATE UNIQUE INDEX profiles_username_unique_idx ON public.profiles USING btree (lower(username)) WHERE (username IS NOT NULL);

CREATE UNIQUE INDEX reports_pkey ON public.reports USING btree (id);

CREATE UNIQUE INDEX staff_logs_pkey ON public.staff_logs USING btree (id);

CREATE UNIQUE INDEX user_achievements_pkey ON public.user_achievements USING btree (achievement_slug, user_id);

CREATE UNIQUE INDEX user_cube_ratings_pkey ON public.user_cube_ratings USING btree (cube_slug, user_id);

CREATE UNIQUE INDEX user_cubes_pkey ON public.user_cubes USING btree (cube, user_id);

CREATE UNIQUE INDEX user_follows_pkey ON public.user_follows USING btree (follower_id, following_id);

CREATE UNIQUE INDEX user_notification_status_pkey ON public.user_notification_status USING btree (notification_id, user_id);

CREATE UNIQUE INDEX user_onboarding_pkey ON public.user_onboarding USING btree (id);

CREATE UNIQUE INDEX user_ratings_id_key ON public.user_cube_ratings USING btree (id);

CREATE UNIQUE INDEX vendors_base_url_key ON public.vendors USING btree (base_url);

CREATE UNIQUE INDEX vendors_name_key ON public.vendors USING btree (name);

CREATE UNIQUE INDEX vendors_pkey ON public.vendors USING btree (id);

CREATE UNIQUE INDEX vendors_vendor_id_key ON public.vendors USING btree (slug);

alter table "public"."accessories" add constraint "accessories_pkey" PRIMARY KEY using index "accessories_pkey";

alter table "public"."achievements" add constraint "Badges_pkey" PRIMARY KEY using index "Badges_pkey";

alter table "public"."brands" add constraint "brands_pkey" PRIMARY KEY using index "brands_pkey";

alter table "public"."cube_features" add constraint "cube_features_pkey" PRIMARY KEY using index "cube_features_pkey";

alter table "public"."cube_models" add constraint "cubes_pkey" PRIMARY KEY using index "cubes_pkey";

alter table "public"."cube_types" add constraint "cube_types_pkey" PRIMARY KEY using index "cube_types_pkey";

alter table "public"."cube_vendor_links" add constraint "cube_vendor_links_duplicate_pkey" PRIMARY KEY using index "cube_vendor_links_duplicate_pkey";

alter table "public"."cube_vendor_links_snapshot" add constraint "cube_vendor_links_snapshot_pkey" PRIMARY KEY using index "cube_vendor_links_snapshot_pkey";

alter table "public"."cubes_model_features" add constraint "cubes_model_features_pkey" PRIMARY KEY using index "cubes_model_features_pkey";

alter table "public"."features" add constraint "features_pkey" PRIMARY KEY using index "features_pkey";

alter table "public"."helpful_rating" add constraint "helpful_rating_pkey" PRIMARY KEY using index "helpful_rating_pkey";

alter table "public"."notifications" add constraint "disclaimer_pkey" PRIMARY KEY using index "disclaimer_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."reports" add constraint "reports_pkey" PRIMARY KEY using index "reports_pkey";

alter table "public"."staff_logs" add constraint "staff_logs_pkey" PRIMARY KEY using index "staff_logs_pkey";

alter table "public"."user_achievements" add constraint "user_achievements_pkey" PRIMARY KEY using index "user_achievements_pkey";

alter table "public"."user_cube_ratings" add constraint "user_cube_ratings_pkey" PRIMARY KEY using index "user_cube_ratings_pkey";

alter table "public"."user_cubes" add constraint "user_cubes_pkey" PRIMARY KEY using index "user_cubes_pkey";

alter table "public"."user_follows" add constraint "user_follows_pkey" PRIMARY KEY using index "user_follows_pkey";

alter table "public"."user_notification_status" add constraint "user_notification_status_pkey" PRIMARY KEY using index "user_notification_status_pkey";

alter table "public"."user_onboarding" add constraint "user_onboarding_pkey" PRIMARY KEY using index "user_onboarding_pkey";

alter table "public"."vendors" add constraint "vendors_pkey" PRIMARY KEY using index "vendors_pkey";

alter table "public"."accessories" add constraint "accessories_id_key" UNIQUE using index "accessories_id_key";

alter table "public"."accessories" add constraint "accessories_slug_key" UNIQUE using index "accessories_slug_key";

alter table "public"."accessories" add constraint "cube_models_duplicate_name_key" UNIQUE using index "cube_models_duplicate_name_key";

alter table "public"."achievements" add constraint "achievements_evolves_from_key" UNIQUE using index "achievements_evolves_from_key";

alter table "public"."achievements" add constraint "achievements_slug_key" UNIQUE using index "achievements_slug_key";

alter table "public"."achievements" add constraint "achievements_submitted_by_id_fkey" FOREIGN KEY (submitted_by_id) REFERENCES profiles(user_id) ON UPDATE CASCADE ON DELETE SET DEFAULT not valid;

alter table "public"."achievements" validate constraint "achievements_submitted_by_id_fkey";

alter table "public"."achievements" add constraint "achievements_unlock_method_check" CHECK ((unlock_method = ANY (ARRAY['Automatic'::text, 'Manual'::text]))) not valid;

alter table "public"."achievements" validate constraint "achievements_unlock_method_check";

alter table "public"."achievements" add constraint "badges_description_key" UNIQUE using index "badges_description_key";

alter table "public"."achievements" add constraint "badges_id_key" UNIQUE using index "badges_id_key";

alter table "public"."achievements" add constraint "badges_name_key" UNIQUE using index "badges_name_key";

alter table "public"."brands" add constraint "brands_added_by_id_fkey" FOREIGN KEY (added_by_id) REFERENCES profiles(user_id) ON UPDATE CASCADE ON DELETE RESTRICT NOT VALID not valid;

alter table "public"."brands" validate constraint "brands_added_by_id_fkey";

alter table "public"."brands" add constraint "brands_name_key" UNIQUE using index "brands_name_key";

alter table "public"."cube_features" add constraint "cube_features_code_key" UNIQUE using index "cube_features_code_key";

alter table "public"."cube_models" add constraint "cube_models_id_key" UNIQUE using index "cube_models_id_key";

alter table "public"."cube_models" add constraint "cube_models_related_to_fkey" FOREIGN KEY (related_to) REFERENCES cube_models(slug) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."cube_models" validate constraint "cube_models_related_to_fkey";

alter table "public"."cube_models" add constraint "cube_models_size_new_check" CHECK ((size ~ '^[0-9]+(\.[0-9]+)?\sx\s[0-9]+(\.[0-9]+)?\sx\s[0-9]+(\.[0-9]+)?$'::text)) not valid;

alter table "public"."cube_models" validate constraint "cube_models_size_new_check";

alter table "public"."cube_models" add constraint "cube_models_submitted_by_id_fkey" FOREIGN KEY (submitted_by_id) REFERENCES profiles(user_id) ON UPDATE CASCADE ON DELETE SET DEFAULT not valid;

alter table "public"."cube_models" validate constraint "cube_models_submitted_by_id_fkey";

alter table "public"."cube_models" add constraint "cube_models_verified_by_id_fkey" FOREIGN KEY (verified_by_id) REFERENCES profiles(user_id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."cube_models" validate constraint "cube_models_verified_by_id_fkey";

alter table "public"."cube_models" add constraint "cubes_name_id_key" UNIQUE using index "cubes_name_id_key";

alter table "public"."cube_types" add constraint "cube_types_added_by_id_fkey" FOREIGN KEY (added_by_id) REFERENCES profiles(user_id) ON UPDATE CASCADE ON DELETE SET DEFAULT not valid;

alter table "public"."cube_types" validate constraint "cube_types_added_by_id_fkey";

alter table "public"."cube_types" add constraint "cube_types_type_key" UNIQUE using index "cube_types_type_key";

alter table "public"."cube_vendor_links" add constraint "cube_vendor_links_duplicate_cube_slug_fkey" FOREIGN KEY (cube_slug) REFERENCES cube_models(slug) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."cube_vendor_links" validate constraint "cube_vendor_links_duplicate_cube_slug_fkey";

alter table "public"."cube_vendor_links" add constraint "cube_vendor_links_duplicate_id_key" UNIQUE using index "cube_vendor_links_duplicate_id_key";

alter table "public"."cube_vendor_links" add constraint "cube_vendor_links_duplicate_vendor_name_fkey" FOREIGN KEY (vendor_name) REFERENCES vendors(name) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."cube_vendor_links" validate constraint "cube_vendor_links_duplicate_vendor_name_fkey";

alter table "public"."cube_vendor_links_snapshot" add constraint "cube_vendor_links_snapshot_cube_slug_fkey" FOREIGN KEY (cube_slug) REFERENCES cube_models(slug) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."cube_vendor_links_snapshot" validate constraint "cube_vendor_links_snapshot_cube_slug_fkey";

alter table "public"."cube_vendor_links_snapshot" add constraint "cube_vendor_links_snapshot_id_key" UNIQUE using index "cube_vendor_links_snapshot_id_key";

alter table "public"."cube_vendor_links_snapshot" add constraint "cube_vendor_links_snapshot_vendor_name_fkey" FOREIGN KEY (vendor_name) REFERENCES vendors(name) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."cube_vendor_links_snapshot" validate constraint "cube_vendor_links_snapshot_vendor_name_fkey";

alter table "public"."cubes_model_features" add constraint "cubes_model_features_cube_fkey" FOREIGN KEY (cube) REFERENCES cube_models(slug) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."cubes_model_features" validate constraint "cubes_model_features_cube_fkey";

alter table "public"."cubes_model_features" add constraint "cubes_model_features_feature_fkey" FOREIGN KEY (feature) REFERENCES cube_features(code) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."cubes_model_features" validate constraint "cubes_model_features_feature_fkey";

alter table "public"."features" add constraint "features_title_key" UNIQUE using index "features_title_key";

alter table "public"."helpful_rating" add constraint "helpful_rating_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."helpful_rating" validate constraint "helpful_rating_user_id_fkey";

alter table "public"."notifications" add constraint "announcement_published_by_id_fkey" FOREIGN KEY (published_by_id) REFERENCES profiles(user_id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."notifications" validate constraint "announcement_published_by_id_fkey";

alter table "public"."notifications" add constraint "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_key" UNIQUE using index "profiles_id_key";

alter table "public"."profiles" add constraint "profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_user_id_key" UNIQUE using index "profiles_user_id_key";

alter table "public"."profiles" add constraint "profiles_username_check" CHECK ((username ~ '^[a-z0-9._]{3,}$'::text)) not valid;

alter table "public"."profiles" validate constraint "profiles_username_check";

alter table "public"."profiles" add constraint "profiles_username_key" UNIQUE using index "profiles_username_key";

alter table "public"."profiles" add constraint "profiles_username_required_when_onboarded" CHECK (((onboarded = false) OR (username IS NOT NULL) OR (display_name IS NOT NULL))) not valid;

alter table "public"."profiles" validate constraint "profiles_username_required_when_onboarded";

alter table "public"."reports" add constraint "reports_reporter_fkey" FOREIGN KEY (reporter) REFERENCES profiles(user_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."reports" validate constraint "reports_reporter_fkey";

alter table "public"."reports" add constraint "reports_resolved_by_fkey" FOREIGN KEY (resolved_by) REFERENCES profiles(user_id) ON UPDATE CASCADE ON DELETE SET DEFAULT not valid;

alter table "public"."reports" validate constraint "reports_resolved_by_fkey";

alter table "public"."staff_logs" add constraint "staff_logs_staff_id_fkey" FOREIGN KEY (staff_id) REFERENCES profiles(user_id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."staff_logs" validate constraint "staff_logs_staff_id_fkey";

alter table "public"."user_achievements" add constraint "user_achievements_achievement_slug_fkey" FOREIGN KEY (achievement_slug) REFERENCES achievements(slug) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_achievements" validate constraint "user_achievements_achievement_slug_fkey";

alter table "public"."user_achievements" add constraint "user_achievements_awarded_by_id_fkey" FOREIGN KEY (awarded_by_id) REFERENCES profiles(user_id) ON UPDATE CASCADE ON DELETE SET DEFAULT not valid;

alter table "public"."user_achievements" validate constraint "user_achievements_awarded_by_id_fkey";

alter table "public"."user_achievements" add constraint "user_achievements_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_achievements" validate constraint "user_achievements_user_id_fkey";

alter table "public"."user_cube_ratings" add constraint "user_cube_ratings_comment_check" CHECK ((length(comment) < 550)) not valid;

alter table "public"."user_cube_ratings" validate constraint "user_cube_ratings_comment_check";

alter table "public"."user_cube_ratings" add constraint "user_ratings_cube_slug_fkey" FOREIGN KEY (cube_slug) REFERENCES cube_models(slug) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_cube_ratings" validate constraint "user_ratings_cube_slug_fkey";

alter table "public"."user_cube_ratings" add constraint "user_ratings_id_key" UNIQUE using index "user_ratings_id_key";

alter table "public"."user_cube_ratings" add constraint "user_ratings_rating_check" CHECK (((rating >= (0.5)::double precision) AND (rating <= (5)::double precision))) not valid;

alter table "public"."user_cube_ratings" validate constraint "user_ratings_rating_check";

alter table "public"."user_cube_ratings" add constraint "user_ratings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_cube_ratings" validate constraint "user_ratings_user_id_fkey";

alter table "public"."user_cubes" add constraint "no_quantity_for_wishlist" CHECK (((status <> 'Wishlist'::user_cube_status) OR (quantity = 1))) not valid;

alter table "public"."user_cubes" validate constraint "no_quantity_for_wishlist";

alter table "public"."user_cubes" add constraint "user_cubes_bought_from_fkey" FOREIGN KEY (bought_from) REFERENCES vendors(slug) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."user_cubes" validate constraint "user_cubes_bought_from_fkey";

alter table "public"."user_cubes" add constraint "user_cubes_cube_fkey" FOREIGN KEY (cube) REFERENCES cube_models(slug) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_cubes" validate constraint "user_cubes_cube_fkey";

alter table "public"."user_cubes" add constraint "user_cubes_notes_check" CHECK ((length(notes) < 200)) not valid;

alter table "public"."user_cubes" validate constraint "user_cubes_notes_check";

alter table "public"."user_cubes" add constraint "user_cubes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_cubes" validate constraint "user_cubes_user_id_fkey";

alter table "public"."user_follows" add constraint "user_follows_follower_id_fkey" FOREIGN KEY (follower_id) REFERENCES profiles(user_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_follows" validate constraint "user_follows_follower_id_fkey";

alter table "public"."user_follows" add constraint "user_follows_following_id_fkey" FOREIGN KEY (following_id) REFERENCES profiles(user_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_follows" validate constraint "user_follows_following_id_fkey";

alter table "public"."user_notification_status" add constraint "user_notification_status_notification_id_fkey" FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE not valid;

alter table "public"."user_notification_status" validate constraint "user_notification_status_notification_id_fkey";

alter table "public"."user_notification_status" add constraint "user_notification_status_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE not valid;

alter table "public"."user_notification_status" validate constraint "user_notification_status_user_id_fkey";

alter table "public"."user_onboarding" add constraint "user_onboarding_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON UPDATE CASCADE ON DELETE SET DEFAULT not valid;

alter table "public"."user_onboarding" validate constraint "user_onboarding_user_id_fkey";

alter table "public"."vendors" add constraint "vendors_base_url_check" CHECK ((base_url ~ '^https?://'::text)) not valid;

alter table "public"."vendors" validate constraint "vendors_base_url_check";

alter table "public"."vendors" add constraint "vendors_base_url_key" UNIQUE using index "vendors_base_url_key";

alter table "public"."vendors" add constraint "vendors_country_iso_check" CHECK ((length(country_iso) <= 2)) not valid;

alter table "public"."vendors" validate constraint "vendors_country_iso_check";

alter table "public"."vendors" add constraint "vendors_currency_check" CHECK ((length(currency) <= 3)) not valid;

alter table "public"."vendors" validate constraint "vendors_currency_check";

alter table "public"."vendors" add constraint "vendors_name_key" UNIQUE using index "vendors_name_key";

alter table "public"."vendors" add constraint "vendors_vendor_id_key" UNIQUE using index "vendors_vendor_id_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.build_v_detailed_cube_models()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
declare
  cols text := '';
  r record;
  colname text;
begin
  -- Build ", exists(...) as <col>" for each feature
  for r in
    select code
    from cube_features
    order by code
  loop
    -- Make a safe SQL identifier from the feature code
    colname := r.code;

    cols := cols || format(
      ', exists (select 1
                 from cubes_model_features f
                 where f.cube = cm.slug
                   and f.feature = %L) as %I',
      r.code,      -- literal (e.g., 'wca_legal')
      colname      -- identifier (e.g., wca_legal)
    );
  end loop;

  -- Create the view
  execute format($sql$
    create or replace view public.v_detailed_cube_models as
    select
      cm.* %s,
      (cm.series || ' ' || cm.model || ' ' || cm.version_name) as name,
      extract(year from cm.release_date)::int as year,
      (select count(*) from user_cubes uc where uc.cube = cm.slug) as popularity,
      (select avg(price) from cube_vendor_links cvl where cvl.cube_slug = cm.slug and (select currency from vendors v where cvl.vendor_name = v.name) = 'USD') as avg_price
    from cube_models cm
  $sql$, cols);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.create_following_notification()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$declare v_name text;

v_username text;

begin
-- Get follower's name + username in one shot (fall back to username)
select
  coalesce(p.display_name, p.username),
  p.username into v_name,
  v_username
from
  public.profiles p
where
  p.user_id = NEW.follower_id;

-- If the follower profile is missing, skip gracefully
if v_username is null then return NEW;

end if;

insert into
  public.notifications (
    icon,
    message,
    user_id,
    published_by_id,
    link,
    link_text
  )
values
  (
    'fa-solid fa-user-plus',
    format('%s started following you.', v_name),
    NEW.following_id, -- the person who should be notified
    NEW.follower_id, -- the actor who caused the notification
    '/user/' || v_username,
    format('See %s''s profile', v_name)
  );

return NEW;

end;$function$
;

CREATE OR REPLACE FUNCTION public.cube_links_snapshot_table_rules()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$begin

raise exception 'Cube links snapshots can not be updated';

end;$function$
;

CREATE OR REPLACE FUNCTION public.cube_models_table_rules()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$begin
-- 1. If the cube is not Pending, prevent changes to verified_at / verified_by_id
if old.status <> 'Pending' then if new.verified_at is distinct from old.verified_at then raise exception 'Cannot change verified_at unless status = Pending';

end if;

if new.verified_by_id is distinct from old.verified_by_id then raise exception 'Cannot change verified_by_id unless status = Pending';

end if;

end if;

-- 2. Once a cube is Rejected, prevent *any* updates
if old.status = 'Rejected'
and row (new.*) is distinct from row (old.*) then raise exception 'Cannot update rejected cubes';

end if;

-- 3. Once a cube is Approved, prevent status changes
if old.status = 'Approved' then if new.status is distinct from old.status then raise exception 'Cannot change status of Approved cubes';

end if;

end if;

-- 4. submitted_by_id is immutable
if new.submitted_by_id is distinct from old.submitted_by_id then raise exception 'Cannot change submitted_by_id';

end if;

-- 5. Primary key id is immutable
if new.id is distinct from old.id then raise exception 'Cannot change id';

end if;

-- 6. created_at is immutable
if new.created_at is distinct from old.created_at then raise exception 'Cannot change created_at';

end if;

-- 7. Set custom slug to rejected cubes
if new.status = 'Rejected'
and (
  tg_op = 'INSERT'
  or old.status <> 'Rejected'
) then if new.slug is null
or left(new.slug, 9) <> 'rejected-' then new.slug := 'rejected-' || new.id::text;

end if;

end if;

-- 8. Only Rejected cubes can be deleted
if old.status <> 'Rejected'
and tg_op = 'DELETE' then raise exception 'Cannot delete non‑Rejected cubes';

end if;

if tg_op = 'DELETE' then return old;

else return new;

end if;

end;$function$
;

CREATE OR REPLACE FUNCTION public.cubes_model_features_table_rules()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$begin

raise exception 'Update on cubes_model_features is forbidden';

end;$function$
;

CREATE OR REPLACE FUNCTION public.due_vendor_links_capped(p_limit integer DEFAULT 100, p_per_vendor integer DEFAULT 40, p_backoff_cap integer DEFAULT 4, p_base interval DEFAULT '12:00:00'::interval)
 RETURNS TABLE(id bigint, url text, vendor_name text, cube_slug text, price numeric, available boolean, updated_at timestamp with time zone, streak_unchanged integer)
 LANGUAGE sql
 STABLE
AS $function$with base as (
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
  limit p_limit;$function$
;

CREATE OR REPLACE FUNCTION public.get_types(enum_type text)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.helpful_rating_table_rules()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$begin if tg_op = 'UPDATE' and row (new.*) is distinct from row (old.*) then raise exception 'Cannot update helpful_rating';

end if;

if new.rating_category = 'cube'
and not exists (
  select
    1
  from
    user_cube_ratings ucr
  where
    ucr.id = new.rating
) then raise exception 'The given cube rating id does not match a cube rating';

end if;

end;$function$
;

CREATE OR REPLACE FUNCTION public.insert_user_achievement()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
  INSERT INTO user_achievements (username, achievement, awarded_by)
  VALUES (NEW.username, 'Early Collector', 'CubeIndex');
  RETURN NEW;
END;$function$
;

CREATE OR REPLACE FUNCTION public.log_data_changes()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$declare
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

end;$function$
;

CREATE OR REPLACE FUNCTION public.notify_discord_new_cube_model()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$declare payload jsonb;

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

end;$function$
;

CREATE OR REPLACE FUNCTION public.notify_discord_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$declare
  payload jsonb;
begin
  -- Run only if onboarded changes from false to true
  if (not old.onboarded and new.onboarded) then
    payload := json_build_object(
      'nthMember',
      (select count(*) from profiles),
      'username', new.username,
      'display_name', new.display_name
    );

    perform net.http_post(
      url := 'https://spsqaktodgqnqbkgilxp.supabase.co/functions/v1/discord-new-users-notification'::text,
      headers := json_build_object('Content-Type', 'application/json')::jsonb,
      body := payload::jsonb
    );
  end if;

  return new;
end;$function$
;

CREATE OR REPLACE FUNCTION public.notify_discord_new_user_report()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$declare payload jsonb;

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

end;$function$
;

CREATE OR REPLACE FUNCTION public.notify_discord_price_alert()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$declare
  price_history float8[];
  latest float8;
  previous float8;
  payload jsonb;
  cube_name text;
  currency text;
begin
  -- Get the two most recent prices as an ordered array: [latest, previous]
  select array_agg(s.price order by s.created_at desc)
  into price_history
  from (
    select price, created_at
    from cube_vendor_links_snapshot
    where vendor_name = new.vendor_name
      and cube_slug   = new.cube_slug
    order by created_at desc
    limit 2
  ) as s;

  if coalesce(array_length(price_history, 1), 0) >= 2 then
    latest   := price_history[1];
    previous := price_history[2];

    if latest is not null and previous is not null and latest < previous then
      -- Build a nice display name like "GAN 12 MagLev UV"
      select concat_ws(' ', series, model,
                       nullif(version_name, ''))
      into cube_name
      from cube_models
      where slug = new.cube_slug;

      select v.currency
      into currency
      from vendors v
      where v.name = new.vendor_name;

      payload := jsonb_build_object(
        'cube_name',  cube_name,
        'old_price',  previous,
        'new_price',  latest,
        'currency',   currency,
        'shop_name',  new.vendor_name,
        'shop_link',  new.url,
        -- Prefer a full URL if your webhook expects it
        'cube_link',  'https://cubeindexbeta.netlify.app/explore/cubes/' || new.cube_slug
      );

      perform net.http_post(
        url     := 'https://spsqaktodgqnqbkgilxp.supabase.co/functions/v1/cube-price-alerts',
        headers := jsonb_build_object('Content-Type','application/json'),
        body    := payload
      );
    end if;
  end if;

  return new;
end;$function$
;

CREATE OR REPLACE FUNCTION public.prevent_update()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$begin raise exception 'updating selected column forbidden';

end;$function$
;

CREATE OR REPLACE FUNCTION public.reports_table_rules()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$begin if old.resolved = true then if row (new.*) is distinct from row (old.*) then raise exception 'Cannot update reports with resolved status';

end if;

end if;

if new.report_type = 'user'
and not exists (
  select
    1
  from
    profiles p
  where
    p.user_id = new.reported::uuid
) then raise exception 'The given user_id does not match a user';

end if;

if new.report_type = 'cube-rating'
and not exists (
  select
    1
  from
    user_cube_ratings ucr
  where
    ucr.id = new.reported::bigint
) then raise exception 'The given cube rating id does not match a cube rating';

end if;

if tg_op = 'DELETE' then return old;

else return new;

end if;

end;$function$
;

CREATE OR REPLACE FUNCTION public.save_cube_vendor_links_snapshots()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$begin IF TG_OP in ('INSERT', 'UPDATE') then
IF not exists (
  select
    1
  from
    public.cube_vendor_links_snapshot s
  where
    s.cube_slug = NEW.cube_slug
    and s.vendor_name = NEW.vendor_name
    and s.url = NEW.url
)
or exists (
  select
    1
  from
    (
      select
        s.price,
        s.available
      from
        public.cube_vendor_links_snapshot s
      where
        s.cube_slug = NEW.cube_slug
        and s.vendor_name = NEW.vendor_name
        and s.url = NEW.url
      order by
        s.created_at desc nulls last
      limit
        1
    ) last
  where
    last.price is distinct from NEW.price
    or last.available is distinct from NEW.available
) then
insert into
  public.cube_vendor_links_snapshot (
    cube_slug,
    vendor_name,
    url,
    available,
    price,
    created_at
  )
values
  (
    NEW.cube_slug,
    NEW.vendor_name,
    NEW.url,
    NEW.available,
    NEW.price,
    now()
  );

end IF;

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

end;$function$
;

CREATE OR REPLACE FUNCTION public.set_updated_at_now()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$begin

if TG_TABLE_NAME = 'cube_models' then
    NEW.updated_at := now();
  end if;

  if TG_TABLE_NAME = 'user_cube_ratings' then
    NEW.updated_at := now();
  end if;

    if TG_TABLE_NAME = 'user_cubes' then
    NEW.modified_at := now();
  end if;

      if TG_TABLE_NAME = 'vendors' then
    NEW.updated_at := now();
  end if;

        if TG_TABLE_NAME = 'cube_vendor_links' then
    NEW.updated_at := now();
  end if;

return new;

end;$function$
;

CREATE OR REPLACE FUNCTION public.staff_logs_table_rules()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$begin 

raise exception 'Update and delete on staff logs is restricted';

return new;

end;$function$
;

CREATE OR REPLACE FUNCTION public.update_average_cube_rating()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$DECLARE
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
END;$function$
;

CREATE OR REPLACE FUNCTION public.update_password(current_plain_password text, new_plain_password text, current_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.user_achievements_table_rules()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$begin if tg_op = 'UPDATE'
and row (new.*) is distinct from row (old.*) then raise exception 'Update on user_achievements is restricted';

end if;

if (
  select
    verified
  from
    profiles p
  where
    p.user_id = new.user_id
) = false then raise exception 'Only verified users can earn achievements';

end if;

return new;

end;$function$
;

CREATE OR REPLACE FUNCTION public.user_cube_ratings_achi_check()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$declare rating_count int;

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
  public.user_achievements (user_id, achievement_slug)
values
  (new.user_id, 'first-impressions')
on conflict do nothing;

return new;

end$function$
;

CREATE OR REPLACE FUNCTION public.user_cube_ratings_table_rules()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$begin
  if not exists (
    select 1 from cube_models
    where slug = new.cube_slug
      and status = 'Approved'
  ) then
    raise exception 'Cannot add rating unless it is Approved';
  end if;

  if (
  select
    verified
  from
    profiles p
  where
    p.user_id = new.user_id
) = false then raise exception 'Only verified users can rate cubes';

end if;

  return new;
end;$function$
;

CREATE OR REPLACE FUNCTION public.user_cubes_achi_check()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$begin
if (
  (
    select
      version_type
    from
      cube_models
    where
      slug = new.cube
  ) = 'Limited'
) then
insert into
  user_achievements (user_id, achievement_slug)
values
  (new.user_id, 'collectors-edition');

end if;

if (
  (
    select
      count(*)
    from
      user_cubes uc
      join cube_models cm on uc.cube = cm.slug
    where
      cm.type = '3x3x3'
      and uc.user_id = new.user_id
  ) >= 3
) then
insert into
  user_achievements (user_id, achievement_slug)
values
  (new.user_id, 'never-two-without-three')
on conflict do nothing;

end if;

if (
  exists (
    select
      1
    from
      user_cubes uc
      join cube_models cm on cm.slug = uc.cube
    where
      uc.user_id = new.user_id
      -- ensure it's NxNxN
      and cm.type ~ '^\d+x\d+x\d+$'
      -- ensure all three dimensions are equal
      and split_part(cm.type, 'x', 1) = split_part(cm.type, 'x', 2)
      and split_part(cm.type, 'x', 2) = split_part(cm.type, 'x', 3)
      -- check size range
      and split_part(cm.type, 'x', 1)::int between 6 and 21
  )
) then
insert into
  user_achievements (user_id, achievement_slug)
values
  (new.user_id, 'big-cube-master')
on conflict do nothing;

end if;

if (
  exists (
    select
      1
    from
      cubes_model_features cmf
    where
      cmf.cube = new.cube
      and cmf.feature = 'smart'
  )
) then
insert into
  user_achievements (user_id, achievement_slug)
values
  (new.user_id, 'smarty')
on conflict do nothing;

end if;

insert into
  user_achievements (user_id, achievement_slug)
values
  (new.user_id, 'early-collector')
on conflict do nothing;

if (new.quantity >= 2) then
insert into
  user_achievements (user_id, achievement_slug)
values
  (new.user_id, 'better-safe-than-sorry')
on conflict do nothing;
end if;

return new;

end;$function$
;

CREATE OR REPLACE FUNCTION public.user_cubes_table_rules()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$begin if not exists (
  select
    1
  from
    cube_models
  where
    slug = new.cube
    and status = 'Approved'
) then raise exception 'Cannot add cube to collection unless it is Approved';

end if;

if (
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

CREATE OR REPLACE FUNCTION public.user_follows_table_rules()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$begin

raise exception 'Update on user_follows is restricted';

end;$function$
;

create or replace view "public"."v_achievement_rarity" as  WITH eligible AS (
         SELECT (count(*))::numeric AS n
           FROM profiles
          WHERE (COALESCE(profiles.onboarded, false) = true)
        ), counts AS (
         SELECT a.id,
            a.name,
            a.icon,
            a.description,
            a.created_at,
            a.updated_at,
            a.unlockable,
            a.slug,
            a.unlock_method,
            a.rarity,
            a.category,
            a.title,
            a.evolutive,
            a.evolves_from,
            a.submitted_by_id,
            a.is_special,
            a.hidden,
            (COALESCE(count(ua.user_id), (0)::bigint))::integer AS holders_count
           FROM (achievements a
             LEFT JOIN user_achievements ua ON ((ua.achievement_slug = a.slug)))
          GROUP BY a.id, a.slug, a.name, a.icon, a.description, a.category, a.title, a.unlock_method, a.unlockable, a.hidden, a.is_special, a.created_at
        ), scored AS (
         SELECT c.id,
            c.slug,
            c.name,
            c.icon,
            c.description,
            c.category,
            c.title,
            c.unlock_method,
            c.unlockable,
            c.hidden,
            c.is_special,
            c.holders_count,
            c.created_at,
                CASE
                    WHEN (e.n = (0)::numeric) THEN (0)::numeric
                    ELSE round((((100)::numeric * (c.holders_count)::numeric) / e.n), 2)
                END AS rarity_percent
           FROM (counts c
             CROSS JOIN eligible e)
        )
 SELECT scored.id,
    scored.slug,
    scored.name,
    scored.icon,
    scored.description,
    scored.category,
    scored.title,
    scored.unlock_method,
    scored.unlockable,
    scored.hidden,
    scored.holders_count,
    scored.rarity_percent,
    scored.created_at,
        CASE
            WHEN scored.is_special THEN 'Special'::text
            WHEN (scored.holders_count = 0) THEN 'Legendary'::text
            WHEN ((((100)::numeric * (scored.holders_count)::numeric) / NULLIF(( SELECT eligible.n
               FROM eligible), (0)::numeric)) < (1)::numeric) THEN 'Legendary'::text
            WHEN ((((100)::numeric * (scored.holders_count)::numeric) / NULLIF(( SELECT eligible.n
               FROM eligible), (0)::numeric)) < (5)::numeric) THEN 'Epic'::text
            WHEN ((((100)::numeric * (scored.holders_count)::numeric) / NULLIF(( SELECT eligible.n
               FROM eligible), (0)::numeric)) < (20)::numeric) THEN 'Rare'::text
            WHEN ((((100)::numeric * (scored.holders_count)::numeric) / NULLIF(( SELECT eligible.n
               FROM eligible), (0)::numeric)) < (50)::numeric) THEN 'Uncommon'::text
            ELSE 'Common'::text
        END AS rarity
   FROM scored;


create or replace view "public"."v_detailed_cube_models" as  SELECT cm.brand,
    cm.image_url,
    cm.model,
    cm.rating,
    cm.slug,
    cm.created_at,
    cm.updated_at,
    cm.type,
    cm.discontinued,
    cm.release_date,
    cm.series,
    cm.id,
    cm.sub_type,
    cm.weight,
    cm.related_to,
    cm.version_type,
    cm.version_name,
    cm.status,
    cm.notes,
    cm.surface_finish,
    cm.verified_at,
    cm.size,
    cm.submitted_by_id,
    cm.verified_by_id,
    (EXISTS ( SELECT 1
           FROM cubes_model_features f
          WHERE ((f.cube = cm.slug) AND (f.feature = 'ball_core'::text)))) AS ball_core,
    (EXISTS ( SELECT 1
           FROM cubes_model_features f
          WHERE ((f.cube = cm.slug) AND (f.feature = 'maglev'::text)))) AS maglev,
    (EXISTS ( SELECT 1
           FROM cubes_model_features f
          WHERE ((f.cube = cm.slug) AND (f.feature = 'magnetic'::text)))) AS magnetic,
    (EXISTS ( SELECT 1
           FROM cubes_model_features f
          WHERE ((f.cube = cm.slug) AND (f.feature = 'modded'::text)))) AS modded,
    (EXISTS ( SELECT 1
           FROM cubes_model_features f
          WHERE ((f.cube = cm.slug) AND (f.feature = 'smart'::text)))) AS smart,
    (EXISTS ( SELECT 1
           FROM cubes_model_features f
          WHERE ((f.cube = cm.slug) AND (f.feature = 'stickered'::text)))) AS stickered,
    (EXISTS ( SELECT 1
           FROM cubes_model_features f
          WHERE ((f.cube = cm.slug) AND (f.feature = 'wca_legal'::text)))) AS wca_legal,
    ((((cm.series || ' '::text) || cm.model) || ' '::text) || cm.version_name) AS name,
    (EXTRACT(year FROM cm.release_date))::integer AS year,
    ( SELECT count(*) AS count
           FROM user_cubes uc
          WHERE (uc.cube = cm.slug)) AS popularity,
    ( SELECT avg(cvl.price) AS avg
           FROM cube_vendor_links cvl
          WHERE ((cvl.cube_slug = cm.slug) AND (( SELECT v.currency
                   FROM vendors v
                  WHERE (cvl.vendor_name = v.name)) = 'USD'::text))) AS avg_price
   FROM cube_models cm;


create or replace view "public"."v_detailed_profiles" as  SELECT p.id,
    p.created_at,
    p.user_id,
    p.username,
    p.private,
    p.profile_picture,
    p.bio,
    p.socials,
    p.banner,
    p.verified,
    p.certified,
    p.role,
    p.display_name,
    p.onboarded,
    COALESCE(uc.cube_count, (0)::bigint) AS user_cubes_count,
    COALESCE(ua.achievement_count, (0)::bigint) AS user_achievements_count,
    COALESCE(fwing.following_count, (0)::bigint) AS user_following_count,
    COALESCE(fwer.follower_count, (0)::bigint) AS user_follower_count,
    COALESCE(ur.ratings_count, (0)::bigint) AS user_cube_ratings_count,
    COALESCE(ur.rating_avg, (0)::double precision) AS user_avg_rating_count
   FROM (((((profiles p
     LEFT JOIN ( SELECT user_cubes.user_id,
            count(*) AS cube_count
           FROM user_cubes
          GROUP BY user_cubes.user_id) uc ON ((uc.user_id = p.user_id)))
     LEFT JOIN ( SELECT user_achievements.user_id,
            count(*) AS achievement_count
           FROM user_achievements
          GROUP BY user_achievements.user_id) ua ON ((ua.user_id = p.user_id)))
     LEFT JOIN ( SELECT user_follows.follower_id,
            count(*) AS following_count
           FROM user_follows
          GROUP BY user_follows.follower_id) fwing ON ((fwing.follower_id = p.user_id)))
     LEFT JOIN ( SELECT user_follows.following_id,
            count(*) AS follower_count
           FROM user_follows
          GROUP BY user_follows.following_id) fwer ON ((fwer.following_id = p.user_id)))
     LEFT JOIN ( SELECT user_cube_ratings.user_id,
            count(*) AS ratings_count,
            avg(user_cube_ratings.rating) AS rating_avg
           FROM user_cube_ratings
          GROUP BY user_cube_ratings.user_id) ur ON ((ur.user_id = p.user_id)));


create or replace view "public"."v_notifications_for_user" as  SELECT n.id,
    n.message,
    n.icon,
    n.link,
    n.link_text,
    n.created_at,
    n.published_by_id,
    n.user_id,
    COALESCE(uns.read, false) AS read
   FROM (notifications n
     LEFT JOIN user_notification_status uns ON (((uns.notification_id = n.id) AND (uns.user_id = auth.uid()))))
  WHERE ((n.user_id = auth.uid()) OR (n.user_id IS NULL));



  create policy "Enable read access for all users"
  on "public"."accessories"
  as permissive
  for select
  to public
using (true);



  create policy "Enable read access for all users"
  on "public"."achievements"
  as permissive
  for select
  to public
using (true);



  create policy "Enable insert for Database Managers and Admins"
  on "public"."brands"
  as permissive
  for insert
  to authenticated
with check ((( SELECT profiles.role
   FROM profiles
  WHERE (profiles.user_id = auth.uid())) = ANY (ARRAY['Database Manager'::users_roles, 'Admin'::users_roles])));



  create policy "Enable read access for all users"
  on "public"."brands"
  as permissive
  for select
  to public
using (true);



  create policy "Enable delete for Admins and Community Managers"
  on "public"."cube_models"
  as permissive
  for delete
  to authenticated
using ((( SELECT profiles.role
   FROM profiles
  WHERE (profiles.user_id = auth.uid())) = ANY (ARRAY['Database Manager'::users_roles, 'Admin'::users_roles])));



  create policy "Enable read access for all users"
  on "public"."cube_models"
  as permissive
  for select
  to public
using (true);



  create policy "Only Database Manager's and Admin's can insert"
  on "public"."cube_models"
  as permissive
  for insert
  to authenticated
with check ((( SELECT profiles.role
   FROM profiles
  WHERE (profiles.user_id = auth.uid())) = ANY (ARRAY['Database Manager'::users_roles, 'Admin'::users_roles])));



  create policy "Only Database Manager's and Admin's can update"
  on "public"."cube_models"
  as permissive
  for update
  to authenticated
using ((( SELECT profiles.role
   FROM profiles
  WHERE (profiles.user_id = auth.uid())) = ANY (ARRAY['Database Manager'::users_roles, 'Admin'::users_roles])));



  create policy "Enable insert for Admins and Database Managers only"
  on "public"."cube_types"
  as permissive
  for insert
  to public
with check ((( SELECT profiles.role
   FROM profiles
  WHERE (profiles.user_id = auth.uid())) = ANY (ARRAY['Database Manager'::users_roles, 'Admin'::users_roles])));



  create policy "Enable read access for all users"
  on "public"."cube_types"
  as permissive
  for select
  to public
using (true);



  create policy "Enable update for users based on email"
  on "public"."cube_types"
  as permissive
  for update
  to public
using (true);



  create policy "Only Admins and Database Managers can insert"
  on "public"."cube_vendor_links"
  as permissive
  for insert
  to public
with check ((( SELECT profiles.role
   FROM profiles
  WHERE (profiles.user_id = auth.uid())) = ANY (ARRAY['Database Manager'::users_roles, 'Admin'::users_roles])));



  create policy "Only Admins and Database Managers can update"
  on "public"."cube_vendor_links"
  as permissive
  for update
  to public
using ((( SELECT profiles.role
   FROM profiles
  WHERE (profiles.user_id = auth.uid())) = ANY (ARRAY['Database Manager'::users_roles, 'Admin'::users_roles])));



  create policy "Read access for all users"
  on "public"."cube_vendor_links"
  as permissive
  for select
  to public
using (true);



  create policy "Select for everyone"
  on "public"."cube_vendor_links_snapshot"
  as permissive
  for select
  to public
using (true);



  create policy "Enable delete for Database Managers and Admins"
  on "public"."cubes_model_features"
  as permissive
  for delete
  to authenticated
using ((( SELECT profiles.role
   FROM profiles
  WHERE (profiles.user_id = auth.uid())) = ANY (ARRAY['Database Manager'::users_roles, 'Admin'::users_roles])));



  create policy "Enable insert for Database Managers and Admins"
  on "public"."cubes_model_features"
  as permissive
  for insert
  to authenticated
with check ((( SELECT profiles.role
   FROM profiles
  WHERE (profiles.user_id = auth.uid())) = ANY (ARRAY['Database Manager'::users_roles, 'Admin'::users_roles])));



  create policy "Enable read access for all users"
  on "public"."cubes_model_features"
  as permissive
  for select
  to public
using (true);



  create policy "Enable read access for all users"
  on "public"."features"
  as permissive
  for select
  to public
using (true);



  create policy "Enable delete for users based on username"
  on "public"."helpful_rating"
  as permissive
  for delete
  to authenticated
using ((user_id = auth.uid()));



  create policy "Enable insert for authenticated users only"
  on "public"."helpful_rating"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable read access for all users"
  on "public"."helpful_rating"
  as permissive
  for select
  to public
using (true);



  create policy "Only Community Managers and Admins can insert"
  on "public"."notifications"
  as permissive
  for insert
  to public
with check ((( SELECT profiles.role
   FROM profiles
  WHERE (profiles.user_id = auth.uid())) = ANY (ARRAY['Community Manager'::users_roles, 'Admin'::users_roles])));



  create policy "Only Community Managers and Admins can update"
  on "public"."notifications"
  as permissive
  for update
  to public
using ((( SELECT profiles.role
   FROM profiles
  WHERE (profiles.user_id = auth.uid())) = ANY (ARRAY['Community Manager'::users_roles, 'Admin'::users_roles])))
with check ((( SELECT profiles.role
   FROM profiles
  WHERE (profiles.user_id = auth.uid())) = ANY (ARRAY['Community Manager'::users_roles, 'Admin'::users_roles])));



  create policy "Select own notifications and broadcast"
  on "public"."notifications"
  as permissive
  for select
  to authenticated
using (((user_id = auth.uid()) OR (user_id IS NULL)));



  create policy "Enable read access for all users"
  on "public"."profiles"
  as permissive
  for select
  to public
using (true);



  create policy "Everyone can insert"
  on "public"."profiles"
  as permissive
  for insert
  to public
with check (true);



  create policy "Users can delete their own profile"
  on "public"."profiles"
  as permissive
  for delete
  to authenticated
using ((auth.uid() = user_id));



  create policy "Users can update their own profile"
  on "public"."profiles"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Enable insert for authenticated users only"
  on "public"."reports"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Only Staff can read"
  on "public"."reports"
  as permissive
  for select
  to public
using ((( SELECT profiles.role
   FROM profiles
  WHERE (profiles.user_id = auth.uid())) <> 'User'::users_roles));



  create policy "Only staff can update"
  on "public"."reports"
  as permissive
  for update
  to authenticated
using ((( SELECT profiles.role
   FROM profiles
  WHERE (profiles.user_id = auth.uid())) <> 'User'::users_roles));



  create policy "Enable insert for authenticated users only"
  on "public"."staff_logs"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable read access for all users"
  on "public"."staff_logs"
  as permissive
  for select
  to public
using (true);



  create policy "Authenticated can insert into user_achievements"
  on "public"."user_achievements"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable read access for all users"
  on "public"."user_achievements"
  as permissive
  for select
  to public
using (true);



  create policy "Enable insert for authenticated users only"
  on "public"."user_cube_ratings"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable read access for all users"
  on "public"."user_cube_ratings"
  as permissive
  for select
  to public
using (true);



  create policy "Users can delete their own ratings"
  on "public"."user_cube_ratings"
  as permissive
  for delete
  to authenticated
using (((user_id = auth.uid()) OR (( SELECT profiles.role
   FROM profiles
  WHERE (profiles.user_id = auth.uid())) = ANY (ARRAY['Moderator'::users_roles, 'Admin'::users_roles]))));



  create policy "Users can update their own ratings"
  on "public"."user_cube_ratings"
  as permissive
  for update
  to authenticated
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));



  create policy "Enable insert for authenticated users only"
  on "public"."user_cubes"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable read access for all users"
  on "public"."user_cubes"
  as permissive
  for select
  to public
using (true);



  create policy "Users can delete their own cubes"
  on "public"."user_cubes"
  as permissive
  for delete
  to authenticated
using ((user_id = auth.uid()));



  create policy "Users can modify their own cubes"
  on "public"."user_cubes"
  as permissive
  for update
  to authenticated
using ((user_id = auth.uid()));



  create policy "Enable delete for users based on user_id"
  on "public"."user_follows"
  as permissive
  for delete
  to public
using ((( SELECT auth.uid() AS uid) = ANY (ARRAY[follower_id, following_id])));



  create policy "Enable insert for authenticated users only"
  on "public"."user_follows"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable read access for all users"
  on "public"."user_follows"
  as permissive
  for select
  to public
using (true);



  create policy "status select own"
  on "public"."user_notification_status"
  as permissive
  for select
  to authenticated
using ((user_id = auth.uid()));



  create policy "status update own"
  on "public"."user_notification_status"
  as permissive
  for update
  to authenticated
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));



  create policy "status upsert own"
  on "public"."user_notification_status"
  as permissive
  for insert
  to authenticated
with check ((user_id = auth.uid()));



  create policy "Enable insert for authenticated users only"
  on "public"."user_onboarding"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable read access for all users"
  on "public"."vendors"
  as permissive
  for select
  to public
using (true);



  create policy "Only Admins and Database Managers can insert"
  on "public"."vendors"
  as permissive
  for insert
  to public
with check ((( SELECT profiles.role
   FROM profiles
  WHERE (profiles.user_id = auth.uid())) = ANY (ARRAY['Database Manager'::users_roles, 'Admin'::users_roles])));



  create policy "Only Database Managers and Admins can update"
  on "public"."vendors"
  as permissive
  for update
  to public
using ((( SELECT profiles.role
   FROM profiles
  WHERE (profiles.user_id = auth.uid())) = ANY (ARRAY['Database Manager'::users_roles, 'Admin'::users_roles])));


CREATE TRIGGER log_brands_insert AFTER INSERT ON public.brands FOR EACH ROW EXECUTE FUNCTION log_data_changes();

CREATE TRIGGER log_cube_models AFTER INSERT OR DELETE OR UPDATE OF brand, image_url, model, slug, created_at, updated_at, type, discontinued, release_date, series, id, sub_type, weight, related_to, version_type, version_name, status, notes, surface_finish, verified_at, size, submitted_by_id, verified_by_id ON public.cube_models FOR EACH ROW EXECUTE FUNCTION log_data_changes();

CREATE TRIGGER notify_discord_new_cube AFTER INSERT OR UPDATE ON public.cube_models FOR EACH ROW EXECUTE FUNCTION notify_discord_new_cube_model();

CREATE TRIGGER trg_cube_models_table_rules BEFORE INSERT OR DELETE OR UPDATE ON public.cube_models FOR EACH ROW EXECUTE FUNCTION cube_models_table_rules();

CREATE TRIGGER log_cube_types_insert AFTER INSERT ON public.cube_types FOR EACH ROW EXECUTE FUNCTION log_data_changes();

CREATE TRIGGER trg_save_cube_vendor_links_snapshots AFTER INSERT OR DELETE OR UPDATE ON public.cube_vendor_links FOR EACH ROW EXECUTE FUNCTION save_cube_vendor_links_snapshots();

CREATE TRIGGER trg_cube_links_snapshot_table_rules BEFORE UPDATE ON public.cube_vendor_links_snapshot FOR EACH ROW EXECUTE FUNCTION cube_links_snapshot_table_rules();

CREATE TRIGGER trg_price_alert_discord AFTER INSERT ON public.cube_vendor_links_snapshot FOR EACH ROW EXECUTE FUNCTION notify_discord_price_alert();

CREATE TRIGGER trg_cubes_model_features_table_rules BEFORE UPDATE ON public.cubes_model_features FOR EACH ROW EXECUTE FUNCTION cubes_model_features_table_rules();

CREATE TRIGGER trg_helpful_rating_table_rule BEFORE INSERT OR UPDATE ON public.helpful_rating FOR EACH ROW EXECUTE FUNCTION helpful_rating_table_rules();

CREATE TRIGGER notify_discord_new_user AFTER UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION notify_discord_new_user();

CREATE TRIGGER trg_early_collector_achievement_insert AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION insert_user_achievement();
ALTER TABLE "public"."profiles" DISABLE TRIGGER "trg_early_collector_achievement_insert";

CREATE TRIGGER notify_discord_new_user_report AFTER INSERT ON public.reports FOR EACH ROW EXECUTE FUNCTION notify_discord_new_user_report();

CREATE TRIGGER trg_reports_table_rules BEFORE INSERT OR DELETE OR UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION reports_table_rules();

CREATE TRIGGER trg_staff_logs_table_rules BEFORE DELETE OR UPDATE ON public.staff_logs FOR EACH ROW EXECUTE FUNCTION staff_logs_table_rules();

CREATE TRIGGER trg_user_achievements_table_rules BEFORE UPDATE ON public.user_achievements FOR EACH ROW EXECUTE FUNCTION user_achievements_table_rules();

CREATE TRIGGER trg_update_rating AFTER INSERT OR DELETE OR UPDATE ON public.user_cube_ratings FOR EACH ROW EXECUTE FUNCTION update_average_cube_rating();

CREATE TRIGGER trg_user_cube_ratings_achi_check AFTER INSERT OR UPDATE ON public.user_cube_ratings FOR EACH ROW EXECUTE FUNCTION user_cube_ratings_achi_check();

CREATE TRIGGER trg_user_cubes_achi_check AFTER INSERT OR UPDATE ON public.user_cubes FOR EACH ROW EXECUTE FUNCTION user_cubes_achi_check();

CREATE TRIGGER trg_user_cubes_table_rules BEFORE INSERT OR UPDATE ON public.user_cubes FOR EACH ROW EXECUTE FUNCTION user_cubes_table_rules();

CREATE TRIGGER trg_create_following_notif AFTER INSERT ON public.user_follows FOR EACH ROW EXECUTE FUNCTION create_following_notification();

CREATE TRIGGER trg_user_follows_table_rules BEFORE UPDATE ON public.user_follows FOR EACH ROW EXECUTE FUNCTION user_follows_table_rules();

CREATE TRIGGER log_vendors AFTER INSERT OR UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION log_data_changes();


