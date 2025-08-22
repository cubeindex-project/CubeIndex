<script lang="ts">
  import { SsgoiTransition } from "@ssgoi/svelte";
  import { page } from "$app/state";
  import { superForm } from "sveltekit-superforms";
  import { passwordStrength } from "$lib/components/helper_functions/passwordStrength";

  let { data } = $props();

  // Three forms (one per step)
  const {
    form: account,
    errors: accountErrors,
    enhance: enhanceAccount,
    message: accountMessage,
  } = superForm(data.accountForm, { dataType: "json", resetForm: false });

  const {
    form: profile,
    errors: profileErrors,
    enhance: enhanceProfile,
    message: profileMessage,
  } = superForm(data.profileForm, {
    resetForm: false,
  });

  const {
    form: survey,
    errors: surveyErrors,
    enhance: enhanceSurvey,
    message: surveyMessage,
  } = superForm(data.surveyForm, { dataType: "json", resetForm: false });

  const step = $derived(data.step);

  let showPassword = $state(false);
  let pwScore: 0 | 1 | 2 | 3 | 4 = $state(0);
  let pwLabel = $state("Very weak");
  let pwSuggestions: string[] = $state([]);

  $effect(() => {
    const s = passwordStrength($account.password ?? "");
    pwScore = s.score;
    pwLabel = s.label;
    pwSuggestions = s.suggestions;
  });

  const steps = [
    { key: "account", label: "Account" },
    { key: "profile", label: "Profile" },
    { key: "survey", label: "Preferences" },
    { key: "done", label: "Done" },
  ] as const;

  const isActive = (k: string) => step === k;
  const isDone = (k: string) =>
    steps.findIndex((s) => s.key === step) >
    steps.findIndex((s) => s.key === k);
</script>

<svelte:head>
  <title>Signup - CubeIndex</title>
</svelte:head>

