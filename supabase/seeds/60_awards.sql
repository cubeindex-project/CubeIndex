begin;
set local session_replication_role = replica;

insert into public.awards_event (title, year, start_at, end_at)
values
	('CubeIndex Awards 2025', 2025, '2025-10-01 00:00:00+00', '2025-11-01 23:59:59+00'),
	('CubeIndex Awards 2026', 2026, '2026-09-15 00:00:00+00', '2026-12-31 23:59:59+00');

insert into public.awards_category (event_id, name, description, slug)
values
	(
		(select id from public.awards_event where year = 2025),
		'Best 3x3',
		'The 3x3 that made the strongest impression on the CubeIndex community this year.',
		'best-3x3'
	),
	(
		(select id from public.awards_event where year = 2025),
		'Best Non-3x3',
		'The standout puzzle outside the 3x3 category.',
		'best-non-3x3'
	),
	(
		(select id from public.awards_event where year = 2025),
		'Best Value',
		'The cube that delivers the most performance for its price.',
		'best-value'
	),
	(
		(select id from public.awards_event where year = 2026),
		'Flagship of the Year',
		'The premium cube with the most complete performance package.',
		'flagship-of-the-year'
	),
	(
		(select id from public.awards_event where year = 2026),
		'Best Big Cube',
		'The best 4x4, 5x5, or larger puzzle for serious solves.',
		'best-big-cube'
	),
	(
		(select id from public.awards_event where year = 2026),
		'Best Specialty Puzzle',
		'The most compelling non-NxNxN puzzle released or enjoyed this year.',
		'best-specialty-puzzle'
	);

insert into public.awards_nominee (category_id, cube_id, extra_info)
select
	category.id,
	cube.id,
	nominees.extra_info
from (
	values
		(2025, 'best-3x3', 'gan-15-maglev', 'A refined flagship with a magnetic core.'),
		(2025, 'best-3x3', 'moyu-super-weilong-v2', 'Light, fast, and highly adjustable.'),
		(2025, 'best-3x3', 'moyu-weilong-wr-m-v10', 'A competition-ready all-rounder.'),
		(2025, 'best-3x3', 'x-man-tornado-v4-pioneer', 'A fast and tactile performance option.'),
		(2025, 'best-non-3x3', 'qiyi-m-pro-4x4', 'A compact magnetic 4x4.'),
		(2025, 'best-non-3x3', 'yj-mgc-5x5', 'A proven 5x5 for speedsolving.'),
		(2025, 'best-non-3x3', 'x-man-bell-v2-pyraminx', 'A controllable magnetic Pyraminx.'),
		(2025, 'best-non-3x3', 'gan-megaminx-v2', 'A premium Megaminx with a ball core.'),
		(2025, 'best-value', 'moyu-rs3-m-v5', 'Strong performance at an accessible price.'),
		(2025, 'best-value', 'qiyi-ms-2x2', 'An affordable magnetic 2x2.'),
		(2025, 'best-value', 'yj-mgc-square-1', 'Reliable magnetic Square-1 performance.'),
		(2025, 'best-value', 'qiyi-wingy-magnetic-skewb', 'A capable, approachable magnetic Skewb.'),
		(2026, 'flagship-of-the-year', 'gan-16-maglev', 'GAN''s latest flagship 3x3.'),
		(2026, 'flagship-of-the-year', 'moyu-super-weilong-v2', 'MoYu''s premium flagship option.'),
		(2026, 'flagship-of-the-year', 'moyu-weilong-wr-m-v10', 'A lightweight magnetic-core 3x3.'),
		(2026, 'flagship-of-the-year', 'x-man-tornado-v4-pioneer', 'A flagship with a distinct, fast feel.'),
		(2026, 'best-big-cube', 'qiyi-m-pro-4x4', 'A modern, compact 4x4.'),
		(2026, 'best-big-cube', 'yj-mgc-5x5', 'A stable and well-regarded 5x5.'),
		(2026, 'best-big-cube', 'yj-mgc-6x6', 'A magnetic 6x6 for ambitious solves.'),
		(2026, 'best-big-cube', 'yj-mgc-7x7', 'A capable 7x7 for the largest WCA cubes.'),
		(2026, 'best-specialty-puzzle', 'x-man-bell-v2-pyraminx', 'A magnetic Pyraminx built for speed.'),
		(2026, 'best-specialty-puzzle', 'qiyi-wingy-magnetic-skewb', 'A smooth magnetic Skewb.'),
		(2026, 'best-specialty-puzzle', 'qiyi-magnetic-clock', 'A magnetic Clock for WCA event practice.'),
		(2026, 'best-specialty-puzzle', 'yj-mgc-square-1', 'A dependable magnetic Square-1.')
) as nominees(year, category_slug, cube_slug, extra_info)
join public.awards_event as event on event.year = nominees.year
join public.awards_category as category
	on category.event_id = event.id
	and category.slug = nominees.category_slug
join public.cube_models as cube on cube.slug = nominees.cube_slug;

insert into public.awards_user_vote (user_id, nominee_id, category_id, voted_at)
select
	votes.user_id,
	nominee.id,
	category.id,
	votes.voted_at
from (
	values
		('11111111-1111-4111-8111-111111111111'::uuid, 'best-3x3', 'moyu-super-weilong-v2', '2025-10-12 12:00:00+00'::timestamptz),
		('22222222-2222-4222-8222-222222222222'::uuid, 'best-3x3', 'moyu-super-weilong-v2', '2025-10-14 12:00:00+00'::timestamptz),
		('898d0e3a-3465-4c25-9b9f-b498b9884d1d'::uuid, 'best-3x3', 'gan-15-maglev', '2025-10-15 12:00:00+00'::timestamptz),
		('11111111-1111-4111-8111-111111111111'::uuid, 'best-non-3x3', 'gan-megaminx-v2', '2025-10-16 12:00:00+00'::timestamptz),
		('22222222-2222-4222-8222-222222222222'::uuid, 'best-non-3x3', 'gan-megaminx-v2', '2025-10-17 12:00:00+00'::timestamptz),
		('898d0e3a-3465-4c25-9b9f-b498b9884d1d'::uuid, 'best-non-3x3', 'qiyi-m-pro-4x4', '2025-10-18 12:00:00+00'::timestamptz),
		('11111111-1111-4111-8111-111111111111'::uuid, 'best-value', 'moyu-rs3-m-v5', '2025-10-19 12:00:00+00'::timestamptz),
		('22222222-2222-4222-8222-222222222222'::uuid, 'best-value', 'moyu-rs3-m-v5', '2025-10-20 12:00:00+00'::timestamptz),
		('898d0e3a-3465-4c25-9b9f-b498b9884d1d'::uuid, 'best-value', 'qiyi-ms-2x2', '2025-10-21 12:00:00+00'::timestamptz)
) as votes(user_id, category_slug, cube_slug, voted_at)
join public.awards_event as event on event.year = 2025
join public.awards_category as category
	on category.event_id = event.id
	and category.slug = votes.category_slug
join public.cube_models as cube on cube.slug = votes.cube_slug
join public.awards_nominee as nominee
	on nominee.category_id = category.id
	and nominee.cube_id = cube.id;

commit;
