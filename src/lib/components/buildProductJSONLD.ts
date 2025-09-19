import type {
  Cube,
  CubesModelFeatures,
  CubeVendorLinks,
  UserCubeRatings,
} from "./dbTableTypes";

/**
 * Build a Schema.org Product JSON-LD object from Cube data.
 * @param data The page's data, including cube, features, vendor_links, ratings, related/sameSeries.
 * @param page SvelteKit page store, to access URL origin and pathname.
 * @returns A JS object suitable for JSON.stringify and embedding as JSON-LD.
 */
export function buildProductJSONLD(
  data: {
    cube: Cube;
    features: CubesModelFeatures[];
    vendor_links: CubeVendorLinks[];
    user_cube_ratings: UserCubeRatings[];
    relatedCube: Cube | null;
    sameSeries: Cube[];
  },
  origin: string,
  href: string
): Record<string, unknown> {
  // 1. Construct the product's name
  const name =
    `${data.cube.series} ${data.cube.model}` +
    (data.cube.version_type !== "Base" && data.cube.version_name
      ? ` ${data.cube.version_name}`
      : "");

  // 2. Build a descriptive sentence with features
  const features = data.features ?? [];
  const featureSet = new Set(features.map((f) => f.feature));
  const description =
    `The ${name} is a ${data.cube.type} twisty puzzle` +
    (data.cube.release_date
      ? ` released on ${new Date(data.cube.release_date)
          .toISOString()
          .slice(0, 10)}`
      : "") +
    `. Features: ` +
    [
      featureSet.has("magnetic") ? "magnetic" : "non-magnetic",
      featureSet.has("smart") ? "smart" : "non-smart",
      featureSet.has("wca_legal") ? "WCA-legal" : "not WCA-legal",
      featureSet.has("modded") ? "modded" : "original",
      featureSet.has("discontinued") ? "discontinued" : "available",
    ].join(", ") +
    ".";

  // 3. Generate an array of Offer objects per vendor
  const offersArray = (data.vendor_links ?? []).map((v) => ({
    "@type": "Offer",
    price: typeof v.price === "number" ? v.price.toFixed(2) : String(v.price),
    priceCurrency: "USD", // localize if needed
    availability: v.available
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
    url: v.url,
    seller: { "@type": "Organization", name: v.vendor_name },
  }));

  // Compute low and high prices, if available
  const low = offersArray.length
    ? Math.min(...offersArray.map((o) => Number(o.price)))
    : undefined;
  const high = offersArray.length
    ? Math.max(...offersArray.map((o) => Number(o.price)))
    : undefined;

  // 4. Extract structured properties (weight, size, flags...)
  const cubeFeatures = [
    ["Type", data.cube.type],
    ["Weight (g)", data.cube.weight],
    ["Size (mm)", data.cube.size],
    ["Surface Finish", data.cube.surface_finish],
    ["Smart", featureSet.has("smart") ? "Yes" : "No"],
    ["Magnetic", featureSet.has("magnetic") ? "Yes" : "No"],
    ["WCA Legal", featureSet.has("wca_legal") ? "Yes" : "No"],
    ["Modded", featureSet.has("modded") ? "Yes" : "No"],
    ["Maglev", featureSet.has("maglev") ? "Yes" : "No"],
    ["Stickered", featureSet.has("stickered") ? "Yes" : "No"],
    ["Ball Core", featureSet.has("ball_core") ? "Yes" : "No"],
  ].filter(([, v]) => v != null && v !== "");

  // 5. Assemble the core JSON-LD object
  const obj: Record<string, string | object> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": href, // canonical reference
    name,
    image: data.cube.image_url,
    description,
    sku: String(data.cube.id),
    category: data.cube.type,
    brand: { "@type": "Brand", name: data.cube.brand },
    additionalProperty: cubeFeatures.map(([k, v]) => ({
      "@type": "PropertyValue",
      name: k,
      value: String(v),
    })),
  };

  // Conditionally mix in ratings
  if (
    Number.isFinite(data.cube.rating) &&
    (data.user_cube_ratings?.length ?? 0) > 0
  ) {
    obj.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(data.cube.rating).toFixed(2),
      reviewCount: data.user_cube_ratings.length,
    };
  }

  // Add offers if available
  if (offersArray.length) {
    obj.offers = {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      offerCount: offersArray.length,
      ...(low != null ? { lowPrice: low.toFixed(2) } : {}),
      ...(high != null ? { highPrice: high.toFixed(2) } : {}),
      offers: offersArray,
    };
  }

  // Relational links to other cubes
  if (data.relatedCube) {
    obj.isSimilarTo = [
      {
        "@type": "Product",
        "@id": `${origin}/explore/cubes/${data.relatedCube.slug}`,
      },
    ];
  }

  if (data.sameSeries && data.sameSeries.length) {
    obj.isRelatedTo = data.sameSeries.slice(0, 10).map((s) => ({
      "@type": "Product",
      "@id": `${origin}/explore/cubes/${s.slug}`,
    }));
  }

  // Add timestamps
  if (data.cube.release_date) {
    obj.releaseDate = new Date(data.cube.release_date).toISOString();
  }
  if (data.cube.updated_at) {
    obj.dateModified = new Date(data.cube.updated_at).toISOString();
  }

  return obj;
}
