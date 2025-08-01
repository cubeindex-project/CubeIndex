<script lang="ts">
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';

  function showToast(message: string) {
    toast.error('A client error occurred', {
      description: 'Click to report the bug',
      action: {
        label: 'Report',
        onClick: () => {
          const url = `/report?error=${encodeURIComponent(message)}`;
          window.location.href = url;
        }
      }
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

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  });
</script>
