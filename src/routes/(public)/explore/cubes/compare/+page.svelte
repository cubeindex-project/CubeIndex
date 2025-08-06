<script lang="ts">
  import { formatDate } from "$lib/components/helper_functions/formatDate.svelte";
  import { supabase } from "$lib/supabaseClient";
  import type { Cube } from "$lib/components/types/cube";
  import { onMount } from "svelte";
  import SearchCubes from "$lib/components/cube/searchCubes.svelte";
  import { SsgoiTransition } from "@ssgoi/svelte";
  import { page } from "$app/state";

  type CubeWithMeta = Cube & {
    _year: number;
    _name: string;
    _wcaLegal: boolean;
    _magnetic: boolean;
    _modded: boolean;
    _stickered: boolean;
    _smart: boolean;
    _maglev: boolean;
  };

  let loading = $state(true);
  let cubes: CubeWithMeta[] = $state([]);
  let options: { label: string; value: string }[] = $state([]);

  async function fetch() {
    loading = true;
    const BATCH = 2000;
    let start = 0;
    const featureMap = new Map<string, Set<string>>();

    const { data: features, error: featErr } = await supabase
      .from("cubes_model_features")
      .select("*");

    if (featErr) {
      throw new Error("A 500 status code error occured:" + featErr.message);
    }

    for (const { cube, feature } of features) {
      if (!featureMap.has(cube)) {
        featureMap.set(cube, new Set());
      }
      featureMap.get(cube)!.add(feature);
    }
    while (true) {
      const { data, error } = await supabase
        .from("cube_models")
        .select("*")
        .eq("status", "Approved")
        .range(start, start + BATCH - 1);

      if (error) throw error;
      loading = false;
      if (data.length === 0) {
        break;
      }

      const cubesWithMeta = data.map((c) => {
        const feats = featureMap.get(c.slug) ?? new Set<string>();
        return {
          ...c,
          _year: new Date(c.release_date ?? "").getFullYear(),
          _name:
            `${c.series ?? ""} ${c.model ?? ""} ${c.version_type ?? ""}`.toLowerCase(),
          _wca_legal: feats.has("wca_legal"),
          _magnetic: feats.has("magnetic"),
          _modded: feats.has("modded"),
          _stickered: feats.has("stickered"),
          _smart: feats.has("smart"),
          _maglev: feats.has("maglev"),
        };
      });

      cubes = cubes.concat(cubesWithMeta);
      start += BATCH;
    }
    options = cubes.map((c) => ({
      label: `${c.series} ${c.model} ${c.version_name}`,
      value: c.slug,
    }));
  }

  let cube1: any = $state(null);
  let cube2: any = $state(null);

  let cube1Value: string = $state("");
  let cube2Value: string = $state("");

  $effect(() => {
    const _ = cube1Value;
    cube1 = cubes.find((c) => c.slug === cube1Value);
  });

  $effect(() => {
    const _ = cube2Value;
    cube2 = cubes.find((c) => c.slug === cube2Value);
  });

  function boolYesNo(v: boolean) {
    return v ? "Yes" : "No";
  }
  function formatFloat(n: number) {
    return typeof n === "number" ? n.toFixed(2).replace(/\.00$/, "") : n;
  }

  onMount(fetch);

  type Field = {
    label: string;
    key: string;
    format?: (value: any) => string;
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
    { label: "Stickered", key: "_stickered", format: boolYesNo },
    { label: "WCA Legal", key: "_wca_legal", format: boolYesNo },
    { label: "Magnetic", key: "_magnetic", format: boolYesNo },
    { label: "Maglev", key: "_maglev", format: boolYesNo },
    { label: "Smart", key: "_smart", format: boolYesNo },
    { label: "Modded", key: "_modded", format: boolYesNo },
    { label: "Discontinued", key: "discontinued", format: boolYesNo },
    { label: "Related To", key: "related_to" },
    { label: "Release Date", key: "release_date", format: formatDate },
    { label: "Rating", key: "rating", format: formatFloat },
    { label: "Weight (g)", key: "weight", format: formatFloat },
    { label: "Size (mm3)", key: "size", format: formatFloat },
  ];
