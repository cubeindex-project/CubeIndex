<script
  lang="ts"
  generics="Submission extends { id: number; name: string; status: 'Approved' | 'Pending' | 'Rejected' }"
>
  import type { Snippet } from "svelte";

  interface Props {
    title: string;
    description: string;
    entityName: string;
    submissions: Submission[];
    card: Snippet<[Submission]>;
  }

  const { title, description, entityName, submissions, card }: Props = $props();

  type Status = "All" | "Approved" | "Pending" | "Rejected";
  let status: Status = $state("Pending");
  let search = $state("");

  const filteredSubmissions = $derived(
    submissions.filter(
      (submission) =>
        (status === "All" || submission.status === status) &&
        submission.name.toLowerCase().includes(search.toLowerCase()),
    ),
  );
</script>

<section class="mx-auto min-h-screen max-w-7xl space-y-8 px-6 py-12">
  <header class="space-y-2">
    <h1 class="font-clash text-4xl font-semibold">{title}</h1>
    <p class="text-base-content/70">{description}</p>
  </header>

  <div class="flex flex-col gap-4 sm:flex-row">
    <input
      type="search"
      class="input w-full"
      placeholder={`Search ${entityName}s`}
      bind:value={search}
    />
    <select class="select" bind:value={status} aria-label="Filter by status">
      <option>All</option>
      <option>Pending</option>
      <option>Approved</option>
      <option>Rejected</option>
    </select>
  </div>

  {#if filteredSubmissions.length}
    <div class="grid items-start gap-6 md:grid-cols-2 xl:grid-cols-3">
      {#each filteredSubmissions as submission (submission.id)}
        {@render card(submission)}
      {/each}
    </div>
  {:else}
    <p
      class="rounded-2xl border border-dashed border-base-300 p-10 text-center"
    >
      No {entityName} submissions match these filters.
    </p>
  {/if}
</section>
