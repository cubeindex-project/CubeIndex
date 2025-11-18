import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFileSync } from "fs";
import { join } from "path";
import { oklch as parseOklch, formatHex } from "culori";

export const GET = async ({ params, locals }) => {
  const cubeName = params.cube_name;

  // 1. Fetch cube data from Supabase
  const { data: cube, error: cErr } = await locals.supabase
    .from("cube_models")
    .select("series, model, version_name, image_url, rating")
    .eq("slug", cubeName)
    .single();

  if (cErr)
    return new Response(
      "An error occurred while fetching the cube: " + cErr.message,
      { status: 404 }
    );

  const [
    { error: urErr, count: ratingCount },
    { error: cvlErr, count: shopsCount },
    { error: ucErr, count: ownersCount },
  ] = await Promise.all([
    locals.supabase
      .from("user_cube_ratings")
      .select("*", { count: "exact", head: true })
      .eq("cube_slug", cubeName),
    locals.supabase
      .from("cube_vendor_links")
      .select("*", { count: "exact", head: true })
      .eq("cube_slug", cubeName),
    locals.supabase
      .from("user_cubes")
      .select("*", { count: "exact", head: true })
      .eq("cube", cubeName),
  ]);

  if (urErr)
    return new Response(
      "An error occurred while fetching user ratings count: " + urErr.message,
      { status: 404 }
    );
  if (cvlErr)
    return new Response(
      "An error occurred while fetching the cube vendors count: " +
        cvlErr.message,
      { status: 404 }
    );
  if (ucErr)
    return new Response(
      "An error occurred while fetching the user cubes count: " + ucErr.message,
      { status: 404 }
    );

  // Load local font
  const clashFontPath = join(
    process.cwd(),
    "static",
    "fonts",
    "ClashDisplay-Semibold.ttf"
  );
  const notoSymbFontPath = join(
    process.cwd(),
    "static",
    "fonts",
    "NotoSansSymbols2-Regular.ttf"
  );
  const clashFontData = readFileSync(clashFontPath);
  const notoSymbFontData = readFileSync(notoSymbFontPath);

  // 2. Generate SVG with Satori
  const stars = (avg: number) => {
    const full = Math.round(avg); // simple rounding (4.3 => 4)
    return "★".repeat(full) + "☆".repeat(5 - full);
  };

  const toHex = (ok: string) => formatHex(parseOklch(ok));

  const CX = {
    base100: toHex("oklch(100% 0 0)"),
    base200: toHex("oklch(98% 0 0)"),
    base300: toHex("oklch(95% 0 0)"),
    baseContent: toHex("oklch(21% 0.006 285.885)"),

    primary: toHex("oklch(48% 0.243 264.376)"),
    primaryContent: toHex("oklch(93% 0.034 272.788)"),

    secondary: toHex("oklch(65% 0.241 354.308)"),
    secondaryContent: toHex("oklch(94% 0.028 342.258)"),

    accent: toHex("oklch(77% 0.152 181.912)"),
    accentContent: toHex("oklch(38% 0.063 188.416)"),

    neutral: toHex("oklch(14% 0.005 285.823)"),
    neutralContent: toHex("oklch(92% 0.004 286.32)"),

    info: toHex("oklch(74% 0.16 232.661)"),
    success: toHex("oklch(76% 0.177 163.223)"),
    warning: toHex("oklch(82% 0.189 84.429)"),
    error: toHex("oklch(71% 0.194 13.428)"),
  };

  const metricsItemStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 16px",
    borderRadius: "12px",
    backgroundColor: CX.base200,
    border: `1px solid ${CX.base300}`,
    minWidth: "170px",
  };

  const metricsValueStyle = {
    fontSize: "30px",
    lineHeight: "1",
    marginBottom: "6px",
    color: CX.accent, // numbers pop with Accent
  };

  const metricsLabelStyle = {
    fontSize: "18px",
    color: CX.baseContent,
    opacity: 0.7,
  };

  const addAlpha = (hex: string, alpha: number) => {
    const a = Math.round(Math.min(Math.max(alpha, 0), 1) * 255)
      .toString(16)
      .padStart(2, "0");
    return hex.length === 7 ? `${hex}${a}` : hex; // expects #RRGGBB
  };

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: "1200px",
          height: "630px",
          backgroundColor: CX.base100,
          color: CX.baseContent,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "ClashDisplay-Semibold, NotoSansSymbols-Regular, sans-serif",
          padding: "40px",
          position: "relative",
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: "24px",
                left: "24px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 12px",
                borderRadius: "9999px",
                backgroundColor: addAlpha(CX.primary ?? "#FFF", 0.92),
                color: CX.primaryContent,
                border: `1px solid ${CX.base300}`,
                boxShadow: `0 2px 8px ${addAlpha(CX.neutral ?? "#FFF", 0.18)}`,
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: "32px",
                      lineHeight: "1",
                      letterSpacing: "0.3px",
                      fontWeight: 600,
                    },
                    children: "CubeIndex",
                  },
                },
              ],
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: "0",
                left: "0",
                width: "100%",
                height: "8px",
                backgroundColor: CX.primary,
              },
            },
          },

          {
            type: "img",
            props: {
              src: cube.image_url,
              width: 600,
              height: 300,
              style: {
                borderRadius: "16px",
                marginBottom: "24px",
                objectFit: "cover",
                border: `1px solid ${CX.base300}`,
                backgroundColor: CX.base200,
              },
            },
          },
          {
            type: "h1",
            props: {
              style: {
                fontSize: "48px",
                margin: 0,
                textAlign: "center",
                color: CX.baseContent,
              },
              children: cube.series + " " + cube.model,
            },
          },
          {
            type: "p",
            props: {
              style: {
                fontSize: "24px",
                color: CX.baseContent,
                opacity: 0.75,
                marginTop: "8px",
                marginBottom: "22px",
                textAlign: "center",
              },
              children: cube.version_name || "",
            },
          },

          // --- Metrics Row ---
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                gap: "16px",
                marginTop: "8px",
                alignItems: "stretch",
                justifyContent: "center",
                flexWrap: "wrap",
                width: "100%",
                maxWidth: "980px",
              },
              children: [
                // Rating (stars + numeric)
                {
                  type: "div",
                  props: {
                    style: metricsItemStyle,
                    children: [
                      {
                        type: "div",
                        props: {
                          style: {
                            fontSize: "30px",
                            lineHeight: "1",
                            marginBottom: "6px",
                            letterSpacing: "2px",
                            color: CX.primary, // brand stars
                            fontFamily:
                              "NotoSansSymbols-Regular, ClashDisplay-Semibold, sans-serif",
                          },
                          children: stars(cube.rating),
                        },
                      },
                      {
                        type: "div",
                        props: {
                          style: { ...metricsLabelStyle },
                          children: `${(cube.rating ?? 0).toFixed(1)} average`,
                        },
                      },
                    ],
                  },
                },

                // Ratings count
                {
                  type: "div",
                  props: {
                    style: metricsItemStyle,
                    children: [
                      {
                        type: "div",
                        props: {
                          style: metricsValueStyle,
                          children: String(ratingCount ?? 0),
                        },
                      },
                      {
                        type: "div",
                        props: {
                          style: metricsLabelStyle,
                          children:
                            (ratingCount ?? 0) === 1
                              ? "person rated it"
                              : "people rated it",
                        },
                      },
                    ],
                  },
                },

                // Shops count
                {
                  type: "div",
                  props: {
                    style: metricsItemStyle,
                    children: [
                      {
                        type: "div",
                        props: {
                          // differentiate shops with Secondary color
                          style: { ...metricsValueStyle, color: CX.secondary },
                          children: String(shopsCount ?? 0),
                        },
                      },
                      {
                        type: "div",
                        props: {
                          style: metricsLabelStyle,
                          children:
                            (shopsCount ?? 0) === 1
                              ? "shop sell it"
                              : "shops sell it",
                        },
                      },
                    ],
                  },
                },

                // Owners count
                {
                  type: "div",
                  props: {
                    style: metricsItemStyle,
                    children: [
                      {
                        type: "div",
                        props: {
                          // differentiate owners with Info color
                          style: { ...metricsValueStyle, color: CX.info },
                          children: String(ownersCount ?? 0),
                        },
                      },
                      {
                        type: "div",
                        props: {
                          style: metricsLabelStyle,
                          children:
                            (ownersCount ?? 0) === 1
                              ? "person owns it"
                              : "people own it",
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "ClashDisplay-Semibold",
          data: clashFontData,
          weight: 600,
          style: "normal",
        },
        {
          name: "NotoSansSymbols-Regular",
          data: notoSymbFontData,
          weight: 400,
          style: "normal",
        },
      ],
    }
  );

  // 3. Convert SVG to PNG
  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  // 4. Return PNG
  return new Response(Uint8Array.from(pngBuffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
