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
		'GAN 16 MagLev', 'gan-16-maglev', 'https://placehold.co/600x600/1d4ed8/ffffff?text=GAN+16+MagLev',
		(select id from public.brands where name = 'GAN'),
		(select id from public.cube_types where name = '3x3'),
		(select id from public.cube_series where name = 'GAN 16'),
		'NxNxN', 'Base', 'UV Coated', '56 x 56 x 56', 64,
		'2025-10-01', 'month', false,
		'898d0e3a-3465-4c25-9b9f-b498b9884d1d', '898d0e3a-3465-4c25-9b9f-b498b9884d1d', '2026-01-10 12:00:00+00'
	),
	(
		'MoYu WeiLong WR M V10', 'moyu-weilong-wr-m-v10', 'https://placehold.co/600x600/dc2626/ffffff?text=MoYu+WeiLong+WR+M+V10',
		(select id from public.brands where name = 'MoYu'),
		(select id from public.cube_types where name = '3x3'),
		(select id from public.cube_series where name = 'WeiLong'),
		'NxNxN', 'Base', 'UV Coated', '55 x 55 x 55', 65,
		'2024-05-15', 'day', false,
		'898d0e3a-3465-4c25-9b9f-b498b9884d1d', '898d0e3a-3465-4c25-9b9f-b498b9884d1d', '2026-01-10 12:00:00+00'
	),
	(
		'MoYu RS3 M V5', 'moyu-rs3-m-v5', 'https://placehold.co/600x600/ea580c/ffffff?text=MoYu+RS3+M+V5',
		(select id from public.brands where name = 'MoYu'),
		(select id from public.cube_types where name = '3x3'),
		(select id from public.cube_series where name = 'RS3 M'),
		'NxNxN', 'Base', 'Frosted', '56 x 56 x 56', 76,
		'2023-08-01', 'month', false,
		'898d0e3a-3465-4c25-9b9f-b498b9884d1d', '898d0e3a-3465-4c25-9b9f-b498b9884d1d', '2026-01-10 12:00:00+00'
	),
	(
		'X-Man Tornado V4 Pioneer', 'x-man-tornado-v4-pioneer', 'https://placehold.co/600x600/0891b2/ffffff?text=X-Man+Tornado+V4+Pioneer',
		(select id from public.brands where name = 'X-Man Design'),
		(select id from public.cube_types where name = '3x3'),
		(select id from public.cube_series where name = 'Tornado'),
		'NxNxN', 'Variant', 'UV Coated', '55.5 x 55.5 x 55.5', 72,
		'2024-09-01', 'month', false,
		'898d0e3a-3465-4c25-9b9f-b498b9884d1d', '898d0e3a-3465-4c25-9b9f-b498b9884d1d', '2026-01-10 12:00:00+00'
	),
	(
		'QiYi MS 2x2', 'qiyi-ms-2x2', 'https://placehold.co/600x600/059669/ffffff?text=QiYi+MS+2x2',
		(select id from public.brands where name = 'QiYi'),
		(select id from public.cube_types where name = '2x2'),
		(select id from public.cube_series where name = 'QiYi MS'),
		'NxNxN', 'Base', 'Frosted', '51 x 51 x 51', 62,
		'2020-01-01', 'year', false,
		'898d0e3a-3465-4c25-9b9f-b498b9884d1d', '898d0e3a-3465-4c25-9b9f-b498b9884d1d', '2026-01-10 12:00:00+00'
	),
	(
		'YJ MGC Square-1', 'yj-mgc-square-1', 'https://placehold.co/600x600/7c3aed/ffffff?text=YJ+MGC+Square-1',
		(select id from public.brands where name = 'YJ'),
		(select id from public.cube_types where name = 'Square-1'),
		(select id from public.cube_series where name = 'MGC'),
		'Square-N', 'Base', 'Frosted', '55 x 55 x 57', 84,
		'2021-06-01', 'month', false,
		'898d0e3a-3465-4c25-9b9f-b498b9884d1d', '898d0e3a-3465-4c25-9b9f-b498b9884d1d', '2026-01-10 12:00:00+00'
	),
	(
		'GAN 15 MagLev', 'gan-15-maglev', 'https://placehold.co/600x600/2563eb/ffffff?text=GAN+15+MagLev',
		(select id from public.brands where name = 'GAN'),
		(select id from public.cube_types where name = '3x3'),
		(select id from public.cube_series where name = 'GAN 15'),
		'NxNxN', 'Base', 'UV Coated', '56 x 56 x 56', 63,
		'2024-09-01', 'month', false,
		'898d0e3a-3465-4c25-9b9f-b498b9884d1d', '898d0e3a-3465-4c25-9b9f-b498b9884d1d', '2026-01-10 12:00:00+00'
	),
	(
		'MoYu Super WeiLong V2', 'moyu-super-weilong-v2', 'https://placehold.co/600x600/b91c1c/ffffff?text=MoYu+Super+WeiLong+V2',
		(select id from public.brands where name = 'MoYu'),
		(select id from public.cube_types where name = '3x3'),
		(select id from public.cube_series where name = 'Super WeiLong'),
		'NxNxN', 'Variant', 'UV Coated', '55 x 55 x 55', 64,
		'2025-04-01', 'month', false,
		'898d0e3a-3465-4c25-9b9f-b498b9884d1d', '898d0e3a-3465-4c25-9b9f-b498b9884d1d', '2026-01-10 12:00:00+00'
	),
	(
		'QiYi M Pro 4x4', 'qiyi-m-pro-4x4', 'https://placehold.co/600x600/047857/ffffff?text=QiYi+M+Pro+4x4',
		(select id from public.brands where name = 'QiYi'),
		(select id from public.cube_types where name = '4x4'),
		(select id from public.cube_series where name = 'M Pro'),
		'NxNxN', 'Base', 'Frosted', '59 x 59 x 59', 110,
		'2024-07-01', 'month', false,
		'898d0e3a-3465-4c25-9b9f-b498b9884d1d', '898d0e3a-3465-4c25-9b9f-b498b9884d1d', '2026-01-10 12:00:00+00'
	),
	(
		'YJ MGC 5x5', 'yj-mgc-5x5', 'https://placehold.co/600x600/6d28d9/ffffff?text=YJ+MGC+5x5',
		(select id from public.brands where name = 'YJ'),
		(select id from public.cube_types where name = '5x5'),
		(select id from public.cube_series where name = 'MGC'),
		'NxNxN', 'Base', 'Frosted', '62 x 62 x 62', 127,
		'2020-06-01', 'month', false,
		'898d0e3a-3465-4c25-9b9f-b498b9884d1d', '898d0e3a-3465-4c25-9b9f-b498b9884d1d', '2026-01-10 12:00:00+00'
	),
	(
		'YJ MGC 6x6', 'yj-mgc-6x6', 'https://placehold.co/600x600/5b21b6/ffffff?text=YJ+MGC+6x6',
		(select id from public.brands where name = 'YJ'),
		(select id from public.cube_types where name = '6x6'),
		(select id from public.cube_series where name = 'MGC 6x6'),
		'NxNxN', 'Base', 'Frosted', '65 x 65 x 65', 165,
		'2020-11-01', 'month', false,
		'898d0e3a-3465-4c25-9b9f-b498b9884d1d', '898d0e3a-3465-4c25-9b9f-b498b9884d1d', '2026-01-10 12:00:00+00'
	),
	(
		'YJ MGC 7x7', 'yj-mgc-7x7', 'https://placehold.co/600x600/4c1d95/ffffff?text=YJ+MGC+7x7',
		(select id from public.brands where name = 'YJ'),
		(select id from public.cube_types where name = '7x7'),
		(select id from public.cube_series where name = 'MGC 7x7'),
		'NxNxN', 'Base', 'Frosted', '67 x 67 x 67', 205,
		'2021-03-01', 'month', false,
		'898d0e3a-3465-4c25-9b9f-b498b9884d1d', '898d0e3a-3465-4c25-9b9f-b498b9884d1d', '2026-01-10 12:00:00+00'
	),
	(
		'X-Man Bell V2 Pyraminx', 'x-man-bell-v2-pyraminx', 'https://placehold.co/600x600/0e7490/ffffff?text=X-Man+Bell+V2+Pyraminx',
		(select id from public.brands where name = 'X-Man Design'),
		(select id from public.cube_types where name = 'Pyraminx'),
		(select id from public.cube_series where name = 'Bell'),
		'Corner-Turning', 'Variant', 'Frosted', '98 x 98 x 98', 84,
		'2023-11-01', 'month', false,
		'898d0e3a-3465-4c25-9b9f-b498b9884d1d', '898d0e3a-3465-4c25-9b9f-b498b9884d1d', '2026-01-10 12:00:00+00'
	),
	(
		'GAN Megaminx V2', 'gan-megaminx-v2', 'https://placehold.co/600x600/1e40af/ffffff?text=GAN+Megaminx+V2',
		(select id from public.brands where name = 'GAN'),
		(select id from public.cube_types where name = 'Megaminx'),
		(select id from public.cube_series where name = 'GAN Megaminx'),
		'Minx', 'Variant', 'UV Coated', '95 x 95 x 95', 112,
		'2025-07-01', 'month', false,
		'898d0e3a-3465-4c25-9b9f-b498b9884d1d', '898d0e3a-3465-4c25-9b9f-b498b9884d1d', '2026-01-10 12:00:00+00'
	),
	(
		'QiYi Wingy Magnetic Skewb', 'qiyi-wingy-magnetic-skewb', 'https://placehold.co/600x600/15803d/ffffff?text=QiYi+Wingy+Magnetic+Skewb',
		(select id from public.brands where name = 'QiYi'),
		(select id from public.cube_types where name = 'Skewb'),
		(select id from public.cube_series where name = 'Wingy'),
		'Corner-Turning', 'Base', 'Frosted', '56 x 56 x 56', 74,
		'2022-03-01', 'month', false,
		'898d0e3a-3465-4c25-9b9f-b498b9884d1d', '898d0e3a-3465-4c25-9b9f-b498b9884d1d', '2026-01-10 12:00:00+00'
	),
	(
		'QiYi Magnetic Clock', 'qiyi-magnetic-clock', 'https://placehold.co/600x600/166534/ffffff?text=QiYi+Magnetic+Clock',
		(select id from public.brands where name = 'QiYi'),
		(select id from public.cube_types where name = 'Clock'),
		(select id from public.cube_series where name = 'QiYi Clock'),
		'Non-Twisty', 'Base', 'Frosted', '105 x 105 x 28', 118,
		'2024-02-01', 'month', false,
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
	('yj-mgc-square-1', 'magnetic'),
	('gan-15-maglev', 'wca_legal'),
	('gan-15-maglev', 'magnetic'),
	('gan-15-maglev', 'maglev'),
	('gan-15-maglev', 'ball_core'),
	('moyu-super-weilong-v2', 'wca_legal'),
	('moyu-super-weilong-v2', 'magnetic'),
	('moyu-super-weilong-v2', 'maglev'),
	('moyu-super-weilong-v2', 'ball_core'),
	('qiyi-m-pro-4x4', 'wca_legal'),
	('qiyi-m-pro-4x4', 'magnetic'),
	('yj-mgc-5x5', 'wca_legal'),
	('yj-mgc-5x5', 'magnetic'),
	('yj-mgc-6x6', 'wca_legal'),
	('yj-mgc-6x6', 'magnetic'),
	('yj-mgc-7x7', 'wca_legal'),
	('yj-mgc-7x7', 'magnetic'),
	('x-man-bell-v2-pyraminx', 'wca_legal'),
	('x-man-bell-v2-pyraminx', 'magnetic'),
	('gan-megaminx-v2', 'wca_legal'),
	('gan-megaminx-v2', 'magnetic'),
	('gan-megaminx-v2', 'ball_core'),
	('qiyi-wingy-magnetic-skewb', 'wca_legal'),
	('qiyi-wingy-magnetic-skewb', 'magnetic'),
	('qiyi-magnetic-clock', 'wca_legal'),
	('qiyi-magnetic-clock', 'magnetic');

commit;
