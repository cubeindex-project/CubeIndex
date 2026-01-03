<script lang="ts">
  import { formatDate } from "$lib/components/helper_functions/formatDate.svelte";
  import type { Cube } from "$lib/components/dbTableTypes";
  import SearchCubes from "$lib/components/cube/searchCubes.svelte";

  type CubeWithMeta = Cube & {
    year: number; // Release year extracted from date
    name: string; // Combined name for search
    wca_legal: boolean; // WCA legal feature flag
    magnetic: boolean; // Magnetic feature flag
    modded: boolean; // Modded feature flag
    stickered: boolean; // Stickered feature flag
    smart: boolean; // Smart feature flag
    popularity: number; // Popularity count from user data
    avg_price: number; // Average price
  };

  const { data } = $props();

  let cubes: CubeWithMeta[] = $derived(data.cubes);
  let options: { label: string; value: string }[] = $state([]);

  $effect(() => {
    options = cubes.map((c) => ({
      label: `${c.series} ${c.model} ${c.version_name}`,
      value: c.slug,
    }));
  });

  let cube1: CubeWithMeta | null = $state(null);
  let cube2: CubeWithMeta | null = $state(null);

  let cube1Value: string = $state("");
  let cube2Value: string = $state("");

  function swapSelections() {
    const a = cube1Value;
    cube1Value = cube2Value;
    cube2Value = a;
  }

  function clearSelection(which: 1 | 2 | "both" = "both") {
    if (which === 1 || which === "both") {
      cube1Value = "";
    }
    if (which === 2 || which === "both") {
      cube2Value = "";
    }
  }

  $effect(() => {
    const _ = cube1Value;
    cube1 = cubes.find((c) => c.slug === cube1Value) ?? null;
  });

  $effect(() => {
    const _ = cube2Value;
    cube2 = cubes.find((c) => c.slug === cube2Value) ?? null;
  });

  function boolYesNo(v: boolean) {
    return v ? "Yes" : "No";
  }
  function formatFloat(n: number) {
    return typeof n === "number" ? n.toFixed(2).replace(/\.00$/, "") : n;
  }

  type Field = {
    label: string;
    key: string;
    format?: (value: any) => string;
    boolean?: boolean;
  };

  const fields: Field[] = [
    { label: "Version Type", key: "version_type" },
    { label: "Brand", key: "brand" },
    { label: "Series", key: "series" },
    { label: "Model", key: "model" },
    { label: "Version Name", key: "version_name" },
    { label: "Type", key: "type" },
    { label: "Subtype", key: "sub_type" },
    { label: "Surface Finish", key: "surface_finish" },
    { label: "Stickered", key: "stickered", format: boolYesNo, boolean: true },
    { label: "WCA Legal", key: "wca_legal", format: boolYesNo, boolean: true },
    { label: "Magnetic", key: "magnetic", format: boolYesNo, boolean: true },
    { label: "Maglev", key: "maglev", format: boolYesNo, boolean: true },
    { label: "Smart", key: "smart", format: boolYesNo, boolean: true },
    { label: "Modded", key: "modded", format: boolYesNo, boolean: true },
    {
      label: "Discontinued",
      key: "discontinued",
      format: boolYesNo,
      boolean: true,
    },
    { label: "Related To", key: "related_to" },
    { label: "Release Date", key: "release_date", format: formatDate },
    { label: "Rating", key: "rating", format: formatFloat },
    { label: "Weight (g)", key: "weight", format: formatFloat },
    { label: "Size (mm3)", key: "size", format: formatFloat },
  ];

  function getValue(c: CubeWithMeta | null, f: Field) {
    if (!c) return "-";
    const raw = c[f.key as keyof CubeWithMeta];
    return f.format ? f.format(raw) : (raw ?? "-");
  }

  function differs(f: Field) {
    if (!cube1 || !cube2) return false;
    const a = getValue(cube1, f);
    const b = getValue(cube2, f);
    return String(a) !== String(b);
  }
</script>

<svelte:head>
  <title>Compare Cubes - CubeIndex</title>
