<script lang="ts">
  import { enhance } from "$app/forms";
  import type { PageData } from "./$types";
  import { m } from "$lib/paraglide/messages";

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

<section class="min-h-screen px-4 py-12 flex items-center justify-center">
  <div class="w-full max-w-3xl space-y-14">
    <h1
      class="text-4xl sm:text-5xl font-clash font-extrabold mb-8 tracking-tight text-primary"
    >
      {m.user_settings()}
    </h1>

    <form method="POST" use:enhance={verifySettings}>
      <!-- Profile Information -->
      <div class="space-y-6 mt-10 mb-10">
        <div class="flex items-center gap-4">
          <span class="text-2xl">👤</span>
          <h2 class="text-2xl font-bold tracking-tight">{m.profile_information()}</h2>
        </div>

        <!-- Avatar URL -->
        <div class="w-full">
          <label class="block text-sm font-semibold mb-2">
            {m.settings_avatar_url()}
            <input
              type="url"
              name="profile_picture"
              bind:value={profile_picture}
              placeholder="https://example.com/avatar.png"
              class="input w-full"
            />
          </label>
          <p class="text-gray-500 text-xs mt-1">
            {m.image_must_be_valid()}
          </p>
        </div>

        <!-- Banner URL -->
        <div class="w-full">
          <label class="block text-sm font-semibold mb-2">
            {m.settings_banner_url()}
            <input
              type="url"
              name="banner"
              bind:value={banner}
              placeholder="https://example.com/banner.jpg"
              class="input w-full"
            />
          </label>
          <p class="text-gray-500 text-xs mt-1">
            {m.optional_banner()}
          </p>
        </div>

        <!-- Username -->
        <div class="w-full">
          <label class="block text-sm font-semibold mb-2">
            {m.label_username()}
            <input
              type="text"
              name="username"
              bind:value={username}
              class="input w-full"
            />
          </label>
        </div>

        <!-- Bio -->
        <fieldset class="fieldset">
          <legend class="fieldset-legend">{m.bio()}</legend>
          <textarea
            class="textarea h-24 w-full max-h-50"
            name="bio"
            bind:value={bio}
            placeholder="Tell us something cool..."
          ></textarea>
        </fieldset>

        <!-- Private Profile Toggle -->
        <fieldset
          class="fieldset bg-base-200 border-base-100 rounded-box w-64 border p-4"
        >
          <legend class="fieldset-legend">{m.profile_privacy()}</legend>
          <label class="label">
            <input
              type="checkbox"
              name="private_profile"
              bind:checked={private_profile}
              class="checkbox bg-base-100"
            />
            {m.make_profile_private()}
          </label>
        </fieldset>
      </div>

      <hr class="border-neutral-700" />

      <!-- Socials -->
      <div class="mt-10 mb-10 space-y-6">
        <div class="flex items-center gap-4">
          <span class="text-2xl">🌐</span>
          <h2 class="text-2xl font-bold tracking-tight">{m.social_links()}</h2>
        </div>

        <div class="grid grid-cols-1 gap-6">
          <!-- Website -->
          <div>
            <label class="block text-sm font-semibold mb-2">
              {m.personal_website()}
              <input
                type="url"
                name="website"
                bind:value={website}
                placeholder="https://yourwebsite.com"
                class="input w-full"
              />
            </label>
          </div>

          <!-- Twitter/X -->
          <div>
            <label class="block text-sm font-semibold mb-2">
              Twitter/X
              <div class="flex">
                <label class="input w-full">
                  x.com/
                  <input
                    type="text"
                    class="grow"
                    name="x"
                    bind:value={x}
                    placeholder="your handle"
                  />
                </label>
              </div>
            </label>
          </div>

          <!-- WCA -->
          <div>
            <label class="block text-sm font-semibold mb-2">
              WCA ID
              <div class="flex">
                <label class="input w-full">
                  worldcubeassociation.org/persons/
                  <input
                    type="text"
                    class="grow"
                    name="wca"
                    bind:value={wca}
                    placeholder="2023EXAM01"
                  />
                </label>
              </div>
            </label>
          </div>

          <!-- Discord -->
          <div>
            <label class="block text-sm font-semibold mb-2">
              Discord
              <div class="flex">
                <label class="input w-full">
                  discord.com/users/
                  <input
                    type="text"
                    class="grow"
                    name="discord"
                    bind:value={discord}
                    placeholder="123456789012345678"
                  />
                </label>
              </div>
            </label>
          </div>

          <!-- YouTube -->
          <div>
            <label class="block text-sm font-semibold mb-2">
              YouTube
              <div class="flex">
                <label class="input w-full">
                  youtube.com/
                  <input
                    type="text"
                    class="grow"
                    name="youtube"
                    bind:value={youtube}
                    placeholder="@your channel"
                  />
                </label>
              </div>
            </label>
          </div>

          <!-- Reddit -->
          <div>
            <label class="block text-sm font-semibold mb-2">
              Reddit
              <div class="flex">
                <label class="input w-full">
                  reddit.com/u/
                  <input
                    type="text"
                    class="grow"
                    name="reddit"
                    bind:value={reddit}
                    placeholder="your username"
                  />
                </label>
              </div>
            </label>
          </div>
        </div>
      </div>

      <hr class="border-neutral-700" />

      <!-- Account Security -->
      <div class="space-y-6 mt-10 mb-10">
        <div class="flex items-center gap-4">
          <span class="text-2xl">🔒</span>
          <h2 class="text-2xl font-bold tracking-tight">{m.account_security()}</h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-semibold mb-2">
              {m.current_password()}
              <input type="password" class="input w-full" />
            </label>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-2">
              {m.label_new_password()}
              <input type="password" class="input w-full" />
            </label>
          </div>
        </div>

        <button
          class="btn btn-lg btn-primary"
          onclick={updatePassword}
          disabled
        >
          {m.update_password()}
        </button>
      </div>

      <div class="flex justify-end pt-6">
        <button type="submit" class="btn btn-primary btn-xl">
          {m.save_changes()}
        </button>
      </div>
    </form>
  </div>
</section>
