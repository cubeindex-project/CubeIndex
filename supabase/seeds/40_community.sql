begin;
set local session_replication_role = replica;

insert into public.user_cubes (
	user_id,
	cube_id,
	main,
	quantity,
	condition,
	status,
	notes,
	acquired_at,
	bought_from_id,
	purchase_price,
	purchase_price_currency
)
values
	('11111111-1111-4111-8111-111111111111', (select id from cube_models where slug = 'gan-16-maglev'), true, 1, 'Good', 'owned', 'Current competition main.', '2026-02-14', (select id from vendors v where v.slug = 'thecubicle'), 62.99, 'USD'),
	('11111111-1111-4111-8111-111111111111', (select id from cube_models where slug = 'moyu-rs3-m-v5'), false, 2, 'Good', 'owned', 'One stock and one set up for OH.', '2025-11-10', (select id from vendors v where v.slug = 'speedcubeshop'), 19.90, 'EUR'),
	('11111111-1111-4111-8111-111111111111', (select id from cube_models where slug = 'yj-mgc-square-1'), false, 1, 'New', 'wanted', 'Try before the next competition.', null, null, null, null),
	('22222222-2222-4222-8222-222222222222', (select id from cube_models where slug = 'moyu-weilong-wr-m-v10'), true, 1, 'New', 'owned', 'Smooth setup with medium compression.', '2026-03-02', (select id from vendors v where v.slug = 'speedcubeshop'), 34.95, 'GBP'),
	('22222222-2222-4222-8222-222222222222', (select id from cube_models where slug = 'qiyi-ms-2x2'), false, 1, 'Fair', 'owned', 'First magnetic 2x2.', '2025-08-20', (select id from vendors v where v.slug = 'cubezz'), 7.49, 'XOF'),
	('22222222-2222-4222-8222-222222222222', (select id from cube_models where slug = 'x-man-tornado-v4-pioneer'), false, 1, 'New', 'wanted', '', null, null, null, null);

insert into public.user_cube_ratings (user_id, cube_id, rating, comment, created_at, updated_at)
values
	('11111111-1111-4111-8111-111111111111', (select id from cube_models where slug = 'gan-16-maglev'), 4.5, 'Fast, stable, and highly adjustable.', '2026-04-10 12:00:00+00', '2026-04-10 12:00:00+00'),
	('11111111-1111-4111-8111-111111111111', (select id from cube_models where slug = 'moyu-rs3-m-v5'), 4.0, 'Excellent value after a basic setup.', '2026-04-11 12:00:00+00', '2026-04-11 12:00:00+00'),
	('22222222-2222-4222-8222-222222222222', (select id from cube_models where slug = 'gan-16-maglev'), 5.0, 'Premium feel with dependable corner cutting.', '2026-04-12 12:00:00+00', '2026-04-12 12:00:00+00'),
	('22222222-2222-4222-8222-222222222222', (select id from cube_models where slug = 'moyu-weilong-wr-m-v10'), 4.5, 'Light and effortless without feeling unstable.', '2026-04-13 12:00:00+00', '2026-04-13 12:00:00+00');

insert into public.user_cube_reviews (user_id, cube, title, review, status, created_at, updated_at)
values
	(
		'11111111-1111-4111-8111-111111111111',
		'gan-16-maglev',
		'A fast flagship that stays controlled',
		'The GAN 16 is quick out of the box, but the adjustment range makes it easy to add control. The ball core gives it a consistent magnetic feel through every turn.',
		'published',
		'2026-04-15 12:00:00+00',
		'2026-04-15 12:00:00+00'
	),
	(
		'22222222-2222-4222-8222-222222222222',
		'moyu-weilong-wr-m-v10',
		'Light, smooth, and competition ready',
		'The WR M V10 feels light without becoming flimsy. It responds well to a slightly slower lubricant and has excellent forward corner cutting.',
		'published',
		'2026-04-16 12:00:00+00',
		'2026-04-16 12:00:00+00'
	);

insert into public.user_cube_reviews_ratings (review_id, category_id, rating)
select review.id, category.id, scores.rating
from (
	values
		('A fast flagship that stays controlled', 'turning', 5.0::real),
		('A fast flagship that stays controlled', 'corner-cutting', 4.5::real),
		('A fast flagship that stays controlled', 'stability', 4.5::real),
		('A fast flagship that stays controlled', 'value', 3.5::real),
		('Light, smooth, and competition ready', 'turning', 4.5::real),
		('Light, smooth, and competition ready', 'corner-cutting', 4.5::real),
		('Light, smooth, and competition ready', 'stability', 4.0::real),
		('Light, smooth, and competition ready', 'value', 4.0::real)
) as scores(review_title, category_slug, rating)
join public.user_cube_reviews as review on review.title = scores.review_title
join public.user_cube_reviews_categories as category on category.slug = scores.category_slug;

insert into public.user_follows (follower_id, following_id, followed_at)
values
	('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', '2026-05-01 12:00:00+00'),
	('22222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111', '2026-05-02 12:00:00+00');

insert into public.user_achievements (user_id, achievement_slug, awarded_by_id, awarded_at)
values
	('11111111-1111-4111-8111-111111111111', 'first-cube', '898d0e3a-3465-4c25-9b9f-b498b9884d1d', '2026-02-14 12:00:00+00'),
	('11111111-1111-4111-8111-111111111111', 'cube-critic', '898d0e3a-3465-4c25-9b9f-b498b9884d1d', '2026-04-10 12:00:00+00'),
	('22222222-2222-4222-8222-222222222222', 'first-cube', '898d0e3a-3465-4c25-9b9f-b498b9884d1d', '2026-03-02 12:00:00+00');

insert into public.notifications (message, icon, link, link_text, published_by_id, user_id, created_at)
values
	('Welcome to the seeded CubeIndex development environment.', 'fa-solid fa-seedling', '/', 'Explore cubes', '898d0e3a-3465-4c25-9b9f-b498b9884d1d', null, '2026-06-01 09:00:00+00'),
	('Maya Chen followed you.', 'fa-solid fa-user-plus', '/user/maya.chen', 'View profile', null, '11111111-1111-4111-8111-111111111111', '2026-06-02 09:00:00+00');

insert into public.user_notification_status (notification_id, user_id, read)
select notification.id, users.user_id, users.read
from public.notifications as notification
join (
	values
		('Welcome to the seeded CubeIndex development environment.', '11111111-1111-4111-8111-111111111111'::uuid, true),
		('Welcome to the seeded CubeIndex development environment.', '22222222-2222-4222-8222-222222222222'::uuid, false),
		('Maya Chen followed you.', '11111111-1111-4111-8111-111111111111'::uuid, false)
) as users(message, user_id, read) on users.message = notification.message;

commit;
