alter table "public"."user_cubes" add column "best_time_ms" integer;

alter table "public"."user_cubes" add constraint "user_cubes_best_time_ms_check" CHECK ((best_time_ms >= 0)) not valid;

alter table "public"."user_cubes" validate constraint "user_cubes_best_time_ms_check";


