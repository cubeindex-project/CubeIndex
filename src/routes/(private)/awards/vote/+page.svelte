<script lang="ts">
  import { SsgoiTransition } from "@ssgoi/svelte";
  import type {
    AwardsEvent,
    AwardsCategory,
  } from "$lib/components/dbTableTypes";

  let { data } = $props();
  const event: AwardsEvent = data.current_event;
  const categories: AwardsCategory[] = data.awards_category;

  const formatDateTime = (value: Date) =>
    new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(new Date(value));

  const closesAtLabel = formatDateTime(event.end_at);
</script>

<svelte:head>
  <title>Awards Voting - CubeIndex</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<SsgoiTransition id="awards-vote">
  <div class="bg-base-100 min-h-screen">
    <div class="mx-auto max-w-5xl px-4 py-10 space-y-10">
      <header class="space-y-2">
        <p class="text-sm text-base-content/70">Awards voting</p>
        <h1 class="text-3xl font-clash font-bold md:text-4xl">{event.title}</h1>
        <p class="text-sm text-base-content/60">Closes {closesAtLabel}</p>
      </header>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Categories</h2>
        {#if categories.length === 0}
          <p class="text-base-content/70">
            Categories will appear when the ballot opens.
          </p>
        {:else}
          <div class="grid gap-3 md:grid-cols-2">
            {#each categories as category}
              <a
                class="rounded-xl border border-base-300 bg-base-200 hover:bg-base-300 p-4"
                href="/awards/vote/{category.slug}"
              >
                <h3 class="text-lg font-semibold">{category.name}</h3>
                <p class="mt-2 text-base-content/80">{category.description}</p>
              </a>
            {/each}
          </div>
        {/if}
      </section>
    </div>
  </div>
</SsgoiTransition>
