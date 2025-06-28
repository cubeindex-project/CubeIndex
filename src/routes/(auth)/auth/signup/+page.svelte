<script lang="ts">
  import { configCatClient } from "$lib/configcatClient";
  import FeatureDisabled from "$lib/components/featureDisabled.svelte";
  import { m } from "$lib/paraglide/messages";
  import { onMount } from "svelte";
  import { enhance } from "$app/forms";

  let { form } = $props();
  let username: string = $state("");
  let email: string = $state("");
  let password: string = $state("");
  let confirmPassword: string = $state("");
  let showPassword: boolean = $state(false);
  let signup: boolean = $state(true);
  let acceptedTOS = $state(false);
  let isSubmitting = $state(false);

  onMount(() =>
    configCatClient.getValueAsync("signup", false).then((value) => {
      signup = value;
    })
  );
</script>

{#if signup}
  <section
    class="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
  >
    <div
      class="w-full max-w-md bg-base-200 border border-base-300 rounded-2xl shadow-lg p-8 z-10"
    >
      <h1 class="text-3xl font-clash font-bold text-center mb-6">
        {m.join_cubeindex()}
      </h1>
      <p class="text-center text-sm mb-8">
        {m.create_free_account()}
      </p>
      <form
        method="POST"
        action="?/signup"
        use:enhance={() => {
          return async ({ update }) => {
            await update({ reset: false });
            isSubmitting = false;
          };
        }}
        onsubmit={() => {
          isSubmitting = true;
        }}
        class="space-y-6"
      >
        <!-- Username -->
        <div>
          <label for="username" class="block text-sm font-medium"
            >{m.label_username()}</label
          >
          <input
            name="username"
            type="text"
            bind:value={username}
            class="input w-full"
            required
          />
        </div>

        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium">{m.label_email()}</label>
          <input
            name="email"
            type="email"
            bind:value={email}
            class="input w-full"
            required
          />
        </div>

        <!-- Password -->
        <div>
          <label for="password" class="block text-sm font-medium"
            >{m.label_password()}</label
          >
          <div class="flex flex-row items-center">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              bind:value={password}
              class="input w-full"
              required
            />
            <label class="swap text-md">
              <input
                type="checkbox"
                onclick={() => (showPassword = !showPassword)}
                class="sr-only peer"
              />
              <i class="fa-solid fa-eye swap-off ml-2 cursor-pointer"></i>
              <i class="fa-solid fa-eye-slash swap-on ml-2 cursor-pointer"></i>
            </label>
          </div>
        </div>

        <!-- Confirm Password -->
        <div>
          <label for="confirmPassword" class="block text-sm font-medium"
            >{m.label_confirm_password()}</label
          >
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            bind:value={confirmPassword}
            class="input w-full"
            required
          />
        </div>

        <!-- Accept ToS {m.and()} {m.privacy_policy()} -->
        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            name="acceptTOS"
            bind:checked={acceptedTOS}
            class="checkbox bg-base-300"
          />
          <label for="acceptTOS" class="text-sm select-none">
            {m.accept_terms_prefix()}
            <a href="/tos" target="_blank" class="link link-primary"
              >{m.terms_of_service()}</a
            >
            and
            <a href="/privacy" target="_blank" class="link link-primary"
              >Privacy Policy</a
            >
          </label>
        </div>

        <!-- Main Sign Up Button -->
        <button
          type="submit"
          class="btn btn-xl w-full btn-primary"
          disabled={isSubmitting ||
            !email ||
            !password ||
            !acceptedTOS ||
            !confirmPassword ||
            !username}
        >
          {#if isSubmitting}
            <span class="loading loading-spinner"></span>
            {m.signing_up()}
          {:else}
            {m.sign_up()}
          {/if}
        </button>

        {#if form?.message}
          <p class="text-sm text-success text-center mt-2">
            {form.message}
          </p>
        {/if}
        {#if form?.error}
          <p class="text-sm text-error text-center mt-2">
            {form.error}
          </p>
        {/if}

        <!-- OR Divider -->
        <div class="divider">{m.or()}</div>

        <!-- {m.sign_up_with_discord()} Button -->
        <a
          type="button"
          href="/auth/discord"
          class="btn btn-lg bg-[#5865F2] text-white w-full mt-4"
        >
          <i class="fa-brands fa-discord text-2xl"></i>
          {m.sign_up_with_discord()}
        </a>
      </form>
      <p class="text-sm text-center mt-6">
        {m.already_have_account()}
        <a href="/auth/login" class="link link-primary link-hover">{m.log_in_lower()}</a>
      </p>
    </div>
  </section>
{:else}
  <FeatureDisabled featureName="Signup is" />
{/if}
