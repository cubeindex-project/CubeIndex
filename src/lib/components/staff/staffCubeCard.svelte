<script lang="ts">
  import CubeCardSkeleton from "../cube/cubeCardSkeleton.svelte";
  import { resolve } from "$app/paths";

  let { cube } = $props();
</script>

{#snippet top()}
  <div
    class="h-10 flex items-center justify-center w-full rounded-t-2xl {cube.status ===
    'Approved'
      ? 'bg-success text-success-content'
      : cube.status === 'Pending'
        ? 'bg-warning text-warning-content'
        : 'bg-error text-error-content'}"
  >
    <p class="font-semibold tracking-wider">{cube.status}</p>
  </div>
{/snippet}

{#snippet content()}
  {#if cube.status === "Approved"}
    <div class="flex-1 flex flex-col">
      <div class="py-4">
        <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
          Verified By: {cube.verified_by_id.display_name}
        </h2>
      </div>

      <div class="mt-4 flex gap-2">
        <a
          href={resolve("/(admin)/staff/cubes/edit/[slug]", {
            slug: cube.slug,
          })}
          class="btn btn-info flex-1"
        >
          <i class="fa-solid fa-pencil mr-2"></i>Edit
        </a>
      </div>

      <a
        href={resolve("/(public)/explore/cubes/[slug]", { slug: cube.slug })}
        class="btn btn-primary mt-4"
      >
        See Cube <i class="fa-solid fa-arrow-right"></i>
      </a>
    </div>
  {:else if cube.status === "Pending"}
    <div class="flex-1 flex flex-col">
      <div class="mt-4 flex gap-2">
        <a
          href={resolve("/(admin)/staff/cubes/review/[slug]", {
            slug: cube.slug,
          })}
          class="btn btn-info flex-1"
        >
          <i class="fa-solid fa-magnifying-glass"></i>Review
        </a>
      </div>
      <a
        href={resolve("/(public)/explore/cubes/[slug]", { slug: cube.slug })}
        class="btn btn-primary mt-4"
      >
        See Cube <i class="fa-solid fa-arrow-right"></i>
      </a>
    </div>
  {:else}
    <div class="flex-1 flex flex-col">
      <div class="flex flex-col gap-4 mt-4">
        <div class="flex flex-row items-center">
          <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
            Rejected By: {cube.verified_by_id.display_name}
          </h2>
        </div>

        <div>
          <h2 class="text-lg font-bold flex items-center gap-2">Reason:</h2>
          <p>{cube.notes}</p>
        </div>
      </div>

      <a
        href={resolve("/(public)/explore/cubes/[slug]", { slug: cube.slug })}
        class="btn btn-primary mt-4"
      >
        See Cube <i class="fa-solid fa-arrow-right"></i>
      </a>
    </div>
  {/if}
{/snippet}

{#snippet bottom()}{/snippet}

<CubeCardSkeleton {cube} rating={false} {top} {content} {bottom} />
