<script lang="ts">
  import type { PageData } from "./$types";
  import { browser } from "$app/environment";
  import { superForm } from "sveltekit-superforms";
  import { queryParameters } from "sveltekit-search-params";
  import Avatar from "$lib/components/user/avatar.svelte";
  import Markdown from "$lib/components/misc/markdown.svelte";
  import { m } from "$lib/paraglide/messages";

  // Props & initial state
  let { data }: { data: PageData } = $props();

  const { form, errors, enhance, message, delayed, isTainted } = superForm(
    data.profileForm,
    {
      invalidateAll: "pessimistic",
      delayMs: 500,
      timeoutMs: 8000,
      clearOnSubmit: "errors-and-message",
    },
  );

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

  type TabId = "profile" | "social" | "security" | "appearance" | "about";
  type TabItem = { id: TabId; icon: string };

  const tabs: TabItem[] = [
    { id: "profile", icon: "fa-solid fa-user" },
    { id: "social", icon: "fa-solid fa-globe" },
    { id: "security", icon: "fa-solid fa-lock" },
    { id: "appearance", icon: "fa-solid fa-palette" },
    { id: "about", icon: "fa-solid fa-circle-info" },
  ];
  const tabLabel = (id: TabId) => {
    switch (id) {
      case "profile":
        return m.user_settings_tab_profile_label();
      case "social":
        return m.user_settings_tab_social_label();
      case "security":
        return m.user_settings_tab_security_label();
      case "appearance":
        return m.user_settings_tab_appearance_label();
      case "about":
        return m.user_settings_tab_about_label();
    }
  };

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
      avatarError = m.user_settings_avatar_type_error_text();
      input.value = "";
      return;
    }
    if (f.size > maxBytes) {
      avatarError = m.user_settings_avatar_size_error_text();
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
      bannerError = m.user_settings_banner_type_error_text();
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
      "(prefers-color-scheme: dark)",
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
    {m.user_settings_meta_title({ section: tabLabel(tab) })}
  </title>
</svelte:head>
<section class="px-4 py-8 min-h-screen">
  <div class="max-w-6xl mx-auto">
    <div class="mb-6">
      <h1 class="text-3xl sm:text-4xl font-clash text-primary">
        {m.user_settings_title_h1()}
      </h1>
      <p class="text-sm opacity-70 mt-1">
        {m.user_settings_intro_text()}
      </p>
    </div>

    <div class="flex flex-col gap-6">
      <div class="w-full overflow-x-auto">
        <div
          class="tabs tabs-border min-w-max whitespace-nowrap"
          role="tablist"
          aria-label={m.user_settings_tabs_aria_label()}
        >
          {#each tabs as it (it.id)}
            <button
              type="button"
              role="tab"
              class="tab gap-2 shrink-0 snap-start group focus:outline-none focus-visible:ring focus-visible:ring-primary/40"
              class:tab-active={tab === it.id}
              aria-selected={tab === it.id}
              aria-current={tab === it.id ? "page" : undefined}
              tabindex={tab === it.id ? 0 : -1}
              onclick={() => {
                tab = it.id;
                $params.tab = it.id;
              }}
            >
              <i
                class={`${it.icon} text-base opacity-70 group-hover:opacity-100`}
              ></i>
              <span class="truncate max-w-[10rem] sm:max-w-none"
                >{tabLabel(it.id)}</span
              >
            </button>
          {/each}
        </div>
      </div>

      <!-- Right Content -->
      <div class="flex-1 space-y-8 min-h-screen">
        <div class="card bg-base-100 shadow-sm">
          {#if tab === "profile"}
            <!-- Profile Information -->
            <div class="card-body">
              <h2 class="card-title">
                {m.user_settings_profile_title()}
              </h2>
              <p class="text-sm opacity-70">
                {m.user_settings_profile_intro_text()}
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
                    <span class="label-text font-semibold">
                      {m.user_settings_profile_display_name_label()}
                    </span>
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
                  <legend class="block text-sm font-semibold">
                    {m.user_settings_profile_bio_label()}
                  </legend>
                  <div class="flex flex-col sm:flex-row gap-4">
                    <textarea
                      bind:value={$form.bio}
                      name="bio"
                      placeholder={m.user_settings_profile_bio_placeholder()}
                      class="textarea textarea-bordered w-full flex-1"
                      rows="6"
                    ></textarea>
                    <div class="flex-1">
                      <div class="text-xs opacity-60 mb-1">
                        {m.user_settings_profile_bio_preview_label()}
                      </div>
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
                      {m.user_settings_markdown_basics_title()}
                    </div>
                    <ul
                      class="list-disc list-inside text-xs opacity-70 space-y-1"
                    >
                      <li>
                        {m.user_settings_markdown_heading_label()}
                        <code># Title</code>,
                        <code>## Section</code>
                      </li>
                      <li>
                        {m.user_settings_markdown_bold_label()}
                        <code>**bold**</code>,
                        <code>*italic*</code>
                      </li>
                      <li>
                        {m.user_settings_markdown_links_label()}
                        <code>[text](https://example.com)</code>
                      </li>
                      <li>
                        {m.user_settings_markdown_lists_label()}
                        <code>- item</code>
                        ({m.user_settings_markdown_lists_hint_text()})
                      </li>
                      <li>
                        {m.user_settings_markdown_code_label()}
                        <code>`inline`</code>
                        {m.user_settings_markdown_code_hint_text()}
                      </li>
                      <li>{m.user_settings_markdown_paragraphs_text()}</li>
                    </ul>
                  </div>
                </fieldset>

                <!-- Avatar -->
                <fieldset class="fieldset">
                  <legend class="block text-sm font-semibold">
                    {m.user_settings_avatar_title()}
                  </legend>
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
                        for="profile_picture"
                        >{m.user_settings_avatar_upload_label()}</label
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
                        {m.user_settings_avatar_helper_text()}
                      </p>
                      {#if avatarError}
                        <p class="text-error">{avatarError}</p>
                      {/if}
                    </div>
                  </div>
                </fieldset>

                <!-- Banner -->
                <fieldset class="fieldset mt-4">
                  <legend class="block text-sm font-semibold">
                    {m.user_settings_banner_title()}
                  </legend>
                  <div class="flex items-start gap-6">
                    <div class="w-full max-w-xl">
                      <div
                        class="rounded-xl border border-base-300 overflow-hidden w-full h-24 bg-base-200"
                      >
                        {#if bannerPreviewUrl}
                          <img
                            src={bannerPreviewUrl}
                            alt={m.user_settings_banner_preview_alt()}
                            class="w-full h-full object-cover"
                          />
                        {:else if $form.banner}
                          <img
                            src={$form.banner}
                            alt={m.user_settings_banner_current_alt()}
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
                        >{m.user_settings_banner_upload_label()}</label
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
                        {m.user_settings_banner_helper_text()}
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
                  <legend class="fieldset-legend">
                    {m.user_settings_privacy_title()}
                  </legend>
                  <label class="label cursor-pointer justify-start gap-3">
                    <input
                      type="checkbox"
                      name="private_profile"
                      bind:checked={$form.private_profile}
                      class="toggle bg-base-100"
                    />
                    <span class="label-text"
                      >{m.user_settings_privacy_toggle_label()}</span
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
                    {/if}
                    {m.user_settings_save_button_label({
                      state: $delayed ? "saving" : "idle",
                    })}
                  </button>
                </div>
              </form>
            </div>
          {:else if tab === "social"}
            <!-- Social Links -->
            <div class="card-body">
              <h2 class="card-title">{m.user_settings_social_title()}</h2>
              <p class="text-sm opacity-70">
                {m.user_settings_social_intro_text()}
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
                      ><i class="fa-solid fa-globe"></i>
                      {m.user_settings_social_website_label()}</span
                    >
                  </span>
                  <input
                    type="text"
                    class="input input-bordered w-full"
                    name="website"
                    bind:value={$socialForm.website}
                    placeholder={m.user_settings_social_website_placeholder()}
                  />
                  {#if $socialErrors.website}
                    <p class="text-error">{$socialErrors.website}</p>
                  {/if}
                </label>

                <!-- Twitter/X -->
                <label class="form-control w-full">
                  <i class="fa-brands fa-x-twitter"></i>
                  {m.user_settings_social_x_label()}
                  <label class="input input-bordered w-full">
                    <span class="hidden sm:flex">x.com/</span>
                    <input
                      type="text"
                      class="grow input-ghost"
                      name="x"
                      bind:value={$socialForm.x}
                      placeholder={m.user_settings_social_x_placeholder()}
                    />
                  </label>
                  {#if $socialErrors.x}
                    <p class="text-error">{$socialErrors.x}</p>
                  {/if}
                </label>

                <!-- WCA -->
                <label class="form-control w-full">
                  {m.user_settings_social_wca_label()}
                  <label class="input input-bordered w-full">
                    <span class="hidden sm:flex">
                      worldcubeassociation.org/persons/
                    </span>
                    <input
                      type="text"
                      class="grow input-ghost"
                      name="wca"
                      bind:value={$socialForm.wca}
                      placeholder={m.user_settings_social_wca_placeholder()}
                    />
                  </label>
                  {#if $socialErrors.wca}
                    <p class="text-error">{$socialErrors.wca}</p>
                  {/if}
                </label>

                <!-- Discord -->
                <label class="form-control w-full">
                  <i class="fa-brands fa-discord"></i>
                  {m.user_settings_social_discord_label()}
                  <label class="input input-bordered w-full">
                    <span class="hidden sm:flex">discord.com/users/</span>
                    <input
                      type="text"
                      class="grow input-ghost"
                      name="discord"
                      bind:value={$socialForm.discord}
                      placeholder={m.user_settings_social_discord_placeholder()}
                    />
                  </label>
                  {#if $socialErrors.discord}
                    <p class="text-error">{$socialErrors.discord}</p>
                  {/if}
                </label>

                <!-- YouTube -->
                <label class="form-control w-full">
                  <i class="fa-brands fa-youtube"></i>
                  {m.user_settings_social_youtube_label()}
                  <label class="input input-bordered w-full">
                    <span class="hidden sm:flex">youtube.com/</span>
                    <input
                      type="text"
                      class="grow input-ghost"
                      name="youtube"
                      bind:value={$socialForm.youtube}
                      placeholder={m.user_settings_social_youtube_placeholder()}
                    />
                  </label>
                  {#if $socialErrors.youtube}
                    <p class="text-error">{$socialErrors.youtube}</p>
                  {/if}
                </label>

                <!-- Reddit -->
                <label class="form-control w-full">
                  <i class="fa-brands fa-reddit-alien"></i>
                  {m.user_settings_social_reddit_label()}
                  <label class="input input-bordered w-full">
                    <span class="hidden sm:flex">reddit.com/u/</span>
                    <input
                      type="text"
                      class="grow input-ghost"
                      name="reddit"
                      bind:value={$socialForm.reddit}
                      placeholder={m.user_settings_social_reddit_placeholder()}
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
                    {/if}
                    {m.user_settings_save_button_label({
                      state: $socialDelayed ? "saving" : "idle",
                    })}
                  </button>
                </div>
              </form>
            </div>
          {:else if tab === "security"}
            <!-- Account Security -->
            <div class="card-body">
              <h2 class="card-title">{m.user_settings_security_title()}</h2>
              <p class="text-sm opacity-70">
                {m.user_settings_security_intro_text()}
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
                        >{m.user_settings_security_current_password_label()}</span
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
                        >{m.user_settings_security_new_password_label()}</span
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
                    {/if}
                    {m.user_settings_password_button_label({
                      state: $passwordDelayed ? "updating" : "idle",
                    })}
                  </button>
                </div>
              </form>
            </div>
          {:else if tab === "appearance"}
            <div class="card bg-base-100 shadow-sm">
              <div class="card-body space-y-6">
                <div class="flex items-center justify-between">
                  <div>
                    <h2 class="card-title">
                      {m.user_settings_appearance_title()}
                    </h2>
                    <p class="text-sm opacity-70">
                      {m.user_settings_appearance_intro_text()}
                    </p>
                  </div>
                  <label class="label cursor-pointer gap-3">
                    <span class="label-text">
                      {m.user_settings_appearance_system_toggle_label()}
                    </span>
                    <input
                      type="checkbox"
                      class="toggle bg-base-100"
                      bind:checked={useSystemTheme}
                    />
                  </label>
                </div>

                <!-- Theme picker -->
                <div>
                  <p class="font-bold mb-2">
                    {m.user_settings_appearance_light_label()}
                  </p>
                  <div
                    class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                  >
                    {#each lightThemes as t (t)}
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
                              <span class="w-4 h-4 rounded bg-secondary"></span>
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
                  <p class="font-bold mb-2">
                    {m.user_settings_appearance_dark_label()}
                  </p>
                  <div
                    class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                  >
                    {#each darkThemes as t (t)}
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
                              <span class="w-4 h-4 rounded bg-secondary"></span>
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
                <!-- Header -->
                <div class="flex items-start gap-4">
                  <div
                    class="btn btn-ghost btn-circle btn-sm text-primary bg-primary/10 shrink-0"
                    aria-hidden="true"
                  >
                    <i class="fa-solid fa-cube"></i>
                  </div>

                  <div class="space-y-1">
                    <h2 class="card-title leading-tight">
                      {m.user_settings_about_title()}
                    </h2>
                    <p class="text-sm opacity-75">
                      {m.user_settings_about_intro_text()}
                    </p>

                    <div class="flex flex-wrap gap-2 pt-2">
                      <!-- Optional: replace with your real version string -->
                      <span class="badge badge-ghost">
                        {m.user_settings_about_badge_open_source()}
                      </span>
                      <span class="badge badge-ghost">Apache 2.0</span>
                      <!-- <span class="badge badge-ghost">v{appVersion}</span> -->
                    </div>
                  </div>
                </div>

                <!-- Quick actions -->
                <div class="flex flex-wrap gap-2">
                  <a
                    class="btn btn-sm btn-primary"
                    href="https://github.com/cubeindex-project/CubeIndex"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <i class="fa-brands fa-github"></i>
                    {m.user_settings_about_action_github_label()}
                  </a>

                  <a
                    class="btn btn-sm btn-ghost"
                    href="/discord"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <i class="fa-brands fa-discord"></i>
                    {m.user_settings_about_action_discord_label()}
                  </a>

                  <a class="btn btn-sm btn-ghost" href="/report">
                    <i class="fa-solid fa-bug"></i>
                    {m.user_settings_about_action_report_label()}
                  </a>

                  <a
                    class="btn btn-sm btn-ghost"
                    href="mailto:thecubeindex@gmail.com"
                  >
                    <i class="fa-solid fa-envelope"></i>
                    {m.user_settings_about_action_support_label()}
                  </a>
                </div>

                <!-- Sections -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <!-- Open source -->
                  <section
                    class="rounded-2xl bg-base-200/60 p-4 border border-base-300 space-y-3"
                  >
                    <div
                      class="flex items-center gap-2 text-primary font-semibold"
                    >
                      <i class="fa-solid fa-code-branch"></i>
                      <span>{m.user_settings_about_open_source_title()}</span>
                    </div>

                    <div class="space-y-2 text-sm opacity-80">
                      <p>
                        {m.user_settings_about_open_source_text()}
                      </p>

                      <p class="flex items-start gap-2">
                        <i
                          class="fa-brands fa-github mt-0.5 text-base-content/70"
                        ></i>
                        <span>
                          {m.user_settings_about_open_source_links_prefix_text()}
                          <a
                            class="link link-primary"
                            href="https://github.com/cubeindex-project/CubeIndex"
                            target="_blank"
                            rel="noreferrer"
                            >{m.user_settings_about_action_github_label()}</a
                          >.
                        </span>
                      </p>
                    </div>
                  </section>

                  <!-- Privacy -->
                  <section
                    class="rounded-2xl bg-base-200/60 p-4 border border-base-300 space-y-3"
                  >
                    <div
                      class="flex items-center gap-2 text-primary font-semibold"
                    >
                      <i class="fa-solid fa-shield-heart"></i>
                      <span>{m.user_settings_about_privacy_title()}</span>
                    </div>

                    <div class="space-y-2 text-sm opacity-80">
                      <p>
                        {m.user_settings_about_privacy_text()}
                      </p>

                      <p class="flex items-start gap-2">
                        <i
                          class="fa-solid fa-file-lines mt-0.5 text-base-content/70"
                        ></i>
                        <span>
                          {m.user_settings_about_privacy_links_prefix_text()}
                          <a class="link link-primary" href="/privacy"
                            >{m.footer_legal_privacy_label()}</a
                          >
                          {m.user_settings_about_privacy_links_conjunction_text()}
                          <a class="link link-primary" href="/tos"
                            >{m.footer_legal_terms_label()}</a
                          >.
                        </span>
                      </p>

                      <p>
                        {m.user_settings_about_privacy_footer_text()}
                      </p>
                    </div>
                  </section>

                  <!-- Links -->
                  <section
                    class="rounded-2xl bg-base-200/60 p-4 border border-base-300 space-y-3"
                  >
                    <div
                      class="flex items-center gap-2 text-primary font-semibold"
                    >
                      <i class="fa-solid fa-link"></i>
                      <span>{m.user_settings_about_links_title()}</span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <!-- Community -->
                      <div class="space-y-2">
                        <div
                          class="text-xs font-semibold uppercase tracking-wide opacity-70"
                        >
                          {m.user_settings_about_links_community_title()}
                        </div>

                        <nav class="space-y-1 opacity-85">
                          <a
                            class="link link-hover link-primary flex items-center gap-2"
                            href="https://github.com/cubeindex-project/CubeIndex"
                            target="_blank"
                            rel="noreferrer"
                          >
                            <i class="fa-brands fa-github text-base-content/60"
                            ></i>
                            <span>{m.user_settings_about_action_github_label()}</span>
                            <i
                              class="fa-solid fa-arrow-up-right-from-square text-xs"
                            ></i>
                          </a>

                          <a
                            class="link link-hover link-primary flex items-center gap-2"
                            href="https://twitter.com/thecubeindex"
                            target="_blank"
                            rel="noreferrer"
                          >
                            <i
                              class="fa-brands fa-x-twitter text-base-content/60"
                            ></i>
                            <span>{m.user_settings_about_links_x_label()}</span>
                            <i
                              class="fa-solid fa-arrow-up-right-from-square text-xs"
                            ></i>
                          </a>

                          <a
                            class="link link-hover link-primary flex items-center gap-2"
                            href="https://www.youtube.com/@cubeindex"
                            target="_blank"
                            rel="noreferrer"
                          >
                            <i class="fa-brands fa-youtube text-base-content/60"
                            ></i>
                            <span>{m.user_settings_about_links_youtube_label()}</span>
                            <i
                              class="fa-solid fa-arrow-up-right-from-square text-xs"
                            ></i>
                          </a>

                          <a
                            class="link link-hover link-primary flex items-center gap-2"
                            href="/discord"
                            target="_blank"
                            rel="noreferrer"
                          >
                            <i class="fa-brands fa-discord text-base-content/60"
                            ></i>
                            <span>{m.user_settings_about_action_discord_label()}</span>
                            <i
                              class="fa-solid fa-arrow-up-right-from-square text-xs"
                            ></i>
                          </a>

                          <a
                            class="link link-hover link-primary flex items-center gap-2"
                            href="mailto:thecubeindex@gmail.com"
                          >
                            <i class="fa-solid fa-envelope text-base-content/60"
                            ></i>
                            <span>{m.user_settings_about_links_email_label()}</span>
                          </a>
                        </nav>
                      </div>
                    </div>
                  </section>
                </div>

                <!-- Footer note -->
                <div class="text-xs opacity-60">
                  {m.user_settings_about_footer_text()}
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</section>