</svelte:head>
  <section class="min-h-screen px-4 py-12">
    <div class="max-w-5xl mx-auto">
      <h1 class="text-4xl font-clash font-bold text-center mb-2">
        Compare Cubes
      </h1>
      <p class="text-center opacity-70 mb-8">
        Select up to two cubes to view specifications side by side.
      </p>
      <div
        class="flex flex-col md:flex-row gap-6 justify-center items-stretch mb-6"
      >
        <div class="flex-1">
          <div class="block mb-2 text-sm font-semibold opacity-70">Cube 1</div>
          <div class="card bg-base-200 border border-base-300 rounded-2xl p-3">
            <SearchCubes cubes={options} bind:outputVar={cube1Value} />
            <div class="mt-2 flex gap-2">
              <button
                class="btn btn-ghost btn-sm"
                onclick={() => clearSelection(1)}
                disabled={!cube1Value}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
        <!-- VS / Controls -->
        <div class="flex flex-col justify-center items-center gap-3">
          <span
            class="bg-base-300 rounded-full text-2xl px-5 py-3 text-primary font-bold"
            >VS</span
          >
          <button
            class="btn btn-outline btn-sm"
            onclick={swapSelections}
            disabled={!cube1Value && !cube2Value}
          >
            <i class="fa-solid fa-right-left mr-2"></i> Swap
          </button>
          <button
            class="btn btn-ghost btn-xs"
            onclick={() => clearSelection("both")}
            disabled={!cube1Value && !cube2Value}
          >
            Clear Both
          </button>
        </div>
        <!-- Cube 2 Select -->
        <div class="flex-1">
          <div class="block mb-2 text-sm font-semibold opacity-70">Cube 2</div>
          <div class="card bg-base-200 border border-base-300 rounded-2xl p-3">
            <SearchCubes cubes={options} bind:outputVar={cube2Value} />
            <div class="mt-2 flex gap-2">
              <button
                class="btn btn-ghost btn-sm"
                onclick={() => clearSelection(2)}
                disabled={!cube2Value}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Comparison Chart -->
      <div
        class="overflow-x-auto mt-8 rounded-2xl border border-base-300 bg-base-200"
      >
        <table class="min-w-full table-auto text-left text-base">
          <thead>
            <tr class="">
              <th
                scope="col"
                class="py-4 px-4 font-bold text-primary text-lg w-1/3"
              >
                Feature
              </th>
              <th
                scope="col"
                class="py-4 px-4 font-bold text-lg text-center w-1/3"
              >
                {#if cube1}
                  <span class="flex flex-col items-center">
                    <img
                      src={cube1.image_url}
                      alt="{cube1.series} {cube1.model} {cube1.version_name}"
                      class="h-24 rounded-xl mb-2 border border-base-300 bg-base-100 object-cover"
                    />
                    <a
                      class="link font-medium"
                      href={`/explore/cubes/${cube1.slug}`}
                    >
                      {cube1.series}
                      {cube1.model}
                      {cube1.version_name}
                    </a>
                  </span>
                {:else}
                  <span>Cube 1</span>
                {/if}
              </th>
              <th
                scope="col"
                class="py-4 px-4 font-bold text-lg text-center w-1/3"
              >
                {#if cube2}
                  <span class="flex flex-col items-center">
                    <img
                      src={cube2.image_url}
                      alt="{cube2.series} {cube2.model} {cube2.version_name}"
                      class="h-24 rounded-xl mb-2 border border-base-300 bg-base-100 object-cover"
                    />
                    <a
                      class="link font-medium"
                      href={`/explore/cubes/${cube2.slug}`}
                    >
                      {cube2.series}
                      {cube2.model}
                      {cube2.version_name}
                    </a>
                  </span>
                {:else}
                  <span>Cube 2</span>
                {/if}
              </th>
            </tr>
          </thead>
          <tbody>
            {#each fields as field}
              <tr
                class={`border-b border-base-300 last:border-b-0 transition ${differs(field) ? "bg-base-100" : ""}`}
              >
                <td class="py-3 px-4 font-medium">
                  {field.label}
                </td>
                <td class="py-3 px-4 text-center">
                  {#if cube1}
                    {#if field.boolean}
                      {#if cube1[field.key as keyof CubeWithMeta]}
                        <span class="badge badge-success">Yes</span>
                      {:else}
                        <span class="badge badge-ghost">No</span>
                      {/if}
                    {:else}
                      {getValue(cube1, field)}
                    {/if}
                  {:else}
                    -
                  {/if}
                </td>
                <td class="py-3 px-4 text-center">
                  {#if cube2}
                    {#if field.boolean}
                      {#if cube2[field.key as keyof CubeWithMeta]}
                        <span class="badge badge-success">Yes</span>
                      {:else}
                        <span class="badge badge-ghost">No</span>
                      {/if}
                    {:else}
                      {getValue(cube2, field)}
                    {/if}
                  {:else}
                    -
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
        {#if !cube1 && !cube2}
          <div class="text-center py-10 text-lg">
            Select at least one cube to compare.
          </div>
        {/if}
      </div>
    </div>
  </section>