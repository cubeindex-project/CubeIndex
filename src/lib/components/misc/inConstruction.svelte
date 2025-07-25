<section
  class="min-h-screen flex flex-col items-center justify-center px-6 text-center relative stripe-bg overflow-hidden"
>
  <div class="relative z-10">
    <div
      class="text-6xl sm:text-8xl font-extrabold text-warning drop-shadow-[0_0_30px_rgba(255,215,0,0.4)]"
    >
      🚧
    </div>
    <h1 class="text-4xl text-warning sm:text-5xl font-bold mt-4">
      Page in Construction
    </h1>
    <p class="mt-4 text-lg max-w-xl">
      We're currently working hard to finish this part of the site. Check back
      soon for something awesome!
    </p>

    <a href="/" class="btn btn-warning btn-lg mt-6"> 🏠 Return Home </a>
  </div>
</section>

<style>
  .stripe-bg::before {
    content: "";
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      45deg,
      rgba(255, 215, 0, 0.05),
      rgba(255, 215, 0, 0.05) 10px,
      transparent 10px,
      transparent 20px
    );
    z-index: 0;
  }
</style>
