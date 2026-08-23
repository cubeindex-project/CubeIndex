begin;
set local session_replication_role = replica;

insert into public.cube_vendor_links (
	cube_id,
	vendor_id,
	url,
	price,
	available,
	is_dead,
	last_modified
)
values
	((select id from public.cube_models where slug = 'gan-16-maglev'), (select id from public.vendors where slug = 'speedcubeshop'), 'https://speedcubeshop.com/products/gan-16-maglev', 64.95, true, false, '2026-08-20 10:00:00+00'),
	((select id from public.cube_models where slug = 'gan-16-maglev'), (select id from public.vendors where slug = 'thecubicle'), 'https://thecubicle.com/products/gan-16-maglev', 62.99, true, false, '2026-08-20 10:05:00+00'),
	((select id from public.cube_models where slug = 'moyu-weilong-wr-m-v10'), (select id from public.vendors where slug = 'speedcubeshop'), 'https://speedcubeshop.com/products/moyu-weilong-wr-m-v10', 34.95, true, false, '2026-08-20 10:10:00+00'),
	((select id from public.cube_models where slug = 'moyu-weilong-wr-m-v10'), (select id from public.vendors where slug = 'thecubicle'), 'https://thecubicle.com/products/moyu-weilong-wr-m-v10', 32.99, true, false, '2026-08-20 10:15:00+00'),
	((select id from public.cube_models where slug = 'moyu-rs3-m-v5'), (select id from public.vendors where slug = 'speedcubeshop'), 'https://speedcubeshop.com/products/moyu-rs3-m-v5', 9.95, true, false, '2026-08-20 10:20:00+00'),
	((select id from public.cube_models where slug = 'x-man-tornado-v4-pioneer'), (select id from public.vendors where slug = 'thecubicle'), 'https://thecubicle.com/products/x-man-tornado-v4-pioneer', 39.99, true, false, '2026-08-20 10:25:00+00'),
	((select id from public.cube_models where slug = 'qiyi-ms-2x2'), (select id from public.vendors where slug = 'cubezz'), 'https://cubezz.com/qiyi-ms-2x2', 7.49, true, false, '2026-08-20 10:30:00+00'),
	((select id from public.cube_models where slug = 'yj-mgc-square-1'), (select id from public.vendors where slug = 'kewbzuk'), 'https://kewbz.co.uk/products/yj-mgc-square-1', 18.99, false, false, '2026-08-20 10:35:00+00');

insert into public.cube_vendor_links_snapshot (
	cube_id,
	vendor_id,
	url,
	price,
	available,
	created_at
)
values
	((select id from public.cube_models where slug = 'gan-16-maglev'), (select id from public.vendors where slug = 'speedcubeshop'), 'https://speedcubeshop.com/products/gan-16-maglev', 69.95, true, '2026-07-01 10:00:00+00'),
	((select id from public.cube_models where slug = 'gan-16-maglev'), (select id from public.vendors where slug = 'speedcubeshop'), 'https://speedcubeshop.com/products/gan-16-maglev', 64.95, true, '2026-08-20 10:00:00+00'),
	((select id from public.cube_models where slug = 'moyu-weilong-wr-m-v10'), (select id from public.vendors where slug = 'thecubicle'), 'https://thecubicle.com/products/moyu-weilong-wr-m-v10', 36.99, true, '2026-07-01 10:00:00+00'),
	((select id from public.cube_models where slug = 'moyu-weilong-wr-m-v10'), (select id from public.vendors where slug = 'thecubicle'), 'https://thecubicle.com/products/moyu-weilong-wr-m-v10', 32.99, true, '2026-08-20 10:15:00+00');

commit;
