<script lang="ts">
  import type { PageData } from "./$types";
  import { browser } from "$app/environment";
  import { superForm } from "sveltekit-superforms";
  import { queryParameters } from "sveltekit-search-params";
  import { SsgoiTransition } from "@ssgoi/svelte";
  import { page } from "$app/state";
  import Avatar from "$lib/components/user/avatar.svelte";
  import Markdown from "$lib/components/misc/markdown.svelte";

  // Props & initial state
  let { data }: { data: PageData } = $props();

  const { form, errors, enhance, message, delayed, isTainted } =
    superForm(data.profileForm, {
      invalidateAll: "pessimistic",
      delayMs: 500,
      timeoutMs: 8000,
      clearOnSubmit: "errors-and-message",
    });

  const {
    form: socialForm,
    errors: socialErrors,
    enhance: socialEnhance,
    message: socialMessage,
    delayed: socialDelayed,
    isTainted: socialIsTainted,
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
    isTainted: passwordIsTainted,
  } = superForm(data.passwordForm, {
    invalidateAll: "pessimistic",
    delayMs: 500,
    timeoutMs: 8000,
    clearOnSubmit: "errors-and-message",
    resetForm: true,
  });

  const params = queryParameters();

  // Tabs: 'profile' | 'social' | 'security'
  let tab: "profile" | "social" | "security" | "appearance" | "about" =
    $derived($params.tab ?? "profile");

  type TabId =
    | "profile"
    | "social"
    | "security"
    | "appearance"
    | "about";
  type TabItem = { id: TabId; label: string; icon: string };

  const tabs: TabItem[] = [
    { id: "profile", label: "Profile", icon: "fa-solid fa-user" },
    { id: "social", label: "Social Links", icon: "fa-solid fa-globe" },
    { id: "security", label: "Security", icon: "fa-solid fa-lock" },
    { id: "appearance", label: "Appearance", icon: "fa-solid fa-palette" },
    { id: "about", label: "About", icon: "fa-solid fa-circle-info" },
  ];

  // Avatar preview state
  let avatarPreviewUrl: string | null = $state(null);
  let avatarError: string | null = $state(null);
  let avatarInputEl: HTMLInputElement | null = $state(null);

  function revokeAvatarPreview() {
    if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
  }

  function resetAvatarSelection() {
    revokeAvatarPreview();
    avatarPreviewUrl = null;
    avatarError = null;
    if (avatarInputEl) {
      avatarInputEl.value = "";
    }
  }

  function onAvatarChange(e: Event) {
    avatarError = null;
    const input = e.target as HTMLInputElement;
    const f = input.files?.[0] ?? null;
    if (!f) {
      resetAvatarSelection();
      return;
    }
    // Basic client-side guards (server re-validates + normalizes)
    const allowed = new Set([
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/gif",
    ]);
    const maxBytes = 2 * 1024 * 1024; // 2MB for avatars
    if (!allowed.has(f.type)) {
      avatarError = "Unsupported image type. Use JPG, PNG, WebP, GIF, or AVIF.";
      input.value = "";
      return;
    }
    if (f.size > maxBytes) {
      avatarError = "File too large. Max 2MB.";
      input.value = "";
      return;
    }
    revokeAvatarPreview();
    avatarPreviewUrl = URL.createObjectURL(f);
    $form.profile_picture = avatarPreviewUrl;
  }

  // Banner preview state
  let bannerPreviewUrl: string | null = $state(null);
  let bannerError: string | null = $state(null);
  let bannerInputEl: HTMLInputElement | null = $state(null);

  function revokeBannerPreview() {
    if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl);
  }

  function resetBannerSelection() {
    revokeBannerPreview();
    bannerPreviewUrl = null;
    bannerError = null;
    if (bannerInputEl) {
      bannerInputEl.value = "";
    }
  }

  function onBannerChange(e: Event) {
    bannerError = null;
    const input = e.target as HTMLInputElement;
    const f = input.files?.[0] ?? null;
    if (!f) {
      resetBannerSelection();
      return;
    }
    // Basic client-side guards (server re-validates + normalizes)
    const allowed = new Set([
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/gif",
    ]);
    if (!allowed.has(f.type)) {
      bannerError = "Unsupported image type. Use JPG, PNG, WebP, or AVIF.";
      input.value = "";
      return;
    }
    revokeBannerPreview();
    bannerPreviewUrl = URL.createObjectURL(f);
    $form.banner = bannerPreviewUrl;
  }

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

  /** Apply system color scheme if enabled */
  function applySystemTheme() {
    if (!browser) return;
    document.documentElement.dataset.system = useSystemTheme ? "true" : "false";
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const next = prefersDark ? "dark" : "light";
    selectedTheme = next;
    applyTheme(next);
  }

  // ---------- on-change handlers ----------
  function onThemeChange(e: Event) {
    selectedTheme = (e.target as HTMLSelectElement).value;
    applyTheme(selectedTheme);
    localStorage.setItem("theme", selectedTheme);
    // Switch to manual mode when user picks a theme explicitly
    localStorage.setItem("themeMode", "manual");
    useSystemTheme = false;
  }

  // Initialize preference and apply theme
  if (browser) {
    const mode = localStorage.getItem("themeMode");
    if (mode === "system") {
      useSystemTheme = true;
      // Ensure manual override is cleared
      localStorage.removeItem("theme");
      applySystemTheme();
    } else {
      useSystemTheme = false;
      const saved = localStorage.getItem("theme");
      if (saved) {
        selectedTheme = saved;
        applyTheme(saved);
      } else {
        // Default manual theme when nothing selected
        // svelte-ignore state_referenced_locally
        applyTheme(selectedTheme);
      }
    }
  }

  // Respect system theme when toggled on
  $effect(() => {
    if (!browser) return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    function handle() {
      if (useSystemTheme) applySystemTheme();
    }
    if (useSystemTheme) {
      // Clear manual override and sync with system
      localStorage.removeItem("theme");
      applySystemTheme();
      mql.addEventListener("change", handle);
    }
    return () => mql.removeEventListener("change", handle);
  });

  // Persist mode changes and keep attributes tidy
  $effect(() => {
    if (!browser) return;
    if (useSystemTheme) {
      localStorage.setItem("themeMode", "system");
      localStorage.removeItem("theme");
      applySystemTheme();
    } else {
      localStorage.setItem("themeMode", "manual");
      // Keep current selected theme applied
      applyTheme(selectedTheme);
    }
  });

  let dirty: boolean = $derived(isTainted());
  let socialDirty: boolean = $derived(socialIsTainted());
  let passwordDirty: boolean = $derived(passwordIsTainted());
