begin;
set local session_replication_role = replica;

insert into public.cube_features (code, label)
values
	('wca_legal', 'WCA Legal'),
	('magnetic', 'Magnetic'),
	('smart', 'Smart Cube'),
	('modded', 'Modified'),
	('maglev', 'MagLev'),
	('stickered', 'Stickered'),
	('ball_core', 'Ball Core');

insert into public.cube_types (name, popularity, shape_family, added_by_id)
values
	('2x2', 90, 'Cube', '898d0e3a-3465-4c25-9b9f-b498b9884d1d'),
	('3x3', 100, 'Cube', '898d0e3a-3465-4c25-9b9f-b498b9884d1d'),
	('4x4', 85, 'Cube', '898d0e3a-3465-4c25-9b9f-b498b9884d1d'),
	('5x5', 75, 'Cube', '898d0e3a-3465-4c25-9b9f-b498b9884d1d'),
	('Pyraminx', 70, 'Tetrahedron', '898d0e3a-3465-4c25-9b9f-b498b9884d1d'),
	('Megaminx', 65, 'Dodecahedron', '898d0e3a-3465-4c25-9b9f-b498b9884d1d'),
	('Skewb', 60, 'Cube', '898d0e3a-3465-4c25-9b9f-b498b9884d1d'),
	('Square-1', 55, 'Shape-Shifting', '898d0e3a-3465-4c25-9b9f-b498b9884d1d'),
	('Clock', 50, 'Clock', '898d0e3a-3465-4c25-9b9f-b498b9884d1d');

insert into public.brands (name, added_by_id)
values
	('GAN', '898d0e3a-3465-4c25-9b9f-b498b9884d1d'),
	('MoYu', '898d0e3a-3465-4c25-9b9f-b498b9884d1d'),
	('QiYi', '898d0e3a-3465-4c25-9b9f-b498b9884d1d'),
	('X-Man Design', '898d0e3a-3465-4c25-9b9f-b498b9884d1d'),
	('YJ', '898d0e3a-3465-4c25-9b9f-b498b9884d1d');

insert into public.cube_series (name)
values
	('GAN 16'),
	('WeiLong'),
	('RS3 M'),
	('Tornado'),
	('QiYi MS'),
	('MGC');

insert into public.vendors (
	slug,
	name,
	base_url,
	country_iso,
	currency,
	sponsored,
	verified,
	supports_price_scraping,
	supports_product_scraping
)
values
	('speedcubeshop', 'SpeedCubeShop', 'https://speedcubeshop.com', 'US', 'USD', false, true, true, true),
	('thecubicle', 'TheCubicle', 'https://thecubicle.com', 'US', 'USD', false, true, true, true),
	('kewbzuk', 'KewbzUK', 'https://kewbz.co.uk', 'GB', 'GBP', false, true, false, false),
	('cubezz', 'Cubezz', 'https://cubezz.com', 'CN', 'USD', false, true, false, false);

insert into public.user_cube_reviews_categories (slug, label, active)
values
	('turning', 'Turning', true),
	('corner-cutting', 'Corner Cutting', true),
	('stability', 'Stability', true),
	('value', 'Value', true);

insert into public.achievements (
	name,
	slug,
	icon,
	description,
	unlockable,
	unlock_method,
	rarity,
	category,
	title,
	evolutive,
	submitted_by_id
)
values
	('First Cube', 'first-cube', 'fa-solid fa-cube', 'Add the first cube to your collection.', true, 'Automatic', 'Common', 'Quantity', 'Collector', true, '898d0e3a-3465-4c25-9b9f-b498b9884d1d'),
	('Cube Critic', 'cube-critic', 'fa-solid fa-star', 'Publish your first cube rating.', true, 'Automatic', 'Common', 'Website', 'Critic', false, '898d0e3a-3465-4c25-9b9f-b498b9884d1d'),
	('Early Collector', 'early-collector', 'fa-solid fa-clock', 'Joined CubeIndex during its early development.', false, 'Manual', 'Special', 'Website', 'Early Collector', false, '898d0e3a-3465-4c25-9b9f-b498b9884d1d');

commit;
