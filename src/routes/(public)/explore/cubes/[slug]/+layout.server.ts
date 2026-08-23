import { logError } from "$lib/server/logError";
import { formatPartialDate } from "$lib/utils/formatPartialDate";
import type { LayoutServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load = (async ({
  locals: { supabase, log, user },
  setHeaders,
  params,
  url,
}) => {
  const slug = params.slug;

  const { data: cube, error: cubeErr } = await supabase
    .from("v_detailed_cube_models")
    .select("*,submitter:profiles!submitted_by_id(display_name, username)")
    .eq("slug", slug)
    .maybeSingle();

  if (cubeErr) {
    log.error(
      { err: cubeErr },
      "An error occurred while fetching the cube data",
    );
    throw error(500, "An error occurred while fetching the cube data");
  }

  if (!cube) {
    throw error(404, "Cube not found");
  }

  const [sameSeriesRes, relatedRes, trimsRes] = await Promise.all([
    cube.series_id
      ? supabase
          .from("v_detailed_cube_models")
          .select("slug, name, series, image_url")
          .eq("series_id", cube.series_id)
          .eq("version_type", "Base")
          .neq("id", cube.id)
          .order("name", { ascending: true })
          .limit(12)
      : Promise.resolve({ data: null, error: null }),
    cube.related_to_id
      ? supabase
          .from("v_detailed_cube_models")
          .select("slug, name, series, image_url")
          .eq("id", cube.related_to_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase
      .from("v_detailed_cube_models")
      .select("slug, name, series, image_url")
      .eq("related_to_id", cube.id)
      .order("name", { ascending: true })
      .limit(24),
  ]);

  if (sameSeriesRes.error || relatedRes.error || trimsRes.error) {
    return logError(
      500,
      "Unable to load related cube data",
      log,
      new Error("", {
        cause: [sameSeriesRes.error, relatedRes.error, trimsRes.error],
      }),
    );
  }

  let alreadyAdded = false;
  let userCubeDetail = null;

  if (user) {
    const { data: user_cube, error: ucErr } = await supabase
      .from("user_cubes")
      .select("*")
      .eq("user_id", user.id)
      .eq("cube_id", cube.id)
      .maybeSingle();

    if (ucErr) {
      log.error({ err: ucErr }, "Failed to fetch user_cubes");
      throw error(500, "Failed to fetch user cubes");
    }

    alreadyAdded = user_cube !== null;
    userCubeDetail = user_cube;
  }

  const { data: cube_vendor_links, error: cvrErr } = await supabase
    .from("cube_vendor_links")
    .select("*, vendor:vendor_id(*)")
    .eq("cube_id", cube.id)
    .eq("is_dead", false);

  if (cvrErr) {
    return logError(500, "Unable to load vendor links", log, cvrErr);
  }

  setHeaders({
    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
  });

  const title = `${cube.name} - CubeIndex`;
  const description =
    `The ${cube.name} is a ${cube.type} twisty puzzle` +
    (cube.release_date
      ? ` released on ${formatPartialDate(cube.release_date, cube.release_date_precision)}`
      : "") +
    `. ` +
    (cube.low_price != null ? `Prices start at $${cube.low_price}. ` : "");
  const image = `${url.origin}/api/og/cube/${cube.slug}`;
  const offers = cube_vendor_links.map((offer) => {
    return {
      "@type": "Offer",
      url: offer.url,
      price: offer.price,
      priceCurrency: offer.vendor.currency,
      availability: offer.available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    };
  });

  return {
    cube,
    alreadyAdded,
    userCubeDetail,
    sameSeries: sameSeriesRes.data ?? [],
    relatedCube: relatedRes.data ?? null,
    cubeTrims: trimsRes.data ?? [],
    submitter: cube.submitter,
    cube_vendor_links,
    meta: {
      title,
      description,
      image,
      twitterImage: image,
      jsonLd: {
        "@context": "https://schema.org/",
        "@type": "Product",
        sku: `CubeIndex:${cube.slug}`,
        name: cube.name,
        description,
        image: [cube.image_url],
        brand: {
          "@type": "Brand",
          name: cube.brand,
        },
        category: cube.type,
        aggregateRating:
          cube.rating_count && cube.rating_count > 0
            ? {
                "@type": "AggregateRating",
                ratingValue: cube.rating,
                ratingCount: cube.rating_count,
              }
            : undefined,
        offers:
          cube_vendor_links.length > 0
            ? {
                "@type": "AggregateOffer",
                offerCount: cube_vendor_links.length,
                lowPrice: cube.low_price,
                priceCurrency: "USD",
                offers,
              }
            : undefined,
      },
    },
  };
}) satisfies LayoutServerLoad;
