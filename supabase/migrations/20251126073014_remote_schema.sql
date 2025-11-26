

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


CREATE TYPE "public"."cube_scrap_runs_status" AS ENUM (
    'queued',
    'done',
    'running',
    'failed'
);


ALTER TYPE "public"."cube_scrap_runs_status" OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."build_v_detailed_cube_models"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $_$
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
$_$;


ALTER FUNCTION "public"."build_v_detailed_cube_models"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_following_notification"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_name text;
    v_username text;
    begin
      -- Get follower's display name or username
        select
            coalesce(p.display_name, p.username),
                p.username
                  into v_name, v_username
                    from public.profiles p
                      where p.user_id = new.follower_id;

                        -- If the follower profile is missing, skip gracefully
                          if v_username is null then
                              return new;
                                end if;

                                  -- Insert notification
                                    insert into public.notifications (
                                        icon,
                                            message,
                                                user_id,
                                                    published_by_id,
                                                        link,
                                                            link_text
                                                              )
                                                                values (
                                                                    'fa-solid fa-user-plus',
                                                                        format('%s started following you.', v_name),
                                                                            new.following_id, -- the person who should be notified
                                                                                new.follower_id,  -- the actor who caused the notification
                                                                                    '/user/' || v_username,
                                                                                        format('See %s''s profile', v_name)
                                                                                          );

                                                                                            return new;
                                                                                            end;
                                                                                            $$;


ALTER FUNCTION "public"."create_following_notification"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cube_links_snapshot_table_rules"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$begin

if row (new.*) is distinct from row (old.*) then
raise exception 'Cube links snapshots can not be updated';
end if;

end;$$;


ALTER FUNCTION "public"."cube_links_snapshot_table_rules"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cube_models_table_rules"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$begin
if old.status <> 'Pending' then if new.verified_at is distinct from old.verified_at then raise exception 'Cannot change verified_at unless status = Pending';

end if;

if new.verified_by_id is distinct from old.verified_by_id then raise exception 'Cannot change verified_by_id unless status = Pending';

end if;

end if;

if old.status = 'Rejected'
and row (new.*) is distinct from row (old.*) and tg_op = 'UPDATE' then raise exception 'Cannot update rejected cubes';

end if;

if old.status = 'Approved' then if new.status is distinct from old.status then raise exception 'Cannot change status of Approved cubes';

end if;

end if;

if new.submitted_by_id is distinct from old.submitted_by_id and tg_op = 'UPDATE' then raise exception 'Cannot change submitted_by_id';

end if;

if new.id is distinct from old.id and tg_op = 'UPDATE' then raise exception 'Cannot change id';

end if;

if new.created_at is distinct from old.created_at and tg_op = 'UPDATE' then raise exception 'Cannot change created_at';

end if;

if new.status = 'Rejected'
and (
  tg_op = 'INSERT'
  or old.status <> 'Rejected'
) then if new.slug is null
or left(new.slug, 9) <> 'rejected-' then new.slug := 'rejected-' || new.id::text;

end if;

end if;

if old.status <> 'Rejected'
and tg_op = 'DELETE' then raise exception 'Cannot delete non‑Rejected cubes';

end if;

if tg_op = 'DELETE' then return old;

else return new;

end if;

end;$$;


ALTER FUNCTION "public"."cube_models_table_rules"() OWNER TO "postgres";


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
    where (now() at time zone 'utc') - updated_at >= effective_cooldown and (select status from cube_models cm where cm.slug = base.cube_slug) = 'Approved'
  )
  select id,url,vendor_name,cube_slug,price,available,updated_at,streak_unchanged
  from ranked
  where rn <= p_per_vendor
  order by updated_at asc
  limit p_limit;$$;


ALTER FUNCTION "public"."due_vendor_links_capped"("p_limit" integer, "p_per_vendor" integer, "p_backoff_cap" integer, "p_base" interval) OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."helpful_rating_table_rules"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$begin if tg_op = 'UPDATE' and row (new.*) is distinct from row (old.*) then raise exception 'Cannot update helpful_rating';

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

end;$$;


ALTER FUNCTION "public"."helpful_rating_table_rules"() OWNER TO "postgres";


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
    AS $$declare
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


CREATE OR REPLACE FUNCTION "public"."notify_discord_price_alert"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$declare
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
        'cube_link',  'https://thecubeindex.com/explore/cubes/' || new.cube_slug
      );

      perform net.http_post(
        url     := 'https://spsqaktodgqnqbkgilxp.supabase.co/functions/v1/cube-price-alerts',
        headers := jsonb_build_object('Content-Type','application/json'),
        body    := payload
      );
    end if;
  end if;

  return new;
end;$$;


ALTER FUNCTION "public"."notify_discord_price_alert"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$begin raise exception 'updating selected column forbidden';

end;$$;


ALTER FUNCTION "public"."prevent_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reports_table_rules"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$begin if old.resolved = true then if row (new.*) is distinct from row (old.*) then raise exception 'Cannot update reports with resolved status';

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

end;$$;


ALTER FUNCTION "public"."reports_table_rules"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."save_cube_vendor_links_snapshots"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if tg_op in ('INSERT', 'UPDATE') then
    if not exists (
      select 1
      from public.cube_vendor_links_snapshot s
      where s.cube_slug   = new.cube_slug
        and s.vendor_name = new.vendor_name
        and s.url         = new.url
    )
    or exists (
      select 1
      from (
        select s.price, s.available
        from public.cube_vendor_links_snapshot s
        where s.cube_slug   = new.cube_slug
          and s.vendor_name = new.vendor_name
          and s.url         = new.url
        order by s.created_at desc nulls last
        limit 1
      ) last
      where last.price     is distinct from new.price
         or last.available is distinct from new.available
    ) then
      insert into public.cube_vendor_links_snapshot (
        cube_slug, vendor_name, url, available, price, created_at
      ) values (
        new.cube_slug,
        new.vendor_name,
        new.url,
        new.available,
        new.price,
        now()
      );
    end if;

    return new;

  elsif tg_op = 'DELETE' then
    delete from public.cube_vendor_links_snapshot
    where cube_slug   = old.cube_slug
      and vendor_name = old.vendor_name
      and url         = old.url;

    return old;
  end if;

  return null;
