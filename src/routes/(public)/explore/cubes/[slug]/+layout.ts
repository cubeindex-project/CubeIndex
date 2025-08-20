import type { LayoutLoad } from "./$types";
import type { Cube, Profiles } from "$lib/components/dbTableTypes";
import { error } from "@sveltejs/kit";
import { formatDate } from "$lib/components/helper_functions/formatDate.svelte.js";
import { buildProductJSONLD } from "$lib/components/buildProductJSONLD.js";

function plural(n: number, s: string, p = s + "s") {
  return `${n} ${n === 1 ? s : p}`;
}

function buildCubeDescription(
  cube: {
    series: string;
    model: string;
    version_name?: string | null;
    type?: string | null;
    release_date?: string | null;
  },
  stats: {
    ratingAvg: number;
    ratingCount: number;
    shopsCount: number;
    ownersCount: number;
  }
) {
  const name = `${cube.series} ${cube.model}${
    cube.version_name ? ` ${cube.version_name}` : ""
  }`;

  const parts: string[] = [];

  // What it is
  parts.push(
    `The ${name} is a ${cube.type ?? "twisty"} puzzle` +
      (cube.release_date
        ? ` released on the ${formatDate(cube.release_date)}`
        : "") +
      `.`
  );

  // Social proof
  if (stats.ratingCount > 0) {
    parts.push(
      `Rated ${stats.ratingAvg}/5 by ${plural(stats.ratingCount, "user")}.`
    );
  } else {
    parts.push(`It has no ratings yet — be the first to review it.`);
  }

  if (stats.shopsCount > 0)
    parts.push(`It is available at ${plural(stats.shopsCount, "shop")}.`);
  if (stats.ownersCount > 0)
    parts.push(`And is owned by ${plural(stats.ownersCount, "user")}.`);

  // Keep it snippet-length (~160 chars)
  let desc = parts.join(" ");
  if (desc.length > 160) desc = desc.slice(0, 157) + "…";
  return desc;
}

export const load = (async ({ setHeaders, params, url, parent }) => {
  const slug = params.slug;
  const { supabase, user } = await parent();

  const profilePromise = user?.id
    ? supabase.from("profiles").select("*").eq("user_id", user.id).single()
    : Promise.resolve({ data: null, error: null });

  const cubePromise = supabase
    .from("cube_models")
    .select(
      `
    *, verified_by_id(display_name, username),
    submitted_by_id(display_name, username)
  `
    )
    .eq("slug", slug)
    .single();

  const [profileRes, cubeRes] = await Promise.all([
    profilePromise,
    cubePromise,
  ]);

  let profile = (profileRes.data ?? {}) as Profiles;
  const cube = cubeRes.data;
  if (!cube) throw error(404, "Cube not found");

  if (user?.id) {
    const { data, error: pErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user?.id)
      .single();

    if (pErr) {
      throw new Error(`500, Failed to fetch profiles: ${pErr.message}`);
    }

    profile = data;
  }

  // 2) Stats (counts via HEAD + exact)
  const [
    { count: ratingCount = 0, error: rErr },
    { count: shopsCount = 0, error: sErr },
    { count: ownersCount = 0, error: oErr },
  ] = await Promise.all([
    supabase
      .from("user_cube_ratings")
      .select("*", { head: true, count: "exact" })
      .eq("cube_slug", slug),
    supabase
      .from("cube_vendor_links")
      .select("*", { head: true, count: "exact" })
      .eq("cube_slug", slug),
    supabase
      .from("user_cubes")
      .select("*", { head: true, count: "exact" })
      .eq("cube", slug),
  ]);

  if (rErr || sErr || oErr) {
    throw error(500, "Failed to load cube stats");
  }

  const ratingAvg = Number.isFinite(cube.rating)
    ? Math.max(0, Math.min(5, Number(cube.rating)))
    : 0;

  // 3) Meta
  const origin = url.origin;
  const href = url.href;
  const canonical = `${origin}/explore/cubes/${slug}`;
  const ogImage = `${origin}/api/og/cube/${slug}`;

  const description = buildCubeDescription(cube, {
    ratingAvg,
    ratingCount: ratingCount ?? 0,
    shopsCount: shopsCount ?? 0,
    ownersCount: ownersCount ?? 0,
  });

  // (Optional) Preload-friendly Cloudinary fetch URL for the hero image
  const preloadImage = `https://res.cloudinary.com/dc7wdwv4h/image/fetch/f_webp,q_auto,w_403/${encodeURIComponent(
    cube.image_url
  )}`;

  const [sameSeriesRes, relatedRes, trimsRes] = await Promise.all([
    supabase
      .from("cube_models")
      .select("slug, series, model, version_name, image_url")
      .eq("series", cube.series)
      .eq("version_type", "Base")
      .neq("model", cube.model)
      .eq("status", "Approved")
      .order("model", { ascending: true })
      .limit(12),
    supabase
      .from("cube_models")
      .select("slug, series, model, version_name, image_url")
      .eq("slug", cube.related_to)
      .eq("status", "Approved")
      .maybeSingle(),
    supabase
      .from("cube_models")
      .select("slug, series, model, version_name, image_url")
      .eq("related_to", cube.slug)
      .eq("status", "Approved")
      .order("model", { ascending: true })
      .limit(24),
  ]);

  const [
    { data: features, error: featErr },
    { data: user_cubes, error: ucErr },
  ] = await Promise.all([
    supabase.from("cubes_model_features").select("*").eq("cube", cube.slug),
    supabase.from("user_cubes").select("*").eq("cube", cube.slug),
  ]);

  if (featErr) {
    throw new Error("A 500 status code error occured:" + featErr.message);
  }

  if (ucErr) {
    throw new Error(`Failed to fetch cube user counts: ${ucErr.message}`);
  }

  setHeaders({
    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
  });

  // Return only what your head/JSON-LD needs; keep/add your own fields as required.
  return {
    profile,
    cube,
    features,
    user_cubes,
    sameSeries: sameSeriesRes.data ?? [],
    relatedCube: relatedRes.data ?? null,
    cubeTrims: trimsRes.data ?? [],
    verifiedBy: cube.verified_by_id,
    submittedBy: cube.submitted_by_id,
    stats: { ratingAvg, ratingCount, shopsCount, ownersCount },
    meta: {
      title: `${cube.series} ${cube.model}${
        cube.version_name ? ` ${cube.version_name}` : ""
      } - CubeIndex`,
      description,
      canonical,
      ogImage,
      preloadImage,
      ldJSON: JSON.stringify(
        buildProductJSONLD(
          {
            cube: cube,
            features,
            vendor_links: [],
            user_cube_ratings: [],
            relatedCube: (relatedRes.data as Cube) ?? null,
            sameSeries: (sameSeriesRes.data as Cube[]) ?? [],
          },
          origin,
          href
        )
      ),
    },
  };
}) satisfies LayoutLoad;
