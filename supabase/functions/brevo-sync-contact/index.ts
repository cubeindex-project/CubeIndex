import { serve } from "https://deno.land/std/http/server.ts";
const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
const BREVO_LIST_ID = Number(Deno.env.get("BREVO_LIST_ID"));
serve(async (req)=>{
  const { email, display_name } = await req.json();
  if (!email) return new Response("No email", {
    status: 400
  });
  const res = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      email,
      listIds: BREVO_LIST_ID ? [
        BREVO_LIST_ID
      ] : undefined,
      attributes: {
        FIRSTNAME: display_name
      },
      updateEnabled: true
    })
  });
  // Allow idempotency: 201 Created or 204 Updated are both fine
  if (res.ok) return new Response("ok");
  const txt = await res.text();
  return new Response(`Brevo error: ${txt}`, {
    status: 500
  });
});
