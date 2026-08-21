<script lang="ts">
  import CubeForm from "$lib/components/cube/CubeForm.svelte";

  const { data } = $props();
  const { form, formOptions } = $derived(data);
</script>

<CubeForm
  initialForm={form}
  {...formOptions}
  formTitle="Submit a Cube"
  formDescription="Thank you for contributing to the database. Provide accurate manufacturer details so the CubeIndex team can review and publish your cube quickly."
  submitLabel="Submit cube"
  submissionNote="It may take up to 48h for your submission to be approved."
  enableAutofill={false}
/>
