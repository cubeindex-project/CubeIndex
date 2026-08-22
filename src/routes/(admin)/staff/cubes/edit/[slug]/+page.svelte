<script lang="ts">
  import CubeForm from "$lib/components/cube/CubeForm.svelte";

  const { data } = $props();
  const { form, formOptions } = $derived(data);
</script>

<CubeForm
  initialForm={form}
  {...formOptions}
  formTitle="Edit a cube"
  formDescription="Review and update the cube's details to keep the CubeIndex database accurate and up to date."
  submitLabel="Edit cube"
/>
