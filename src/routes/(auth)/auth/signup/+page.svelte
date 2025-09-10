<script lang="ts">
  import { SsgoiTransition } from "@ssgoi/svelte";
  import { page } from "$app/state";
  import { superForm } from "sveltekit-superforms";
  import { passwordStrength } from "$lib/components/helper_functions/passwordStrength";
  import { Turnstile } from "svelte-turnstile";
  import { PUBLIC_TURNSTILE_SITE_KEY } from "$env/static/public";

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
  <section class="min-h-screen">
    <div class="grid grid-cols-1 md:grid-cols-2 min-h-screen">
      <!-- Left: Signup process -->
      <div
        class="h-full flex flex-col justify-center px-6 sm:px-12 py-10 bg-base-200 border-base-300 md:border-r border-y"
      >
        <div class="w-full max-w-md mx-auto">
          <h1 class="text-3xl font-clash font-bold mb-2">Join CubeIndex</h1>
          <p class="text-sm mb-6">
            Create a free account to start tracking your collection
          </p>

          <!-- Stepper -->
          <ol
            class="steps steps-vertical sm:steps-horizontal w-full mb-6 sm:mb-8 text-xs sm:text-sm"
          >
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
              class="space-y-5 sm:space-y-6"
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
                      <i class="fa-solid fa-eye swap-off ml-2 cursor-pointer"
                      ></i>
                      <i
                        class="fa-solid fa-eye-slash swap-on ml-2 cursor-pointer"
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
                  <div
                    class="w-full h-2 bg-base-300 rounded-full overflow-hidden"
                  >
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
                    <ul
                      class="mt-1 text-xs opacity-70 list-disc ml-5 space-y-0.5"
                    >
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
              <div class="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="acceptTOS"
                  bind:checked={$account.acceptTOS}
                  class="checkbox bg-base-300 mt-0.5"
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

              <button
                type="submit"
                class="btn btn-lg sm:btn-xl w-full btn-primary"
              >
                Continue
              </button>

              <div>
                <Turnstile
                  siteKey={PUBLIC_TURNSTILE_SITE_KEY}
                  size="flexible"
                />
                {#if $accountErrors["cf-turnstile-response"]}
                  <span class="text-error">
                    {$accountErrors["cf-turnstile-response"]}
                  </span>
                {/if}
              </div>

              <div class="divider">or</div>

              <a
                href="/auth/discord"
                class="btn btn-lg sm:btn-xl bg-[#5865F2] text-white w-full"
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
              class="space-y-5 sm:space-y-6"
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

              <button
                type="submit"
                class="btn btn-lg sm:btn-xl w-full btn-primary">Continue</button
              >
            </form>
          {/if}

          {#if step === "survey"}
            <!-- SURVEY FORM -->
            <form
              method="POST"
              action="?/submitSurvey"
              use:enhanceSurvey
              class="space-y-5 sm:space-y-6"
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

              <button
                type="submit"
                class="btn btn-lg sm:btn-xl w-full btn-primary"
              >
                Finish
              </button>
            </form>
          {/if}

          {#if step === "done"}
            <div class="text-center space-y-3">
              <h2 class="text-2xl font-bold">You're all set 🎉</h2>
              <p class="opacity-80">
                Check your email to verify your account. Once verified, you can
                start tracking your collection, compare shops, and get
                price-drop alerts on Discord.
              </p>
              <a href="/explore" class="btn btn-primary mt-2"
                >Start Collecting!</a
              >
            </div>
          {/if}

          <!-- Existing login hint -->
          <p class="text-sm text-center mt-6">
            Already have an account?
            <a href="/auth/login" class="link link-primary link-hover">Log in</a
            >
          </p>
        </div>
      </div>

      <!-- Right: Visuals / marketing panel -->
      <aside
        class="hidden md:flex h-full relative overflow-hidden border-l border-base-300 bg-base-100"
      >
        <!-- Background gradient -->
        <div
          class="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20"
        ></div>

        <!-- Decorative blobs -->
        <div
          class="pointer-events-none absolute -top-20 -right-10 w-72 h-72 bg-primary/30 blur-3xl rounded-full"
        ></div>
        <div
          class="pointer-events-none absolute -bottom-24 -left-8 w-80 h-80 bg-secondary/20 blur-3xl rounded-full"
        ></div>

        <div
          class="relative z-10 p-8 flex flex-col justify-center gap-6 w-full"
        >
          <div>
            <h2
              class="text-2xl sm:text-3xl font-clash font-extrabold tracking-tight"
            >
              All your cubes, in one place
            </h2>
            <p class="mt-2 text-sm opacity-80">
              Track your collection, rate cubes, unlock achievements, and get
              price updates.
            </p>
          </div>

          <ul class="space-y-3 text-sm">
            <li class="flex items-start gap-3">
              <span class="badge badge-primary"
                ><i class="fa-solid fa-cubes"></i></span
              >
              <div>
                <div class="font-semibold">Collection management</div>
                <div class="opacity-70">
                  Add cubes, set condition and status, and mark mains.
                </div>
              </div>
            </li>
            <li class="flex items-start gap-3">
              <span class="badge badge-warning"
                ><i class="fa-solid fa-star"></i></span
              >
              <div>
                <div class="font-semibold">Ratings & reviews</div>
                <div class="opacity-70">
                  Share your experience and see what others think.
                </div>
              </div>
            </li>
            <li class="flex items-start gap-3">
              <span class="badge badge-accent"
                ><i class="fa-solid fa-trophy"></i></span
              >
              <div>
                <div class="font-semibold">Achievements</div>
                <div class="opacity-70">
                  Unlock badges as you grow your collection.
                </div>
              </div>
            </li>
          </ul>

          <div class="mt-4 grid grid-cols-3 gap-3">
            <div
              class="aspect-[4/3] rounded-xl bg-base-100/70 border border-base-300 shadow-sm"
            ></div>
            <div
              class="aspect-[4/3] rounded-xl bg-base-100/70 border border-base-300 shadow-sm"
            ></div>
            <div
              class="aspect-[4/3] rounded-xl bg-base-100/70 border border-base-300 shadow-sm"
            ></div>
          </div>
        </div>
      </aside>
    </div>
  </section>
</SsgoiTransition>
