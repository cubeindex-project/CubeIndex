<script>
  // This would normally come from your backend (Supabase, JSON, etc.)
  const cubes = [
    {
      name: "GAN 12 M Maglev",
      image: "/images/gan12.png",
      brand: "GAN",
      type: "3x3",
      released: 2021,
    },
    {
      name: "MoYu RS3M 2020",
      image: "/images/rs3m2020.png",
      brand: "MoYu",
      type: "3x3",
      released: 2020,
    },
    {
      name: "DaYan TengYun V2 M",
      image: "/images/tengyun.png",
      brand: "DaYan",
      type: "3x3",
      released: 2019,
    },
  ];
</script>

<section class="min-h-screen bg-black text-white px-6 py-10">
  <div class="max-w-7xl mx-auto">
    <h1 class="text-4xl sm:text-5xl font-clash font-bold mb-6">
      Explore Cubes
    </h1>
    <p class="text-gray-400 mb-10">
      Browse and discover all kinds of speedcubes in the CubeIndex database.
    </p>

    <!-- Grid of Cubes -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
      {#each cubes as cube}
        <div
          class="bg-gray-900 rounded-2xl shadow hover:shadow-xl transition duration-300 p-4"
        >
          <img
            src={cube.image}
            alt={cube.name}
            class="rounded-xl w-full h-40 object-contain mb-4 bg-gray-800"
          />
          <h2 class="text-xl font-semibold">{cube.name}</h2>
          <p class="text-sm text-gray-400">{cube.brand} · {cube.type}</p>
          <p class="text-sm text-gray-500">Released: {cube.released}</p>
        </div>
      {/each}
    </div>
  </div>
</section>
