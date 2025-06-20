<script lang="ts">
  import { configCatClient } from "$lib/configcatClient";
  import FeatureDisabled from "$lib/components/featureDisabled.svelte";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient.js";

  let { form } = $props();
  let showPassword = $state(false);
  let email = $state("");
  let login = $state(true);
  let localError: string = $state("");
  let message: string = $state("");

  async function resetPassword(e: Event) {
    e.preventDefault();
    if (!email) {
      localError = "Please enter an email";
      return;
    }
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });

    if (err) {
      localError = err.message;
      return;
    }

    message = "Check your email to reset your password";
  }

  onMount(() =>
    configCatClient.getValueAsync("login", false).then((value) => {
      login = value;
    })
  );
</script>

{#if login}
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
      <form method="POST" class="space-y-6">
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

        <button type="submit" class="btn w-full btn-primary btn-lg">
          Log In
        </button>

        {#if form?.message}
          <p class="text-sm text-red-500 text-center mt-2">
            {form.message}
          </p>
        {/if}
        {#if localError && !form?.message}
          <p class="text-sm text-red-500 text-center mt-2">
            {localError}
          </p>
        {/if}
        {#if message}
          <p class="text-sm text-green-400 text-center mt-2">
            {message}
          </p>
        {/if}

        <!-- OR Divider -->
        <div class="divider">or</div>

        <!-- Sign Up with Discord Button -->
        <a
          type="button"
          href="/auth/login/discord"
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
{:else}
  <FeatureDisabled featureName="Login is" />
{/if}
