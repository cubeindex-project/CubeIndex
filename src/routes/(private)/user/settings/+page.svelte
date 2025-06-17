<script lang="ts">
  import { enhance } from "$app/forms";
  import type { PageData } from "./$types";
  import { supabase } from "$lib/supabaseClient.js";

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
  let newPassword = $state("");
  let confirmPassword = $state("");
  let error = $state("");
  let message = $state("");

  function verifySettings() {
    error = "";
    message = "";
  }

  async function sendResetEmail() {
    error = "";
    const {
      data: { user },
      error: err,
    } = await supabase.auth.getUser();
    if (err) {
      error = err.message;
      return;
    }
    if (!user?.email) {
      error = "Unable to determine email";
      return;
    }
    const { error: e } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });
    if (e) {
      error = e.message;
    } else {
      message = "Check your email to reset your password";
    }
  }

  async function updatePassword() {
    error = "";
    message = "";
    if (newPassword.length < 8) {
      error = "Password must be at least 8 characters.";
      return;
    }
    if (newPassword !== confirmPassword) {
      error = "Passwords do not match";
      return;
    }
    const { error: err } = await supabase.auth.updateUser({ password: newPassword });
    if (err) {
      error = err.message;
      return;
    }
    newPassword = "";
    confirmPassword = "";
    message = "Password updated";
  }
</script>

<section class="min-h-screen px-4 py-12 flex items-center justify-center">
  <div class="w-full max-w-3xl space-y-14">
    <h1
      class="text-4xl sm:text-5xl font-clash font-extrabold mb-8 tracking-tight text-primary"
    >
      User Settings
    </h1>

    <form method="POST" use:enhance={verifySettings}>
      <!-- Profile Information -->
      <div class="space-y-6 mt-10 mb-10">
        <div class="flex items-center gap-4">
          <span class="text-2xl">👤</span>
          <h2 class="text-2xl font-bold tracking-tight">Profile Information</h2>
        </div>

        <!-- Avatar URL -->
        <div class="w-full">
          <label class="block text-sm font-semibold mb-2">
            Avatar Image URL
            <input
              type="url"
              name="profile_picture"
              bind:value={profile_picture}
              placeholder="https://example.com/avatar.png"
              class="input w-full"
            />
          </label>
          <p class="text-gray-500 text-xs mt-1">
            Image must be a valid JPG, PNG, or GIF URL.
          </p>
        </div>

        <!-- Banner URL -->
        <div class="w-full">
          <label class="block text-sm font-semibold mb-2">
            Banner Image URL
            <input
              type="url"
              name="banner"
              bind:value={banner}
              placeholder="https://example.com/banner.jpg"
              class="input w-full"
            />
          </label>
          <p class="text-gray-500 text-xs mt-1">
            Optional banner shown at the top of your profile.
          </p>
        </div>

        <!-- Username -->
        <div class="w-full">
          <label class="block text-sm font-semibold mb-2">
            Username
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
          <legend class="fieldset-legend">Bio</legend>
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
          <legend class="fieldset-legend">Profile Privacy</legend>
          <label class="label">
            <input
              type="checkbox"
              name="private_profile"
              bind:checked={private_profile}
              class="checkbox bg-base-100"
            />
            Make my profile private (only visible to me)
          </label>
        </fieldset>
      </div>

      <hr class="border-neutral-700" />

      <!-- Socials -->
      <div class="mt-10 mb-10 space-y-6">
        <div class="flex items-center gap-4">
          <span class="text-2xl">🌐</span>
          <h2 class="text-2xl font-bold tracking-tight">Social Links</h2>
        </div>

        <div class="grid grid-cols-1 gap-6">
          <!-- Website -->
          <div>
            <label class="block text-sm font-semibold mb-2">
              Personal Website
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
          <h2 class="text-2xl font-bold tracking-tight">Account Security</h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-semibold mb-2">
              New Password
              <input type="password" class="input w-full" bind:value={newPassword} />
            </label>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-2">
              Confirm Password
              <input type="password" class="input w-full" bind:value={confirmPassword} />
            </label>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-4">
          <button class="btn btn-primary flex-1" on:click={updatePassword}>
            Update Password
          </button>
          <button class="btn flex-1" type="button" on:click={sendResetEmail}>
            Send Reset Email
          </button>
        </div>
        {#if error}
          <p class="text-sm text-red-500">{error}</p>
        {/if}
        {#if message}
          <p class="text-sm text-green-400">{message}</p>
        {/if}
      </div>

      <div class="flex justify-end pt-6">
        <button type="submit" class="btn btn-primary btn-xl">
          Save Changes
        </button>
      </div>
    </form>
  </div>
</section>