end;
$$;


ALTER FUNCTION "public"."save_cube_vendor_links_snapshots"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at_now"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$begin

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

end;$$;


ALTER FUNCTION "public"."set_updated_at_now"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."staff_logs_table_rules"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$begin 

raise exception 'Update and delete on staff logs is restricted';

return new;

end;$$;


ALTER FUNCTION "public"."staff_logs_table_rules"() OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."user_achievements_table_rules"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$begin if tg_op = 'UPDATE'
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

end;$$;


ALTER FUNCTION "public"."user_achievements_table_rules"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_cube_ratings_achi_check"() RETURNS "trigger"
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
  public.user_achievements (user_id, achievement_slug)
values
  (new.user_id, 'first-impressions')
on conflict do nothing;

return new;

end$$;


ALTER FUNCTION "public"."user_cube_ratings_achi_check"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_cube_ratings_table_rules"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$begin
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
end;$$;


ALTER FUNCTION "public"."user_cube_ratings_table_rules"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_cubes_achi_check"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $_$begin
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


if (new.quantity >= 2) then
insert into
  user_achievements (user_id, achievement_slug)
values
  (new.user_id, 'better-safe-than-sorry')
on conflict do nothing;
end if;

return new;

end;$_$;


ALTER FUNCTION "public"."user_cubes_achi_check"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_cubes_table_rules"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$begin if not exists (
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

end;$$;


ALTER FUNCTION "public"."user_cubes_table_rules"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_follows_table_rules"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$begin

raise exception 'Update on user_follows is restricted';

end;$$;


ALTER FUNCTION "public"."user_follows_table_rules"() OWNER TO "postgres";

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
    "hidden" boolean DEFAULT false NOT NULL,
    "is_special" boolean DEFAULT false NOT NULL,
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



CREATE TABLE IF NOT EXISTS "public"."awards_category" (
    "id" bigint NOT NULL,
    "event_id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "slug" "text" DEFAULT ''::"text" NOT NULL
);


ALTER TABLE "public"."awards_category" OWNER TO "postgres";


ALTER TABLE "public"."awards_category" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."awards_category_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."awards_event" (
    "id" bigint NOT NULL,
    "title" "text" NOT NULL,
    "year" bigint NOT NULL,
    "start_at" timestamp with time zone NOT NULL,
    "end_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."awards_event" OWNER TO "postgres";


ALTER TABLE "public"."awards_event" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."awards_event_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."awards_nominee" (
    "id" bigint NOT NULL,
    "category_id" bigint NOT NULL,
    "cube_id" bigint NOT NULL,
    "extra_info" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."awards_nominee" OWNER TO "postgres";


ALTER TABLE "public"."awards_nominee" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."awards_nominee_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."awards_user_vote" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "nominee_id" bigint NOT NULL,
    "voted_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "category_id" bigint NOT NULL
);


ALTER TABLE "public"."awards_user_vote" OWNER TO "postgres";


ALTER TABLE "public"."awards_user_vote" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."awards_user_vote_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



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



CREATE TABLE IF NOT EXISTS "public"."cube_scrap_runs" (
    "id" bigint NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text",
    "status" "public"."cube_scrap_runs_status" DEFAULT 'queued'::"public"."cube_scrap_runs_status" NOT NULL,
    "error_message" "text",
    "started_at" timestamp with time zone,
    "finished_at" timestamp with time zone,
    "url" "text" NOT NULL
);


ALTER TABLE "public"."cube_scrap_runs" OWNER TO "postgres";


ALTER TABLE "public"."cube_scrap_runs" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."cube_scrap_runs_id_seq"
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



CREATE TABLE IF NOT EXISTS "public"."features" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" NOT NULL,
    "icon" "text" NOT NULL,
    "description" "text",
    "implemented" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."features" OWNER TO "postgres";


ALTER TABLE "public"."features" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."features_id_seq"
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



CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" bigint NOT NULL,
    "message" "text" NOT NULL,
    "icon" "text" DEFAULT ''::"text",
    "link" "text",
    "link_text" "text" DEFAULT ''::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "published_by_id" "uuid" DEFAULT "auth"."uid"(),
    "user_id" "uuid"
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


ALTER TABLE "public"."notifications" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."notifications_id_seq"
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
    "username" "text",
    "private" boolean DEFAULT false NOT NULL,
    "profile_picture" "text" DEFAULT ''::"text",
    "bio" "text",
    "socials" "jsonb" DEFAULT '{}'::"jsonb",
    "banner" "text",
    "verified" boolean DEFAULT false NOT NULL,
    "certified" boolean DEFAULT false NOT NULL,
    "role" "public"."users_roles" DEFAULT 'User'::"public"."users_roles" NOT NULL,
    "display_name" "text",
    "onboarded" boolean DEFAULT false NOT NULL,
    "beta_flags" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    CONSTRAINT "profiles_username_check" CHECK (("username" ~ '^[a-z0-9._]{3,}$'::"text")),
    CONSTRAINT "profiles_username_required_when_onboarded" CHECK ((("onboarded" = false) OR ("username" IS NOT NULL) OR ("display_name" IS NOT NULL)))
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
    "awarded_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "awarded_by_id" "uuid" DEFAULT '898d0e3a-3465-4c25-9b9f-b498b9884d1d'::"uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "achievement_slug" "text" NOT NULL
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
    CONSTRAINT "user_cube_ratings_comment_check" CHECK (("length"("comment") < 550)),
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
    "user_id" "uuid" NOT NULL,
    "bought_from" "text",
    CONSTRAINT "no_quantity_for_wishlist" CHECK ((("status" <> 'Wishlist'::"public"."user_cube_status") OR ("quantity" = 1))),
    CONSTRAINT "user_cubes_notes_check" CHECK (("length"("notes") < 200))
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



