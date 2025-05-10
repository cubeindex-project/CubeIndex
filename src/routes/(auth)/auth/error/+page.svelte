<script lang="ts">
  import { goto } from '$app/navigation';

  // Navigate back to login
  function backToLogin() {
    history.back();
  }
</script>

<section
  class="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden"
>
  <!-- Background Image Overlay -->
  <div class="absolute inset-0 opacity-10">
    <img src="/images/hero-bg.png" alt="" class="w-full h-full object-cover" />
  </div>

  <!-- Error Card -->
  <div
    role="alert"
    aria-live="assertive"
    class="w-full max-w-md bg-neutral-900 border border-red-600 rounded-2xl shadow-lg p-8 z-10"
  >
    <h1 class="text-3xl font-clash font-bold text-center mb-4 text-red-500">
      Email Confirmation Error
    </h1>
    <p class="text-center text-gray-400 mb-6">
      We couldn’t confirm your email address. Please try again or resend the confirmation link.
    </p>
    <div class="flex flex-col gap-4">
      <button
        on:click={backToLogin}
        class="w-full bg-red-600 hover:bg-red-700 transition rounded-lg px-6 py-3 font-semibold text-white text-lg"
      >
        Back
      </button>
    </div>
  </div>
</section>
