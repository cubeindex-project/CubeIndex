import { serve } from "https://deno.land/std/http/server.ts";
serve(async (req)=>{
  try {
    const { name, slug, image_url, submitted_by } = await req.json();
    const webhookUrl = Deno.env.get("DISCORD_WEBHOOK_URL");
    const message = {
      embeds: [
        {
          title: "A New Cube Have Been Added!",
          description: `[The **${name}**](https://thecubeindex.com/explore/cubes/${slug})`,
          color: 0x024db5,
          thumbnail: {
            url: image_url
          },
          footer: {
            text: submitted_by ? `Submitted by ${submitted_by}` : "Submitted anonymously"
          },
          timestamp: new Date().toISOString()
        }
      ],
      content: "||<@&1375821731142439042>||"
    };
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(message)
    });
    return new Response("Notification sent", {
      status: 200
    });
  } catch (err) {
    console.error("Error parsing request:", err);
    return new Response("Invalid request", {
      status: 400
    });
  }
});
