begin;
set local session_replication_role = replica;

insert into public.cube_models (
	name,
	slug,
	image_url,
	brand_id,
	type_id,
	series_id,
	sub_type,
	version_type,
	surface_finish,
	size,
	weight,
	release_date,
	release_date_precision,
	discontinued,
	submitted_by_id,
	verified_by_id,
	verified_at
)
values
	(
		'GAN 16 MagLev', 'gan-16-maglev', '/images/CubeIndex_Logo.webp',
		(select id from public.brands where name = 'GAN'),
		(select id from public.cube_types where name = '3x3'),
		(select id from public.cube_series where name = 'GAN 16'),
		'NxNxN', 'Base', 'UV Coated', '56 x 56 x 56', 64,
		'2025-10-01', 'month', false,
		'898d0e3a-3465-4c25-9b9f-b498b9884d1d', '898d0e3a-3465-4c25-9b9f-b498b9884d1d', '2026-01-10 12:00:00+00'
	),
	(
		'MoYu WeiLong WR M V10', 'moyu-weilong-wr-m-v10', '/images/CubeIndex_Logo.webp',
		(select id from public.brands where name = 'MoYu'),
		(select id from public.cube_types where name = '3x3'),
		(select id from public.cube_series where name = 'WeiLong'),
		'NxNxN', 'Base', 'UV Coated', '55 x 55 x 55', 65,
		'2024-05-15', 'day', false,
		'898d0e3a-3465-4c25-9b9f-b498b9884d1d', '898d0e3a-3465-4c25-9b9f-b498b9884d1d', '2026-01-10 12:00:00+00'
	),
	(
		'MoYu RS3 M V5', 'moyu-rs3-m-v5', '/images/CubeIndex_Logo.webp',
		(select id from public.brands where name = 'MoYu'),
		(select id from public.cube_types where name = '3x3'),
		(select id from public.cube_series where name = 'RS3 M'),
		'NxNxN', 'Base', 'Frosted', '56 x 56 x 56', 76,
		'2023-08-01', 'month', false,
		'898d0e3a-3465-4c25-9b9f-b498b9884d1d', '898d0e3a-3465-4c25-9b9f-b498b9884d1d', '2026-01-10 12:00:00+00'
	),
	(
		'X-Man Tornado V4 Pioneer', 'x-man-tornado-v4-pioneer', '/images/CubeIndex_Logo.webp',
		(select id from public.brands where name = 'X-Man Design'),
		(select id from public.cube_types where name = '3x3'),
		(select id from public.cube_series where name = 'Tornado'),
		'NxNxN', 'Variant', 'UV Coated', '55.5 x 55.5 x 55.5', 72,
		'2024-09-01', 'month', false,
		'898d0e3a-3465-4c25-9b9f-b498b9884d1d', '898d0e3a-3465-4c25-9b9f-b498b9884d1d', '2026-01-10 12:00:00+00'
	),
	(
		'QiYi MS 2x2', 'qiyi-ms-2x2', '/images/CubeIndex_Logo.webp',
		(select id from public.brands where name = 'QiYi'),
		(select id from public.cube_types where name = '2x2'),
		(select id from public.cube_series where name = 'QiYi MS'),
		'NxNxN', 'Base', 'Frosted', '51 x 51 x 51', 62,
		'2020-01-01', 'year', false,
		'898d0e3a-3465-4c25-9b9f-b498b9884d1d', '898d0e3a-3465-4c25-9b9f-b498b9884d1d', '2026-01-10 12:00:00+00'
	),
	(
		'YJ MGC Square-1', 'yj-mgc-square-1', '/images/CubeIndex_Logo.webp',
		(select id from public.brands where name = 'YJ'),
		(select id from public.cube_types where name = 'Square-1'),
		(select id from public.cube_series where name = 'MGC'),
		'Square-N', 'Base', 'Frosted', '55 x 55 x 57', 84,
		'2021-06-01', 'month', false,
		'898d0e3a-3465-4c25-9b9f-b498b9884d1d', '898d0e3a-3465-4c25-9b9f-b498b9884d1d', '2026-01-10 12:00:00+00'
	);

insert into public.cubes_model_features (cube, feature)
values
	('gan-16-maglev', 'wca_legal'),
	('gan-16-maglev', 'magnetic'),
	('gan-16-maglev', 'maglev'),
	('gan-16-maglev', 'ball_core'),
	('moyu-weilong-wr-m-v10', 'wca_legal'),
	('moyu-weilong-wr-m-v10', 'magnetic'),
	('moyu-weilong-wr-m-v10', 'maglev'),
	('moyu-weilong-wr-m-v10', 'ball_core'),
	('moyu-rs3-m-v5', 'wca_legal'),
	('moyu-rs3-m-v5', 'magnetic'),
	('x-man-tornado-v4-pioneer', 'wca_legal'),
	('x-man-tornado-v4-pioneer', 'magnetic'),
	('x-man-tornado-v4-pioneer', 'maglev'),
	('x-man-tornado-v4-pioneer', 'ball_core'),
	('qiyi-ms-2x2', 'wca_legal'),
	('qiyi-ms-2x2', 'magnetic'),
	('yj-mgc-square-1', 'wca_legal'),
	('yj-mgc-square-1', 'magnetic');

commit;
