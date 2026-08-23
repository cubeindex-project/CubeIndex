// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
Deno.serve(async (req)=>{
  try {
    const { cube, vendor, old_price, new_price, shop_link } = await req.json();
    const webhookUrl = Deno.env.get("DISCORD_PRICE_ALERTS_WEBHOOK_URL");
    if (!webhookUrl) {
      console.error("Missing DISCORD_PRICE_ALERTS_WEBHOOK_URL");
      return new Response("Server misconfiguration", {
        status: 500
      });
    }
    const diff = new_price - old_price;
    const discount = Math.abs(diff / old_price * 100).toFixed(1);
    const message = {
      content: "||<@&1408192603396116693>||",
      embeds: [
        {
          description: `The price of [${cube.name}](https://thecubeindex.com/explore/cubes/${cube.slug}) has dropped by **${discount}%** at [${vendor.name}](${shop_link}), going from **${vendor.currency}${old_price}** to **${vendor.currency}${new_price}**!`,
          color: 0x024db5,
          timestamp: new Date().toISOString()
        }
      ]
    };
    const resp = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(message)
    });
    if (!resp.ok) {
      console.error("Discord webhook error:", await resp.text());
      return new Response("Failed to send notification", {
        status: 502
      });
    }
    return new Response("Notification sent", {
      status: 200
    });
  } catch (err) {
    console.error("Error parsing request:", err);
    return new Response("Invalid request payload", {
      status: 400
    });
  }
});
