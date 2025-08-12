<script lang="ts">
  import { page } from "$app/state";
  import Badge from "$lib/components/user/badge.svelte";
  import { SsgoiTransition } from "@ssgoi/svelte";
  const { data } = $props();
  const { logoDesigner, team } = data;

  const features = [
    {
      title: "Organize Your Cubes",
      icon: "fa-solid fa-boxes",
      desc: "Keep track of your entire collection with ease.",
    },
    {
      title: "Discover New Models",
      icon: "fa-solid fa-search",
      desc: "Explore popular, limited, and community submissions.",
    },
    {
      title: "Track Achievements",
      icon: "fa-solid fa-trophy",
      desc: "Earn badges and milestones for your cubing journey.",
    },
    {
      title: "Community Driven",
      icon: "fa-solid fa-users",
      desc: "Contribute entries, rate cubes, and engage with fellow cubers.",
    },
  ];
</script>

<SsgoiTransition id={page.url.pathname}>
  <div class="space-y-16 px-5 py-12 max-w-5xl mx-auto">
    <!-- Hero -->
    <section class="text-center space-y-2">
      <img
        src="/images/CubeIndex_Logo.webp"
        alt="CubeIndex Logo"
        class="mx-auto w-32 h-32 rounded-2xl"
      />
      <!-- Disclaimer -->
      <p class="text-xs italic">
        Logo designed by <a href="/user/{logoDesigner.username}" class="link"
          >{logoDesigner.display_name}</a
        >.
      </p>
      <h1 class="text-5xl font-bold">Welcome to CubeIndex</h1>
      <p class="text-lg max-w-2xl mx-auto">
        CubeIndex is your ultimate speedcubing companion. Organize, explore, and
        showcase your cube collection — all in one place.
      </p>
    </section>

    <!-- Feature Highlights -->
    <section>
      <h2 class="text-3xl font-semibold text-center mb-8">What You Can Do</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {#each features as f}
          <div
            class="card bg-base-200 shadow transform transition p-6 text-center"
          >
            <div class="stat-figure text-primary mb-4">
              <i class="{f.icon} text-3xl"></i>
            </div>
            <h3 class="text-xl font-medium mb-2">{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        {/each}
      </div>
    </section>

    <!-- Team Spotlight -->
    <section>
      <h2 class="text-3xl font-semibold text-center mb-8">Meet the Team</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {#each team as member}
          <div class="card card-compact bg-base-200 rounded-md p-6 text-center">
            <div class="flex justify-center mb-4">
              {#if member.profile_picture}
                <img
                  src={member.profile_picture}
                  alt="Avatar"
                  class="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-primary shadow-xl object-cover transition-transform duration-200"
                />
              {:else}
                <div
                  class="avatar avatar-placeholder flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-primary bg-base-300 shadow-xl"
                >
                  <span class="text-5xl uppercase font-bold">
                    {member.username.charAt(0)}
                  </span>
                </div>
              {/if}
            </div>
            <h3 class="text-xl font-semibold mb-2">{member.display_name}</h3>
            <div class="mb-4">
              <Badge textSize="sm" profile={member} />
            </div>
            <a href="/user/{member.username}" class="btn btn-neutral w-full">
              Visit Profile <i class="fa-solid fa-arrow-up-right-from-square"
              ></i>
            </a>
          </div>
        {/each}
        <div
          class="card card-compact bg-base-200 transform transition-all rounded-md p-6 text-center"
        >
          <div class="flex justify-center mb-4">
            <img
              src="/images/we-want-you.webp"
              alt="Avatar"
              class="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-primary shadow-xl object-cover transition-transform duration-200"
            />
          </div>
          <h3 class="text-xl font-semibold mb-2">You</h3>
          <a href="https://tally.so/r/w7gbd9" class="btn btn-neutral w-full">
            Apply <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      </div>
    </section>
  </div>
</SsgoiTransition>
