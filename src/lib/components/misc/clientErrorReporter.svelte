<script lang="ts">
  import { m } from "$lib/paraglide/messages";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";

  function showToast(message: string) {
    toast.error(m.misc_client_error_toast_text({ message }), {
      description: m.misc_client_error_toast_description(),
      action: {
        label: m.misc_client_error_toast_action_label(),
        onClick: () => {
          const url = `/report?error=${encodeURIComponent(message)}`;
          window.location.href = url;
        },
      },
    });
  }

  onMount(() => {
    const handleError = (event: ErrorEvent) => {
      const msg = event.error?.message || event.message;
      showToast(msg);
    };
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason as any;
      const msg = reason?.message ?? String(reason);
      showToast(msg);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  });
</script>
