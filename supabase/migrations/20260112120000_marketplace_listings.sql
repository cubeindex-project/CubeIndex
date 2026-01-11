create table "public"."marketplace_listings" (
	"id" uuid primary key default gen_random_uuid(),
	"created_at" timestamp with time zone not null default now(),
	"updated_at" timestamp with time zone not null default now(),
	"seller_id" uuid not null references "public"."profiles" ("user_id") on delete cascade,
	"cube_slug" text references "public"."cube_models" ("slug") on delete set null,
	"cube_name" text not null,
	"condition" "public"."user_cube_condition" not null,
	"price_amount" numeric(10, 2) not null,
	"price_currency" text not null default 'USD',
	"location_country" text not null,
	"location_region" text,
	"description" text,
	"contact_method" text not null,
	"contact_value" text not null,
	"image_url" text,
	"status" text not null default 'active',
	constraint "marketplace_listings_contact_method_check" check (
		"contact_method" in ('external', 'email', 'discord', 'other')
	),
	constraint "marketplace_listings_status_check" check (
		"status" in ('active', 'sold', 'paused', 'removed')
	)
);

create index "marketplace_listings_status_idx" on "public"."marketplace_listings" ("status");
create index "marketplace_listings_cube_slug_idx" on "public"."marketplace_listings" ("cube_slug");
create index "marketplace_listings_seller_id_idx" on "public"."marketplace_listings" ("seller_id");
create index "marketplace_listings_created_at_idx" on "public"."marketplace_listings" ("created_at");
create index "marketplace_listings_country_idx" on "public"."marketplace_listings" ("location_country");

create trigger "set_marketplace_listings_updated_at"
before update on "public"."marketplace_listings"
for each row execute function "public"."set_updated_at_now"();

alter table "public"."marketplace_listings" enable row level security;

grant select on table "public"."marketplace_listings" to "anon";
grant select on table "public"."marketplace_listings" to "authenticated";
grant insert on table "public"."marketplace_listings" to "authenticated";
grant update on table "public"."marketplace_listings" to "authenticated";
grant delete on table "public"."marketplace_listings" to "authenticated";

create policy "Enable read access for active listings"
on "public"."marketplace_listings"
as permissive
for select
using ("status" = 'active' or (auth.uid() = "seller_id"));

create policy "Enable insert for authenticated users"
on "public"."marketplace_listings"
as permissive
for insert
to authenticated
with check (auth.uid() = "seller_id");

create policy "Enable update for owners"
on "public"."marketplace_listings"
as permissive
for update
to authenticated
using (auth.uid() = "seller_id")
with check (auth.uid() = "seller_id");

create policy "Enable delete for owners"
on "public"."marketplace_listings"
as permissive
for delete
to authenticated
using (auth.uid() = "seller_id");
