<script lang="ts">
  import { supabase } from "$lib/supabaseClient.js";
  import { passwordStrength } from "$lib/components/helper_functions/passwordStrength";
  import { m } from "$lib/paraglide/messages";

  let showPassword = $state(false);
  let password = $state("");
  let confirmPassword = $state("");
  let isSubmitting = $state(false);
  let message: string = $state("");
  let errorMsg: string = $state("");

  let pwScore: 0 | 1 | 2 | 3 | 4 = $state(0);
  let pwLabel = $state("very_weak");
  let pwSuggestions: string[] = $state([]);

  $effect(() => {
    const s = passwordStrength(password);
    pwScore = s.score;
    pwLabel = s.label;
    pwSuggestions = s.suggestions;
  });

  async function onSubmit(e: Event) {
    e.preventDefault();
    errorMsg = "";
    message = "";
    if (!password || password.length < 8) {
      errorMsg = m.auth_reset_password_length_error_text({ minLength: 8 });
      return;
    }
    if (password !== confirmPassword) {
      errorMsg = m.auth_reset_password_match_error_text();
      return;
    }
    isSubmitting = true;
    const { error } = await supabase.auth.updateUser({ password });
    isSubmitting = false;
    if (error) {
      errorMsg = error.message || m.auth_reset_password_update_error_text();
      return;
    }
    message = m.auth_reset_password_update_success_text();
    // Optional: redirect to login after short delay
    setTimeout(() => {
      window.location.href = "/auth/login";
    }, 1200);
  }
</script>

<svelte:head>
  <title>{m.auth_reset_meta_title()}</title>
  <meta name="robots" content="noindex" />
  <meta name="description" content={m.auth_reset_meta_description()} />
</svelte:head>
  <section class="min-h-screen flex items-center justify-center px-6 py-10">
    <div class="w-full max-w-md bg-base-200 border border-base-300 rounded-2xl shadow-lg p-8">
      <h1 class="text-3xl font-clash font-bold mb-2">
        {m.auth_reset_title_h1()}
      </h1>
      <p class="text-sm mb-8">{m.auth_reset_intro_text()}</p>

      <form class="space-y-6" onsubmit={onSubmit}>
        <div>
          <label for="password" class="block text-sm font-medium">
            {m.auth_reset_new_password_label()}
          </label>
          <div class="flex items-center gap-2">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              bind:value={password}
              class="input w-full"
              autocomplete="new-password"
              required
              minlength={8}
            />
            <label class="swap text-md">
              <input
                type="checkbox"
                class="sr-only peer"
                onchange={() => (showPassword = !showPassword)}
              />
              <i class="fa-solid fa-eye swap-off ml-2 cursor-pointer"></i>
              <i class="fa-solid fa-eye-slash swap-on ml-2 cursor-pointer"></i>
            </label>
          </div>

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
            <div class="mt-1 text-xs opacity-80">
              {m.auth_password_strength_label({ label: pwLabel })}
            </div>
            {#if pwSuggestions.length}
              <ul class="mt-1 text-xs opacity-70 list-disc ml-5 space-y-0.5">
                {#each pwSuggestions.slice(0, 3) as s}
                  <li>{m.auth_password_suggestion_text({ suggestion: s })}</li>
                {/each}
              </ul>
            {/if}
          </div>
        </div>

        <div>
          <label for="confirm" class="block text-sm font-medium">
            {m.auth_reset_confirm_password_label()}
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            bind:value={confirmPassword}
            class="input w-full"
            autocomplete="new-password"
            required
          />
        </div>

        <button
          type="submit"
          class="btn w-full btn-primary btn-lg"
          disabled={isSubmitting}
        >
          {#if isSubmitting}
            <span class="loading loading-spinner"></span>
            {m.auth_reset_submitting_text()}
          {:else}
            {m.auth_reset_submit_cta()}
          {/if}
        </button>

        {#if message}
          <p class="text-sm text-success text-center mt-2">{message}</p>
        {/if}
        {#if errorMsg}
          <p class="text-sm text-error text-center mt-2">{errorMsg}</p>
        {/if}
      </form>

      <p class="text-sm text-center text-gray-500 mt-6">
        {m.auth_reset_back_to_login_prompt_text()}
        {" "}
        <a href="/auth/login" class="link link-primary link-hover ml-1">
          {m.auth_reset_back_to_login_cta()}
        </a>
      </p>
    </div>
  </section>
