<script lang="ts">
  import { resolve } from "$app/paths";
  import { passwordStrength } from "$lib/components/helper_functions/passwordStrength";
  import { untrack } from "svelte";
  import { superForm } from "sveltekit-superforms";

  const { data } = $props();

  const { form, errors, enhance, message, constraints, submitting } = superForm(
    untrack(() => data.form),
    { resetForm: false },
  );

  let showPassword = $state(false);

  const pwStrength = $derived(passwordStrength($form.password));
</script>

<section
  class="flex flex-col min-h-screen justify-center px-6 sm:px-12 py-10 bg-base-200"
>
  <div class="w-full max-w-md mx-auto">
    <h1 class="text-3xl font-clash font-bold mb-2">Reset Password</h1>
    <p class="text-sm mb-8">Enter a new password for your account</p>

    <form class="space-y-6" method="POST" use:enhance>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Password</legend>
        <div class="flex items-center gap-2">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            bind:value={$form.password}
            class="input w-full"
            {...$constraints.password}
          />
          <label class="swap text-md">
            <input
              type="checkbox"
              onchange={() => (showPassword = !showPassword)}
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

        <!-- Strength bar -->
        <div class="mt-3">
          <div class="w-full h-2 bg-base-300 rounded-full overflow-hidden">
            <div
              class="h-2 transition-all"
              style={`width: ${(pwStrength.score + 1) * 20}%;`}
              class:!bg-error={pwStrength.score <= 1}
              class:!bg-warning={pwStrength.score === 2}
              class:!bg-success={pwStrength.score >= 3}
            ></div>
          </div>
          <div class="mt-1 text-xs opacity-80">{pwStrength.label}</div>
          {#if pwStrength.suggestions.length}
            <ul class="mt-1 text-xs opacity-70 list-disc ml-5 space-y-0.5">
              {#each pwStrength.suggestions.slice(0, 3) as s, index (index)}
                <li>{s}</li>
              {/each}
            </ul>
          {/if}
        </div>
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend">Confirm Password</legend>
        <input
          name="confirmPassword"
          type="password"
          bind:value={$form.confirmPassword}
          class="input w-full"
          autocomplete="new-password"
          required
        />
        {#if $errors.confirmPassword}
          <span class="text-error">
            {$errors.confirmPassword}
          </span>
        {/if}
      </fieldset>

      <button
        type="submit"
        class="btn w-full btn-primary btn-lg"
        disabled={$submitting}
      >
        {#if $submitting}
          <span class="loading loading-spinner"></span>
          Updating...
        {:else}
          Update Password
        {/if}
      </button>

      {#if $message}
        <p class="text-sm text-success text-center mt-2">{$message}</p>
      {/if}
    </form>

    <p class="text-sm text-center text-gray-500 mt-6">
      Remembered it?
      <a
        href={resolve("/auth/login")}
        class="link link-primary link-hover ml-1"
      >
        Back to Login
      </a>
    </p>
  </div>
</section>