<SsgoiTransition id={page.url.pathname}>
  <section
    class="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
  >
    <div
      class="w-full max-w-xl bg-base-200 border border-base-300 rounded-2xl shadow-lg p-8 z-10"
    >
      <h1 class="text-3xl font-clash font-bold text-center mb-2">
        Join CubeIndex
      </h1>
      <p class="text-center text-sm mb-6">
        Create a free account to start tracking your collection
      </p>

      <!-- Stepper -->
      <ol class="steps w-full mb-8">
        {#each steps as s}
          <li
            class="step"
            class:step-primary={isActive(s.key) || isDone(s.key)}
          >
            {s.label}
          </li>
        {/each}
      </ol>

      {#if step === "account"}
        <!-- ACCOUNT FORM -->
        <form
          class="space-y-6"
          method="POST"
          action="?/createAccount"
          use:enhanceAccount
        >
          <!-- Email -->
          <div>
            <label class="block text-sm font-medium">
              Email
              <input
                name="email"
                type="email"
                bind:value={$account.email}
                class="input w-full"
                required
              />
            </label>
            {#if $accountErrors.email}
              <span class="text-error">
                {$accountErrors.email}
              </span>
            {/if}
          </div>

          <!-- Password + Meter -->
          <div>
            <label class="block text-sm font-medium">
              Password
              <div class="flex items-center gap-2">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  bind:value={$account.password}
                  class="input w-full"
                  required
                />
                <label class="swap text-md">
                  <input
                    type="checkbox"
                    onchange={() => (showPassword = !showPassword)}
                    class="sr-only peer"
                  />
                  <i class="fa-solid fa-eye swap-off ml-2 cursor-pointer"></i>
                  <i class="fa-solid fa-eye-slash swap-on ml-2 cursor-pointer"
                  ></i>
                </label>
              </div>
            </label>
            {#if $accountErrors.password}
              <span class="text-error">
                {$accountErrors.password}
              </span>
            {/if}

            <!-- Strength bar -->
            <div class="mt-3">
              <div class="w-full h-2 bg-base-300 rounded-full overflow-hidden">
                <div
                  class="h-2 transition-all"
                  style={`width: ${(pwScore + 1) * 20}%;`}
                  class:!bg-error={pwScore <= 1}
                  class:!bg-warning={pwScore === 2}
                  class:!bg-success={pwScore >= 3}
                ></div>
              </div>
              <div class="mt-1 text-xs opacity-80">{pwLabel}</div>
              {#if pwSuggestions.length}
                <ul class="mt-1 text-xs opacity-70 list-disc ml-5 space-y-0.5">
                  {#each pwSuggestions.slice(0, 3) as s}<li>{s}</li>{/each}
                </ul>
              {/if}
            </div>
          </div>

          <!-- Confirm Password -->
          <div>
            <label class="block text-sm font-medium">
              Confirm Password
              <input
                name="confirmPassword"
                type="password"
                bind:value={$account.confirmPassword}
                class="input w-full"
                required
              />
            </label>
            {#if $accountErrors.confirmPassword}<span class="text-error">
                {$accountErrors.confirmPassword}
              </span>{/if}
          </div>

          <!-- ToS -->
          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              name="acceptTOS"
              bind:checked={$account.acceptTOS}
              class="checkbox bg-base-300"
            />
            <div class="text-sm select-none">
              I accept the
              <a href="/tos" target="_blank" class="link link-primary"
                >Terms of Service</a
              >
              and
              <a href="/privacy" target="_blank" class="link link-primary"
                >Privacy Policy</a
              >
            </div>
          </div>
          {#if $accountMessage}
            <p class="text-error text-sm">
              {$accountMessage}
            </p>
          {/if}

          <button type="submit" class="btn btn-xl w-full btn-primary"
            >Continue</button
          >

          <div class="divider">or</div>
          <a
            href="/auth/discord"
            class="btn btn-lg bg-[#5865F2] text-white w-full"
          >
            <i class="fa-brands fa-discord text-2xl"></i>
            Sign Up with Discord
          </a>
        </form>
      {/if}

      {#if step === "profile"}
        <!-- PROFILE FORM -->
        <form
          method="POST"
          action="?/createProfile"
          use:enhanceProfile
          enctype="multipart/form-data"
          class="space-y-6"
        >
          <div>
            <label class="block text-sm font-medium">
              Display Name
              <input
                name="display_name"
                type="text"
                bind:value={$profile.display_name}
                class="input w-full"
                required
              />
            </label>
            {#if $profileErrors.display_name}
              <span class="text-error">
                {$profileErrors.display_name}
              </span>
            {/if}
          </div>

          <div>
            <label class="block text-sm font-medium">
              Username
              <input
                name="username"
                type="text"
                bind:value={$profile.username}
                class="input w-full"
                required
              />
            </label>
            {#if $profileErrors.username}
              <span class="text-error">
                {$profileErrors.username}
              </span>
            {/if}
          </div>

          <div>
            <label class="block text-sm font-medium">
              Profile Picture
              <input
                name="avatar"
                type="file"
                accept="image/*"
                class="file-input w-full"
                bind:value={$profile.avatar}
              />
            </label>
            {#if $profileErrors.avatar}
              <span class="text-error">
                {$profileErrors.avatar}
              </span>
            {/if}
          </div>

          {#if $profileMessage}
            <p class="text-error text-sm">
              {$profileMessage}
            </p>
          {/if}

          <button type="submit" class="btn btn-xl w-full btn-primary"
            >Continue</button
          >
        </form>
      {/if}

      {#if step === "survey"}
        <!-- SURVEY FORM -->
        <form
          method="POST"
          action="?/submitSurvey"
          use:enhanceSurvey
          class="space-y-6"
        >
          <div>
            <label class="block text-sm font-medium">
              How did you discover CubeIndex?

              <select
                name="discovered_via"
                bind:value={$survey.discovered_via}
                class="select w-full"
                required
              >
                <option value="" disabled selected>Select one</option>
                <option value="friend">Friend</option>
                <option value="discord">Discord</option>
                <option value="reddit">Reddit</option>
                <option value="youtube">YouTube</option>
                <option value="search">Search Engine</option>
                <option value="other">Other</option>
              </select>
            </label>
            {#if $surveyErrors.discovered_via}
              <span class="text-error">
                {$surveyErrors.discovered_via}
              </span>
            {/if}
          </div>

          <div>
            <label class="block text-sm font-medium">
              What features interest you the most?
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {#each [["price_tracking", "Price tracking"], ["collection_management", "Collection management"], ["ratings_reviews", "Ratings & reviews"], ["shop_compare", "Shop compare"], ["alerts_discord", "Discord alerts"], ["achievements", "Achievements"]] as [val, label]}
                  <label
                    class="flex gap-2 items-center p-2 rounded-lg border border-base-300"
                  >
                    <input
                      type="checkbox"
                      name="interested_features"
                      value={val}
                      bind:group={$survey.interested_features}
                      class="checkbox"
                    />
                    <span>{label}</span>
                  </label>
                {/each}
              </div>
            </label>
            {#if $surveyErrors.interested_features}
              <span class="text-error">
                {$surveyErrors.interested_features._errors}
              </span>
            {/if}
          </div>

          <div>
            <label class="block text-sm font-medium">
              Anything else?
              <textarea
                name="other_text"
                bind:value={$survey.other_text}
                class="textarea w-full"
                rows="3"
                placeholder="Optional"
              ></textarea>
            </label>
            {#if $surveyErrors.other_text}
              <span class="text-error">
                {$surveyErrors.other_text}
              </span>
            {/if}
          </div>

          {#if $surveyMessage}
            <p class="text-error text-sm">
              {$surveyMessage}
            </p>
          {/if}

          <button type="submit" class="btn btn-xl w-full btn-primary">
            Finish
          </button>
        </form>
      {/if}

      {#if step === "done"}
        <div class="text-center space-y-3">
          <h2 class="text-2xl font-bold">You're all set 🎉</h2>
          <p class="opacity-80">
            Check your email to verify your account. Once verified, you can
            start tracking your collection, compare shops, and get price-drop
            alerts on Discord.
          </p>
          <a href="/" class="btn btn-primary mt-2">Go to Home</a>
        </div>
      {/if}

      <!-- Existing login hint -->
      <p class="text-sm text-center mt-6">
        Already have an account?
        <a href="/auth/login" class="link link-primary link-hover">Log in</a>
      </p>
    </div>
  </section>
</SsgoiTransition>
