<script lang="ts">
  import CubeForm from "$lib/components/forms/CubeForm.svelte";
  import SubmissionStatusManager from "$lib/components/staff/SubmissionStatusManager.svelte";

  const { data } = $props();
  const { cube, form, formOptions } = $derived(data);
</script>

{#snippet headerActions()}
  {#if cube.status === "Pending"}
    <SubmissionStatusManager submission={cube} entityLabel="cube" />
  {/if}
{/snippet}

<CubeForm
  initialForm={form}
  {...formOptions}
  formTitle="Edit a cube"
  submitLabel="Edit cube"
  {headerActions}
/>