</script>

<svelte:head>
  <title>
    {tab.charAt(0).toUpperCase() + tab.slice(1)} Settings - CubeIndex
  </title>
</svelte:head>

<SsgoiTransition id={page.url.pathname}>
  <section class="px-4 py-8 min-h-screen">
    <div class="max-w-6xl mx-auto">
      <div class="mb-6">
        <h1 class="text-3xl sm:text-4xl font-clash text-primary">
          User Settings
        </h1>
        <p class="text-sm opacity-70 mt-1">
          Manage your profile, links, security, and theme.
        </p>
      </div>

      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Sidebar -->
        <aside class="lg:w-72 lg:flex-shrink-0 max-w-fit">
          <div
            class="card bg-base-200/70 backdrop-blur border border-base-300 shadow-sm rounded-xl sticky top-24"
          >
            <nav class="card-body p-2 sm:p-3">
              <ul class="menu menu-vertical gap-1 rounded-lg">
                {#each tabs as it (it.id)}
                  <li>
                    <button
                      class="group relative w-full justify-start flex gap-3 px-3 py-2 rounded-lg
               text-sm font-medium text-base-content/90
               hover:bg-base-300/60 active:bg-base-300
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100
               transition-colors duration-150
               aria-[current=page]:bg-primary/10 aria-[current=page]:text-primary"
                      class:active={tab === it.id}
                      onclick={() => {
                        tab = it.id;
                        $params.tab = it.id;
                      }}
                      aria-current={tab === it.id ? "page" : undefined}
                    >
                      <i
                        class={`${it.icon} text-base opacity-80 group-hover:opacity-100`}
                      ></i>
                      <span class="truncate">{it.label}</span>
                    </button>
                  </li>
                {/each}
              </ul>
            </nav>
          </div>
        </aside>

        <!-- Right Content -->
        <div class="flex-1 space-y-8 min-h-screen">
          <div class="card bg-base-100 shadow-sm">
            {#if tab === "profile"}
              <!-- Profile Information -->
              <div class="card-body">
                <h2 class="card-title">Profile Information</h2>
                <p class="text-sm opacity-70">
                  Update your public profile details. Your bio supports Markdown
                  formatting (bold, italics, links, lists, and code). See quick
                  tips below.
                </p>
                <form
                  action="?/profile"
                  method="POST"
                  class="mt-4 space-y-6"
                  use:enhance
                  enctype="multipart/form-data"
                  aria-live="polite"
                >
                  <!-- Username -->
                  <div class="form-control w-full">
                    <label class="label" for="display_name">
                      <span class="label-text font-semibold">Display Name</span>
                    </label>
                    <input
                      id="display_name"
                      type="text"
                      name="display_name"
                      bind:value={$form.display_name}
                      class="input input-bordered w-full"
                    />
                  </div>
                  {#if $errors.display_name}
                    <p class="text-error">{$errors.display_name}</p>
                  {/if}

                  <!-- Bio -->
                  <fieldset class="fieldset">
                    <legend class="block text-sm font-semibold">Bio</legend>
                    <div class="flex flex-col sm:flex-row gap-4">
                      <textarea
                        bind:value={$form.bio}
                        name="bio"
                        placeholder="Tell us something cool... Markdown is supported"
                        class="textarea textarea-bordered w-full flex-1"
                        rows="6"
                      ></textarea>
                      <div class="flex-1">
                        <div class="text-xs opacity-60 mb-1">Live Preview</div>
                        <div
                          class="card !bg-base-200 p-4 rounded-2xl max-h-96 overflow-auto markdown-body !text-base-content"
                        >
                          <Markdown text={$form.bio} />
                        </div>
                      </div>
                    </div>
                    {#if $errors.bio}
                      <p class="text-error">{$errors.bio}</p>
                    {/if}
                    <div class="mt-3">
                      <div class="text-xs opacity-70 font-semibold mb-1">
                        Markdown basics
                      </div>
                      <ul
                        class="list-disc list-inside text-xs opacity-70 space-y-1"
                      >
                        <li>
                          Headings: <code># Title</code>,
                          <code>## Section</code>
                        </li>
                        <li>
                          Bold/Italic: <code>**bold**</code>,
                          <code>*italic*</code>
                        </li>
                        <li>
                          Links: <code>[text](https://example.com)</code>
                        </li>
                        <li>
                          Lists: <code>- item</code> (use one line per item)
                        </li>
                        <li>
                          Code: <code>`inline`</code> or fenced blocks with three
                          backticks
                        </li>
                        <li>Paragraphs: leave a blank line between them</li>
                      </ul>
                    </div>
                  </fieldset>

                  <!-- Avatar -->
                  <fieldset class="fieldset">
                    <legend class="block text-sm font-semibold">Avatar</legend>
                    <div class="flex items-start gap-6">
                      <Avatar
                        profile={{
                          display_name: $form.display_name,
                          profile_picture:
                            avatarPreviewUrl ??
                            ($form.profile_picture as string | null) ??
                            null,
                        }}
                        imgSize="size-24 sm:size-32"
                        textSize="text-5xl"
                      />
                      <div class="flex-1 space-y-2">
                        <label
                          class="block text-sm font-semibold"
                          for="profile_picture">Upload new avatar</label
                        >
                        <input
                          id="profile_picture"
                          name="profile_picture"
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          class="file-input w-full max-w-xs"
                          onchange={onAvatarChange}
                          bind:this={avatarInputEl}
                        />
                        <p class="text-xs opacity-70">
                          Supported: JPG, PNG, WebP, AVIF. Max size 2MB.
                        </p>
                        {#if avatarError}
                          <p class="text-error">{avatarError}</p>
                        {/if}
                      </div>
                    </div>
                  </fieldset>

                  <!-- Banner -->
                  <fieldset class="fieldset mt-4">
                    <legend class="block text-sm font-semibold">Banner</legend>
                    <div class="flex items-start gap-6">
                      <div class="w-full max-w-xl">
                        <div
                          class="rounded-xl border border-base-300 overflow-hidden w-full h-24 bg-base-200"
                        >
                          {#if bannerPreviewUrl}
                            <img
                              src={bannerPreviewUrl}
                              alt="Banner preview"
                              class="w-full h-full object-cover"
                            />
                          {:else if $form.banner}
                            <img
                              src={$form.banner}
                              alt="Current banner"
                              class="w-full h-full object-cover"
                            />
                          {:else}
                            <div
                              class="w-full h-full bg-gradient-to-tr from-primary via-secondary to-neutral"
                            ></div>
                          {/if}
                        </div>
                      </div>
                      <div class="flex-1 space-y-2">
                        <label class="block text-sm font-semibold" for="banner"
                          >Upload new banner</label
                        >
                        <input
                          id="banner"
                          name="banner"
                          type="file"
                          accept="image/*"
                          class="file-input w-full max-w-xs"
                          onchange={onBannerChange}
                          bind:this={bannerInputEl}
                        />
                        <p class="text-xs opacity-70">
                          Supported: JPG, PNG, WebP, GIF, AVIF. Max size 5MB.
                        </p>
                        {#if bannerError}
                          <p class="text-error">{bannerError}</p>
                        {/if}
                      </div>
                    </div>
                  </fieldset>

                  <fieldset
                    class="fieldset bg-base-200 border-base-100 rounded-box w-full border p-4"
                  >
                    <legend class="fieldset-legend">Profile Privacy</legend>
                    <label class="label cursor-pointer justify-start gap-3">
                      <input
                        type="checkbox"
                        name="private_profile"
                        bind:checked={$form.private_profile}
                        class="toggle bg-base-100"
                      />
                      <span class="label-text"
                        >Make my profile private (only visible to me)</span
                      >
                    </label>
                    {#if $errors.private_profile}
                      <p class="text-error">{$errors.private_profile}</p>
                    {/if}
                  </fieldset>

                  {#if $message}
                    <div class="alert alert-success">
                      <i class="fa-solid fa-check"></i>
                      <span>{$message}</span>
                    </div>
                  {/if}

                  <div class="flex justify-end">
                    <button
                      class="btn btn-primary btn-lg"
                      type="submit"
                      disabled={!dirty}
                    >
                      {#if $delayed}
                        <span class="loading loading-spinner"></span>
                        Saving...
                      {:else}
                        Save Changes
                      {/if}
                    </button>
                  </div>
                </form>
              </div>
            {:else if tab === "social"}
              <!-- Social Links -->
              <div class="card-body">
                <h2 class="card-title">Social Links</h2>
                <p class="text-sm opacity-70">
                  Share where people can find you online.
                </p>

                <form
                  class="mt-4 grid grid-cols-1 gap-6"
                  action="?/socials"
                  method="POST"
                  use:socialEnhance
                  aria-live="polite"
                >
                  <!-- Website -->
                  <label class="form-control w-full">
                    <span class="label">
                      <span class="label-text font-semibold"
                        ><i class="fa-solid fa-globe"></i> Personal Website</span
                      >
                    </span>
                    <input
                      type="text"
                      class="input input-bordered w-full"
                      name="website"
                      bind:value={$socialForm.website}
                      placeholder="https://cubeindex.com"
                    />
                    {#if $socialErrors.website}
                      <p class="text-error">{$socialErrors.website}</p>
                    {/if}
                  </label>

                  <!-- Twitter/X -->
                  <label class="form-control w-full">
                    <i class="fa-brands fa-x-twitter"></i> Twitter/X
                    <label class="input input-bordered w-full">
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
                  <label class="form-control w-full">
                    WCA ID
                    <label class="input input-bordered w-full">
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
                  <label class="form-control w-full">
                    <i class="fa-brands fa-discord"></i> Discord
                    <label class="input input-bordered w-full">
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
                  <label class="form-control w-full">
                    <i class="fa-brands fa-youtube"></i> YouTube
                    <label class="input input-bordered w-full">
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
                  <label class="form-control w-full">
                    <i class="fa-brands fa-reddit-alien"></i> Reddit
                    <label class="input input-bordered w-full">
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

                  {#if $socialMessage}
                    <div class="alert alert-success">
                      <i class="fa-solid fa-check"></i>
                      <span>{$socialMessage}</span>
                    </div>
                  {/if}

                  <div class="flex justify-end">
                    <button
                      class="btn btn-primary btn-lg"
                      type="submit"
                      disabled={!socialDirty}
                    >
                      {#if $socialDelayed}
                        <span class="loading loading-spinner"></span>
                        Saving...
                      {:else}
                        Save Changes
                      {/if}
                    </button>
                  </div>
                </form>
              </div>
            {:else if tab === "security"}
              <!-- Account Security -->
              <div class="card-body">
                <h2 class="card-title">Account Security</h2>
                <p class="text-sm opacity-70">
                  Change your password. Keep it unique and strong.
                </p>

                <form
                  class="mt-4 flex flex-col gap-6"
                  action="?/password"
                  method="POST"
                  use:passwordEnhance
                  aria-live="polite"
                >
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                    <label class="form-control w-full">
                      <span class="label"
                        ><span class="label-text font-semibold"
                          >Current Password</span
                        ></span
                      >
                      <input
                        type="password"
                        name="currentPassword"
                        bind:value={$passwordForm.currentPassword}
                        class="input input-bordered w-full"
                      />
                      {#if $passwordErrors.currentPassword}
                        <p class="text-error">
                          {$passwordErrors.currentPassword}
                        </p>
                      {/if}
                    </label>

                    <label class="form-control w-full">
                      <span class="label"
                        ><span class="label-text font-semibold"
                          >New Password</span
                        ></span
                      >
                      <input
                        type="password"
                        name="newPassword"
                        bind:value={$passwordForm.newPassword}
                        class="input input-bordered w-full"
                      />
                      {#if $passwordErrors.newPassword}
                        <p class="text-error">{$passwordErrors.newPassword}</p>
                      {/if}
                    </label>
                  </div>

                  {#if $passwordMessage}
                    <div class="alert alert-success">
                      <i class="fa-solid fa-check"></i>
                      <span>{$passwordMessage}</span>
                    </div>
                  {/if}

                  <div class="flex justify-end">
                    <button
                      class="btn btn-primary btn-lg"
                      type="submit"
                      disabled={!passwordDirty}
                    >
                      {#if $passwordDelayed}
                        <span class="loading loading-spinner"></span>
                        Updating...
                      {:else}
                        Update Password
                      {/if}
                    </button>
                  </div>
                </form>
              </div>
            {:else if tab === "appearance"}
              <div class="card bg-base-100 shadow-sm">
                <div class="card-body space-y-6">
                  <div class="flex items-center justify-between">
                    <div>
                      <h2 class="card-title">Appearance</h2>
                      <p class="text-sm opacity-70">
                        Choose a theme you like. You can also follow your
                        system.
                      </p>
                    </div>
                    <label class="label cursor-pointer gap-3">
                      <span class="label-text">Use system theme</span>
                      <input
                        type="checkbox"
                        class="toggle bg-base-100"
                        bind:checked={useSystemTheme}
                      />
                    </label>
                  </div>

                  <!-- Theme picker -->
                  <div>
                    <p class="font-bold mb-2">Light:</p>
                    <div
                      class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                    >
                      {#each lightThemes as t (t)}
                        <label
                          data-theme={t}
                          class="cursor-pointer rounded-2xl"
                        >
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
                            class="card bg-base-100 transition-all hover:shadow"
                            class:ring-2={selectedTheme === t}
                            class:ring-primary={selectedTheme === t}
                          >
                            <div class="card-body p-3 items-center">
                              <!-- DaisyUI “icon”: four live colour chips -->
                              <div
                                class="grid grid-cols-2 sm:grid-cols-4 gap-1 mb-2"
                              >
                                <span class="w-4 h-4 rounded bg-primary"></span>
                                <span class="w-4 h-4 rounded bg-secondary"
                                ></span>
                                <span class="w-4 h-4 rounded bg-accent"></span>
                                <span class="w-4 h-4 rounded bg-neutral"></span>
                              </div>
                              <span class="text-sm font-medium capitalize"
                                >{t}</span
                              >
                            </div>
                          </div>
                        </label>
                      {/each}
                    </div>
                  </div>

                  <div>
                    <p class="font-bold mb-2">Dark:</p>
                    <div
                      class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                    >
                      {#each darkThemes as t (t)}
                        <label
                          data-theme={t}
                          class="cursor-pointer rounded-2xl"
                        >
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
                            class="card bg-base-100 transition-all hover:shadow"
                            class:ring-2={selectedTheme === t}
                            class:ring-primary={selectedTheme === t}
                          >
                            <div class="card-body p-3 items-center">
                              <!-- DaisyUI “icon”: four live colour chips -->
                              <div
                                class="grid grid-cols-2 sm:grid-cols-4 gap-1 mb-2"
                              >
                                <span class="w-4 h-4 rounded bg-primary"></span>
                                <span class="w-4 h-4 rounded bg-secondary"
                                ></span>
                                <span class="w-4 h-4 rounded bg-accent"></span>
                                <span class="w-4 h-4 rounded bg-neutral"></span>
                              </div>
                              <span class="text-sm font-medium capitalize"
                                >{t}</span
                              >
                            </div>
                          </div>
                        </label>
                      {/each}
                    </div>
                  </div>
                </div>
              </div>
            {:else}
              <div class="card bg-base-100 shadow-sm">
                <div class="card-body space-y-6">
                  <div class="flex flex-col gap-2">
                    <div class="flex items-center gap-3">
                      <div
                        class="btn btn-ghost btn-circle btn-sm text-primary bg-primary/10"
                        aria-hidden="true"
                      >
                        <i class="fa-solid fa-cube"></i>
                      </div>
                      <div>
                        <h2 class="card-title">About CubeIndex</h2>
                        <p class="text-sm opacity-70">
                          CubeIndex is open source and released under the
                          Apache License 2.0. You can review the codebase, open
                          issues, or contribute improvements on GitHub.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="rounded-2xl bg-base-200/60 p-4 border border-base-300 space-y-3">
                      <div class="flex items-center gap-2 text-primary font-semibold">
                        <i class="fa-solid fa-code-branch"></i>
                        <span>Open source</span>
                      </div>
                      <div class="space-y-2 text-sm opacity-80">
                        <p>
                          CubeIndex is licensed under the Apache License 2.0
                          and welcomes community contributions.
                        </p>
                        <p class="flex items-start gap-2">
                          <i class="fa-brands fa-github mt-0.5 text-base-content/70"></i>
                          <span>
                            View the code, star the project, or file issues on
                            <a
                              class="link link-primary"
                              href="https://github.com/cubeindex-project/CubeIndex"
                              target="_blank"
                              rel="noreferrer"
                              >GitHub</a
                            >.
                          </span>
                        </p>
                      </div>
                    </div>

                    <div class="rounded-2xl bg-base-200/60 p-4 border border-base-300 space-y-3">
                      <div class="flex items-center gap-2 text-primary font-semibold">
                        <i class="fa-solid fa-shield-heart"></i>
                        <span>Privacy & support</span>
                      </div>
                      <div class="space-y-2 text-sm opacity-80">
                        <p>
                          You control who sees your profile. Set it to private
                          anytime from the Profile tab to keep your information
                          visible only to you.
                        </p>
                        <p class="flex items-start gap-2">
                          <i class="fa-solid fa-envelope mt-0.5 text-base-content/70"></i>
                          <span
                            >Need help or spotted an issue? Reach out at
                            <a
                              class="link link-primary"
                              href="mailto:support@cubeindex.com"
                              >support@cubeindex.com</a
                            >.</span
                          >
                        </p>
                        <p>
                          We regularly update CubeIndex to improve stability,
                          performance, and accessibility for every cuber.
                        </p>
                      </div>
                    </div>

                    <div class="rounded-2xl bg-base-200/60 p-4 border border-base-300 space-y-3">
                      <div class="flex items-center gap-2 text-primary font-semibold">
                        <i class="fa-solid fa-link"></i>
                        <span>Helpful links</span>
                      </div>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm opacity-80">
                        <div class="space-y-1">
                          <a class="link link-primary" href="/">Home</a>
                          <a class="link link-primary" href="/explore">Explore</a>
                          <a class="link link-primary" href="/achievements">Achievements</a>
                          <a class="link link-primary" href="/report">Report</a>
                          <a
                            class="link link-primary"
                            href="/discord"
                            rel="noreferrer"
                            target="_blank"
                            >Discord</a
                          >
                        </div>
                        <div class="space-y-1">
                          <a
                            class="link link-primary"
                            href="https://github.com/cubeindex-project/CubeIndex"
                            rel="noreferrer"
                            target="_blank"
                            >GitHub</a
                          >
                          <a
                            class="link link-primary"
                            href="https://twitter.com/thecubeindex"
                            rel="noreferrer"
                            target="_blank"
                            >Twitter</a
                          >
                          <a
                            class="link link-primary"
                            href="https://www.youtube.com/@cubeindex"
                            rel="noreferrer"
                            target="_blank"
                            >Youtube</a
                          >
                          <a class="link link-primary" href="mailto:thecubeindex@gmail.com">Email</a>
                          <a class="link link-primary" href="/tos">Terms of Service</a>
                          <a class="link link-primary" href="/privacy">Privacy Policy</a>
                          <a class="link link-primary" href="/sitemap.xml">Sitemap</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </section>
</SsgoiTransition>
