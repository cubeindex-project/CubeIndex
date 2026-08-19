import { BREVO_API_KEY } from "$env/static/private";

export async function addToEmailList(
  email: string | undefined,
  display_name: string,
): Promise<{ success: boolean; error?: string | undefined }> {
  if (!email) return { success: false, error: "Email undefined" };

  try {
    const res = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email,
        listIds: [10],
        attributes: {
          FIRSTNAME: display_name,
        },
        updateEnabled: true,
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) return { success: true };
    const error = await res.text();
    return { success: false, error };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return { success: false, error };
  }
}
