<script lang="ts">
    import { onMount } from "svelte";
    import { writable } from "svelte/store";

    const { data } = $props();
    const { announcements } = data;

    interface Announcement {
        id: number;
        title: string;
        message: string;
        icon: string;
        purpose: string;
        link?: string;
        linkText?: string;
        created_at: string;
        archived: boolean;
    }

    const newAnn = writable<Partial<Announcement>>({
        title: "",
        message: "",
        icon: "",
        purpose: "info",
        link: "",
        linkText: "",
    });
    const events = writable<Announcement[]>([]);

    async function submitAnn() {
        const payload = $newAnn;
        const res = await fetch("/api/announcements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const saved: Announcement = await res.json();
        events.update((arr) => [saved, ...arr]);
        newAnn.set({
            title: "",
            message: "",
            icon: "",
            purpose: "info",
            link: "",
            linkText: "",
        });
    }

    async function toggleArchive(id: number, archive: boolean) {
        await fetch(`/api/announcements/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ archived: archive }),
        });
        events.update((arr) =>
            arr.map((a) => (a.id === id ? { ...a, archived: archive } : a)),
        );
    }
</script>

<div class="p-6 space-y-6">
    <!-- Submission Form -->
    <div class="card bg-base-100 shadow">
        <div class="card-body space-y-4">
            <h2 class="card-title">📢 New Announcement</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                    type="text"
                    class="input input-bordered col-span-2"
                    placeholder="Title"
                    bind:value={$newAnn.title}
                />
                <select
                    class="select select-bordered w-full"
                    bind:value={$newAnn.purpose}
                >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                </select>
            </div>
            <textarea
                rows="3"
                class="textarea textarea-bordered w-full"
                placeholder="Message"
                bind:value={$newAnn.message}
            ></textarea>
            <input
                type="text"
                class="input input-bordered w-full"
                placeholder="Icon (e.g. 🎉)"
                bind:value={$newAnn.icon}
            />
            <div class="flex gap-4">
                <input
                    type="text"
                    class="input input-bordered flex-1"
                    placeholder="Link URL (optional)"
                    bind:value={$newAnn.link}
                />
                <input
                    type="text"
                    class="input input-bordered flex-1"
                    placeholder="Link Text (optional)"
                    bind:value={$newAnn.linkText}
                />
            </div>
            <button
                class="btn btn-primary"
                onclick={submitAnn}
                disabled={!$newAnn.title || !$newAnn.message}
            >
                Publish
            </button>
        </div>
    </div>

    <!-- Announcements Table -->
    <div class="overflow-x-auto">
        <table class="table table-zebra w-full">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Created At</th>
                    <th>Purpose</th>
                    <th>Archived?</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {#each announcements as ann}
                    <tr>
                        <td>{ann.id}</td>
                        <td class="flex items-center gap-2">
                            {#if ann.icon}
                                <span>{ann.icon}</span>
                            {/if}
                            {ann.title}
                        </td>
                        <td>{new Date(ann.created_at).toLocaleString()}</td>
                        <td>
                            <span class="badge badge-{ann.purpose}">
                                {ann.purpose}
                            </span>
                        </td>
                        <td>
                            {#if ann.archived}
                                <span class="text-sm text-gray-500">Yes</span>
                            {:else}
                                <span class="text-sm text-green-500">No</span>
                            {/if}
                        </td>
                        <td class="flex gap-2">
                            {#if ann.archived}
                                <button
                                    class="btn btn-sm btn-secondary"
                                    onclick={() => toggleArchive(ann.id, false)}
                                >
                                    Unarchive
                                </button>
                            {:else}
                                <button
                                    class="btn btn-sm btn-warning"
                                    onclick={() => toggleArchive(ann.id, true)}
                                >
                                    Archive
                                </button>
                            {/if}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>
