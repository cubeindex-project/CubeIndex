<script lang="ts">
  import { untrack } from "svelte";
  import { superForm } from "sveltekit-superforms";

  let { data } = $props();

  const { form, errors, enhance, message, constraints, submitting } = superForm(
    untrack(() => data.form),
    {
      resetForm: false,
    },
  );
</script>

<section
  class="flex flex-col min-h-screen justify-center px-6 sm:px-12 py-10 bg-base-200"
>
  <div class="w-full max-w-md mx-auto">
    <h1 class="text-3xl font-clash font-bold mb-2">Almost there!</h1>
    <p class="text-sm opacity-80 mb-6">
      Choose a unique username to finalize your CubeIndex profile.
    </p>

    <form class="space-y-6" method="POST" use:enhance>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Display Name</legend>
        <input
          name="display_name"
          type="text"
          bind:value={$form.display_name}
          class="input w-full"
          {...$constraints.display_name}
        />
        {#if $errors.display_name}
          <span class="text-error text-sm block mt-1">
            {$errors.display_name}
          </span>
        {/if}
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend">Username</legend>
        <input
          name="username"
          type="text"
          bind:value={$form.username}
          class="input w-full"
          {...$constraints.username}
        />
        <p class="label">
          You won't be able to change it in the future! Choose wisely!
        </p>
        {#if $errors.username}
          <span class="text-error text-sm block mt-1">
            {$errors.username}
          </span>
        {/if}
      </fieldset>

      {#if $message}
        <p class="text-error text-sm">
          {$message}
        </p>
      {/if}

      <button
        type="submit"
        class="btn btn-lg w-full btn-primary"
        disabled={$submitting}
      >
        {#if $submitting}
          <span class="loading loading-spinner"></span>
          Saving...
        {:else}
          Continue
        {/if}
      </button>
    </form>
  </div>
</section>
