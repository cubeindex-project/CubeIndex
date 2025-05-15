<script lang="ts">
    const { data } = $props();
    const { profiles } = data;
    const profile = profiles?.[0];

    const default_profile_picture = "/images/default-profile.png";

    function formatJoinDate(dateString: string): string {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(date);
    }

    const formattedJoinDate = formatJoinDate(profile?.created_at);
</script>

<section class="min-h-screen bg-black text-white px-6 py-12">
    <!-- Profile Header -->
    <div
        class="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-6"
    >
        <img
            src={`${profile?.profile_picture && profile.profile_picture !== "" ? profile.profile_picture : default_profile_picture}`}
            alt="Avatar"
            class="w-32 h-32 rounded-full border-4 border-blue-600 object-cover"
        />
        <div class="flex-1">
            <h2 class="text-3xl font-clash font-bold">{profile?.username}</h2>
            <p class="text-gray-400">Member since : {formattedJoinDate}</p>
        </div>
    </div>

    <!-- Badges Section -->
    <div class="max-w-4xl mx-auto mt-12">
        <h3 class="text-2xl font-semibold mb-4">Badges Earned</h3>
        <div class="bg-gray-800 rounded-lg p-6 text-center text-gray-300 shadow-md">
            <span class="text-lg font-medium">Badges coming soon!</span>
        </div>
    </div>

    <!-- Cube Collection -->
    <div class="max-w-4xl mx-auto mt-12">
        <h3 class="text-2xl font-semibold mb-4">Cube Collection</h3>
        <div class="bg-gray-800 rounded-lg p-6 text-center text-gray-300 shadow-md">
            <span class="text-lg font-medium">Cubes coming soon!</span>
        </div>
    </div>
</section>
