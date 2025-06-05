<script lang="ts">
  import { enhance } from "$app/forms";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  const { profiles } = data;

  const profile = profiles?.[0];

  let profile_picture = $state(profile.profile_picture);
  let banner = $state(profile.banner);
  let username = $state(profile.username);
  let bio = $state(profile.bio);
  let private_profile = $state(profile.private);
  let website = $state(profile.socials.website);
  let reddit = $state(profile.socials.reddit);
  let wca = $state(profile.socials.wca);
  let discord = $state(profile.socials.discord);
  let youtube = $state(profile.socials.youtube);
  let x = $state(profile.socials.x);
  let password = $state("");
  let error = $state("");
  let message = $state("");

  function verifySettings() {
    if (password.length < 8) {
      error = "Password must be at least 8 characters.";
      return;
    }
  }
  function updatePassword() {
    if (password.length < 8) {
      error = "Password must be at least 8 characters.";
      return;
    }
  }
</script>

<section
  class="min-h-screen bg-black text-white px-4 py-12 flex items-center justify-center"
>
  <div class="w-full max-w-3xl space-y-14">
    <h1
      class="text-4xl sm:text-5xl font-clash font-extrabold mb-8 tracking-tight text-blue-400"
    >
      User Settings
    </h1>

    <form method="POST" use:enhance={verifySettings}>
      <!-- Profile Information -->
      <div class="space-y-6 mt-10 mb-10">
        <div class="flex items-center gap-4">
          <span class="text-blue-400 text-2xl">👤</span>
          <h2 class="text-2xl font-bold tracking-tight text-white">
            Profile Information
          </h2>
        </div>

        <!-- Avatar URL -->
        <div class="w-full">
          <label class="block text-sm font-semibold text-gray-300 mb-2">
            Avatar Image URL
            <input
              type="url"
              name="profile_picture"
              bind:value={profile_picture}
              placeholder="https://example.com/avatar.png"
              class="w-full bg-neutral-900 text-white p-3 rounded-lg border border-neutral-700 focus:border-blue-500 outline-none transition"
            />
          </label>
          <p class="text-gray-500 text-xs mt-1">
            Image must be a valid JPG, PNG, or GIF URL.
          </p>
        </div>

        <!-- Banner URL -->
        <div class="w-full">
          <label class="block text-sm font-semibold text-gray-300 mb-2">
            Banner Image URL
            <input
              type="url"
              name="banner"
              bind:value={banner}
              placeholder="https://example.com/banner.jpg"
              class="w-full bg-neutral-900 text-white p-3 rounded-lg border border-neutral-700 focus:border-blue-500 outline-none transition"
            />
          </label>
          <p class="text-gray-500 text-xs mt-1">
            Optional banner shown at the top of your profile.
          </p>
        </div>

        <!-- Username -->
        <div class="w-full">
          <label class="block text-sm font-semibold text-gray-300 mb-2">
            Username
            <input
              type="text"
              name="username"
              bind:value={username}
              class="w-full bg-neutral-900 text-white p-3 rounded-lg border border-neutral-700 focus:border-blue-500 outline-none transition"
            />
          </label>
        </div>

        <!-- Bio -->
        <div class="w-full">
          <label class="block text-sm font-semibold text-gray-300 mb-2">
            Bio
            <input
              type="text"
              name="bio"
              bind:value={bio}
              placeholder="Tell us something cool..."
              class="w-full bg-neutral-900 text-white p-3 rounded-lg border border-neutral-700 focus:border-blue-500 outline-none transition"
            />
          </label>
        </div>

        <!-- Private Profile Toggle -->
        <div>
          <label class="block text-sm font-semibold text-gray-300 mb-2">
            Profile Privacy
            <div class="flex items-center gap-3 mt-1">
              <input
                type="checkbox"
                name="private_profile"
                bind:checked={private_profile}
                id="private-profile"
                class="h-5 w-5 rounded border border-neutral-700 bg-neutral-900 text-blue-500 focus:ring-blue-500 cursor-pointer"
              />
              <label
                for="private-profile"
                class="text-sm text-gray-300 font-medium"
              >
                Make my profile private (only visible to me)
              </label>
            </div>
          </label>
        </div>
      </div>

      <hr class="border-neutral-700" />

      <!-- Socials -->
      <div class="mt-10 mb-10 space-y-6">
        <div class="flex items-center gap-4">
          <span class="text-2xl text-blue-400">🌐</span>
          <h2 class="text-2xl font-bold tracking-tight text-white">
            Social Links
          </h2>
        </div>

        <div class="grid grid-cols-1 gap-6">
          <!-- Website -->
          <div>
            <label class="block text-sm font-semibold text-gray-300 mb-2">
              Personal Website
              <input
                type="url"
                name="website"
                bind:value={website}
                placeholder="https://yourwebsite.com"
                class="w-full bg-neutral-900 text-white p-3 rounded-lg border border-neutral-700 focus:border-blue-500 outline-none transition"
              />
            </label>
          </div>

          <!-- Twitter/X -->
          <div>
            <label class="block text-sm font-semibold text-gray-300 mb-2">
              Twitter/X
              <div class="flex">
                <span
                  class="sm:inline-flex hidden items-center px-3 rounded-l-lg bg-neutral-800 border border-r-0 border-neutral-700 text-gray-400 text-sm"
                >
                  https://x.com/
                </span>
                <input
                  type="text"
                  name="x"
                  bind:value={x}
                  placeholder="your handle"
                  class="w-full bg-neutral-900 text-white p-3 rounded-r-lg rounded-l-lg sm:rounded-l-none border border-neutral-700 focus:border-blue-500 outline-none transition"
                />
              </div>
            </label>
          </div>

          <!-- WCA -->
          <div>
            <label class="block text-sm font-semibold text-gray-300 mb-2">
              WCA ID
              <div class="flex">
                <span
                  class="sm:inline-flex items-center hidden px-3 rounded-l-lg bg-neutral-800 border border-r-0 border-neutral-700 text-gray-400 text-sm"
                >
                  worldcubeassociation.org/persons/
                </span>
                <input
                  type="text"
                  name="wca"
                  bind:value={wca}
                  placeholder="2023EXAM01"
                  class="w-full bg-neutral-900 text-white p-3 rounded-r-lg rounded-l-lg sm:rounded-l-none border border-neutral-700 focus:border-blue-500 outline-none transition"
                />
              </div>
            </label>
          </div>

          <!-- Discord -->
          <div>
            <label class="block text-sm font-semibold text-gray-300 mb-2">
              Discord ID
              <div class="flex">
                <span
                  class="sm:inline-flex hidden items-center px-3 rounded-l-lg bg-neutral-800 border border-r-0 border-neutral-700 text-gray-400 text-sm"
                >
                  discord.com/users/
                </span>
                <input
                  type="text"
                  name="discord"
                  bind:value={discord}
                  placeholder="123456789012345678"
                  class="w-full bg-neutral-900 text-white p-3 rounded-r-lg rounded-l-lg sm:rounded-l-none border border-neutral-700 focus:border-blue-500 outline-none transition"
                />
              </div>
            </label>
          </div>

          <!-- YouTube -->
          <div>
            <label class="block text-sm font-semibold text-gray-300 mb-2">
              YouTube Handle or Channel ID
              <div class="flex">
                <span
                  class="sm:inline-flex hidden items-center px-3 rounded-l-lg bg-neutral-800 border border-r-0 border-neutral-700 text-gray-400 text-sm"
                >
                  youtube.com/
                </span>
                <input
                  type="text"
                  name="youtube"
                  bind:value={youtube}
                  placeholder="@your channel or channel/UCxxxx"
                  class="w-full bg-neutral-900 text-white p-3 rounded-r-lg rounded-l-lg sm:rounded-l-none border border-neutral-700 focus:border-blue-500 outline-none transition"
                />
              </div>
            </label>
          </div>

          <!-- Reddit -->
          <div>
            <label class="block text-sm font-semibold text-gray-300 mb-2">
              Reddit
              <div class="flex">
                <span
                  class="sm:inline-flex hidden items-center px-3 rounded-l-lg bg-neutral-800 border border-r-0 border-neutral-700 text-gray-400 text-sm"
                >
                  reddit.com/u/
                </span>
                <input
                  type="text"
                  name="reddit"
                  bind:value={reddit}
                  placeholder="your username"
                  class="w-full bg-neutral-900 text-white p-3 rounded-r-lg rounded-l-lg sm:rounded-l-none border border-neutral-700 focus:border-blue-500 outline-none transition"
                />
              </div>
            </label>
          </div>
        </div>
      </div>

      <hr class="border-neutral-700" />

      <!-- Account Security -->
      <div class="space-y-6 mt-10 mb-10">
        <div class="flex items-center gap-4">
          <span class="text-2xl text-blue-400">🔒</span>
          <h2 class="text-2xl font-bold tracking-tight text-white">
            Account Security
          </h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-semibold text-gray-300 mb-2">
              Current Password
              <input
                type="password"
                class="w-full bg-neutral-900 text-white p-3 rounded-lg border border-neutral-700 focus:border-blue-500 outline-none transition"
              />
            </label>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-300 mb-2">
              New Password
              <input
                type="password"
                class="w-full bg-neutral-900 text-white p-3 rounded-lg border border-neutral-700 focus:border-blue-500 outline-none transition"
              />
            </label>
          </div>
        </div>

        <button
          class="mt-4 px-5 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg text-white font-semibold transition cursor-pointer"
          onclick={updatePassword}
        >
          Update Password
        </button>
      </div>

      <div class="flex justify-end pt-6">
        <button
          type="submit"
          class="px-8 py-3 bg-blue-700 hover:bg-blue-800 rounded-xl text-white text-lg font-semibold shadow transition cursor-pointer"
        >
          Save Changes
        </button>
      </div>
    </form>
  </div>
</section>
