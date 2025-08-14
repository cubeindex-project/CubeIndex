import { configCatClient } from "$lib/configcatClient";
import type { Profiles } from "$lib/components/dbTableTypes";
import { error } from "@sveltejs/kit";
import { formatDate } from "$lib/components/helper_functions/formatDate.svelte.js";

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
    parts.push(`No ratings yet — be the first to review it.`);
  }

  if (stats.shopsCount > 0)
    parts.push(`Available at ${plural(stats.shopsCount, "shop")}.`);
  if (stats.ownersCount > 0)
    parts.push(`Owned by ${plural(stats.ownersCount, "user")}.`);

  // Keep it snippet-length (~160 chars)
  let desc = parts.join(" ");
  if (desc.length > 160) desc = desc.slice(0, 157) + "…";
  return desc;
}

export const load = async ({ locals, setHeaders, params, request }) => {
  const slug = params.slug;

  let databaseAvailability: boolean = true;
  let cubesAvailability: boolean = true;

  configCatClient.getValueAsync("database", false).then((value) => {
    databaseAvailability = value;
  });

  configCatClient.getValueAsync("cubes", false).then((value) => {
    cubesAvailability = value;
  });

  let profile: Profiles = {} as Profiles;

  if (locals.user?.id) {
    const { data, error: pErr } = await locals.supabase
      .from("profiles")
      .select("*")
      .eq("user_id", locals.user?.id)
      .single();

    if (pErr) {
      throw new Error(`500, Failed to fetch profiles: ${pErr.message}`);
    }

    profile = data;
  }

  // 1) Cube
  const { data: cube, error: cErr } = await locals.supabase
    .from("cube_models")
    .select("*")
    .eq("slug", slug)
    .single();

  if (cErr || !cube) {
    throw error(404, "Cube not found");
  }

  // 2) Stats (counts via HEAD + exact)
  const [
    { count: ratingCount = 0, error: rErr },
    { count: shopsCount = 0, error: sErr },
    { count: ownersCount = 0, error: oErr },
  ] = await Promise.all([
    locals.supabase
      .from("user_cube_ratings")
      .select("*", { head: true, count: "exact" })
      .eq("cube_slug", slug),
    locals.supabase
      .from("cube_vendor_links")
      .select("*", { head: true, count: "exact" })
      .eq("cube_slug", slug),
    locals.supabase
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
  const origin = "http://" + request.headers.get("host"); // SSR-safe
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

  setHeaders({
    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
  });

  // Return only what your head/JSON-LD needs; keep/add your own fields as required.
  return {
    databaseAvailability,
    cubesAvailability,
    profile,
    cube,
    stats: { ratingAvg, ratingCount, shopsCount, ownersCount },
    meta: {
      title: `${cube.series} ${cube.model}${
        cube.version_name ? ` ${cube.version_name}` : ""
      } - CubeIndex`,
      description,
      canonical,
      ogImage,
      preloadImage,
    },
  };
};
