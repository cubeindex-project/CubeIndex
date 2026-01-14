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
    COALESCE(ur.rating_avg, (0)::double precision) AS user_avg_rating_count,
    COALESCE((ucr.reviews_count)::double precision, (0)::double precision) AS cube_reviews_count
   FROM ((((((public.profiles p
     LEFT JOIN ( SELECT user_cubes.user_id,
            count(*) AS cube_count
           FROM public.user_cubes
          GROUP BY user_cubes.user_id) uc ON ((uc.user_id = p.user_id)))
     LEFT JOIN ( SELECT user_achievements.user_id,
            count(*) AS achievement_count
           FROM public.user_achievements
          GROUP BY user_achievements.user_id) ua ON ((ua.user_id = p.user_id)))
     LEFT JOIN ( SELECT user_follows.follower_id,
            count(*) AS following_count
           FROM public.user_follows
          GROUP BY user_follows.follower_id) fwing ON ((fwing.follower_id = p.user_id)))
     LEFT JOIN ( SELECT user_follows.following_id,
            count(*) AS follower_count
           FROM public.user_follows
          GROUP BY user_follows.following_id) fwer ON ((fwer.following_id = p.user_id)))
     LEFT JOIN ( SELECT user_cube_ratings.user_id,
            count(*) AS ratings_count,
            avg(user_cube_ratings.rating) AS rating_avg
           FROM public.user_cube_ratings
          GROUP BY user_cube_ratings.user_id) ur ON ((ur.user_id = p.user_id)))
     LEFT JOIN ( SELECT ucr_1.user_id,
            count(*) AS reviews_count
           FROM public.user_cube_reviews ucr_1
          WHERE (ucr_1.status = 'published'::public.cube_review_status)
          GROUP BY ucr_1.user_id) ucr ON ((ucr.user_id = p.user_id)));


grant delete on table "public"."helpful_review" to "postgres";

grant insert on table "public"."helpful_review" to "postgres";

grant references on table "public"."helpful_review" to "postgres";

grant select on table "public"."helpful_review" to "postgres";

grant trigger on table "public"."helpful_review" to "postgres";

grant truncate on table "public"."helpful_review" to "postgres";

grant update on table "public"."helpful_review" to "postgres";

grant delete on table "public"."user_cube_reviews" to "postgres";

grant insert on table "public"."user_cube_reviews" to "postgres";

grant references on table "public"."user_cube_reviews" to "postgres";

grant select on table "public"."user_cube_reviews" to "postgres";

grant trigger on table "public"."user_cube_reviews" to "postgres";

grant truncate on table "public"."user_cube_reviews" to "postgres";

grant update on table "public"."user_cube_reviews" to "postgres";

grant delete on table "public"."user_cube_reviews_categories" to "postgres";

grant insert on table "public"."user_cube_reviews_categories" to "postgres";

grant references on table "public"."user_cube_reviews_categories" to "postgres";

grant select on table "public"."user_cube_reviews_categories" to "postgres";

grant trigger on table "public"."user_cube_reviews_categories" to "postgres";

grant truncate on table "public"."user_cube_reviews_categories" to "postgres";

grant update on table "public"."user_cube_reviews_categories" to "postgres";

grant delete on table "public"."user_cube_reviews_ratings" to "postgres";

grant insert on table "public"."user_cube_reviews_ratings" to "postgres";

grant references on table "public"."user_cube_reviews_ratings" to "postgres";

grant select on table "public"."user_cube_reviews_ratings" to "postgres";

grant trigger on table "public"."user_cube_reviews_ratings" to "postgres";

grant truncate on table "public"."user_cube_reviews_ratings" to "postgres";

grant update on table "public"."user_cube_reviews_ratings" to "postgres";


