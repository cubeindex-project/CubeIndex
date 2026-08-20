with series_mappings (slug, series_name) as (
	values
	    ('aj-bubble-skewb', 'AJ Bubble'),
	    ('alpha-cc1-black', 'Alpha CC1'),
	    ('alpha-cc1-white', 'Alpha CC1'),
	    ('alpha-cc3-black', 'Alpha CC3'),
	    ('alpha-cc3-white-white', 'Alpha CC3'),
	    ('alpha-v-black', 'Alpha V'),
	    ('alpha-v-white', 'Alpha V'),
	    ('angstrom-weilong-wrm-v9-20-magnet-ball-core--uv--maglev', 'Angstrom WeiLong WRM'),
	    ('calvins-double-megaminx-black', 'Calvin''s Double Megaminx'),
	    ('calvins-double-megaminx-stickerless', 'Calvin''s Double Megaminx'),
	    ('calvins-ideal-cube-1x1x2', 'Calvin''s Ideal Cube'),
	    ('cube4you-clock-3x3', 'Cube4You Clock'),
	    ('cubestyle-carbon-fiber-skewb', 'CubeStyle Carbon Fiber'),
	    ('dayan-guhong-pro-3x3-55mm', 'DaYan GuHong Pro+'),
	    ('dayan-guhong-pro-3x3-55mm-maglev', 'DaYan GuHong Pro+'),
	    ('dayan-guhong-pro-54mm', 'DaYan GuHong Pro+'),
	    ('dayan-guhong-pro-55mm-maglev', 'DaYan GuHong Pro'),
	    ('dayan-guhong-pro-56mm-maglev', 'DaYan GuHong Pro'),
	    ('dayan-guhong-pro-m-54mm', 'DaYan GuHong Pro'),
	    ('dayan-guhong-pro-m-54mm-maglev', 'DaYan GuHong Pro'),
	    ('dayan-guhong-pro-m-55mm', 'DaYan GuHong Pro'),
	    ('dayan-guhong-pro-m-56mm', 'DaYan GuHong Pro'),
	    ('dayan-megaminx-v2-m', 'DaYan Megaminx'),
	    ('dayan-pyraminx-v3-maglev-uv', 'DaYan Pyraminx'),
	    ('dayan-pyraminx-v3-magnetic', 'DaYan Pyraminx'),
	    ('diansheng-big-2x2-m', 'DianSheng Big 2x2'),
	    ('diansheng-galaxy-13x13-m', 'DianSheng Galaxy'),
	    ('diansheng-galaxy-2x2-fto', 'DianSheng Galaxy'),
	    ('diansheng-galaxy-corner-turning-3x3', 'DianSheng Galaxy'),
	    ('diansheng-galaxy-gigaminx', 'DianSheng Galaxy'),
	    ('diansheng-galaxy-kilominx', 'DianSheng Galaxy'),
	    ('diansheng-galaxy-master-kilominx', 'DianSheng Galaxy'),
	    ('diansheng-galaxy-megaminx', 'DianSheng Galaxy'),
	    ('diansheng-galaxy-mirror-5x5-purple', 'DianSheng Galaxy'),
	    ('diansheng-galaxy-petaminx', 'DianSheng Galaxy'),
	    ('diansheng-galaxy-teraminx', 'DianSheng Galaxy'),
	    ('diansheng-galaxy-teraminx-m', 'Diansheng Galaxy Teraminx'),
	    ('diansheng-s5m-5x5', 'DianSheng S5M'),
	    ('diansheng-smc-7x7', 'DianSheng SMC'),
	    ('diansheng-solar-4x4', 'DianSheng Solar'),
	    ('diansheng-solar-5x5', 'DianSheng Solar'),
	    ('diansheng-solar-s2-m', 'DianSheng Solar S2'),
	    ('drift-3m-pro-maglev', 'Drift 3M'),
	    ('drift-3m-v1', 'Drift 3M'),
	    ('escube-air-3x3', 'ESCUBE AIR'),
	    ('escube-air-3x3-20-magnet-ball-core', 'ESCube Air'),
	    ('escube-air-3x3-8-magnet-ball-core', 'ESCube Air'),
	    ('fz-aochuang-v6-triple-track-uv', 'FZ AoChuang'),
	    ('gan11-air', 'GAN11'),
	    ('gan11-m', 'GAN11'),
	    ('gan11-m-duo', 'GAN11'),
	    ('gan11-m-pro', 'GAN11'),
	    ('gan11-m-pro-uv', 'GAN11'),
	    ('gan12-m-leap', 'GAN12'),
	    ('gan12-m-maglev', 'GAN12'),
	    ('gan12-m-maglev-uv-coated', 'GAN12'),
	    ('gan-12-ui-maglev-uv-10th-anniversary-edition', 'GAN 12 UI'),
	    ('gan13-m-maglev', 'GAN13'),
	    ('gan13-m-maglev-fx', 'GAN13'),
	    ('gan13-m-maglev-uv', 'GAN13'),
	    ('gan14-m-maglev-matte', 'GAN14'),
	    ('gan14-m-maglev-uv', 'GAN14'),
	    ('gan-15-maglev', 'GAN 15'),
	    ('gan15-maglev-emeraldox', 'GAN15'),
	    ('gan-15-maglev-uv-10th-anniversary-edition', 'GAN 15'),
	    ('gan15-new-black-uv', 'GAN15'),
	    ('gan15-newblack-uv', 'GAN15'),
	    ('gan16-maglev-max-amyth-le', 'GAN16'),
	    ('gan16-maglev-max-uv', 'GAN16'),
	    ('gan-251-m-air', 'GAN 251'),
	    ('gan251-m-air-10th-anniversary-edition', 'GAN251'),
	    ('gan251-m-leap', 'GAN251 M'),
	    ('gan251-m-leap-2x2-uv-10th-anniversary-edition', 'GAN251 M Leap'),
	    ('gan251-m-leap-uv', 'GAN251'),
	    ('gan251-m-pro', 'GAN251'),
	    ('gan356-i-3', 'GAN356 i'),
	    ('gan356-i-carry', 'GAN356 i'),
	    ('gan356-i-carry-2', 'GAN356 i'),
	    ('gan-356-i-carry-2-uv-10th-anniversary-edition', 'GAN 356 i Carry'),
	    ('gan356-i-carry-e', 'GAN356 i'),
	    ('gan356-i-carry-e-uv-coated', 'GAN356 i'),
	    ('gan356-i-carry-s', 'GAN356 i Carry'),
	    ('gan356-maglev', 'GAN356'),
	    ('gan356-maglev-uv', 'GAN356'),
	    ('gan356-me', 'GAN356'),
	    ('gan356-me-2025-lunar-new-year-edition', 'GAN356'),
	    ('gan356-me-brainstorm-voyage-edition', 'GAN356'),
	    ('gan356-me-christmas-edition', 'GAN356'),
	    ('gan356-me-uv', 'GAN356'),
	    ('gan356-me-uv-10th-anniversary-edition', 'GAN356'),
	    ('gan356-me-v2', 'GAN356'),
	    ('gan-357-ultimate', 'GAN 357'),
	    ('gan460-m', 'GAN460'),
	    ('gan460-m-v2-frosted', 'GAN460'),
	    ('gan460-m-v2-sp', 'GAN460'),
	    ('gan460-m-v2-uv', 'GAN460'),
	    ('gan562-m', 'GAN562'),
	    ('gan562-m-uv-coated', 'GAN562'),
	    ('gan-megaminx-maglev', 'GAN Megaminx'),
	    ('gan-mirror-m', 'GAN Mirror')
),
upserted_series as (
	insert into public.cube_series (name)
	select distinct series_name
	from series_mappings
	on conflict (name) do update
	set name = excluded.name
	returning id, name
)
update public.cube_models cm
set series_id = us.id
from series_mappings sm
join upserted_series us on us.name = sm.series_name
where cm.slug = sm.slug;

delete from public.cube_models
where slug in (
    'haitun-waverider-3x3-flagship-magnetic'
    'haitun-waverider-3x3-magnetic'
    'scs-speed-cube-pro-3x3-magnetic'
    'vin-cube-3x3-nova'
    'yj-yuhu-megaminx-v2-m'
);