CREATE TABLE IF NOT EXISTS "public"."user_notification_status" (
    "notification_id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "read" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."user_notification_status" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_onboarding" (
    "id" bigint NOT NULL,
    "user_id" "uuid" DEFAULT '898d0e3a-3465-4c25-9b9f-b498b9884d1d'::"uuid" NOT NULL,
    "discovered_via" "text" NOT NULL,
    "interested_features" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "other_text" "text"
);


ALTER TABLE "public"."user_onboarding" OWNER TO "postgres";


ALTER TABLE "public"."user_onboarding" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_onboarding_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE OR REPLACE VIEW "public"."v_achievement_rarity" AS
SELECT
    NULL::smallint AS "id",
    NULL::"text" AS "slug",
    NULL::"text" AS "name",
    NULL::"text" AS "icon",
    NULL::"text" AS "description",
    NULL::"public"."achievements_categories" AS "category",
    NULL::"text" AS "title",
    NULL::"text" AS "unlock_method",
    NULL::boolean AS "unlockable",
    NULL::boolean AS "hidden",
    NULL::integer AS "holders_count",
    NULL::numeric AS "rarity_percent",
    NULL::timestamp with time zone AS "created_at",
    NULL::"text" AS "rarity";


ALTER TABLE "public"."v_achievement_rarity" OWNER TO "postgres";


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


CREATE OR REPLACE VIEW "public"."v_detailed_cube_models" WITH ("security_invoker"='on') AS
 SELECT "cm"."brand",
    "cm"."image_url",
    "cm"."model",
    "cm"."rating",
    "cm"."slug",
    "cm"."created_at",
    "cm"."updated_at",
    "cm"."type",
    "cm"."discontinued",
    "cm"."release_date",
    "cm"."series",
    "cm"."id",
    "cm"."sub_type",
    "cm"."weight",
    "cm"."related_to",
    "cm"."version_type",
    "cm"."version_name",
    "cm"."status",
    "cm"."notes",
    "cm"."surface_finish",
    "cm"."verified_at",
    "cm"."size",
    "cm"."submitted_by_id",
    "cm"."verified_by_id",
    (EXISTS ( SELECT 1
           FROM "public"."cubes_model_features" "f"
          WHERE (("f"."cube" = "cm"."slug") AND ("f"."feature" = 'ball_core'::"text")))) AS "ball_core",
    (EXISTS ( SELECT 1
           FROM "public"."cubes_model_features" "f"
          WHERE (("f"."cube" = "cm"."slug") AND ("f"."feature" = 'maglev'::"text")))) AS "maglev",
    (EXISTS ( SELECT 1
           FROM "public"."cubes_model_features" "f"
          WHERE (("f"."cube" = "cm"."slug") AND ("f"."feature" = 'magnetic'::"text")))) AS "magnetic",
    (EXISTS ( SELECT 1
           FROM "public"."cubes_model_features" "f"
          WHERE (("f"."cube" = "cm"."slug") AND ("f"."feature" = 'modded'::"text")))) AS "modded",
    (EXISTS ( SELECT 1
           FROM "public"."cubes_model_features" "f"
          WHERE (("f"."cube" = "cm"."slug") AND ("f"."feature" = 'smart'::"text")))) AS "smart",
    (EXISTS ( SELECT 1
           FROM "public"."cubes_model_features" "f"
          WHERE (("f"."cube" = "cm"."slug") AND ("f"."feature" = 'stickered'::"text")))) AS "stickered",
    (EXISTS ( SELECT 1
           FROM "public"."cubes_model_features" "f"
          WHERE (("f"."cube" = "cm"."slug") AND ("f"."feature" = 'wca_legal'::"text")))) AS "wca_legal",
    (((("cm"."series" || ' '::"text") || "cm"."model") || ' '::"text") || "cm"."version_name") AS "name",
    (EXTRACT(year FROM "cm"."release_date"))::integer AS "year",
    ( SELECT "count"(*) AS "count"
           FROM "public"."user_cubes" "uc"
          WHERE ("uc"."cube" = "cm"."slug")) AS "popularity",
    ( SELECT "avg"("cvl"."price") AS "avg"
           FROM "public"."cube_vendor_links" "cvl"
          WHERE (("cvl"."cube_slug" = "cm"."slug") AND (( SELECT "v"."currency"
                   FROM "public"."vendors" "v"
                  WHERE ("cvl"."vendor_name" = "v"."name")) = 'USD'::"text"))) AS "avg_price"
   FROM "public"."cube_models" "cm";


ALTER TABLE "public"."v_detailed_cube_models" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_awards_category_winners" AS
 WITH "vote_counts" AS (
         SELECT "n_1"."id" AS "nominee_id",
            "n_1"."category_id",
            ("count"("v"."id"))::integer AS "votes"
           FROM ("public"."awards_nominee" "n_1"
             LEFT JOIN "public"."awards_user_vote" "v" ON (("v"."nominee_id" = "n_1"."id")))
          GROUP BY "n_1"."id", "n_1"."category_id"
        ), "ranked" AS (
         SELECT "vc"."nominee_id",
            "vc"."category_id",
            "vc"."votes",
            "row_number"() OVER (PARTITION BY "vc"."category_id" ORDER BY "vc"."votes" DESC, "vc"."nominee_id") AS "rn"
           FROM "vote_counts" "vc"
        ), "nominees_per_category" AS (
         SELECT "awards_nominee"."category_id",
            ("count"(*))::integer AS "nominees_count"
           FROM "public"."awards_nominee"
          GROUP BY "awards_nominee"."category_id"
        )
 SELECT "e"."id" AS "event_id",
    "e"."year" AS "event_year",
    "e"."title" AS "event_title",
    "e"."start_at",
    "e"."end_at",
    "c"."id" AS "category_id",
    "c"."name" AS "category_name",
    "c"."slug" AS "category_slug",
    "c"."description" AS "category_description",
    "c"."created_at" AS "category_created_at",
    "r"."nominee_id",
    "r"."votes",
    "npc"."nominees_count",
    "cm"."id" AS "cube_id",
    "cm"."brand",
    "cm"."slug" AS "cube_slug",
    "cm"."image_url",
    "cm"."version_type",
    "cm"."name" AS "cube_name"
   FROM ((((("ranked" "r"
     JOIN "public"."awards_category" "c" ON (("c"."id" = "r"."category_id")))
     JOIN "public"."awards_event" "e" ON (("e"."id" = "c"."event_id")))
     JOIN "public"."awards_nominee" "n" ON (("n"."id" = "r"."nominee_id")))
     JOIN "public"."v_detailed_cube_models" "cm" ON (("cm"."id" = "n"."cube_id")))
     JOIN "nominees_per_category" "npc" ON (("npc"."category_id" = "c"."id")))
  WHERE ("r"."rn" = 1);


ALTER TABLE "public"."v_awards_category_winners" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_detailed_profiles" WITH ("security_invoker"='on') AS
 SELECT "p"."id",
    "p"."created_at",
    "p"."user_id",
    "p"."username",
    "p"."private",
    "p"."profile_picture",
    "p"."bio",
    "p"."socials",
    "p"."banner",
    "p"."verified",
    "p"."certified",
    "p"."role",
    "p"."display_name",
    "p"."onboarded",
    COALESCE("uc"."cube_count", (0)::bigint) AS "user_cubes_count",
    COALESCE("ua"."achievement_count", (0)::bigint) AS "user_achievements_count",
    COALESCE("fwing"."following_count", (0)::bigint) AS "user_following_count",
    COALESCE("fwer"."follower_count", (0)::bigint) AS "user_follower_count",
    COALESCE("ur"."ratings_count", (0)::bigint) AS "user_cube_ratings_count",
    COALESCE("ur"."rating_avg", (0)::double precision) AS "user_avg_rating_count"
   FROM ((((("public"."profiles" "p"
     LEFT JOIN ( SELECT "user_cubes"."user_id",
            "count"(*) AS "cube_count"
           FROM "public"."user_cubes"
          GROUP BY "user_cubes"."user_id") "uc" ON (("uc"."user_id" = "p"."user_id")))
     LEFT JOIN ( SELECT "user_achievements"."user_id",
            "count"(*) AS "achievement_count"
           FROM "public"."user_achievements"
          GROUP BY "user_achievements"."user_id") "ua" ON (("ua"."user_id" = "p"."user_id")))
     LEFT JOIN ( SELECT "user_follows"."follower_id",
            "count"(*) AS "following_count"
           FROM "public"."user_follows"
          GROUP BY "user_follows"."follower_id") "fwing" ON (("fwing"."follower_id" = "p"."user_id")))
     LEFT JOIN ( SELECT "user_follows"."following_id",
            "count"(*) AS "follower_count"
           FROM "public"."user_follows"
          GROUP BY "user_follows"."following_id") "fwer" ON (("fwer"."following_id" = "p"."user_id")))
     LEFT JOIN ( SELECT "user_cube_ratings"."user_id",
            "count"(*) AS "ratings_count",
            "avg"("user_cube_ratings"."rating") AS "rating_avg"
           FROM "public"."user_cube_ratings"
          GROUP BY "user_cube_ratings"."user_id") "ur" ON (("ur"."user_id" = "p"."user_id")));


ALTER TABLE "public"."v_detailed_profiles" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_notifications_for_user" WITH ("security_invoker"='on') AS
 SELECT "n"."id",
    "n"."message",
    "n"."icon",
    "n"."link",
    "n"."link_text",
    "n"."created_at",
    "n"."published_by_id",
    "n"."user_id",
    COALESCE("uns"."read", false) AS "read"
   FROM ("public"."notifications" "n"
     LEFT JOIN "public"."user_notification_status" "uns" ON ((("uns"."notification_id" = "n"."id") AND ("uns"."user_id" = "auth"."uid"()))))
  WHERE (("n"."user_id" = "auth"."uid"()) OR ("n"."user_id" IS NULL));


ALTER TABLE "public"."v_notifications_for_user" OWNER TO "postgres";


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
    ADD CONSTRAINT "achievements_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."awards_category"
    ADD CONSTRAINT "awards_category_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."awards_event"
    ADD CONSTRAINT "awards_event_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."awards_event"
    ADD CONSTRAINT "awards_event_year_key" UNIQUE ("year");



ALTER TABLE ONLY "public"."awards_nominee"
    ADD CONSTRAINT "awards_nominee_category_cube_uniq" UNIQUE ("category_id", "cube_id");



ALTER TABLE ONLY "public"."awards_nominee"
    ADD CONSTRAINT "awards_nominee_id_category_uniq" UNIQUE ("id", "category_id");



ALTER TABLE ONLY "public"."awards_nominee"
    ADD CONSTRAINT "awards_nominee_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."awards_nominee"
    ADD CONSTRAINT "awards_nominee_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."awards_user_vote"
    ADD CONSTRAINT "awards_user_vote_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."awards_user_vote"
    ADD CONSTRAINT "awards_user_vote_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."awards_user_vote"
    ADD CONSTRAINT "awards_user_vote_single_category" UNIQUE ("user_id", "category_id");



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



ALTER TABLE ONLY "public"."cube_scrap_runs"
    ADD CONSTRAINT "cube_scrap_runs_pkey" PRIMARY KEY ("id");



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



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "disclaimer_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."features"
    ADD CONSTRAINT "features_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."features"
    ADD CONSTRAINT "features_title_key" UNIQUE ("title");



ALTER TABLE ONLY "public"."helpful_rating"
    ADD CONSTRAINT "helpful_rating_pkey" PRIMARY KEY ("id");



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
    ADD CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("achievement_slug", "user_id");



ALTER TABLE ONLY "public"."user_cube_ratings"
    ADD CONSTRAINT "user_cube_ratings_pkey" PRIMARY KEY ("cube_slug", "user_id");



ALTER TABLE ONLY "public"."user_cubes"
    ADD CONSTRAINT "user_cubes_pkey" PRIMARY KEY ("cube", "user_id");



ALTER TABLE ONLY "public"."user_follows"
    ADD CONSTRAINT "user_follows_pkey" PRIMARY KEY ("follower_id", "following_id");



ALTER TABLE ONLY "public"."user_notification_status"
    ADD CONSTRAINT "user_notification_status_pkey" PRIMARY KEY ("notification_id", "user_id");



ALTER TABLE ONLY "public"."user_onboarding"
    ADD CONSTRAINT "user_onboarding_pkey" PRIMARY KEY ("id");



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



CREATE UNIQUE INDEX "profiles_username_unique_idx" ON "public"."profiles" USING "btree" ("lower"("username")) WHERE ("username" IS NOT NULL);



CREATE OR REPLACE VIEW "public"."v_achievement_rarity" WITH ("security_invoker"='on') AS
 WITH "eligible" AS (
         SELECT ("count"(*))::numeric AS "n"
           FROM "public"."profiles"
          WHERE (COALESCE("profiles"."onboarded", false) = true)
        ), "counts" AS (
         SELECT "a"."id",
            "a"."name",
            "a"."icon",
            "a"."description",
            "a"."created_at",
            "a"."updated_at",
            "a"."unlockable",
            "a"."slug",
            "a"."unlock_method",
            "a"."rarity",
            "a"."category",
            "a"."title",
            "a"."evolutive",
            "a"."evolves_from",
            "a"."submitted_by_id",
            "a"."is_special",
            "a"."hidden",
            (COALESCE("count"("ua"."user_id"), (0)::bigint))::integer AS "holders_count"
           FROM ("public"."achievements" "a"
             LEFT JOIN "public"."user_achievements" "ua" ON (("ua"."achievement_slug" = "a"."slug")))
          GROUP BY "a"."id", "a"."slug", "a"."name", "a"."icon", "a"."description", "a"."category", "a"."title", "a"."unlock_method", "a"."unlockable", "a"."hidden", "a"."is_special", "a"."created_at"
        ), "scored" AS (
         SELECT "c"."id",
            "c"."slug",
            "c"."name",
            "c"."icon",
            "c"."description",
            "c"."category",
            "c"."title",
            "c"."unlock_method",
            "c"."unlockable",
            "c"."hidden",
            "c"."is_special",
            "c"."holders_count",
            "c"."created_at",
                CASE
                    WHEN ("e"."n" = (0)::numeric) THEN (0)::numeric
                    ELSE "round"((((100)::numeric * ("c"."holders_count")::numeric) / "e"."n"), 2)
                END AS "rarity_percent"
           FROM ("counts" "c"
             CROSS JOIN "eligible" "e")
        )
 SELECT "scored"."id",
    "scored"."slug",
    "scored"."name",
    "scored"."icon",
    "scored"."description",
    "scored"."category",
    "scored"."title",
    "scored"."unlock_method",
    "scored"."unlockable",
    "scored"."hidden",
    "scored"."holders_count",
    "scored"."rarity_percent",
    "scored"."created_at",
        CASE
            WHEN "scored"."is_special" THEN 'Special'::"text"
            WHEN ("scored"."holders_count" = 0) THEN 'Legendary'::"text"
            WHEN ((((100)::numeric * ("scored"."holders_count")::numeric) / NULLIF(( SELECT "eligible"."n"
               FROM "eligible"), (0)::numeric)) < (1)::numeric) THEN 'Legendary'::"text"
            WHEN ((((100)::numeric * ("scored"."holders_count")::numeric) / NULLIF(( SELECT "eligible"."n"
               FROM "eligible"), (0)::numeric)) < (5)::numeric) THEN 'Epic'::"text"
            WHEN ((((100)::numeric * ("scored"."holders_count")::numeric) / NULLIF(( SELECT "eligible"."n"
               FROM "eligible"), (0)::numeric)) < (20)::numeric) THEN 'Rare'::"text"
            WHEN ((((100)::numeric * ("scored"."holders_count")::numeric) / NULLIF(( SELECT "eligible"."n"
               FROM "eligible"), (0)::numeric)) < (50)::numeric) THEN 'Uncommon'::"text"
            ELSE 'Common'::"text"
        END AS "rarity"
   FROM "scored";



CREATE OR REPLACE TRIGGER "log_achievements" AFTER INSERT OR DELETE OR UPDATE ON "public"."achievements" FOR EACH ROW EXECUTE FUNCTION "public"."log_data_changes"();



CREATE OR REPLACE TRIGGER "log_brands_insert" AFTER INSERT ON "public"."brands" FOR EACH ROW EXECUTE FUNCTION "public"."log_data_changes"();



CREATE OR REPLACE TRIGGER "log_cube_models" AFTER INSERT OR DELETE OR UPDATE OF "brand", "image_url", "model", "slug", "created_at", "updated_at", "type", "discontinued", "release_date", "series", "id", "sub_type", "weight", "related_to", "version_type", "version_name", "status", "notes", "surface_finish", "verified_at", "size", "submitted_by_id", "verified_by_id" ON "public"."cube_models" FOR EACH ROW EXECUTE FUNCTION "public"."log_data_changes"();



CREATE OR REPLACE TRIGGER "log_cube_types_insert" AFTER INSERT ON "public"."cube_types" FOR EACH ROW EXECUTE FUNCTION "public"."log_data_changes"();



CREATE OR REPLACE TRIGGER "log_vendors" AFTER INSERT OR UPDATE ON "public"."vendors" FOR EACH ROW EXECUTE FUNCTION "public"."log_data_changes"();



CREATE OR REPLACE TRIGGER "notify_discord_new_cube" AFTER INSERT OR UPDATE ON "public"."cube_models" FOR EACH ROW EXECUTE FUNCTION "public"."notify_discord_new_cube_model"();



CREATE OR REPLACE TRIGGER "notify_discord_new_user" AFTER UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."notify_discord_new_user"();



CREATE OR REPLACE TRIGGER "notify_discord_new_user_report" AFTER INSERT ON "public"."reports" FOR EACH ROW EXECUTE FUNCTION "public"."notify_discord_new_user_report"();



CREATE OR REPLACE TRIGGER "trg_create_following_notif" AFTER INSERT ON "public"."user_follows" FOR EACH ROW EXECUTE FUNCTION "public"."create_following_notification"();



CREATE OR REPLACE TRIGGER "trg_cube_links_snapshot_table_rules" BEFORE UPDATE ON "public"."cube_vendor_links_snapshot" FOR EACH ROW EXECUTE FUNCTION "public"."cube_links_snapshot_table_rules"();

ALTER TABLE "public"."cube_vendor_links_snapshot" DISABLE TRIGGER "trg_cube_links_snapshot_table_rules";



CREATE OR REPLACE TRIGGER "trg_cube_models_table_rules" BEFORE INSERT OR DELETE OR UPDATE ON "public"."cube_models" FOR EACH ROW EXECUTE FUNCTION "public"."cube_models_table_rules"();



CREATE OR REPLACE TRIGGER "trg_early_collector_achievement_insert" AFTER INSERT ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."insert_user_achievement"();

ALTER TABLE "public"."profiles" DISABLE TRIGGER "trg_early_collector_achievement_insert";



CREATE OR REPLACE TRIGGER "trg_helpful_rating_table_rule" BEFORE INSERT OR UPDATE ON "public"."helpful_rating" FOR EACH ROW EXECUTE FUNCTION "public"."helpful_rating_table_rules"();



CREATE OR REPLACE TRIGGER "trg_price_alert_discord" AFTER INSERT ON "public"."cube_vendor_links_snapshot" FOR EACH ROW EXECUTE FUNCTION "public"."notify_discord_price_alert"();



CREATE OR REPLACE TRIGGER "trg_reports_table_rules" BEFORE INSERT OR DELETE OR UPDATE ON "public"."reports" FOR EACH ROW EXECUTE FUNCTION "public"."reports_table_rules"();



CREATE OR REPLACE TRIGGER "trg_save_cube_vendor_links_snapshots" AFTER INSERT OR DELETE OR UPDATE ON "public"."cube_vendor_links" FOR EACH ROW EXECUTE FUNCTION "public"."save_cube_vendor_links_snapshots"();



CREATE OR REPLACE TRIGGER "trg_staff_logs_table_rules" BEFORE DELETE OR UPDATE ON "public"."staff_logs" FOR EACH ROW EXECUTE FUNCTION "public"."staff_logs_table_rules"();



CREATE OR REPLACE TRIGGER "trg_update_rating" AFTER INSERT OR DELETE OR UPDATE ON "public"."user_cube_ratings" FOR EACH ROW EXECUTE FUNCTION "public"."update_average_cube_rating"();



CREATE OR REPLACE TRIGGER "trg_user_achievements_table_rules" BEFORE UPDATE ON "public"."user_achievements" FOR EACH ROW EXECUTE FUNCTION "public"."user_achievements_table_rules"();



CREATE OR REPLACE TRIGGER "trg_user_cube_ratings_achi_check" AFTER INSERT OR UPDATE ON "public"."user_cube_ratings" FOR EACH ROW EXECUTE FUNCTION "public"."user_cube_ratings_achi_check"();



CREATE OR REPLACE TRIGGER "trg_user_cubes_achi_check" AFTER INSERT OR UPDATE ON "public"."user_cubes" FOR EACH ROW EXECUTE FUNCTION "public"."user_cubes_achi_check"();



CREATE OR REPLACE TRIGGER "trg_user_cubes_table_rules" BEFORE INSERT OR UPDATE ON "public"."user_cubes" FOR EACH ROW EXECUTE FUNCTION "public"."user_cubes_table_rules"();



CREATE OR REPLACE TRIGGER "trg_user_follows_table_rules" BEFORE UPDATE ON "public"."user_follows" FOR EACH ROW EXECUTE FUNCTION "public"."user_follows_table_rules"();



ALTER TABLE ONLY "public"."achievements"
    ADD CONSTRAINT "achievements_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE SET DEFAULT;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "announcement_published_by_id_fkey" FOREIGN KEY ("published_by_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."awards_category"
    ADD CONSTRAINT "awards_category_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."awards_event"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."awards_nominee"
    ADD CONSTRAINT "awards_nominee_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."awards_category"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."awards_nominee"
    ADD CONSTRAINT "awards_nominee_cube_id_fkey" FOREIGN KEY ("cube_id") REFERENCES "public"."cube_models"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."awards_user_vote"
    ADD CONSTRAINT "awards_user_vote_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."awards_category"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."awards_user_vote"
    ADD CONSTRAINT "awards_user_vote_nominee_category_fkey" FOREIGN KEY ("nominee_id", "category_id") REFERENCES "public"."awards_nominee"("id", "category_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."awards_user_vote"
    ADD CONSTRAINT "awards_user_vote_nominee_id_fkey" FOREIGN KEY ("nominee_id") REFERENCES "public"."awards_nominee"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."awards_user_vote"
    ADD CONSTRAINT "awards_user_vote_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_added_by_id_fkey" FOREIGN KEY ("added_by_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE RESTRICT NOT VALID;



ALTER TABLE ONLY "public"."cube_models"
    ADD CONSTRAINT "cube_models_related_to_fkey" FOREIGN KEY ("related_to") REFERENCES "public"."cube_models"("slug") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."cube_models"
    ADD CONSTRAINT "cube_models_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE SET DEFAULT;



ALTER TABLE ONLY "public"."cube_models"
    ADD CONSTRAINT "cube_models_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."cube_scrap_runs"
    ADD CONSTRAINT "cube_scrap_runs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE CASCADE;



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
    ADD CONSTRAINT "helpful_rating_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_reporter_fkey" FOREIGN KEY ("reporter") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE SET DEFAULT;



ALTER TABLE ONLY "public"."staff_logs"
    ADD CONSTRAINT "staff_logs_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_achievement_slug_fkey" FOREIGN KEY ("achievement_slug") REFERENCES "public"."achievements"("slug") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_awarded_by_id_fkey" FOREIGN KEY ("awarded_by_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE SET DEFAULT;



ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_cubes"
    ADD CONSTRAINT "user_cubes_bought_from_fkey" FOREIGN KEY ("bought_from") REFERENCES "public"."vendors"("slug") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_cubes"
    ADD CONSTRAINT "user_cubes_cube_fkey" FOREIGN KEY ("cube") REFERENCES "public"."cube_models"("slug") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_cubes"
    ADD CONSTRAINT "user_cubes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_follows"
    ADD CONSTRAINT "user_follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_follows"
    ADD CONSTRAINT "user_follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_notification_status"
    ADD CONSTRAINT "user_notification_status_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_notification_status"
    ADD CONSTRAINT "user_notification_status_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_onboarding"
    ADD CONSTRAINT "user_onboarding_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE SET DEFAULT;



ALTER TABLE ONLY "public"."user_cube_ratings"
    ADD CONSTRAINT "user_ratings_cube_slug_fkey" FOREIGN KEY ("cube_slug") REFERENCES "public"."cube_models"("slug") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_cube_ratings"
    ADD CONSTRAINT "user_ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE CASCADE;



CREATE POLICY "Authenticated can insert" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated can insert into user_achievements" ON "public"."user_achievements" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Database Managers can read all" ON "public"."cube_scrap_runs" FOR SELECT USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = ANY (ARRAY['Database Manager'::"public"."users_roles", 'Admin'::"public"."users_roles"])));



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



CREATE POLICY "Enable insert for authenticated users if the event is active" ON "public"."awards_user_vote" FOR INSERT TO "authenticated" WITH CHECK (((( SELECT "auth"."uid"() AS "uid") = "user_id") AND (EXISTS ( SELECT 1
   FROM (("public"."awards_nominee" "n"
     JOIN "public"."awards_category" "c" ON (("c"."id" = "n"."category_id")))
     JOIN "public"."awards_event" "ae" ON (("ae"."id" = "c"."event_id")))
  WHERE (("n"."id" = "awards_user_vote"."nominee_id") AND ("c"."id" = "awards_user_vote"."category_id") AND (("now"() >= "ae"."start_at") AND ("now"() <= "ae"."end_at")))))));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."cube_scrap_runs" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."helpful_rating" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."reports" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."staff_logs" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."user_cube_ratings" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."user_cubes" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."user_follows" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."user_onboarding" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."accessories" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."achievements" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."awards_category" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."awards_event" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."awards_nominee" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."brands" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."cube_models" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."cube_types" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."cubes_model_features" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."features" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."helpful_rating" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."staff_logs" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."user_achievements" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."user_cube_ratings" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."user_cubes" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."user_follows" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."vendors" FOR SELECT USING (true);



CREATE POLICY "Enable update for users based on email" ON "public"."cube_types" FOR UPDATE USING (true);



CREATE POLICY "Enable users to view their own data only" ON "public"."awards_user_vote" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Only Admins and Database Managers can insert" ON "public"."cube_vendor_links" FOR INSERT WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = ANY (ARRAY['Database Manager'::"public"."users_roles", 'Admin'::"public"."users_roles"])));



CREATE POLICY "Only Admins and Database Managers can insert" ON "public"."vendors" FOR INSERT WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = ANY (ARRAY['Database Manager'::"public"."users_roles", 'Admin'::"public"."users_roles"])));



