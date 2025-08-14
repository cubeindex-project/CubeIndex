import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFileSync } from "fs";
import { join } from "path";
import { oklch as parseOklch, formatHex } from "culori";

export const GET = async ({ params, locals }) => {
  const username = params.username;

  // 1. Fetch cube data from Supabase
  const { data: profile, error: err } = await locals.supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (err)
    return new Response(
      "An error occured while fetching the profile: " + err.message,
      { status: 404 }
    );

  const { error: ecErr, count: userCubesCount } = await locals.supabase
    .from("user_cubes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", profile.user_id);

  if (ecErr)
    return new Response(
      "An error occured while fetching the user cubes count: " + ecErr.message,
      { status: 404 }
    );

  const { error: userAchieveError, count: userAchievementsCount } =
    await locals.supabase
      .from("user_achievements")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.user_id);

  if (userAchieveError)
    return new Response(
      "An error occured while fetching the user achievements count: " +
        userAchieveError.message,
      { status: 404 }
    );

  const { error: urErr, count: userRatingsCount } = await locals.supabase
    .from("user_cube_ratings")
    .select("*", { count: "exact", head: true })
    .eq("user_id", profile.user_id);

  if (urErr)
    return new Response(
      "An error occured while fetching the user ratings count: " +
        urErr.message,
      { status: 404 }
    );

  const { error: followingErr, count: followingCount } = await locals.supabase
    .from("user_follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", profile.user_id);

  if (followingErr)
    return new Response(
      "An error occured while fetching the user following count: " +
        followingErr.message,
      { status: 404 }
    );

  const { error: followedErr, count: followersCount } = await locals.supabase
    .from("user_follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", profile.user_id);

  if (followedErr)
    return new Response(
      "An error occured while fetching the user followers count: " +
        followedErr.message,
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

  // Helpers
  const toHex = (ok: string) => formatHex(parseOklch(ok));
  const addAlpha = (hex: string, alpha: number) => {
    const a = Math.round(Math.min(Math.max(alpha, 0), 1) * 255)
      .toString(16)
      .padStart(2, "0");
    return hex.length === 7 ? `${hex}${a}` : hex; // expects #RRGGBB
  };
  const plural = (n: number, one: string, many: string) =>
    n === 1 ? one : many;
  const initials = (name?: string | null) =>
    (name ?? "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() ?? "")
      .join("") ||
    (profile?.username?.[0]?.toUpperCase() ?? "?");

  // CubeIndex colors
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

  // Shared metric styles
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
    color: CX.accent,
  };
  const metricsLabelStyle = {
    fontSize: "18px",
    color: CX.baseContent,
    opacity: 0.7,
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
          fontFamily:
            "ClashDisplay-Semibold, NotoSansSymbols-Regular, sans-serif",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        },
        children: [
          // 1. Banner
          profile?.banner
            ? {
                type: "img",
                props: {
                  src: profile.banner,
                  width: 1200,
                  height: 250,
                  style: {
                    objectFit: "cover",
                    backgroundColor: CX.base200,
                    borderBottom: `1px solid ${CX.base300}`,
                  },
                },
              }
            : {
                type: "div",
                props: {
                  style: {
                    width: "1200px",
                    height: "250px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderBottom: `1px solid ${CX.base300}`,
                    background: `linear-gradient(135deg, ${addAlpha(
                      CX.primary ?? "#FFF",
                      0.12
                    )}, ${addAlpha(CX.accent ?? "#FFF", 0.12)})`,
                  },
                  children: {
                    type: "span",
                    props: {
                      style: {
                        fontSize: "48px",
                        color: CX.primary,
                        opacity: 0.8,
                      },
                      children: "",
                    },
                  },
                },
              },

          // 2. Profile picture overlapping banner
          {
            type: "div",
            props: {
              style: {
                marginTop: "-100px", // overlap without z-index
                width: "200px",
                height: "200px",
                borderRadius: "9999px",
                border: `4px solid ${CX.base100}`,
                overflow: "hidden",
                backgroundColor: CX.base200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              },
              children: profile?.profile_picture
                ? {
                    type: "img",
                    props: {
                      src: profile.profile_picture,
                      width: 200,
                      height: 200,
                      style: { objectFit: "cover" },
                    },
                  }
                : {
                    type: "span",
                    props: {
                      style: { fontSize: "64px", color: CX.primary },
                      children: initials(profile?.display_name),
                    },
                  },
            },
          },

          // 3. Name
          {
            type: "h1",
            props: {
              style: {
                fontSize: "48px",
                margin: 0,
                textAlign: "center",
              },
              children:
                profile?.display_name || profile?.username || "CubeIndex User",
            },
          },

          // 4. Username
          {
            type: "p",
            props: {
              style: {
                fontSize: "24px",
                opacity: 0.75,
                margin: "8px 0 24px 0",
                textAlign: "center",
              },
              children: profile?.username ? `@${profile.username}` : "",
            },
          },

          // 5. Metrics row
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                gap: "16px",
                flexWrap: "wrap",
                justifyContent: "center",
                maxWidth: "980px",
              },
              children: [
                metricBlock(
                  userCubesCount ?? 0,
                  plural(userCubesCount ?? 0, "cube", "cubes")
                ),
                metricBlock(
                  userAchievementsCount ?? 0,
                  plural(
                    userAchievementsCount ?? 0,
                    "achievement",
                    "achievements"
                  ),
                  CX.secondary
                ),
                metricBlock(
                  userRatingsCount ?? 0,
                  plural(userRatingsCount ?? 0, "rating", "ratings"),
                  CX.info
                ),
                metricBlock(followingCount ?? 0, "following"),
                metricBlock(
                  followersCount ?? 0,
                  plural(followersCount ?? 0, "follower", "followers"),
                  CX.success
                ),
              ],
            },
          },

          // 6. CubeIndex watermark chip (drawn last so it’s “on top”)
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
                    style: { fontSize: "32px", fontWeight: 600 },
                    children: "CubeIndex",
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

  // Metric block helper
  function metricBlock(value: number, label: string, color?: string) {
    return {
      type: "div",
      props: {
        style: metricsItemStyle,
        children: [
          {
            type: "div",
            props: {
              style: { ...metricsValueStyle, ...(color && { color }) },
              children: String(value),
            },
          },
          { type: "div", props: { style: metricsLabelStyle, children: label } },
        ],
      },
    };
  }

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
