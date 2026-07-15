<script lang="ts">
  import VendorSubmissionReview from "$lib/components/staff/VendorSubmissionReview.svelte";

  const { data } = $props();
</script>

<VendorSubmissionReview vendor={data.vendor} />