CREATE POLICY "Only Admins and Database Managers can update" ON "public"."cube_vendor_links" FOR UPDATE USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = ANY (ARRAY['Database Manager'::"public"."users_roles", 'Admin'::"public"."users_roles"])));



CREATE POLICY "Only Community Managers and Admins can insert" ON "public"."notifications" FOR INSERT WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = ANY (ARRAY['Community Manager'::"public"."users_roles", 'Admin'::"public"."users_roles"])));



CREATE POLICY "Only Community Managers and Admins can update" ON "public"."notifications" FOR UPDATE USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = ANY (ARRAY['Community Manager'::"public"."users_roles", 'Admin'::"public"."users_roles"]))) WITH CHECK ((( SELECT "profiles"."role"
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



CREATE POLICY "Select own notifications and broadcast" ON "public"."notifications" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR ("user_id" IS NULL)));



CREATE POLICY "Users can delete their own cubes" ON "public"."user_cubes" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete their own profile" ON "public"."profiles" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own ratings" ON "public"."user_cube_ratings" FOR DELETE TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR (( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())) = ANY (ARRAY['Moderator'::"public"."users_roles", 'Admin'::"public"."users_roles"]))));



CREATE POLICY "Users can modify their own cubes" ON "public"."user_cubes" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can read their own rows" ON "public"."cube_scrap_runs" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own ratings" ON "public"."user_cube_ratings" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."accessories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."achievements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."awards_category" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."awards_event" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."awards_nominee" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."awards_user_vote" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."brands" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cube_features" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cube_models" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cube_scrap_runs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cube_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cube_vendor_links" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cube_vendor_links_snapshot" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cubes_model_features" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."features" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."helpful_rating" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."staff_logs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "status select own" ON "public"."user_notification_status" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "status update own" ON "public"."user_notification_status" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "status upsert own" ON "public"."user_notification_status" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."user_achievements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_cube_ratings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_cubes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_follows" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_notification_status" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_onboarding" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vendors" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";












GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";









































































































































































































GRANT ALL ON FUNCTION "public"."build_v_detailed_cube_models"() TO "anon";
GRANT ALL ON FUNCTION "public"."build_v_detailed_cube_models"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."build_v_detailed_cube_models"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."create_following_notification"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."create_following_notification"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_following_notification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_following_notification"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cube_links_snapshot_table_rules"() TO "anon";
GRANT ALL ON FUNCTION "public"."cube_links_snapshot_table_rules"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cube_links_snapshot_table_rules"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cube_models_table_rules"() TO "anon";
GRANT ALL ON FUNCTION "public"."cube_models_table_rules"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cube_models_table_rules"() TO "service_role";



GRANT ALL ON FUNCTION "public"."due_vendor_links_capped"("p_limit" integer, "p_per_vendor" integer, "p_backoff_cap" integer, "p_base" interval) TO "anon";
GRANT ALL ON FUNCTION "public"."due_vendor_links_capped"("p_limit" integer, "p_per_vendor" integer, "p_backoff_cap" integer, "p_base" interval) TO "authenticated";
GRANT ALL ON FUNCTION "public"."due_vendor_links_capped"("p_limit" integer, "p_per_vendor" integer, "p_backoff_cap" integer, "p_base" interval) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_types"("enum_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_types"("enum_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_types"("enum_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."helpful_rating_table_rules"() TO "anon";
GRANT ALL ON FUNCTION "public"."helpful_rating_table_rules"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."helpful_rating_table_rules"() TO "service_role";



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



