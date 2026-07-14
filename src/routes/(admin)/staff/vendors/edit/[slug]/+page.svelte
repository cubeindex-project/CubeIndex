<script lang="ts">
  import VendorForm from "$lib/components/forms/VendorForm.svelte";

  let { data } = $props();
</script>

<VendorForm initialForm={data.form} />
