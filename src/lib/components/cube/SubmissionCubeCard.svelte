<script lang="ts">
  import CubeCardSkeleton from "$lib/components/cube/CubeCardSkeleton.svelte";
  import { formatDate } from "../../utils/formatDate";
  import type { Tables } from "$lib/types/database.types";
  import { resolve } from "$app/paths";
  import StaffNote from "../submission/StaffNote.svelte";

  interface Props {
    cube: Tables<"v_detailed_cube_models">;
  }

  let { cube }: Props = $props();
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
  <div class="mt-4 flex flex-col gap-4">
    <section
      class="text-xs text-base-content/60 flex flex-wrap gap-x-4 gap-y-2"
    >
      <span>
        <i class="fa-regular fa-calendar" aria-hidden="true"></i>
        <span class="font-medium text-base-content/80">Submitted:</span>
        <time
          datetime={cube.created_at?.toString()}
          class="ml-1 text-base-content"
        >
          {cube.created_at ? formatDate(cube.created_at) : "—"}
        </time>
      </span>
      {#if cube.verified_at}
        <span>
          <i class="fa-solid fa-check" aria-hidden="true"></i>
          <span class="font-medium text-base-content/80">Verified:</span>
          <time
            datetime={cube.verified_at.toString()}
            class="ml-1 text-base-content"
          >
            {formatDate(cube.verified_at)}
          </time>
        </span>
      {/if}
    </section>
    {#if cube.staff_note}
      <StaffNote staff_note={cube.staff_note} />
    {/if}
  </div>
{/snippet}

{#snippet bottom()}
  <a
    href={resolve(`/(public)/explore/cubes/[slug]`, { slug: cube.slug })}
    class="btn btn-primary mt-4"
    aria-label="View Cube Details"
  >
    View Details
    <i class="fa-solid fa-arrow-right"></i>
  </a>
{/snippet}

<CubeCardSkeleton
  {cube}
  rating={false}
  {top}
  {content}
  {bottom}
  showMeta={false}
/>
