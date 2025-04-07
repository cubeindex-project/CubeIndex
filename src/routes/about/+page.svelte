<script>
    const features = [
      {
        title: 'Track Your Collection',
        desc: 'Easily log every cube you own — from 2x2 to 7x7, and beyond. Keep your collection organized and up to date.'
      },
      {
        title: 'Earn Badges',
        desc: 'Unlock achievements and earn unique badges based on the cubes in your collection. From brand loyalty to puzzle type mastery.'
      },
      {
        title: 'Explore Cubes',
        desc: 'Browse a curated, user-driven database of speedcubes from all major brands. Discover new models and there specification.'
      },
      {
        title: 'Built for Speedcubers',
        desc: 'CubeIndex is made by cubers, for cubers. Whether you\'re just starting or an elite solver, there\'s something for everyone.'
      }
    ];
  </script>
  
  <section class="min-h-screen bg-black text-white px-6 py-16">
    <div class="max-w-5xl mx-auto space-y-12">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-4xl sm:text-5xl font-clash font-bold">About CubeIndex</h1>
        <p class="mt-4 text-gray-400 max-w-xl mx-auto">
          CubeIndex is your personal companion for everything related to speedcubing products. It helps you keep track of your cubes, share your collection, and obviously &#10024; brag &#10024;.
        </p>
      </div>
  
      <!-- Features Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {#each features as f}
          <div class="bg-gray-900 rounded-2xl p-6">
            <h3 class="text-xl font-semibold mb-2 text-blue-400">{f.title}</h3>
            <p class="text-gray-300 text-sm">{f.desc}</p>
          </div>
        {/each}
      </div>
  
      <!-- Founder/Creator Credit -->
      <div class="text-center pt-12 border-t border-gray-800">
        <p class="text-sm text-gray-500">
          Built with ❤️‍🔥 by <a href="https://saterz.dev" class="text-blue-500 hover:underline">Saterz</a>
        </p>
      </div>
    </div>
  </section>
  