</script>

<SsgoiTransition id={page.url.pathname}>
  <section class="min-h-screen px-4 py-12">
    <div class="max-w-5xl mx-auto">
      <h1 class="text-4xl font-clash font-bold text-center mb-10">
        Compare Cubes
      </h1>
      <div class="flex flex-col md:flex-row gap-8 justify-center mb-12">
        <!-- Cube 1 Select -->
        {#if loading}
          <!-- Cube 1 Skeleton -->
          <div class="flex-1">
            <div
              class="block mb-2 h-6 w-20 rounded bg-base-300 animate-pulse"
            ></div>
            <div
              class="w-full h-[48px] rounded-xl bg-base-200 border border-base-300 mb-4 animate-pulse"
            ></div>
          </div>
        {:else}
          <div class="flex-1">
            <label class="block mb-2 text-lg font-semibold">
              Cube 1
              <SearchCubes cubes={options} bind:outputVar={cube1Value} />
            </label>
          </div>
        {/if}
        <!-- VS -->
        <div class="flex justify-center items-center">
          <span
            class="bg-base-300 rounded-full text-3xl px-7 py-4 text-primary font-bold"
            >VS</span
          >
        </div>
        {#if loading}
          <!-- Cube 2 Skeleton -->
          <div class="flex-1">
            <div
              class="block mb-2 h-6 w-20 rounded bg-base-300 animate-pulse"
            ></div>
            <div
              class="w-full h-[48px] rounded-xl bg-base-200 border border-base-300 mb-4 animate-pulse"
            ></div>
          </div>
        {:else}
          <!-- Cube 2 Select -->
          <div class="flex-1">
            <label class="block mb-2 text-lg font-semibold">
              Cube 2
              <SearchCubes cubes={options} bind:outputVar={cube2Value} />
            </label>
          </div>
        {/if}
      </div>

      <!-- Comparison Chart -->
      <div
        class="overflow-x-auto mt-10 rounded-2xl border border-base-200 bg-base-300"
      >
        <table class="min-w-full table-auto text-left text-base">
          <thead>
            <tr class="">
              <th class="py-4 px-3 font-bold text-primary text-lg w-1/3">
                Feature
              </th>
              <th class="py-4 px-3 font-bold text-lg text-center w-1/3">
                {#if cube1}
                  <span class="flex flex-col items-center">
                    <img
                      src={cube1.image_url}
                      alt="{cube1.series} {cube1.model} {cube1.version_name}"
                      class="h-25 rounded-xl mb-1"
                    />
                    {cube1.series}
                    {cube1.model}
                    {cube1.version_name}
                  </span>
                {:else}
                  <span>Cube 1</span>
                {/if}
              </th>
              <th class="py-4 px-3 font-bold text-lg text-center w-1/3">
                {#if cube2}
                  <span class="flex flex-col items-center">
                    <img
                      src={cube2.image_url}
                      alt="{cube2.series} {cube2.model} {cube2.version_name}"
                      class="h-25 rounded-xl mb-1"
                    />
                    {cube2.series}
                    {cube2.model}
                    {cube2.version_name}
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
                class="border-b border-base-200 last:border-b-0 hover:bg-base-200 transition"
              >
                <td class="py-3 px-3 font-medium">
                  {field.label}
                </td>
                <td class="py-3 px-3 text-center">
                  {#if cube1}
                    {field.format
                      ? field.format(cube1[field.key])
                      : (cube1[field.key] ?? "-")}
                  {:else}
                    -
                  {/if}
                </td>
                <td class="py-3 px-3 text-center">
                  {#if cube2}
                    {field.format
                      ? field.format(cube2[field.key])
                      : (cube2[field.key] ?? "-")}
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
</SsgoiTransition>
