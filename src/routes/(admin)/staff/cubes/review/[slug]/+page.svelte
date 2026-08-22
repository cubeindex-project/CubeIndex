<script lang="ts">
  import CubeSubmissionReview from "$lib/components/staff/CubeSubmissionReview.svelte";

  const { data } = $props();
</script>

<CubeSubmissionReview
  cube={data.cube}
  features={data.features}
  vendorLinks={data.vendorLinks}
/>
