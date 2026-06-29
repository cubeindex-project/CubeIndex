<script lang="ts">
  import { resolve } from "$app/paths";
  import { Turnstile } from "svelte-turnstile";
  import { superForm } from "sveltekit-superforms";
  import { PUBLIC_TURNSTILE_SITE_KEY } from "$env/static/public";
  import ExternalAuthProviders from "$lib/components/layout/ExternalAuthProviders.svelte";
  import { untrack } from "svelte";

  const { data } = $props();
  const { supabase } = $derived(data);

  const {
    form,
    errors,
    delayed,
    enhance,
    message,
    isTainted,
    tainted,
    constraints,
    submitting,
  } = superForm(
    untrack(() => data.form),
    {
      onUpdate({ result }) {
        if (result.type === "failure") {
          resetTurnstile?.();
        }
      },
      delayMs: 500,
      timeoutMs: 8000,
    },
  );

  let showPassword = $state(false);
  let resetError: string = $state("");
  let resetMessage: string = $state("");

  async function resetPassword(e: Event) {
    e.preventDefault();
    resetError = "";
    resetMessage = "";
    if (!$form.email) {
      return (resetError = "Please enter an email");
    }
    const { error: err } = await supabase.auth.resetPasswordForEmail(
      $form.email,
      {
        redirectTo: `${window.location.origin}/auth/reset`,
      },
    );

    if (err) {
      return (resetError = err.message);
    }

    resetMessage = "Check your email to reset your password";
  }

  let resetTurnstile: (() => void) | undefined = $state();
</script>

<section
  class="flex flex-col min-h-screen justify-center px-6 sm:px-12 py-10 bg-base-200"
>
  <div class="w-full max-w-md mx-auto">
    <h1 class="text-3xl font-clash font-bold mb-2">Welcome Back</h1>
    <p class="text-sm mb-8">Log in to your CubeIndex profile</p>
    <form method="POST" class="space-y-6" use:enhance>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Email</legend>
        <input
          name="email"
          type="email"
          bind:value={$form.email}
          class="input w-full"
          {...$constraints.email}
        />
        {#if $errors.email}
          <span class="text-error">
            {$errors.email}
          </span>
        {/if}
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend">Password</legend>
        <div class="flex flex-row items-center">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            class="input w-full"
            {...$constraints.password}
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
        {#if $errors.password}
          <span class="text-error">
            {$errors.password}
          </span>
        {/if}
      </fieldset>

      <p class="text-sm text-gray-500 -mt-5">
        Forgot your password?
        <button
          type="button"
          class="link link-primary link-hover"
          onclick={resetPassword}
        >
          Reset
        </button>
      </p>

      <button
        type="submit"
        class="btn w-full btn-primary btn-lg"
        disabled={$submitting || !isTainted($tainted)}
      >
        {#if $delayed}
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

      <div>
        <Turnstile
          siteKey={PUBLIC_TURNSTILE_SITE_KEY}
          size="flexible"
          bind:reset={resetTurnstile}
        />
        {#if $errors["cf-turnstile-response"]}
          <span class="text-error">
            {$errors["cf-turnstile-response"]}
          </span>
        {/if}
      </div>

      {#if $message}
        <p class="text-error text-sm">
          {$message}
        </p>
      {/if}

      <div class="divider">or with</div>

      <ExternalAuthProviders />
    </form>

    <p class="text-sm text-center text-gray-500 mt-6">
      Don't have an account?
      <a
        href={resolve("/auth/signup")}
        class="link link-primary link-hover ml-1"
      >
        Sign Up
      </a>
    </p>
  </div>
</section>
