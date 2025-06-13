// +page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { slugify } from '$lib/components/slugify.svelte';

export const load = (async ({ locals }) => {
    // Use locals.supabase so that row‐level security / auth works
    const { data: cubes, error: cubesErr } = await locals.supabase
        .from('cube_models')
        .select('*');
    if (cubesErr) throw error(500, cubesErr.message);

    const { data: profiles, error: profilesErr } = await locals.supabase
        .from('profiles')
        .select('username');
    if (profilesErr) throw error(500, profilesErr.message);

    return { cubes, profiles };
}) satisfies PageServerLoad;

export const actions: Actions = {
    default: async ({ request, locals }) => {
        const form = await request.formData();

        // Extract & cast all fields
        const series = form.get('series')?.toString().trim() ?? '';
        const model = form.get('model')?.toString().trim() ?? '';
        const versionName = form.get('version')?.toString().trim() ?? '';
        const brandRaw = form.get('brand')?.toString() ?? '';
        const otherBrand = form.get('otherBrand')?.toString().trim() ?? '';
        const type = form.get('type')?.toString() ?? '';
        const releaseDate = form.get('releaseDate')?.toString() ?? '';
        const imageUrl = form.get('imageUrl')?.toString().trim() ?? '';
        const surfaceFinish = form.get('surfaceFinish')?.toString().trim() ?? '';
        const weight = parseFloat(form.get('weight')?.toString() ?? '0');
        const size = parseFloat(form.get('size')?.toString() ?? '0');
        const cubeVersion = form.get('cubeVersion')?.toString() ?? '';
        const submittedByRaw = form.get('submittedBy')?.toString() ?? '';
        const relatedTo = form.get('relatedTo')?.toString() ?? '';
        // Checkboxes return either "on" or null
        const wcaLegal = form.get('wcaLegal') !== null;
        const magnetic = form.get('magnetic') !== null;
        const smart = form.get('smart') !== null;
        const modded = form.get('modded') !== null;
        const discontinued = form.get('discontinued') !== null;
        const maglev = form.get('maglev') !== null;

        // Basic required‐fields validation
        if (
            !model ||
            !series ||
            !brandRaw ||
            !releaseDate ||
            !imageUrl ||
            isNaN(weight) ||
            isNaN(size) ||
            !cubeVersion
        ) {
            return fail(400, { message: 'Please fill in all required fields.' });
        }

        // “Other” dropdowns
        const brand = brandRaw === '___other' ? otherBrand : brandRaw;
        if (brandRaw === '___other' && !otherBrand) {
            return fail(400, { message: 'Please specify the other brand.' });
        }

        // Version field for Trim/Limited
        if ((cubeVersion === 'Trim' || cubeVersion === 'Limited') && !versionName) {
            return fail(400, { message: 'Please specify the version name.' });
        }

        // Relation requirements
        if (modded && !relatedTo) {
            return fail(400, { message: 'Please select the model this is a mod of.' });
        }
        if ((cubeVersion === 'Trim' || cubeVersion === 'Limited') && !relatedTo) {
            return fail(400, {
                message: 'Please select the model this is a limited edition of.'
            });
        }

        // Business rule: smart cubes cannot be WCA‐legal
        if (smart && wcaLegal) {
            return fail(400, { message: 'Smart cubes cannot be WCA legal.' });
        }

        // Figure out who’s submitting
        const { data: me, error: meErr } = await locals.supabase
            .from('profiles')
            .select('username')
            .eq('user_id', locals.user?.id);
        if (meErr || !me?.length) throw error(500, meErr?.message || 'Profile not found');
        const submittedBy =
            submittedByRaw === 'disabled' ? me[0].username : submittedByRaw;

        const slug = slugify(`${series} ${model} ${versionName}`);

        const payload = {
            slug,
            series,
            model,
            version_name: versionName,
            brand,
            type,
            release_date: releaseDate,
            image_url: imageUrl,
            surface_finish: surfaceFinish,
            weight,
            size,
            version_type: cubeVersion,
            submitted_by: submittedBy,
            verified_by: me[0].username,
            related_to: relatedTo || null,
            wca_legal: wcaLegal,
            magnetic,
            smart,
            modded,
            discontinued,
            maglev
        };

        const { error: insertErr } = await locals.supabase
            .from('cube_models')
            .insert(payload)
            .select();
        if (insertErr) return fail(500, { message: insertErr.message });

        return { message: 'Cube added successfully!' };
    }
};
