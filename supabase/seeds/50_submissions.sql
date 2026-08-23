begin;
set local session_replication_role = replica;

insert into public.submissions (
	type,
	status,
	operation,
	submitter_note,
	submitted_by_id,
	submitted_at
)
values (
	'cube',
	'Pending',
	'create',
	'Seeded submission for exercising the staff review workflow.',
	'22222222-2222-4222-8222-222222222222',
	'2026-08-21 15:00:00+00'
);

insert into public.cube_submissions (
	submission_id,
	name,
	version_type,
	image_url,
	brand_id,
	type_id,
	series_id,
	release_date,
	release_date_precision,
	weight,
	size,
	surface_finish,
	discontinued,
	sub_type
)
values (
	(select id from public.submissions where submitter_note = 'Seeded submission for exercising the staff review workflow.'),
	'GAN 16 MagLev Limited Edition',
	'Limited',
	'/images/legendary-cube.webp',
	(select id from public.brands where name = 'GAN'),
	(select id from public.cube_types where name = '3x3'),
	(select id from public.cube_series where name = 'GAN 16'),
	'2026-07-01',
	'month',
	64,
	'56 x 56 x 56',
	'UV Coated',
	false,
	'NxNxN'
);

insert into public.cube_submission_features (cube_submission_id, feature_id)
select submission.id, feature.id
from public.cube_submissions as submission
cross join public.cube_features as feature
where submission.name = 'GAN 16 MagLev Limited Edition'
	and feature.code in ('wca_legal', 'magnetic', 'maglev', 'ball_core');

insert into public.cube_vendor_link_submissions (
	cube_submission_id,
	vendor_id,
	url,
	price,
	available
)
values (
	(select id from public.cube_submissions where name = 'GAN 16 MagLev Limited Edition'),
	(select id from public.vendors where slug = 'speedcubeshop'),
	'https://speedcubeshop.com/products/gan-16-maglev-limited-edition',
	74.95,
	true
);

commit;
