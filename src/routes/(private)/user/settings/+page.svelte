<script lang="ts">
  import type { PageData } from "./$types";
  import { browser } from "$app/environment";
  import { superForm } from "sveltekit-superforms";
  import { queryParameters } from "sveltekit-search-params";
  import { SsgoiTransition } from "@ssgoi/svelte";
  import { page } from "$app/state";
  import Avatar from "$lib/components/user/avatar.svelte";

  // Props & initial state
  let { data }: { data: PageData } = $props();

  const { form, errors, enhance, message, delayed } = superForm(
    data.profileForm,
    {
      invalidateAll: "pessimistic",
      delayMs: 500,
      timeoutMs: 8000,
      clearOnSubmit: "errors-and-message",
    }
  );

  const {
    form: socialForm,
    errors: socialErrors,
    enhance: socialEnhance,
    message: socialMessage,
    delayed: socialDelayed,
  } = superForm(data.socialForm, {
    invalidateAll: "pessimistic",
    delayMs: 500,
    timeoutMs: 8000,
    clearOnSubmit: "errors-and-message",
  });

  const {
    form: passwordForm,
    errors: passwordErrors,
    enhance: passwordEnhance,
    message: passwordMessage,
    delayed: passwordDelayed,
  } = superForm(data.passwordForm, {
    invalidateAll: "pessimistic",
    delayMs: 500,
    timeoutMs: 8000,
    clearOnSubmit: "errors-and-message",
    resetForm: true,
  });

  const params = queryParameters();

  // Tabs: 'profile' | 'social' | 'security'
  let tab: "profile" | "social" | "security" | "appearance" = $state(
    $params.tab ?? "profile"
  );

  const lightThemes = [
    "light",
    "lofi",
    "lemonade",
    "winter",
    "valentine",
    "autumn",
    "caramellatte",
    "cyberpunk",
    "acid",
    "garden",
    "corporate",
    "pastel",
  ];

  const darkThemes = [
    "dark",
    "black",
    "synthwave",
    "forest",
    "luxury",
    "aqua",
    "night",
    "sunset",
    "abyss",
    "coffee",
    "dim",
    "halloween",
  ];

  let selectedTheme = $state("light");
  let useSystemTheme = $state(false);

  // ---------- helpers ----------
  const applyTheme = (theme: string) =>
    (document.documentElement.dataset.theme = theme);

  // ---------- on-change handlers ----------
  function onThemeChange(e: Event) {
    selectedTheme = (e.target as HTMLSelectElement).value;
    applyTheme(selectedTheme);
    localStorage.setItem("theme", selectedTheme);
    useSystemTheme = false;
  }

  if (browser) {
    const saved = localStorage.getItem("theme");

    if (saved) {
      selectedTheme = saved;
      applyTheme(saved);
    }
  }
</script>

