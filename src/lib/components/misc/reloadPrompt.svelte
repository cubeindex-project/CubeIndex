<script lang="ts">
  import { useRegisterSW } from "virtual:pwa-register/svelte";
  import Portal from "./portal.svelte";
  const { needRefresh, updateServiceWorker, offlineReady } = useRegisterSW({
    onRegistered(r) {
      r &&
        setInterval(() => {
          r.update();
        }, 3600000);
    },
    onRegisterError(error) {
      new Error("SW registration error", error);
    },
  });
  const close = () => {
    offlineReady.set(false);
    needRefresh.set(false);
  };
  const toast = $derived($offlineReady || $needRefresh);
</script>

{#if toast}
  <Portal>
    <div
      class="fixed right-0 bottom-0 m-4 p-3 border border-base-300 rounded-2xl z-10 text-left shadow-md bg-base-200"
      role="alert"
    >
      <div class="mb-2">
        {#if $offlineReady}
          <span> App ready to work offline </span>
        {:else}
          <span>
            New content available, click on reload button to update.
          </span>
        {/if}
      </div>
      <div class="gap-2 flex">
        {#if $needRefresh}
          <button
            onclick={() => updateServiceWorker(true)}
            class="btn btn-primary"
          >
            Reload
          </button>
        {/if}
        <button onclick={close} class="btn btn-ghost btn-error"> Close </button>
      </div>
    </div>
  </Portal>
{/if}
