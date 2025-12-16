import satori, { type Font } from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFileSync } from "fs";
import { join } from "path";
import { oklch as parseOklch, formatHex } from "culori";

const CLASH_FONT_PATH = join(
  process.cwd(),
  "static",
  "fonts",
  "ClashDisplay-Semibold.ttf",
);
const NOTO_SYMBOLS_FONT_PATH = join(
  process.cwd(),
  "static",
  "fonts",
  "NotoSansSymbols2-Regular.ttf",
);
const CLASH_FONT_DATA = readFileSync(CLASH_FONT_PATH);
const NOTO_SYMBOLS_FONT_DATA = readFileSync(NOTO_SYMBOLS_FONT_PATH);

const USERBAR_WIDTH = 350;
const USERBAR_HEIGHT = 19;

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

const CX = {
  base100: toHex("oklch(100% 0 0)"),
  base200: toHex("oklch(98% 0 0)"),
  base300: toHex("oklch(94% 0 0)"),
  baseContent: toHex("oklch(21% 0.006 285.885)"),
  primary: toHex("oklch(48% 0.243 264.376)"),
  accent: toHex("oklch(77% 0.152 181.912)"),
  primaryContent: toHex("oklch(93% 0.034 272.788)"),
  neutral: toHex("oklch(14% 0.005 285.823)"),
};

const USERBAR_FONTS: Font[] = [
  {
    name: "ClashDisplay-Semibold",
    data: CLASH_FONT_DATA,
    weight: 600,
    style: "normal",
  },
  {
    name: "NotoSansSymbols-Regular",
    data: NOTO_SYMBOLS_FONT_DATA,
    weight: 400,
    style: "normal",
  },
];

export const GET = async ({ params, locals }) => {
  const username = params.username;

  const { data: profile, error } = await locals.supabase
    .from("v_detailed_profiles")
    .select("display_name, username, user_cubes_count, user_achievements_count")
    .eq("username", username)
    .maybeSingle();

  if (error)
    return new Response(`Unable to load profile: ${error.message}`, {
      status: 500,
    });

  if (!profile) return new Response("Profile not found", { status: 404 });

  const name = profile.display_name || profile.username || "User";
  const metricsText = `${profile.user_cubes_count ?? 0} cubes • ${
    profile.user_achievements_count ?? 0
  } achievements`;

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: `${USERBAR_WIDTH}px`,
          height: `${USERBAR_HEIGHT}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: CX.base100,
          color: CX.baseContent,
          fontFamily:
            "ClashDisplay-Semibold, NotoSansSymbols-Regular, sans-serif",
          position: "relative",
          padding: "0 6px",
          borderRadius: "3px",
          overflow: "hidden",
        },
        children: [
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
      width: USERBAR_WIDTH,
      height: USERBAR_HEIGHT,
      fonts: USERBAR_FONTS,
    },
  );

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: USERBAR_WIDTH },
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
