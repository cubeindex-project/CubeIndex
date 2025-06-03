<script lang="ts">
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
    let { cubes } = data;

    let cube1: any = $state(null);
    let cube2: any = $state(null);

    function selectCube1(e: Event) {
        const slug = (e.target as HTMLSelectElement).value;
        cube1 = cubes.find((c) => c.slug === slug);
    }
    function selectCube2(e: Event) {
        const slug = (e.target as HTMLSelectElement).value;
        cube2 = cubes.find((c) => c.slug === slug);
    }

    const options = cubes.map((c) => ({
        label: `${c.series} ${c.model} ${c.version_name}`,
        value: c.slug,
    }));

    function boolYesNo(v: boolean) {
        return v === true ? "Yes" : v === false ? "No" : "-";
    }
    function formatDate(d: string): string {
        if (!d) return "-";
        const date = new Date(d);
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(date);
    }
    function formatFloat(n: number) {
        return typeof n === "number" ? n.toFixed(2).replace(/\.00$/, "") : n;
    }

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
        { label: "Stickered", key: "stickered", format: boolYesNo },
        { label: "WCA Legal", key: "wca_legal", format: boolYesNo },
        { label: "Magnetic", key: "magnetic", format: boolYesNo },
        { label: "Maglev", key: "maglev", format: boolYesNo },
        { label: "Smart", key: "smart", format: boolYesNo },
        { label: "Modded", key: "modded", format: boolYesNo },
        { label: "Discontinued", key: "discontinued", format: boolYesNo },
        { label: "Related To", key: "related_to" },
        { label: "Release Date", key: "release_date", format: formatDate },
        { label: "Rating", key: "rating", format: formatFloat },
        { label: "Weight (g)", key: "weight", format: formatFloat },
        { label: "Size (mm3)", key: "size", format: formatFloat },
    ];
</script>

<section class="min-h-screen bg-black text-white px-4 py-12">
    <div class="max-w-5xl mx-auto">
        <h1 class="text-4xl font-clash font-bold text-center mb-10">
            Compare Cubes
        </h1>
        <div class="flex flex-col md:flex-row gap-8 justify-center mb-12">
            <!-- Cube 1 Select -->
            <div class="flex-1">
                <label class="block mb-2 text-lg font-semibold"
                    >Cube 1
                    <select
                        class="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white focus:border-blue-500 outline-none mb-4"
                        onchange={selectCube1}
                    >
                        <option value="" disabled selected
                            >Select a cube…</option
                        >
                        {#each options as opt}
                            <option value={opt.value}>{opt.label}</option>
                        {/each}
                    </select>
                </label>
            </div>
            <!-- VS -->
            <div class="flex justify-center items-center">
                <span
                    class="bg-neutral-800 rounded-full text-3xl px-7 py-4 text-blue-400 font-bold shadow"
                    >VS</span
                >
            </div>
            <!-- Cube 2 Select -->
            <div class="flex-1">
                <label class="block mb-2 text-lg font-semibold"
                    >Cube 2
                    <select
                        class="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white focus:border-blue-500 outline-none mb-4"
                        onchange={selectCube2}
                    >
                        <option value="" disabled selected
                            >Select a cube…</option
                        >
                        {#each options as opt}
                            <option value={opt.value}>{opt.label}</option>
                        {/each}
                    </select>
                </label>
            </div>
        </div>

        <!-- Comparison Chart -->
        <div
            class="overflow-x-auto mt-10 rounded-2xl shadow-lg border border-neutral-800 bg-neutral-900/80"
        >
            <table class="min-w-full table-auto text-left text-base">
                <thead>
                    <tr class="bg-neutral-900/60">
                        <th
                            class="py-4 px-3 font-bold text-blue-400 text-lg w-1/3"
                        >
                            Feature
                        </th>
                        <th
                            class="py-4 px-3 font-bold text-white text-lg text-center w-1/3"
                        >
                            {#if cube1}
                                <span class="flex flex-col items-center">
                                    <img
                                        src={cube1.image_url}
                                        alt="{cube1.series} {cube1.model} {cube1.version_name}"
                                        class="h-25 rounded mb-1 border border-neutral-700"
                                    />
                                    {cube1.series}
                                    {cube1.model}
                                    {cube1.version_name}
                                </span>
                            {:else}
                                <span class="text-neutral-500">Cube 1</span>
                            {/if}
                        </th>
                        <th
                            class="py-4 px-3 font-bold text-white text-lg text-center w-1/3"
                        >
                            {#if cube2}
                                <span class="flex flex-col items-center">
                                    <img
                                        src={cube2.image_url}
                                        alt="{cube2.series} {cube2.model} {cube2.version_name}"
                                        class="h-25 rounded mb-1 border border-neutral-700"
                                    />
                                    {cube2.series}
                                    {cube2.model}
                                    {cube2.version_name}
                                </span>
                            {:else}
                                <span class="text-neutral-500">Cube 2</span>
                            {/if}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {#each fields as field}
                        <tr
                            class="border-b border-neutral-800 last:border-b-0 hover:bg-neutral-800/40 transition"
                        >
                            <td class="py-3 px-3 font-medium text-white/90">
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
                <div class="text-center text-neutral-500 py-10 text-lg">
                    Select at least one cube to compare.
                </div>
            {/if}
        </div>
    </div>
</section>
