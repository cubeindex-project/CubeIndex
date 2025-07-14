<script lang="ts">
  import type { PageData } from "./$types";
  import UserCubeCard from "$lib/components/userCubeCard.svelte";
  import EditUserCubeCard from "$lib/components/editUserCubeCard.svelte";
  import { supabase } from "$lib/supabaseClient";
  import { onMount } from "svelte";
  import type { Cube } from "$lib/components/types/cube";

  let { data }: { data: PageData } = $props();
  const { profile, user } = data;

  let user_cubes: any[] = $state([]);
  let cubes: Cube[] = $state([]);

  let userCubesFromAll: Cube[] = $state([]);

  let loading = $state(true);

  async function fetchUserCubes() {
    const { data, error } = await supabase
      .from("user_cubes")
      .select("*")
      .eq("username", profile.username);

    if (error) {
      console.error(500, `Failed to fetch the user cubes: ${error.message}`);
      return;
    }

    user_cubes = data;
    loading = false;
  }

  async function fetchCubes() {
    const { data, error } = await supabase
      .from("cube_models")
      .select("*")
      .eq("status", "Approved")
      .order("model", { ascending: true })
      .order("series", { ascending: true });

    if (error) {
      console.error(500, "Failed to fetch cubes", error.message);
      return;
    }

    cubes = data;
  }

  onMount(() => {
    fetchUserCubes();
    fetchCubes();
  });

  let edit = $state(false);

  $effect(() => {
    if (loading || !user_cubes.length) return;

    const userCubeName = new Set(user_cubes.map((uc) => uc.cube));

    userCubesFromAll = cubes.filter((cube) => userCubeName.has(cube.slug));
  });
</script>

<div class="relative max-w-6xl mx-auto mt-12 px-4">
  <div class="flex justify-between">
    <h3 class="text-2xl font-bold mb-4">Cube Collection</h3>
    {#if user?.id === profile.user_id && userCubesFromAll.length > 0}
      <button
        class="btn {edit
          ? 'btn-error text-error-content'
          : 'btn-info text-info-content'}"
        onclick={() => {
          edit = !edit;
        }}
      >
        {#if edit}
          <i class="fa-solid fa-xmark"></i>
          Cancel
        {:else}
          <i class="fa-solid fa-pencil"></i>
          Edit
        {/if}
      </button>
    {/if}
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
      {#each userCubesFromAll as cube}
        {#if edit}
          <EditUserCubeCard {cube} user_details={user_cubes} image={true} />
        {:else}
          <UserCubeCard {cube} user_details={user_cubes} image={true} />
        {/if}
      {/each}
    </ul>
  {:else}
    <div
      class="bg-gradient-to-r from-base-200 via-blue-950 to-base-200 rounded-xl p-6 text-center text-gray-300 border border-base-300"
    >
      <span class="text-lg font-medium"
        >{user?.id === profile.user_id ? "You have" : "This user has"} no cubes in
        {user?.id === profile.user_id ? "your" : "their"} collection.</span
      >
    </div>
  {/if}
</div>
