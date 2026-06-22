<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { SvelteSet } from "svelte/reactivity";

  const supabase = page.data.supabase;

  let staff_logs: LogEntry[] = $state([]);

  onMount(async () => {
    const BATCH = 500;
    let start = 0;
    while (true) {
      const { data, error: err } = await supabase
        .from("staff_logs")
        .select("*, staff_id(display_name)")
        .order("id", { ascending: false })
        .range(start, start + BATCH - 1);

      if (err)
        throw new Error(`Failed to load staff logs (500): ${err.message}`);

      if (data.length === 0) break;

      staff_logs = staff_logs.concat(data);
      start += BATCH;
    }
  });

  interface LogEntry {
    id: number;
    target_table: string;
    created_at: string;
    action: string;
    details: string;
    old_data: Record<string, unknown> | null;
    new_data: Record<string, unknown> | null;
    staff_id: { display_name: string };
  }

  const logs: LogEntry[] = $derived(staff_logs);
  let debouncedSearch = $state("");
  let currentPage = $state(1);
  let pageSize = $state(50);

  const filtered = $derived(
    logs.filter(
      (log) =>
        log.staff_id.display_name.toLowerCase().includes(debouncedSearch) ||
        log.action.toLowerCase().includes(debouncedSearch) ||
        log.created_at.toLowerCase().includes(debouncedSearch) ||
        log.target_table.toLowerCase().includes(debouncedSearch),
    ),
  );

  const totalPages = $derived(Math.ceil(filtered.length / pageSize) || 1);
  const activePage = $derived(Math.max(1, Math.min(currentPage, totalPages)));

  const paginated = $derived(
    filtered.slice((activePage - 1) * pageSize, activePage * pageSize),
  );

  let showBifAf: boolean[] = $state([]);
  let showDiff: boolean[] = $state([]);

  /**
   * Returns a partial object mapping each changed key to an object
   * { from: oldValue, to: newValue }. If oldData is null, 'from' will be null.
   */
  function diff(
    oldData: Record<string, unknown> | null,
    newData: Record<string, unknown> | null,
  ): Record<string, { from: unknown; to: unknown }> {
    const result: Record<string, { from: unknown; to: unknown }> = {};

    // 1) Gather every key that could possibly have changed:
    const allKeys = new SvelteSet<string>();
    if (oldData) for (const k of Object.keys(oldData)) allKeys.add(k);
    if (newData) for (const k of Object.keys(newData)) allKeys.add(k);

    // 2) Compare each key’s old vs. new value (treat missing as null)
    for (const key of Array.from(allKeys)) {
      const oldValue = oldData ? oldData[key] : null;
      const newValue = newData ? newData[key] : null;

      // Deep‐vs‐shallow check, just like before:
      const changed =
        typeof newValue === "object" && newValue !== null
          ? JSON.stringify(oldValue) !== JSON.stringify(newValue)
          : oldValue !== newValue;

      if (changed) {
        result[key] = { from: oldValue, to: newValue };
      }
    }

    return result;
  }

  function toggleBifAf(i: number) {
    showBifAf[i] = !showBifAf[i];
  }

  function toggleDiff(i: number) {
    showDiff[i] = !showDiff[i];
  }

  // Simple debounce utility
  function debounce(fn: (val: string) => void, delay = 300) {
    let timeout: ReturnType<typeof setTimeout>;
    return (val: string) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(val), delay);
    };
  }

  // Debounce the search input to improve performance
  const onSearchInput = debounce((val: string) => {
    debouncedSearch = val.toLowerCase();
    currentPage = 1;
  }, 300);

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    }).format(date);
  }

  function prevPage() {
    if (activePage > 1) currentPage = activePage - 1;
  }

  function nextPage() {
    if (activePage < totalPages) currentPage = activePage + 1;
  }

  function goToPage(p: number) {
    currentPage = p;
  }
</script>

<div class="p-4">
  <h1 class="text-2xl font-bold mb-4">Staff Logs</h1>

  <div class="flex flex-wrap items-center mb-4 gap-4">
    <input
      type="text"
      placeholder="Search logs..."
      class="input input-bordered input-md w-full max-w-sm"
      oninput={(e) => onSearchInput((e.target as HTMLInputElement).value)}
    />

    <div class="flex items-center gap-2">
      <label for="pageSize" class="font-medium">Rows per page:</label>
      <select
        id="pageSize"
        bind:value={pageSize}
        class="select select-bordered select-md w-24"
      >
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
    </div>
  </div>

  <div class="overflow-y-auto h-[80vh] border rounded-lg">
    <table class="table table-zebra w-full">
      <thead class="bg-base-200">
        <tr>
          <th>ID</th>
          <th>Date</th>
          <th>Staff</th>
          <th>Target Table</th>
          <th>Action</th>
          <th>Changes</th>
          <th>Before/After</th>
        </tr>
      </thead>
      <tbody>
        {#each paginated as log, i (log.id)}
          <tr>
            <td>{log.id}</td>
            <td>{formatDate(log.created_at)}</td>
            <td>{log.staff_id.display_name}</td>
            <td>{log.target_table}</td>
            <td>{log.action}</td>
            <td>
              <div class="whitespace-pre-wrap flex flex-row">
                <button
                  class="cursor-pointer btn btn-primary"
                  onclick={() => toggleDiff(i)}
                >
                  {showDiff[i] ? "Hide" : "Show"}
                </button>
                {#if showDiff[i]}
                  <div
                    class="absolute -translate-x-full z-50 bg-base-300/10 backdrop-blur-3xl rounded-2xl p-2"
                  >
                    <p class="font-bold">Changes:</p>
                    {#each Object.entries(diff(log.old_data, log.new_data)) as [key, { from, to }], index (index)}
                      <div>
                        {key}: {JSON.stringify(from)} -> {JSON.stringify(to)}
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
            </td>
            <td class="relative flex flex-row-reverse">
              <button
                class="cursor-pointer btn btn-primary"
                onclick={() => toggleBifAf(i)}
              >
                {showBifAf[i] ? "Hide" : "Show"}
              </button>
              {#if showBifAf[i]}
                <div
                  class="card absolute -translate-x-20 z-50 bg-base-300/10 backdrop-blur-3xl rounded-2xl"
                >
                  <div class="card-body">
                    <table class="table table-zebra w-full">
                      <thead class="bg-base-200">
                        <tr>
                          <th>Before</th>
                          <th>After</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <div class="whitespace-pre-wrap text-xs">
                              <div class="p-2">
                                <p class="text-xs">
                                  {JSON.stringify(log.old_data, undefined, 2)}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div class="whitespace-pre-wrap text-xs">
                              <div class="p-2">
                                <p class="text-xs">
                                  {JSON.stringify(log.new_data, undefined, 2)}
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- DaisyUI styled pagination -->
  <div class="join justify-center mt-4">
    <button
      class="join-item btn btn-sm"
      onclick={prevPage}
      disabled={activePage === 1}
    >
      «
    </button>

    {#each [...Array(totalPages).keys()] as i (i)}
      {#if i < 2 || i >= totalPages - 2 || (i >= activePage - 2 && i <= activePage + 1)}
        <button
          class="join-item btn btn-sm {activePage === i + 1
            ? 'btn-active'
            : ''}"
          onclick={() => goToPage(i + 1)}
        >
          {i + 1}
        </button>
      {:else if i === 2}
        <span class="join-item btn btn-sm cursor-default">…</span>
      {/if}
    {/each}

    <button
      class="join-item btn btn-sm"
      onclick={nextPage}
      disabled={activePage === totalPages}
    >
      »
    </button>
  </div>
</div>