<SsgoiTransition id={page.url.pathname}>
  <section class="min-h-screen mx-64 my-8">
    <h1 class="text-4xl font-clash text-primary mb-6">User Settings</h1>

    <div class="flex flex-col lg:flex-row gap-6">
      <ul
        class="menu menu-horizontal lg:menu-vertical bg-base-200 rounded-2xl lg:min-h-screen w-full lg:w-fit p-4 gap-5 flex-row flex overflow-scroll sm:overflow-hidden"
      >
        <li>
          <button
            class="tab tab-lg justify-start flex gap-2"
            class:menu-active={tab === "profile"}
            onclick={() => {
              tab = "profile";
              $params.tab = "profile";
            }}
          >
            <i class="fa-solid fa-user"></i>
            Profile
          </button>
        </li>
        <li>
          <button
            class="tab tab-lg justify-start flex gap-2"
            class:menu-active={tab === "social"}
            onclick={() => {
              tab = "social";
              $params.tab = "social";
            }}
          >
            <i class="fa-solid fa-globe"></i>
            Social Links
          </button>
        </li>
        <li>
          <button
            class="tab tab-lg justify-start flex gap-2"
            class:menu-active={tab === "security"}
            onclick={() => {
              tab = "security";
              $params.tab = "security";
            }}
          >
            <i class="fa-solid fa-lock"></i>
            Security
          </button>
        </li>
        <li>
          <button
            class="tab tab-lg justify-start flex gap-2"
            class:menu-active={tab === "appearance"}
            onclick={() => {
              tab = "appearance";
              $params.tab = "appearance";
            }}
          >
            <i class="fa-solid fa-palette"></i>
            Appearance
          </button>
        </li>
      </ul>

      <!-- Right Content -->
      <div class="flex-1 space-y-10">
        {#if tab === "profile"}
          <!-- Profile Information -->
          <div class="space-y-6">
            <h2 class="text-2xl font-bold">Profile Information</h2>
            <form
              action="?/profile"
              method="POST"
              class="space-y-6"
              use:enhance
            >
              <!-- Username -->
              <div class="w-full">
                <label class="block text-sm font-semibold mb-2">
                  Display Name
                  <input
                    type="text"
                    name="username"
                    bind:value={$form.display_name}
                    class="input w-full"
                  />
                </label>
                {#if $errors.display_name}
                  <p class="text-error">{$errors.display_name}</p>
                {/if}
              </div>

              <!-- Bio -->
              <fieldset class="fieldset">
                <legend class="block text-sm font-semibold">Bio</legend>
                <textarea
                  class="textarea h-24 w-full max-h-50"
                  name="bio"
                  bind:value={$form.bio}
                  placeholder="Tell us something cool..."
                ></textarea>
                {#if $errors.bio}
                  <p class="text-error">{$errors.bio}</p>
                {/if}
              </fieldset>

              <Avatar
                profile={{
                  display_name: $form.display_name,
                  profile_picture: $form.profile_picture
                    ? $form.profile_picture
                    : null,
                }}
                size="lg"
              />

              <!-- Avatar URL -->
              <div class="w-full">
                <label class="block text-sm font-semibold mb-2">
                  Avatar Image URL
                  <input
                    type="url"
                    name="profile_picture"
                    bind:value={$form.profile_picture}
                    placeholder="https://example.com/avatar.png"
                    class="input w-full"
                  />
                </label>
                <p class="text-gray-500 text-xs mt-1">
                  Image must be a valid JPG, PNG, or GIF URL.
                </p>
                {#if $errors.profile_picture}
                  <p class="text-error">{$errors.profile_picture}</p>
                {/if}
              </div>

              {#if $form.banner}
                <div
                  class="relative h-48 w-full sm:h-72 md:h-80 overflow-hidden rounded-2xl"
                >
                  <img
                    src={$form.banner}
                    alt="{$form.display_name}'s banner"
                    class="w-full h-full object-cover object-center transition-transform duration-300"
                    loading="lazy"
                  />
                  <div class="absolute inset-0 pointer-events-none"></div>
                </div>
              {:else}
                <div
                  class="relative w-full h-44 sm:h-56 bg-gradient-to-tr from-primary via-secondary to-neutral"
                ></div>
              {/if}

              <!-- Banner URL -->
              <div class="w-full">
                <label class="block text-sm font-semibold mb-2">
                  Banner Image URL
                  <input
                    type="url"
                    name="banner"
                    bind:value={$form.banner}
                    placeholder="https://example.com/banner.jpg"
                    class="input w-full"
                  />
                </label>
                <p class="text-gray-500 text-xs mt-1">
                  Optional banner shown at the top of your profile.
                </p>
                {#if $errors.banner}
                  <p class="text-error">{$errors.banner}</p>
                {/if}
              </div>

              <fieldset
                class="fieldset bg-base-200 border-base-100 rounded-box w-fit border p-4"
              >
                <legend class="fieldset-legend">Profile Privacy</legend>
                <label class="label">
                  <input
                    type="checkbox"
                    name="private_profile"
                    bind:checked={$form.private_profile}
                    class="checkbox bg-base-100"
                  />
                  Make my profile private (only visible to me)
                </label>
                {#if $errors.private_profile}
                  <p class="text-error">{$errors.private_profile}</p>
                {/if}
              </fieldset>

              <div class="flex justify-end">
                <button class="btn btn-primary btn-lg" type="submit">
                  {#if $delayed}
                    <span class="loading loading-spinner"></span>
                    Saving...
                  {:else if $message}
                    <i class="fa-solid fa-check"></i>
                    {$message}
                  {:else}
                    Save Changes
                  {/if}
                </button>
              </div>
            </form>
          </div>
        {:else if tab === "social"}
          <!-- Social Links -->
          <div class="space-y-6">
            <h2 class="text-2xl font-bold">Social Links</h2>

            <form
              class="grid grid-cols-1 gap-6"
              action="?/socials"
              method="POST"
              use:socialEnhance
            >
              <!-- Website -->
              <label class="block font-semibold mb-2">
                <i class="fa-solid fa-globe"></i> Personal Website
                <input
                  type="text"
                  class="input w-full"
                  name="website"
                  bind:value={$socialForm.website}
                  placeholder="https://cubeindex.com"
                />
                {#if $socialErrors.website}
                  <p class="text-error">{$socialErrors.website}</p>
                {/if}
              </label>

              <!-- Twitter/X -->
              <label class="block font-semibold mb-2">
                <i class="fa-brands fa-x-twitter"></i> Twitter/X
                <label class="input w-full">
                  <span class="hidden sm:flex">x.com/</span>
                  <input
                    type="text"
                    class="grow input-ghost"
                    name="x"
                    bind:value={$socialForm.x}
                    placeholder="thecubeindex"
                  />
                </label>
                {#if $socialErrors.x}
                  <p class="text-error">{$socialErrors.x}</p>
                {/if}
              </label>

              <!-- WCA -->
              <label class="block font-semibold mb-2">
                WCA ID
                <label class="input w-full">
                  <span class="hidden sm:flex">
                    worldcubeassociation.org/persons/
                  </span>
                  <input
                    type="text"
                    class="grow input-ghost"
                    name="wca"
                    bind:value={$socialForm.wca}
                    placeholder="2023EXAM01"
                  />
                </label>
                {#if $socialErrors.wca}
                  <p class="text-error">{$socialErrors.wca}</p>
                {/if}
              </label>

              <!-- Discord -->
              <label class="block font-semibold mb-2">
                <i class="fa-brands fa-discord"></i> Discord
                <label class="input w-full">
                  <span class="hidden sm:flex">discord.com/users/</span>
                  <input
                    type="text"
                    class="grow input-ghost"
                    name="discord"
                    bind:value={$socialForm.discord}
                    placeholder="123456789012345678"
                  />
                </label>
                {#if $socialErrors.discord}
                  <p class="text-error">{$socialErrors.discord}</p>
                {/if}
              </label>

              <!-- YouTube -->
              <label class="block font-semibold mb-2">
                <i class="fa-brands fa-youtube"></i> YouTube
                <label class="input w-full">
                  <span class="hidden sm:flex">youtube.com/</span>
                  <input
                    type="text"
                    class="grow input-ghost"
                    name="youtube"
                    bind:value={$socialForm.youtube}
                    placeholder="@cubeindex"
                  />
                </label>
                {#if $socialErrors.youtube}
                  <p class="text-error">{$socialErrors.youtube}</p>
                {/if}
              </label>

              <!-- Reddit -->
              <label class="block font-semibold mb-2">
                <i class="fa-brands fa-reddit-alien"></i> Reddit
                <label class="input w-full">
                  <span class="hidden sm:flex">reddit.com/u/</span>
                  <input
                    type="text"
                    class="grow input-ghost"
                    name="reddit"
                    bind:value={$socialForm.reddit}
                    placeholder="cubeindex"
                  />
                </label>
                {#if $socialErrors.reddit}
                  <p class="text-error">{$socialErrors.reddit}</p>
                {/if}
              </label>

              <div class="flex justify-end">
                <button class="btn btn-primary btn-lg" type="submit">
                  {#if $socialDelayed}
                    <span class="loading loading-spinner"></span>
                    Saving...
                  {:else if $socialMessage}
                    <i class="fa-solid fa-check"></i>
                    {$socialMessage}
                  {:else}
                    Save Changes
                  {/if}
                </button>
              </div>
            </form>
          </div>
        {:else if tab === "security"}
          <!-- Account Security -->
          <div class="space-y-6">
            <h2 class="text-2xl font-bold">Account Security</h2>

            <form
              class="flex flex-col gap-6"
              action="?/password"
              method="POST"
              use:passwordEnhance
            >
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                <label class="block text-sm font-semibold mb-2">
                  Current Password
                  <input
                    type="password"
                    name="currentPassword"
                    bind:value={$passwordForm.currentPassword}
                    class="input w-full"
                  />
                  {#if $passwordErrors.currentPassword}
                    <p class="text-error">{$passwordErrors.currentPassword}</p>
                  {/if}
                </label>

                <label class="block text-sm font-semibold mb-2">
                  New Password
                  <input
                    type="password"
                    name="newPassword"
                    bind:value={$passwordForm.newPassword}
                    class="input w-full"
                  />
                  {#if $passwordErrors.newPassword}
                    <p class="text-error">{$passwordErrors.newPassword}</p>
                  {/if}
                </label>
              </div>

              <div class="flex justify-end">
                <button class="btn btn-primary btn-lg" type="submit">
                  {#if $passwordDelayed}
                    <span class="loading loading-spinner"></span>
                    Updating...
                  {:else if $passwordMessage}
                    <i class="fa-solid fa-check"></i>
                    {$passwordMessage}
                  {:else}
                    Update Password
                  {/if}
                </button>
              </div>
            </form>
          </div>
        {:else}
          <div class="space-y-8">
            <h2 class="text-2xl font-bold">Appearance</h2>

            <!-- Theme picker -->
            <div>
              <p class="font-bold mb-2">Light:</p>
              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {#each lightThemes as t}
                  <label data-theme={t} class="cursor-pointer rounded-2xl">
                    <!-- hidden radio acts as theme-controller -->
                    <input
                      type="radio"
                      name="theme"
                      class="theme-controller hidden"
                      value={t}
                      bind:group={selectedTheme}
                      onchange={onThemeChange}
                      disabled={useSystemTheme}
                    />

                    <!-- the card itself -->
                    <div
                      class="card bg-base-100 transition-all"
                      class:ring-2={selectedTheme === t}
                      class:ring-primary={selectedTheme === t}
                    >
                      <div class="card-body p-3 items-center">
                        <!-- DaisyUI “icon”: four live colour chips -->
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-1 mb-2">
                          <span class="w-4 h-4 rounded bg-primary"></span>
                          <span class="w-4 h-4 rounded bg-secondary"></span>
                          <span class="w-4 h-4 rounded bg-accent"></span>
                          <span class="w-4 h-4 rounded bg-neutral"></span>
                        </div>
                        <span class="text-sm font-medium capitalize">{t}</span>
                      </div>
                    </div>
                  </label>
                {/each}
              </div>
            </div>

            <div>
              <p class="font-bold mb-2">Dark:</p>
              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {#each darkThemes as t}
                  <label data-theme={t} class="cursor-pointer rounded-2xl">
                    <!-- hidden radio acts as theme-controller -->
                    <input
                      type="radio"
                      name="theme"
                      class="theme-controller hidden"
                      value={t}
                      bind:group={selectedTheme}
                      onchange={onThemeChange}
                      disabled={useSystemTheme}
                    />

                    <!-- the card itself -->
                    <div
                      class="card bg-base-100 transition-all"
                      class:ring-2={selectedTheme === t}
                      class:ring-primary={selectedTheme === t}
                    >
                      <div class="card-body p-3 items-center">
                        <!-- DaisyUI “icon”: four live colour chips -->
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-1 mb-2">
                          <span class="w-4 h-4 rounded bg-primary"></span>
                          <span class="w-4 h-4 rounded bg-secondary"></span>
                          <span class="w-4 h-4 rounded bg-accent"></span>
                          <span class="w-4 h-4 rounded bg-neutral"></span>
                        </div>
                        <span class="text-sm font-medium capitalize">{t}</span>
                      </div>
                    </div>
                  </label>
                {/each}
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </section>
</SsgoiTransition>
