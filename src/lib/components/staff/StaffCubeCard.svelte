<script lang="ts">
  import { resolve } from "$app/paths";
  import CubeCardSkeleton from "../cube/CubeCardSkeleton.svelte";
  import type { Tables } from "$lib/types/database.types";

  interface Props {
    cube: Tables<"v_detailed_cube_models">;
  }

  let { cube }: Props = $props();
</script>

{#snippet content()}
  <div class="flex-1 flex flex-col gap-4">
    <!-- <a
      href={resolve("/(admin)/staff/cubes/edit/[slug]", { slug: cube.slug ?? "" })}
      class="btn btn-info"
    >
      <i class="fa-solid fa-pencil mr-2"></i>Edit
    </a> -->
    <a
      href={resolve("/(public)/explore/cubes/[slug]", { slug: cube.slug ?? "" })}
      class="btn btn-primary"
    >
      See Cube <i class="fa-solid fa-arrow-right"></i>
    </a>
  </div>
{/snippet}

<CubeCardSkeleton {cube} rating={false} {content} />
