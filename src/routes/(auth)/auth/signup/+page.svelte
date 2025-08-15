<script lang="ts">
  import { enhance } from "$app/forms";
  import { SsgoiTransition } from "@ssgoi/svelte";
  import { page } from "$app/state";

  let { form } = $props();
  let display_name: string = $state("");
  let username: string = $state("");
  let email: string = $state("");
  let password: string = $state("");
  let confirmPassword: string = $state("");
  let showPassword: boolean = $state(false);
  let acceptedTOS = $state(false);
  let isSubmitting = $state(false);
</script>

<svelte:head>
  <title>Signup - CubeIndex</title>
</svelte:head>

<SsgoiTransition id={page.url.pathname}>
  <section
    class="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
  >
    <div
      class="w-full max-w-md bg-base-200 border border-base-300 rounded-2xl shadow-lg p-8 z-10"
    >
      <h1 class="text-3xl font-clash font-bold text-center mb-6">
        Join CubeIndex
      </h1>
      <p class="text-center text-sm mb-8">
        Create a free account to start tracking your collection
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
        <!-- Display Name -->
        <div>
          <label for="username" class="block text-sm font-medium">
            Display Name
          </label>
          <input
            name="display_name"
            type="text"
            bind:value={display_name}
            class="input w-full"
            required
          />
        </div>

        <!-- Username -->
        <div>
          <label for="username" class="block text-sm font-medium">
            Username
          </label>
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
          <label for="email" class="block text-sm font-medium">Email</label>
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
            >Password</label
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
            >Confirm Password</label
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

        <!-- Accept ToS and Privacy Policy -->
        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            name="acceptTOS"
            bind:checked={acceptedTOS}
            class="checkbox bg-base-300"
          />
          <label for="acceptTOS" class="text-sm select-none">
            I accept the
            <a href="/tos" target="_blank" class="link link-primary"
              >Terms of Service</a
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
            !username ||
            !display_name}
        >
          {#if isSubmitting}
            <span class="loading loading-spinner"></span>
            Signing Up...
          {:else}
            Sign Up
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
        <div class="divider">or</div>

        <!-- Sign Up with Discord Button -->
        <a
          type="button"
          href="/auth/discord"
          class="btn btn-lg bg-[#5865F2] text-white w-full mt-4"
        >
          <i class="fa-brands fa-discord text-2xl"></i>
          Sign Up with Discord
        </a>
      </form>
      <p class="text-sm text-center mt-6">
        Already have an account?
        <a href="/auth/login" class="link link-primary link-hover">Log in</a>
      </p>
    </div>
  </section>
</SsgoiTransition>
