<script lang="ts">
  import { formatDate } from "$lib/components/helper_functions/formatDate.svelte";
  import type { Cube } from "$lib/components/dbTableTypes";
  import SearchCubes from "$lib/components/cube/searchCubes.svelte";
  import { m } from "$lib/paraglide/messages";

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
    return v ? m.common_label_yes_text() : m.common_label_no_text();
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
    { label: m.explore_compare_field_version_type_label(), key: "version_type" },
    { label: m.explore_compare_field_brand_label(), key: "brand" },
    { label: m.explore_compare_field_series_label(), key: "series" },
    { label: m.explore_compare_field_model_label(), key: "model" },
    { label: m.explore_compare_field_version_name_label(), key: "version_name" },
    { label: m.explore_compare_field_type_label(), key: "type" },
    { label: m.explore_compare_field_subtype_label(), key: "sub_type" },
    { label: m.explore_compare_field_surface_finish_label(), key: "surface_finish" },
    { label: m.explore_compare_field_stickered_label(), key: "stickered", format: boolYesNo, boolean: true },
    { label: m.explore_compare_field_wca_legal_label(), key: "wca_legal", format: boolYesNo, boolean: true },
    { label: m.explore_compare_field_magnetic_label(), key: "magnetic", format: boolYesNo, boolean: true },
    { label: m.explore_compare_field_maglev_label(), key: "maglev", format: boolYesNo, boolean: true },
    { label: m.explore_compare_field_smart_label(), key: "smart", format: boolYesNo, boolean: true },
    { label: m.explore_compare_field_modded_label(), key: "modded", format: boolYesNo, boolean: true },
    {
      label: m.explore_compare_field_discontinued_label(),
      key: "discontinued",
      format: boolYesNo,
      boolean: true,
    },
    { label: m.explore_compare_field_related_to_label(), key: "related_to" },
    { label: m.explore_compare_field_release_date_label(), key: "release_date", format: formatDate },
    { label: m.explore_compare_field_rating_label(), key: "rating", format: formatFloat },
    { label: m.explore_compare_field_weight_label(), key: "weight", format: formatFloat },
    { label: m.explore_compare_field_size_label(), key: "size", format: formatFloat },
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
  <title>{m.explore_compare_meta_title()}</title>
</svelte:head>
  <section class="min-h-screen px-4 py-12">
    <div class="max-w-5xl mx-auto">
      <h1 class="text-4xl font-clash font-bold text-center mb-2">
        {m.explore_compare_title_h1()}
      </h1>
      <p class="text-center opacity-70 mb-8">
        {m.explore_compare_intro_text()}
      </p>
      <div
        class="flex flex-col md:flex-row gap-6 justify-center items-stretch mb-6"
      >
        <div class="flex-1">
          <div class="block mb-2 text-sm font-semibold opacity-70">
            {m.common_label_cube_1_text()}
          </div>
          <div class="card bg-base-200 border border-base-300 rounded-2xl p-3">
            <SearchCubes cubes={options} bind:outputVar={cube1Value} />
            <div class="mt-2 flex gap-2">
              <button
                class="btn btn-ghost btn-sm"
                onclick={() => clearSelection(1)}
                disabled={!cube1Value}
              >
                {m.common_action_clear_cta()}
              </button>
            </div>
          </div>
        </div>
        <!-- VS / Controls -->
        <div class="flex flex-col justify-center items-center gap-3">
          <span
            class="bg-base-300 rounded-full text-2xl px-5 py-3 text-primary font-bold"
            >{m.explore_compare_vs_text()}</span
          >
          <button
            class="btn btn-outline btn-sm"
            onclick={swapSelections}
            disabled={!cube1Value && !cube2Value}
          >
            <i class="fa-solid fa-right-left mr-2"></i> {m.common_action_swap_cta()}
          </button>
          <button
            class="btn btn-ghost btn-xs"
            onclick={() => clearSelection("both")}
            disabled={!cube1Value && !cube2Value}
          >
            {m.common_action_clear_both_cta()}
          </button>
        </div>
        <!-- Cube 2 Select -->
        <div class="flex-1">
          <div class="block mb-2 text-sm font-semibold opacity-70">
            {m.common_label_cube_2_text()}
          </div>
          <div class="card bg-base-200 border border-base-300 rounded-2xl p-3">
            <SearchCubes cubes={options} bind:outputVar={cube2Value} />
            <div class="mt-2 flex gap-2">
              <button
                class="btn btn-ghost btn-sm"
                onclick={() => clearSelection(2)}
                disabled={!cube2Value}
              >
                {m.common_action_clear_cta()}
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
                {m.common_label_feature_text()}
              </th>
              <th
                scope="col"
                class="py-4 px-4 font-bold text-lg text-center w-1/3"
              >
                {#if cube1}
                  <span class="flex flex-col items-center">
                    <img
                      src={cube1.image_url}
                      alt={m.explore_compare_cube_image_alt({
                        series: cube1.series,
                        model: cube1.model,
                        versionName: cube1.version_name,
                      })}
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
                  <span>{m.common_label_cube_1_text()}</span>
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
                      alt={m.explore_compare_cube_image_alt({
                        series: cube2.series,
                        model: cube2.model,
                        versionName: cube2.version_name,
                      })}
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
                  <span>{m.common_label_cube_2_text()}</span>
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
                        <span class="badge badge-success">
                          {m.common_label_yes_text()}
                        </span>
                      {:else}
                        <span class="badge badge-ghost">
                          {m.common_label_no_text()}
                        </span>
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
                        <span class="badge badge-success">
                          {m.common_label_yes_text()}
                        </span>
                      {:else}
                        <span class="badge badge-ghost">
                          {m.common_label_no_text()}
                        </span>
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
            {m.explore_compare_empty_text()}
          </div>
        {/if}
      </div>
    </div>
  </section>
