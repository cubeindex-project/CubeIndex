import type { LayoutServerLoad } from "./$types";
import { logError } from "$lib/server/logError";
import { dev } from "$app/environment";
import type { Meta } from "$lib/types/meta";
import type { Tables } from "$lib/types/database.types";

export const load: LayoutServerLoad = async ({
  locals: { safeGetSession, supabase, log },
  cookies,
  url,
}) => {
  const { session, user } = await safeGetSession();

  let profile: Tables<"profiles"> | null = null;

  if (user) {
    const { data, error: err } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (err) {
      logError(
        Number(err.code),
        "Error while retrieving profile in layout",
        log,
        err,
        false,
      );
      profile = null;
    }

    profile = data;
  }

  const umamiTag = !dev;

  return {
    profile,
    user,
    session,
    user,
    cookies: cookies.getAll(),
    umamiTag,
    meta: {
      title: "CubeIndex",
      description:
        "Discover, track, and rate your speedcubes. CubeIndex is the all-in-one database for cubers.",
      ogTitle: "CubeIndex - Speedcubing Database & Collection Tracker",
      siteName: "CubeIndex",
      image: url.origin + "/images/og/cubeindex-og.png",
      twitterImage: url.origin + "/images/og/cubeindex-twitter-og.png",
      url: url.href,
      twitterCard: "summary_large_image",
      googleSiteVerification: "LeqQ-VZhIWm9luPXxKl2DWIb48Udb94UIZclWUjOevE",
      noindex: false,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Organization",
        url: url.origin,
        logo: url.origin + "/images/CubeIndex_Logo.webp",
        name: "CubeIndex",
        description:
          "Discover, track, and rate your speedcubes. CubeIndex is the all-in-one database for cubers.",
        email: "thecubeindex@gmail.com",
      },
      canonical: url.href,
    } as Meta,
  };
};
