<script lang="ts">
  import StaffCubeSubmissionCard from "$lib/components/staff/StaffCubeSubmissionCard.svelte";
  import StaffSubmissionExplore from "$lib/components/staff/StaffSubmissionExplore.svelte";

  const { data } = $props();
  const submissions = $derived(
    data.cubeSubmissions.map((cubeSubmission) => ({
      ...cubeSubmission,
      status: cubeSubmission.submission.status,
    })),
  );
</script>

<StaffSubmissionExplore
  title="Manage cubes"
  description="Review and manage cube submissions."
  entityName="cube"
  {submissions}
>
  {#snippet card(cubeSubmission)}
    <StaffCubeSubmissionCard {cubeSubmission} />
  {/snippet}
</StaffSubmissionExplore>
