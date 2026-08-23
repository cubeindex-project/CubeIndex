import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
serve(async (req)=>{
  try {
    const { report_type, id, title, created_at, reported, image_url, reporter, comment } = await req.json();
    const webhookUrl = Deno.env.get('DISCORD_REPORTS_WEBHOOK_URL');
    if (!webhookUrl) {
      console.error('[report-discord] Missing DISCORD_WEBHOOK_URL secret');
      return new Response('Missing webhook URL', {
        status: 500
      });
    }
    const message = {
      embeds: [
        {
          title: `🚨 New ${report_type} report (#${id})`,
          description: title?.length ? title : 'Untitled',
          color: 0x024db5,
          timestamp: created_at,
          image: {
            url: image_url ?? ""
          },
          fields: [
            {
              name: 'Reported',
              value: reported,
              inline: true
            },
            {
              name: 'Reporter',
              value: reporter,
              inline: true
            },
            {
              name: 'Comment',
              value: comment?.trim().length ? comment : '—',
              inline: false
            }
          ]
        }
      ],
      content: "||<@&1380865299221577738>||"
    };
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });
    if (!response.ok) {
      console.error('[report-discord] Discord response:', await response.text());
    }
    return new Response("Notification sent", {
      status: 200
    });
  } catch (err) {
    console.error('[report-discord] Error:', err);
    return new Response('Error', {
      status: 500
    });
  }
});
