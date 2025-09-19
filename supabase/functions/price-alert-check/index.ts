import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

type Subscription = {
  id: string;
  user_id: string;
  cube_slug: string;
  desired_price: number;
  channel: "in_app" | "email";
  active: boolean;
  last_notified_at: string | null;
};

type SnapshotMatch = {
  price: number;
  vendor_name: string | null;
  created_at: string;
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !serviceKey) {
  throw new Error("Missing Supabase credentials for price-alert-check function");
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

function buildCubeLabel(meta: {
  slug: string;
  series: string | null;
  model: string | null;
  version_name: string | null;
}): string {
  const series = meta.series ?? "";
  const model = meta.model ?? "";
  const version = meta.version_name ? ` ${meta.version_name}` : "";
  return `${series} ${model}${version}`.trim() || meta.slug;
}

serve(async (request) => {
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    const { data: subscriptions, error: subsError } = await supabase
      .from("cube_price_alert_subscriptions")
      .select("id, user_id, cube_slug, desired_price, channel, active, last_notified_at")
      .eq("active", true);

    if (subsError) {
      throw new Error(`Failed to load alert subscriptions: ${subsError.message}`);
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed: 0, notifications: 0 }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    const slugSet = Array.from(new Set(subscriptions.map((sub) => sub.cube_slug)));
    const { data: cubeMeta, error: cubeError } = await supabase
      .from("cube_models")
      .select("slug, series, model, version_name")
      .in("slug", slugSet);

    if (cubeError) {
      throw new Error(`Failed to load cube metadata: ${cubeError.message}`);
    }

    const cubeLabelMap = new Map<string, string>();
    for (const meta of cubeMeta ?? []) {
      cubeLabelMap.set(meta.slug, buildCubeLabel(meta));
    }

    const triggered: { subscription: Subscription; snapshot: SnapshotMatch }[] = [];

    for (const subscription of subscriptions as Subscription[]) {
      const { data: match, error: snapshotError } = await supabase
        .from("cube_vendor_links_snapshot")
        .select("price, vendor_name, created_at")
        .eq("cube_slug", subscription.cube_slug)
        .lte("price", subscription.desired_price)
        .order("created_at", { ascending: false })
        .limit(1);

      if (snapshotError) {
        console.error(
          `Failed to evaluate subscription ${subscription.id}: ${snapshotError.message}`,
        );
        continue;
      }

      if (!match || match.length === 0) continue;

      const snapshot = match[0] as SnapshotMatch;
      const lastNotified = subscription.last_notified_at
        ? new Date(subscription.last_notified_at)
        : null;
      const snapshotDate = new Date(snapshot.created_at);

      if (Number.isNaN(snapshotDate.getTime())) continue;
      if (lastNotified && snapshotDate <= lastNotified) continue;

      triggered.push({ subscription, snapshot });
    }

    if (triggered.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed: subscriptions.length, notifications: 0 }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    const notificationsPayload = triggered.map(({ subscription, snapshot }) => ({
      message: `Price alert: ${
        cubeLabelMap.get(subscription.cube_slug) ?? subscription.cube_slug
      } is now $${Number(snapshot.price).toFixed(2)} at ${
        snapshot.vendor_name ?? "a vendor"
      }`,
      icon: "fa-solid fa-tag",
      link: `/explore/cubes/${subscription.cube_slug}/price`,
      link_text: "View price history",
      user_id: subscription.user_id,
      published_by_id: null,
    }));

    const { error: insertError, data: inserted } = await supabase
      .from("notifications")
      .insert(notificationsPayload)
      .select("id");

    if (insertError) {
      throw new Error(`Failed to enqueue notifications: ${insertError.message}`);
    }

    const emailPayload = triggered
      .filter(({ subscription }) => subscription.channel === "email")
      .map(({ subscription, snapshot }) => ({
        subscription_id: subscription.id,
        user_id: subscription.user_id,
        cube_slug: subscription.cube_slug,
        vendor_name: snapshot.vendor_name,
        price: snapshot.price,
        snapshot_at: snapshot.created_at,
        payload: {
          cube: cubeLabelMap.get(subscription.cube_slug) ?? subscription.cube_slug,
          vendor: snapshot.vendor_name,
          price: snapshot.price,
        },
      }));

    let emailInserted = 0;
    if (emailPayload.length > 0) {
      const { error: emailError, data: emailRows } = await supabase
        .from("cube_price_alert_email_queue")
        .insert(emailPayload)
        .select("id");

      if (emailError) {
        console.error(`Failed to enqueue email alerts: ${emailError.message}`);
      } else {
        emailInserted = emailRows?.length ?? 0;
      }
    }

    let updateFailures = 0;
    for (const { subscription, snapshot } of triggered) {
      const { error: updateError } = await supabase
        .from("cube_price_alert_subscriptions")
        .update({ last_notified_at: snapshot.created_at })
        .eq("id", subscription.id);

      if (updateError) {
        updateFailures += 1;
        console.error(
          `Failed to update last_notified_at for ${subscription.id}: ${updateError.message}`,
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: subscriptions.length,
        notifications: inserted?.length ?? 0,
        emails: emailInserted,
        updateFailures,
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
