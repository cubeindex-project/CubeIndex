begin;

-- Seed inserts bypass application triggers so local setup never calls external
-- services and remains independent from trigger-side business logic.
set local session_replication_role = replica;

insert into auth.users (
	instance_id,
	id,
	aud,
	role,
	email,
	encrypted_password,
	email_confirmed_at,
	raw_app_meta_data,
	raw_user_meta_data,
	created_at,
	updated_at,
	confirmation_token,
	recovery_token,
	email_change,
	email_change_token_new,
	email_change_token_current,
	phone_change_token,
	reauthentication_token
)
values
	(
		'00000000-0000-0000-0000-000000000000',
		'898d0e3a-3465-4c25-9b9f-b498b9884d1d',
		'authenticated',
		'authenticated',
		'admin@cubeindex.local',
		extensions.crypt('password123', extensions.gen_salt('bf')),
		'2026-01-01 09:00:00+00',
		'{"provider":"email","providers":["email"]}'::jsonb,
		'{"display_name":"CubeIndex Admin"}'::jsonb,
		'2026-01-01 09:00:00+00',
		'2026-01-01 09:00:00+00',
		'', '', '', '', '', '', ''
	),
	(
		'00000000-0000-0000-0000-000000000000',
		'11111111-1111-4111-8111-111111111111',
		'authenticated',
		'authenticated',
		'alex@cubeindex.local',
		extensions.crypt('password123', extensions.gen_salt('bf')),
		'2026-01-02 10:00:00+00',
		'{"provider":"email","providers":["email"]}'::jsonb,
		'{"display_name":"Alex Turner"}'::jsonb,
		'2026-01-02 10:00:00+00',
		'2026-01-02 10:00:00+00',
		'', '', '', '', '', '', ''
	),
	(
		'00000000-0000-0000-0000-000000000000',
		'22222222-2222-4222-8222-222222222222',
		'authenticated',
		'authenticated',
		'maya@cubeindex.local',
		extensions.crypt('password123', extensions.gen_salt('bf')),
		'2026-01-03 11:00:00+00',
		'{"provider":"email","providers":["email"]}'::jsonb,
		'{"display_name":"Maya Chen"}'::jsonb,
		'2026-01-03 11:00:00+00',
		'2026-01-03 11:00:00+00',
		'', '', '', '', '', '', ''
	);

insert into auth.identities (
	provider_id,
	user_id,
	identity_data,
	provider,
	last_sign_in_at,
	created_at,
	updated_at
)
select
	u.id::text,
	u.id,
	jsonb_build_object(
		'sub', u.id::text,
		'email', u.email,
		'email_verified', true,
		'phone_verified', false
	),
	'email',
	u.created_at,
	u.created_at,
	u.updated_at
from auth.users as u
where u.id in (
	'898d0e3a-3465-4c25-9b9f-b498b9884d1d',
	'11111111-1111-4111-8111-111111111111',
	'22222222-2222-4222-8222-222222222222'
);

insert into public.profiles (
	user_id,
	username,
	display_name,
	bio,
	socials,
	verified,
	certified,
	role,
	onboarded,
	beta_flags
)
values
	(
		'898d0e3a-3465-4c25-9b9f-b498b9884d1d',
		'cubeindex_admin',
		'CubeIndex Admin',
		'Local development administrator account.',
		'{"github":"cubeindex-project"}'::jsonb,
		true,
		true,
		'Admin',
		true,
		'{"seeded":true}'::jsonb
	),
	(
		'11111111-1111-4111-8111-111111111111',
		'alex.turner',
		'Alex Turner',
		'Speedcuber, collector, and hardware tinkerer.',
		'{"wca":"2024TURN01"}'::jsonb,
		true,
		false,
		'User',
		true,
		'{"seeded":true}'::jsonb
	),
	(
		'22222222-2222-4222-8222-222222222222',
		'maya.chen',
		'Maya Chen',
		'Learning blindfolded solving one algorithm at a time.',
		'{"youtube":"@mayacubes"}'::jsonb,
		true,
		false,
		'User',
		true,
		'{"seeded":true}'::jsonb
	);

commit;
