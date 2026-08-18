<script lang="ts">
  import CubeForm from "$lib/components/forms/CubeForm.svelte";

  const { data } = $props();
  const { form, formOptions } = $derived(data);
</script>

<CubeForm
  initialForm={form}
  {...formOptions}
  formTitle="Submit a Cube"
  submitLabel="Submit cube"
  submissionNote="It may take up to 48h for your submission to be approved."
  enableAutofill
/>
