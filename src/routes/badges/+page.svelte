<script>
    // Simulated badge data — connect to Supabase later!
    const badges = [
      {
        name: "3x3 Collector",
        icon: "/images/badges/3x3.png",
        description: "Own at least 5 different 3x3 speedcubes.",
        unlocked: true
      },
      {
        name: "Brand Explorer",
        icon: "/images/badges/brands.png",
        description: "Own cubes from 5 different brands.",
        unlocked: false
      },
      {
        name: "WCA Ready",
        icon: "/images/badges/wca.png",
        description: "Own all 17 official WCA puzzle types.",
        unlocked: false
      },
      {
        name: "OG Collector",
        icon: "/images/badges/og.png",
        description: "Add a cube released before 2010.",
        unlocked: true
      }
    ];
  </script>
  
  <section class="min-h-screen bg-black text-white px-6 py-16">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl sm:text-5xl font-clash font-bold">All available badges</h1>
        <p class="mt-4 text-gray-400 max-w-xl mx-auto">
          Unlock achievements as you build your speedcube collection. Some are easy, some are legendary.
        </p>
      </div>
  
      <!-- Badge Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {#each badges as badge}
          <div class="bg-gray-900 rounded-2xl p-6 text-center hover:shadow-xl transition relative overflow-hidden">
            <!-- Lock overlay -->
            {#if !badge.unlocked}
              <div class="absolute inset-0 bg-black/60 backdrop-blur flex items-center justify-center z-10 text-gray-400">
                <span class="text-sm">Locked</span>
              </div>
            {/if}
  
            <img src={badge.icon} alt={badge.name} class="w-16 h-16 mx-auto mb-4" />
            <h3 class="text-xl font-semibold text-blue-400">{badge.name}</h3>
            <p class="text-sm text-gray-300 mt-2">{badge.description}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>
  