<script lang="ts">
	import VendorForm from "$lib/components/forms/VendorForm.svelte";

	const { data } = $props();
</script>

<VendorForm initialForm={data.form} />
