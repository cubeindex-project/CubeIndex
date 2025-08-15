<script lang="ts">
  import { supabase } from "$lib/supabaseClient.js";
  import { SsgoiTransition } from "@ssgoi/svelte";
  import { page } from "$app/state";

  let { form } = $props();
  let showPassword = $state(false);
  let email = $state("");
  let password = $state("");
  let resetError: string = $state("");
  let resetMessage: string = $state("");
  let isSubmitting = $state(false);

  async function resetPassword(e: Event) {
    e.preventDefault();
    resetError = "";
    resetMessage = "";
    if (!email) {
      resetError = "Please enter an email";
      return;
    }
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });

    if (err) {
      resetError = err.message;
      return;
    }

    resetMessage = "Check your email to reset your password";
  }
</script>

<svelte:head>
  <title>Login - CubeIndex</title>
</svelte:head>

<SsgoiTransition id={page.url.pathname}>
  <section
    class="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
  >
    <div
      class="w-full max-w-md bg-base-200 border border-base-300 rounded-2xl shadow-lg p-8 z-10"
    >
      <h1 class="text-3xl font-clash font-bold text-center mb-6">
        Welcome Back
      </h1>
      <p class="text-center text-sm mb-8">Login to your CubeIndex profile</p>
      <form
        method="POST"
        class="space-y-6"
        onsubmit={() => {
          isSubmitting = true;
        }}
      >
        <div>
          <label for="email" class="block text-sm font-medium">Email</label>
          <input
            name="email"
            type="email"
            bind:value={email}
            class="input w-full"
            required
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium"
            >Password</label
          >
          <div class="flex flex-row items-center">
            <input
              name="password"
              bind:value={password}
              type={showPassword ? "text" : "password"}
              class="input w-full"
            />
            <label class="swap text-md">
              <input
                type="checkbox"
                onclick={() => {
                  showPassword = !showPassword;
                }}
                class="sr-only peer"
              />
              <i class="fa-solid fa-eye swap-off ml-2 cursor-pointer"></i>
              <i class="fa-solid fa-eye-slash swap-on ml-2 cursor-pointer"></i>
            </label>
          </div>
        </div>

        <p class="text-sm text-gray-500 -mt-5">
          Forgot your password?
          <button
            type="button"
            class="link link-primary link-hover"
            onclick={resetPassword}>Reset</button
          >
        </p>

        <button
          type="submit"
          class="btn w-full btn-primary btn-lg"
          disabled={isSubmitting || !email || !password}
        >
          {#if isSubmitting}
            <span class="loading loading-spinner"></span>
            Logging In...
          {:else}
            Log In
          {/if}
        </button>

        {#if resetMessage}
          <p class="text-sm text-success text-center mt-2">
            {resetMessage}
          </p>
        {/if}
        {#if resetError}
          <p class="text-sm text-error text-center mt-2">
            {resetError}
          </p>
        {/if}
        {#if form?.error}
          <p class="text-sm text-error text-center mt-2">
            {form.error}
          </p>
        {/if}

        <!-- OR Divider -->
        <div class="divider">or</div>

        <!-- Sign Up with Discord Button -->
        <a
          type="button"
          href="/auth/discord"
          class="btn btn-lg bg-[#5865F2] text-white w-full mt-4"
        >
          <i class="fa-brands fa-discord text-2xl"></i>
          Sign In with Discord
        </a>
      </form>

      <p class="text-sm text-center text-gray-500 mt-6">
        Don't have an account?
        <a href="/auth/signup" class="link link-primary link-hover ml-1">
          Sign Up
        </a>
      </p>
    </div>
  </section>
</SsgoiTransition>
