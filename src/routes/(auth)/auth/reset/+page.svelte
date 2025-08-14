<script lang="ts">
  import { page } from "$app/state";
  import { supabase } from "$lib/supabaseClient.js";
  import { SsgoiTransition } from "@ssgoi/svelte";
  import { onMount } from "svelte";
  let password = $state("");
  let showPassword = $state(false);
  let confirmPassword = $state("");
  let message = $state("");
  let error = $state("");

  onMount(async () => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    if (code) {
      await supabase.auth.exchangeCodeForSession(code);
    }
  });

  async function resetPassword(e: Event) {
    e.preventDefault();
    error = "";
    if (password.length < 8) {
      error = "Password must be at least 8 characters.";
      return;
    }
    if (password !== confirmPassword) {
      error = "Passwords do not match";
      return;
    }
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) {
      error = err.message;
      return;
    }
    message = "Password updated. You can now log in.";
  }
</script>

<svelte:head>
  <title>Reset Password - CubeIndex</title>
</svelte:head>

<SsgoiTransition id={page.url.pathname}>
  <section class="min-h-screen flex flex-col items-center justify-center px-6">
    <div
      class="w-full max-w-md bg-base-200 border border-base-300 rounded-2xl shadow-lg p-8"
    >
      <h1 class="text-3xl font-clash font-bold text-center mb-6">
        Reset Password
      </h1>
      <form onsubmit={resetPassword} class="space-y-6">
        <div>
          <label class="block text-sm font-medium"
            >New Password
            <div class="flex flex-row items-center">
              <input
                bind:value={password}
                type={showPassword ? "text" : "password"}
                class="input w-full"
                required
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
                <i class="fa-solid fa-eye-slash swap-on ml-2 cursor-pointer"
                ></i>
              </label>
            </div>
          </label>
        </div>
        <div>
          <label class="block text-sm font-medium"
            >Confirm Password
            <input
              type="password"
              bind:value={confirmPassword}
              class="input w-full"
              required
            />
          </label>
        </div>
        <button type="submit" class="btn btn-primary w-full"
          >Update Password</button
        >
        {#if error}
          <p class="text-sm text-red-500 text-center mt-2">{error}</p>
        {/if}
        {#if message}
          <p class="text-sm text-green-400 text-center mt-2">{message}</p>
        {/if}
      </form>
    </div>
  </section>
</SsgoiTransition>
