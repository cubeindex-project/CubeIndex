import type { HandleClientError } from "@sveltejs/kit";

export const handleError: HandleClientError = ({ error, event, status }) => {
  const clientError =
    error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : { name: "UnknownError", message: String(error) };

  const url = new URL(event.url);
  console.error("Unhandled client error", { error, status, path: url.pathname });

  void fetch("/api/log/client-error", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ error: clientError, status, url: url.href }),
    keepalive: true,
  }).catch(() => undefined);

  return {
    message: "Something went wrong on our end.",
  };
};
