<script lang="ts">
  import VendorForm from "$lib/components/forms/VendorForm.svelte";

  const { data } = $props();
</script>

<VendorForm
  initialForm={data.form}
  formTitle="Submit a vendor"
  formDescription="Thank you for contributing to the database. Provide the store's official details so the CubeIndex team can verify rapidly."
  submitLabel="Submit vendor"
  submissionNote="It may take up to 48h for your submission to be reviewed."
/>
