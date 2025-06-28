<script lang="ts">
    import { enhance } from "$app/forms";
    import { supabase } from "$lib/supabaseClient.js";
    import { error } from "@sveltejs/kit";

    const { data, form } = $props();
    const { announcements, profile } = data;

    let isSubmitting: boolean = $state(false);

    async function toggleArchive(id: number, archive: boolean) {
        const { error: err } = await supabase
            .from("announcement")
            .update({ archived: archive })
            .eq("id", id);

        if (err) throw error(500, err.message);
        window.location.reload();
    }

    function onSubmit() {
        return async ({
            update,
        }: {
            update: (opts: { reset: boolean }) => void;
        }) => {
            isSubmitting = true;
            update({ reset: false });
            isSubmitting = false;
        };
    }
</script>

<div class="p-6 space-y-6">
    <div class="mb-6 text-center">
        <h1 class="text-4xl font-clash">Announcements</h1>
        {#if profile.role !== "Community Manager" && profile.role !== "Admin"}
            <p class="mt-2 text-error">
                Publishing announcements isn't available for users with your
                role: {profile.role}
            </p>
        {/if}
    </div>
    <!-- Submission Form -->
    <div class="card bg-base-200 max-w-6xl mx-auto">
        <form method="POST" class="card-body space-y-4" use:enhance={onSubmit}>
            <h2 class="card-title">📢 New Announcement</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                    name="title"
                    type="text"
                    class="input input-bordered col-span-2"
                    placeholder="Title"
                />
                <select name="purpose" class="select select-bordered w-full">
                    <option value="legal">Legal</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="announcement">Announcement</option>
                    <option value="warning">Warning</option>
                    <option value="alert">Alert</option>
                    <option value="promo">Promo</option>
                    <option value="info">Info</option>
                    <option value="update">Update</option>
                </select>
            </div>
            <textarea
                name="message"
                rows="3"
                class="textarea textarea-bordered w-full"
                placeholder="Message"
            ></textarea>
            <input
                name="icon"
                type="text"
                class="input input-bordered w-full"
                placeholder="Icon (e.g. 🎉)"
            />
            <div class="flex gap-4">
                <input
                    name="link"
                    type="text"
                    class="input input-bordered flex-1"
                    placeholder="Link URL (optional)"
                />
                <input
                    name="linkText"
                    type="text"
                    class="input input-bordered flex-1"
                    placeholder="Link Text (optional)"
                />
            </div>
            {#if profile.role === "Community Manager" || profile.role === "Admin"}
                <button type="submit" class="btn btn-primary"
                    >{isSubmitting ? "Sending..." : "Publish"}</button
                >
            {:else}
                <button class="btn btn-primary" disabled>Not available</button>
            {/if}

            {#if form?.message}
                <p class="text-info text-center">{form.message}</p>
            {/if}
        </form>
    </div>

    <!-- Announcements Table -->
    <div class="overflow-x-auto">
        <table class="table table-zebra w-full">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Message</th>
                    <th>Created At</th>
                    <th>Purpose</th>
                    <th>Status</th>
                    <th>Published By</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {#each announcements as ann}
                    <tr>
                        <td class="flex items-center gap-2">
                            {#if ann.icon}
                                <span>{ann.icon}</span>
                            {/if}
                            {ann.title}
                        </td>
                        <td>{ann.message}</td>
                        <td>{new Date(ann.created_at).toLocaleString()}</td>
                        <td>
                            <span class="badge badge-{ann.purpose}">
                                {ann.purpose}
                            </span>
                        </td>
                        <td>
                            {#if ann.archived}
                                <span class="text-sm text-gray-500"
                                    >Archived</span
                                >
                            {:else}
                                <span class="text-sm text-green-500"
                                    >Published</span
                                >
                            {/if}
                        </td>
                        <td>
                            {#if ann.published_by}
                                {ann.published_by}
                            {:else}
                                Unknown
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
