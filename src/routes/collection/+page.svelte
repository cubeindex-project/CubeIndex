<script>
    // Simulated cube collection — replace with real user data later
    const myCubes = [
      {
        name: "GAN 11 M Pro",
        image: "/images/cubes/gan11.png",
        brand: "GAN",
        type: "3x3",
        year: 2020,
        addedOn: "2023-12-15"
      },
      {
        name: "MoYu Weilong WR M 2021",
        image: "/images/cubes/wrm.png",
        brand: "MoYu",
        type: "3x3",
        year: 2021,
        addedOn: "2024-01-20"
      },
      {
        name: "QiYi Valk 2 M",
        image: "/images/cubes/valk2m.png",
        brand: "QiYi",
        type: "2x2",
        year: 2019,
        addedOn: "2024-02-12"
      }
    ];
  </script>
  
  <section class="min-h-screen bg-black text-white px-6 py-16">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl sm:text-5xl font-clash font-bold">My Collection</h1>
        <p class="mt-4 text-gray-400 max-w-xl mx-auto">
          Every cube you’ve logged lives here. Flex your collection, track your growth, and organize your cubes.
        </p>
      </div>
  
      <!-- Collection Grid -->
      {#if myCubes.length > 0}
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {#each myCubes as cube}
            <div class="bg-gray-900 rounded-2xl p-5 hover:shadow-xl transition">
              <img src={cube.image} alt={cube.name} class="w-full h-40 object-contain mb-4 rounded-lg bg-gray-800" />
              <h2 class="text-xl font-semibold text-blue-400">{cube.name}</h2>
              <p class="text-sm text-gray-400">{cube.brand} · {cube.type}</p>
              <p class="text-xs text-gray-500">Added on {cube.addedOn}</p>
            </div>
          {/each}
        </div>
      {:else}
        <div class="text-center text-gray-500 mt-12">
          <p>You haven’t added any cubes yet. Start building your collection!</p>
          <a href="/explore" class="inline-block mt-4 px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
            Add Your First Cube
          </a>
        </div>
      {/if}
    </div>
  </section>
  