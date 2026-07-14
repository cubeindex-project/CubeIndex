<script lang="ts">
  import VendorForm from "$lib/components/forms/VendorForm.svelte";

  let { data } = $props();
</script>

<VendorForm
  initialForm={data.form}
  formTitle="Edit a vendor"
  formDescription="Review and update the vendor's details to keep the CubeIndex database accurate and up to date."
  submitLabel="Edit vendor"
/>
