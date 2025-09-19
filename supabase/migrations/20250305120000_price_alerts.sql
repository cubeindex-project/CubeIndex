create type if not exists price_alert_channel as enum ('in_app','email');

create table if not exists public.cube_price_alert_subscriptions (
  id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null default auth.uid(),
  cube_slug text not null,
  desired_price numeric(10,2) not null check (desired_price >= 0),
  channel price_alert_channel not null default 'in_app',
  active boolean not null default true,
  last_notified_at timestamptz,
  primary key (id),
  constraint cube_price_alert_subscriptions_user_cube_channel_unique unique (user_id, cube_slug, desired_price, channel),
  constraint cube_price_alert_subscriptions_user_fk foreign key (user_id) references auth.users (id) on delete cascade,
  constraint cube_price_alert_subscriptions_cube_fk foreign key (cube_slug) references public.cube_models (slug) on delete cascade
);

create index if not exists cube_price_alert_subscriptions_user_idx on public.cube_price_alert_subscriptions (user_id, cube_slug);
create index if not exists cube_price_alert_subscriptions_cube_idx on public.cube_price_alert_subscriptions (cube_slug);

create or replace function public.tg_cube_price_alert_subscriptions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_cube_price_alert_subscriptions_updated_at on public.cube_price_alert_subscriptions;
create trigger trg_cube_price_alert_subscriptions_updated_at
  before update on public.cube_price_alert_subscriptions
  for each row execute function public.tg_cube_price_alert_subscriptions_updated_at();

alter table public.cube_price_alert_subscriptions enable row level security;

create policy if not exists "Users can view their alert subscriptions"
  on public.cube_price_alert_subscriptions
  for select
  using (auth.uid() = user_id);

create policy if not exists "Users can insert their alert subscriptions"
  on public.cube_price_alert_subscriptions
  for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can update their alert subscriptions"
  on public.cube_price_alert_subscriptions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists "Users can delete their alert subscriptions"
  on public.cube_price_alert_subscriptions
  for delete
  using (auth.uid() = user_id);

create table if not exists public.cube_price_alert_email_queue (
  id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  subscription_id uuid not null references public.cube_price_alert_subscriptions(id) on delete cascade,
  user_id uuid not null,
  cube_slug text not null,
  vendor_name text,
  price numeric(10,2),
  snapshot_at timestamptz not null,
  payload jsonb not null default '{}'::jsonb,
  primary key (id)
);

create index if not exists cube_price_alert_email_queue_processed_idx on public.cube_price_alert_email_queue (processed_at);
create index if not exists cube_price_alert_email_queue_subscription_idx on public.cube_price_alert_email_queue (subscription_id);
