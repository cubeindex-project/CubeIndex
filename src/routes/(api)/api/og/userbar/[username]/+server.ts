import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFileSync } from "fs";
import { join } from "path";
import { oklch as parseOklch, formatHex } from "culori";

export const GET = async ({ params, locals }) => {
  const username = params.username;

  // Profile
  const { data: profile, error: pErr } = await locals.supabase
    .from("v_detailed_profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (pErr) return new Response("Profile not found", { status: 404 });

  // Fonts
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

  // Helpers
  const toHex = (ok: string) => formatHex(parseOklch(ok));
  const hexToRgb = (hex: string) => {
    const h = hex.replace("#", "");
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  };
  const rgba = (hex: string, a: number) => {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, a))})`;
  };

  // CubeIndex palette
  const CX = {
    base100: toHex("oklch(100% 0 0)"),
    base200: toHex("oklch(98% 0 0)"),
    base300: toHex("oklch(94% 0 0)"),
    baseContent: toHex("oklch(21% 0.006 285.885)"),
    primary: toHex("oklch(48% 0.243 264.376)"), // purple
    accent: toHex("oklch(77% 0.152 181.912)"), // teal/blue (not used in gradients anymore)
    primaryContent: toHex("oklch(93% 0.034 272.788)"),
    neutral: toHex("oklch(14% 0.005 285.823)"),
  };

  const name = profile?.display_name || profile?.username || "User";
  const metricsText = `${profile.user_cubes_count ?? 0} cubes • ${
    profile.user_achievements_count ?? 0
  } achievements`;

  const width = 350;
  const height = 19;

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: `${width}px`,
          height: `${height}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: CX.base100, // solid background (no gradients)
          color: CX.baseContent,
          fontFamily:
            "ClashDisplay-Semibold, NotoSansSymbols-Regular, sans-serif",
          position: "relative",
          padding: "0 6px",
          borderRadius: "3px",
          overflow: "hidden",
        },
        children: [
          // Faint CubeIndex watermark (solid color, no gradients)
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                right: "24px",
                top: "-7px",
                transform: "rotate(-6deg)",
                fontSize: "28px",
                letterSpacing: "-0.5px",
                fontWeight: 700,
                color: rgba(CX.primary ?? "#000", 0.25),
                userSelect: "none",
                pointerEvents: "none",
                whiteSpace: "nowrap",
              },
              children: "CubeIndex",
            },
          },

          // LEFT: name
          {
            type: "div",
            props: {
              style: {
                position: "relative",
                zIndex: 1,
                fontSize: "11px",
                lineHeight: "1",
                whiteSpace: "nowrap",
                marginRight: "6px",
                fontWeight: 600,
              },
              children: name,
            },
          },

          // CENTER: metrics
          {
            type: "div",
            props: {
              style: {
                position: "relative",
                zIndex: 1,
                flex: "1 1 auto",
                minWidth: 0,
                fontSize: "9px",
                lineHeight: "1",
                opacity: 0.9,
                textAlign: "left",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
              children: metricsText,
            },
          },

          // RIGHT: brand pill (solid, no gradient)
          {
            type: "div",
            props: {
              style: {
                position: "relative",
                zIndex: 1,
                marginLeft: "6px",
                padding: "1px 6px",
                borderRadius: "9999px",
                fontSize: "10px",
                lineHeight: "1",
                backgroundColor: CX.primary,
                color: CX.primaryContent,
                border: `1px solid ${rgba(CX.primary ?? "#000", 0.28)}`,
                fontWeight: 700,
                whiteSpace: "nowrap",
                boxShadow: `0 0 0 1px ${rgba(CX.base100 ?? "#000", 0.35)} inset`,
              },
              children: "CubeIndex",
            },
          },
        ],
      },
    },
    {
      width,
      height,
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

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    background: CX.base100,
  });
  const pngBuffer = resvg.render().asPng();

  return new Response(Uint8Array.from(pngBuffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
