import { serve } from "https://deno.land/std/http/server.ts";
serve(async (req)=>{
  try {
    const { nthMember, username, display_name } = await req.json();
    const webhookUrl = Deno.env.get("DISCORD_WEBHOOK_URL_USERS");
    if (!webhookUrl) {
      console.error("Missing DISCORD_WEBHOOK_URL_USERS");
      return new Response("Server misconfiguration", {
        status: 500
      });
    }
    const profileUrl = `https://thecubeindex.com/user/${username}`;
    const message = {
      embeds: [
        {
          description: `**[${display_name}](${profileUrl})** has just signed up! They are the ${nthMember}th member!`,
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
