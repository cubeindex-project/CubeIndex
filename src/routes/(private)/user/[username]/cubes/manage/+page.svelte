<script lang="ts">
  import UserCubeCard from "$lib/components/cube/userCubeCard.svelte";
  import type { Cube, UserCubes } from "$lib/components/dbTableTypes";
  import type { PageData } from "./$types";
  import { supabase } from "$lib/supabaseClient";
  import { onMount } from "svelte";

  let { data }: { data: PageData } = $props();
  const { profile } = data;

  export interface CubeAndDetails extends UserCubes {
    cube_model: Cube;
  }

  let user_cubes: CubeAndDetails[] = $state([]);
  let user_cube_ratings: any[] = $state([]);
  let loading = $state(true);
  let selected: Set<string> = $state(new Set());
  let message = $state("");

  async function fetchUserCubes() {
    const { data, error } = await supabase
      .from("user_cubes")
      .select("*, cube_model:cube(*)")
      .eq("user_id", profile.user_id);
    if (error) {
      throw new Error(`500, Failed to fetch the user cubes: ${error.message}`);
    }
    user_cubes = data ?? [];
  }

  async function fetchUserRatings() {
    const { data, error: urErr } = await supabase
      .from("user_cube_ratings")
      .select("*")
      .eq("user_id", profile.user_id);

    if (urErr) {
      throw new Error(`Failed to fetch user ratings: ${urErr.message}`);
    }
    user_cube_ratings = data ?? [];
  }

  onMount(async () => {
    try {
      await Promise.all([fetchUserCubes(), fetchUserRatings()]);
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  });

  function toggleSelection(slug: string) {
    const next = new Set(selected);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    selected = next;
  }

  async function removeSelected() {
    message = "";
    const slugs = Array.from(selected);
    if (slugs.length === 0) return;
    try {
      await Promise.all(
        slugs.map((slug) =>
          fetch("/api/delete-cube-from-collection", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug }),
          })
        )
      );
      user_cubes = user_cubes.filter(
        (uc) => !selected.has(uc.cube_model?.slug)
      );
      selected = new Set();
      message = "Cubes removed successfully.";
    } catch (err: any) {
      message = err.message;
    }
  }
</script>

<section class="relative max-w-6xl mx-auto mt-12 px-4">
  <div class="flex justify-between">
    <h3 class="text-2xl font-bold mb-4">Manage Collection</h3>
    <button
      class="btn btn-error text-error-content disabled:text-accent-content"
      onclick={removeSelected}
      disabled={selected.size === 0}
      type="button"
    >
      {#if selected.size === 0}
        Select Cubes To Remove Them
      {:else}
        <i class="fa-solid fa-trash"></i>
        Remove Selected ({selected.size})
      {/if}
    </button>
  </div>

  {#if loading}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {#each Array(6) as i}
        <div class="bg-neutral rounded-2xl overflow-hidden animate-pulse">
          <div class="h-48 bg-neutral-content"></div>
          <div class="p-5 space-y-4">
            <div class="h-6 bg-neutral-content rounded w-3/4"></div>
            <div class="h-4 bg-neutral-content rounded w-1/2"></div>
            <div class="h-4 bg-neutral-content rounded w-1/4"></div>
          </div>
        </div>
      {/each}
    </div>
  {:else if user_cubes && user_cubes.length > 0}
    <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {#each user_cubes as row}
        <li class="relative">
          <input
            type="checkbox"
            class="checkbox absolute top-2 left-2 z-10 bg-base-100 checked:bg-base-200 checkbox-xl"
            checked={selected.has(row.cube_model?.slug)}
            onchange={() => toggleSelection(row.cube_model.slug)}
          />
          <UserCubeCard
            mode="edit"
            cube={row.cube_model}
            user_details={row}
            user_rating={user_cube_ratings.find(
              (ucr) => ucr.cube_slug === row.cube_model?.slug
            )?.rating ?? 0}
          />
        </li>
      {/each}
    </ul>
  {:else}
    <div class="col-span-full flex flex-col items-center justify-center py-20">
      <i class="fa-solid fa-cube fa-3x mb-4"></i>
      <h2 class="text-2xl font-semibold mb-2">
        You don't have any cubes in your collection.
      </h2>
    </div>
  {/if}

  {#if message}
    <div class="mt-6 text-center">{message}</div>
  {/if}
</section>
