import type { Actions, PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { slugify } from "$lib/components/helper_functions/slugify.svelte";
import { getSubTypes } from "$lib/components/helper_functions/subType.svelte";
import { message, setError, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { cleanLink } from "$lib/components/helper_functions/linkCleaner";
import { cubeSchema } from "$lib/components/validation/cubeForm";
import { z } from "zod/v4";
import { logError } from "$lib/server/logError";

/** Schema for store URL scraping requests. */
const scrapSchema = z.object({
  runName: z
    .preprocess((value) => {
      if (typeof value !== "string") return value;
      const trimmed = value.trim();
      return trimmed.length === 0 ? undefined : trimmed;
    }, z.string().min(3, "Run name must be at least 3 characters long.").max(120, "Run names are limited to 120 characters."))
    .optional(),
  storeUrls: z
    .string()
    .min(1, "Add at least one store URL.")
    .max(5000, "Please keep the request under 5,000 characters."),
});

/** Captures each store page queued for scraping. */
interface ScrapRunUrl {
  id: number;
  source_url: string;
  normalized_url: string | null;
  status: string;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
}

/** Describes a queued import request created by a user. */
interface ScrapRun {
  id: number;
  name: string | null;
  status: string;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  urls: ScrapRunUrl[];
}

export const load = (async ({ locals }) => {
  const form = await superValidate(zod4(cubeSchema), { errors: false });
  const scrapeForm = await superValidate(zod4(scrapSchema), {
    errors: false,
  });

  let hasAccess: boolean = false;

  if (locals.user?.id) {
    const { data, error } = await locals.supabase
      .from("profiles")
      .select("beta_flags")
      .eq("user_id", locals.user.id)
      .single();

    if (error) {
      logError(
        500,
        "An error occured while fetching your profile",
        locals.log,
        error
      );
    }

    hasAccess = data.beta_flags.submit_cubes;
  }

  const [
    { data: cubes, error: cubeErr },
    { data: brands, error: brandErr },
    { data: types, error: typeErr },
  ] = await Promise.all([
    locals.supabase.from("cube_models").select("*").eq("status", "Approved"),
    locals.supabase
      .from("brands")
      .select("name")
      .order("name", { ascending: true }),
    locals.supabase
      .from("cube_types")
      .select("name")
      .order("name", { ascending: true }),
  ]);

  if (cubeErr) {
    locals.log.error({ err: cubeErr.message }, "Failed to fetch cubes");
    throw error(500, "Failed to fetch cubes");
  }
  if (brandErr) {
    locals.log.error({ err: brandErr.message }, "Failed to fetch brands");
    throw error(500, "Failed to fetch brands");
  }
  if (typeErr) {
    locals.log.error({ err: typeErr.message }, "Failed to fetch types");
    throw error(500, "Failed to fetch types");
  }

  const [
    { data: surfaces, error: surfaceErr },
    { data: subTypes, error: subTypeErr },
  ] = await Promise.all([
    locals.supabase.rpc("get_types", {
      enum_type: "cube_surface_finishes",
    }),
    locals.supabase.rpc("get_types", {
      enum_type: "cubes_subtypes",
    }),
  ]);

  if (surfaceErr) {
    locals.log.error({ err: surfaceErr.message }, "Failed to fetch surfaces");
    error(500, "Failed to fetch surfaces");
  }
  if (subTypeErr) {
    locals.log.error({ err: subTypeErr.message }, "Failed to fetch sub types");
    error(500, "Failed to fetch sub types");
  }

  let scrapRuns: ScrapRun[] = [];
  if (locals.user) {
    const { data: runs, error: runsErr } = await locals.supabase
      .from("cube_scrap_runs")
      .select("id, name, created_at,")
      .eq("user_id", locals.user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (runsErr) {
      locals.log.error(
        { err: runsErr.message },
        "Failed to fetch cube scrap runs"
      );
    } else {
      scrapRuns = runs ?? [];
    }
  }

  return {
    form,
    cubes,
    brands,
    types,
    surfaces,
    subTypes,
    scrapeForm,
    scrapRuns,
    hasAccess,
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  scrape: async ({ request, locals }) => {
    const { supabase, user, log } = locals;

    if (!user) throw error(401, "Unauthorized");

    const { data, error: err } = await locals.supabase
      .from("profiles")
      .select("beta_flags")
      .eq("user_id", user.id)
      .single();

    if (err) {
      logError(
        500,
        "An error occured while fetching your profile",
        locals.log,
        err
      );
    }

    const hasAccess: boolean = data.beta_flags.submit_cubes;

    if (!hasAccess) throw error(401, "Unauthorized");

    const form = await superValidate(request, zod4(scrapSchema));

    if (!form.valid) {
      return { form };
    }

    const entries = form.data.storeUrls
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (!entries.length) {
      return setError(form, "storeUrls", "Add at least one store URL.", {
        status: 400,
      });
    }

    const uniqueEntries = Array.from(new Set(entries));
    const maxUrls = 10;

    if (uniqueEntries.length > maxUrls) {
      return setError(
        form,
        "storeUrls",
        `Please limit requests to ${maxUrls} store URLs at a time.`,
        { status: 400 }
      );
    }

    const runName = form.data.runName ?? null;

    const { data: run, error: runErr } = await supabase
      .from("cube_scrap_runs")
      .insert({ user_id: user.id, name: runName })
      .select("id, name")
      .single();

    if (runErr || !run) {
      log.error({ err: runErr?.message }, "Failed to create cube scrap run");
      return setError(
        form,
        "",
        "We couldn't queue that scrape run. Please try again later.",
        { status: 500 }
      );
    }

    const urlPayload = uniqueEntries.map((source) => ({
      run_id: run.id,
      source_url: source,
      normalized_url: cleanLink(source),
    }));

    const { error: urlErr } = await supabase
      .from("cube_scrap_runs_url")
      .insert(urlPayload);

    if (urlErr) {
      log.error(
        { err: urlErr.message },
        "Failed to insert cube scrap run URLs"
      );
      return setError(
        form,
        "storeUrls",
        "We couldn't queue those store URLs. Please try again later.",
        { status: 500 }
      );
    }

    return message(
      form,
      "Your store URLs were queued. We'll email you when the import finishes."
    );
  },
  advanced: async ({ request, locals }) => {
    const { supabase, user } = locals;
    if (!user) throw error(401, "Unauthorized");

    const { data: profile, error: err } = await locals.supabase
      .from("profiles")
      .select("beta_flags")
      .eq("user_id", user.id)
      .single();

    if (err) {
      logError(
        500,
        "An error occured while fetching your profile",
        locals.log,
        err
      );
    }

    const hasAccess: boolean = profile.beta_flags.submit_cubes;

    if (!hasAccess) throw error(401, "Unauthorized");

    const form = await superValidate(request, zod4(cubeSchema));

    if (!form.valid) {
      return message(form, "Please fix the highlighted fields and try again.", {
        status: 400,
      });
    }

    const data = form.data;

    const slugSource = [
      data.series && data.series.length > 0 ? data.series : null,
      data.model,
      data.versionType === "Base" ? null : data.versionName ?? null,
    ]
      .filter((value): value is string => Boolean(value && value.length > 0))
      .join(" ");

    const slug = slugify(slugSource);

    if (!slug) {
      return message(
        form,
        "Unable to derive a slug from the provided model details.",
        { status: 400 }
      );
    }

    const computedSubType =
      data.sub_type === "auto" ? getSubTypes(data.type) : data.sub_type;

    const now = new Date().toISOString();

    const payload = {
      slug,
      series: data.series && data.series.length > 0 ? data.series : null,
      model: data.model,
      version_name: data.versionType === "Base" ? "" : data.versionName ?? "",
      brand: data.brand,
      type: data.type,
      sub_type: computedSubType,
      release_date: data.releaseDate,
      image_url: cleanLink(data.imageUrl),
      surface_finish: data.surfaceFinish,
      weight: data.weight,
      size: data.size,
      version_type: data.versionType,
      related_to:
        data.relatedTo && data.relatedTo.length > 0 ? data.relatedTo : null,
      submitted_by_id: user.id,
      discontinued: data.discontinued,
      status: "Pending",
      verified_by_id: null,
      notes: "",
      updated_at: now,
      created_at: now,
    } satisfies Record<string, unknown>;

    const { error: insertErr } = await supabase
      .from("cube_models")
      .insert(payload);

    if (
      insertErr?.message ===
      'duplicate key value violates unique constraint "cubes_name_id_key"'
    ) {
      return setError(form, "This cube already exists in our database.", {
        status: 400,
      });
    }

    if (insertErr) {
      locals.log.error({ err: insertErr.message }, "Failed to insert cube");
      return setError(form, "An error occured while submitting the cube", {
        status: 500,
      });
    }

    const features = data.features;

    // Convert camelCase keys from the form to snake_case codes stored in the database
    const normalizeKey = (key: string) =>
      key.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);

    const { data: existingRows, error: rowsErr } = await supabase
      .from("cubes_model_features")
      .select("feature")
      .eq("cube", slug);

    if (rowsErr) {
      locals.log.error({ err: rowsErr.message }, "Failed to fetch features");
      setError(form, "An error occured while submitting the cube", {
        status: 500,
      });
    }

    const rows = existingRows ?? [];
    const existingFeatures = rows.map((row) => row.feature);
    const newFeatures = Object.entries(features)
      .filter(([, present]) => present)
      .map(([key]) => normalizeKey(key));

    const toAdd = newFeatures.filter(
      (feature) => !existingFeatures.includes(feature)
    );
    const toRemove = existingFeatures.filter(
      (feature) => !newFeatures.includes(feature)
    );

    if (toAdd.length) {
      const insertPayload = toAdd.map((feature) => ({
        cube: slug,
        feature,
      }));
      const { error: featUpErr } = await supabase
        .from("cubes_model_features")
        .upsert(insertPayload);

      if (featUpErr) {
        locals.log.error(
          { err: featUpErr.message },
          "Failed to insert features"
        );
        setError(form, "An error occured while submitting the cube", {
          status: 500,
        });
      }
    }

    if (toRemove.length) {
      const { error: featUpErr } = await supabase
        .from("cubes_model_features")
        .delete()
        .eq("cube", slug)
        .in("feature", toRemove);

      if (featUpErr) {
        locals.log.error(
          { err: featUpErr.message },
          "Failed to delete features"
        );
        setError(form, "An error occured while submitting the cube", {
          status: 500,
        });
      }
    }

    return message(
      form,
      'Cube submitted for review! Track its status on <a class="link" href="/user/submissions">your submissions page</a>.'
    );
  },
};