GRANT ALL ON FUNCTION "public"."notify_discord_price_alert"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_discord_price_alert"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_discord_price_alert"() TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."reports_table_rules"() TO "anon";
GRANT ALL ON FUNCTION "public"."reports_table_rules"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."reports_table_rules"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."save_cube_vendor_links_snapshots"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."save_cube_vendor_links_snapshots"() TO "anon";
GRANT ALL ON FUNCTION "public"."save_cube_vendor_links_snapshots"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."save_cube_vendor_links_snapshots"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at_now"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at_now"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at_now"() TO "service_role";



GRANT ALL ON FUNCTION "public"."staff_logs_table_rules"() TO "anon";
GRANT ALL ON FUNCTION "public"."staff_logs_table_rules"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."staff_logs_table_rules"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_average_cube_rating"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_average_cube_rating"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_average_cube_rating"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_password"("current_plain_password" "text", "new_plain_password" "text", "current_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."update_password"("current_plain_password" "text", "new_plain_password" "text", "current_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_password"("current_plain_password" "text", "new_plain_password" "text", "current_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."user_achievements_table_rules"() TO "anon";
GRANT ALL ON FUNCTION "public"."user_achievements_table_rules"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_achievements_table_rules"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_cube_ratings_achi_check"() TO "anon";
GRANT ALL ON FUNCTION "public"."user_cube_ratings_achi_check"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_cube_ratings_achi_check"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_cube_ratings_table_rules"() TO "anon";
GRANT ALL ON FUNCTION "public"."user_cube_ratings_table_rules"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_cube_ratings_table_rules"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_cubes_achi_check"() TO "anon";
GRANT ALL ON FUNCTION "public"."user_cubes_achi_check"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_cubes_achi_check"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_cubes_table_rules"() TO "anon";
GRANT ALL ON FUNCTION "public"."user_cubes_table_rules"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_cubes_table_rules"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_follows_table_rules"() TO "anon";
GRANT ALL ON FUNCTION "public"."user_follows_table_rules"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_follows_table_rules"() TO "service_role";

































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



GRANT ALL ON TABLE "public"."awards_category" TO "anon";
GRANT ALL ON TABLE "public"."awards_category" TO "authenticated";
GRANT ALL ON TABLE "public"."awards_category" TO "service_role";



GRANT ALL ON SEQUENCE "public"."awards_category_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."awards_category_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."awards_category_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."awards_event" TO "anon";
GRANT ALL ON TABLE "public"."awards_event" TO "authenticated";
GRANT ALL ON TABLE "public"."awards_event" TO "service_role";



GRANT ALL ON SEQUENCE "public"."awards_event_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."awards_event_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."awards_event_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."awards_nominee" TO "anon";
GRANT ALL ON TABLE "public"."awards_nominee" TO "authenticated";
GRANT ALL ON TABLE "public"."awards_nominee" TO "service_role";



GRANT ALL ON SEQUENCE "public"."awards_nominee_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."awards_nominee_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."awards_nominee_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."awards_user_vote" TO "anon";
GRANT ALL ON TABLE "public"."awards_user_vote" TO "authenticated";
GRANT ALL ON TABLE "public"."awards_user_vote" TO "service_role";



GRANT ALL ON SEQUENCE "public"."awards_user_vote_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."awards_user_vote_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."awards_user_vote_id_seq" TO "service_role";



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



GRANT ALL ON TABLE "public"."cube_scrap_runs" TO "anon";
GRANT ALL ON TABLE "public"."cube_scrap_runs" TO "authenticated";
GRANT ALL ON TABLE "public"."cube_scrap_runs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cube_scrap_runs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cube_scrap_runs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cube_scrap_runs_id_seq" TO "service_role";



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



GRANT ALL ON TABLE "public"."features" TO "anon";
GRANT ALL ON TABLE "public"."features" TO "authenticated";
GRANT ALL ON TABLE "public"."features" TO "service_role";



GRANT ALL ON SEQUENCE "public"."features_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."features_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."features_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."helpful_rating" TO "anon";
GRANT ALL ON TABLE "public"."helpful_rating" TO "authenticated";
GRANT ALL ON TABLE "public"."helpful_rating" TO "service_role";



GRANT ALL ON SEQUENCE "public"."helpful_rating_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."helpful_rating_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."helpful_rating_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "service_role";



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



GRANT ALL ON TABLE "public"."user_notification_status" TO "anon";
GRANT ALL ON TABLE "public"."user_notification_status" TO "authenticated";
GRANT ALL ON TABLE "public"."user_notification_status" TO "service_role";



GRANT ALL ON TABLE "public"."user_onboarding" TO "anon";
GRANT ALL ON TABLE "public"."user_onboarding" TO "authenticated";
GRANT ALL ON TABLE "public"."user_onboarding" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_onboarding_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_onboarding_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_onboarding_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."v_achievement_rarity" TO "anon";
GRANT ALL ON TABLE "public"."v_achievement_rarity" TO "authenticated";
GRANT ALL ON TABLE "public"."v_achievement_rarity" TO "service_role";



GRANT ALL ON TABLE "public"."vendors" TO "anon";
GRANT ALL ON TABLE "public"."vendors" TO "authenticated";
GRANT ALL ON TABLE "public"."vendors" TO "service_role";



GRANT ALL ON TABLE "public"."v_detailed_cube_models" TO "anon";
GRANT ALL ON TABLE "public"."v_detailed_cube_models" TO "authenticated";
GRANT ALL ON TABLE "public"."v_detailed_cube_models" TO "service_role";



GRANT ALL ON TABLE "public"."v_awards_category_winners" TO "anon";
GRANT ALL ON TABLE "public"."v_awards_category_winners" TO "authenticated";
GRANT ALL ON TABLE "public"."v_awards_category_winners" TO "service_role";



GRANT ALL ON TABLE "public"."v_detailed_profiles" TO "anon";
GRANT ALL ON TABLE "public"."v_detailed_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."v_detailed_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."v_notifications_for_user" TO "anon";
GRANT ALL ON TABLE "public"."v_notifications_for_user" TO "authenticated";
GRANT ALL ON TABLE "public"."v_notifications_for_user" TO "service_role";



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































  create policy "Everyone can select banners 1tghu4n_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'banners'::text));



  create policy "Everyone can select pn4br_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'submissions'::text));



  create policy "Everyone can upload pn4br_0"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((bucket_id = 'submissions'::text));



  create policy "Users can update own avatar"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)))
with check (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Users can upload their avatar 1tghu4n_0"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'banners'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Users can upload their avatar 1tghu4n_1"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'banners'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Users can upload their avatar"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'avatars'::text));



