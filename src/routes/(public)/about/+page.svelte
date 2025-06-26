<script lang="ts">
  import Badge from "$lib/components/badge.svelte";
  import { m } from "$lib/paraglide/messages.js";
  const { data } = $props();
  const { profiles } = data;

  const features = [
    {
      title: m.about_feature_organize(),
      icon: "fa-solid fa-boxes",
      desc: m.about_feature_organize_desc(),
    },
    {
      title: m.about_feature_discover(),
      icon: "fa-solid fa-search",
      desc: m.about_feature_discover_desc(),
    },
    {
      title: m.about_feature_track(),
      icon: "fa-solid fa-trophy",
      desc: m.about_feature_track_desc(),
    },
    {
      title: m.about_feature_community(),
      icon: "fa-solid fa-users",
      desc: m.about_feature_community_desc(),
    },
  ];

  const team = profiles.filter((p: any) => p.role !== "User" && p.username !== "CubeIndex");

  const logoDesigner = profiles.filter((p: any) => p.username === "CubeLite")
</script>

<div class="space-y-16 px-5 py-12 max-w-5xl mx-auto">
  <!-- Hero -->
  <section class="text-center space-y-2">
    <img
      src="/images/CubeIndex - Pixel Art.png"
      alt="CubeIndex Logo"
      class="mx-auto w-32 h-32 rounded-2xl"
    />
    <!-- Disclaimer -->
    <p class="text-xs text-gray-500 italic">{m.about_logo_by()} <a href="/user/{logoDesigner[0].id}" class="link">{logoDesigner[0].username}</a>.</p>
    <h1 class="text-5xl font-bold">{m.about_welcome()}</h1>
    <p class="text-lg max-w-2xl mx-auto">
      {m.about_description()}
    </p>
  </section>

  <!-- Feature Highlights -->
  <section>
    <h2 class="text-3xl font-semibold text-center mb-8">{m.about_features_heading()}</h2>
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
    <h2 class="text-3xl font-semibold text-center mb-8">{m.about_team_heading()}</h2>
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
          <h3 class="text-xl font-semibold mb-2">{member.username}</h3>
          <div class="mb-4">
            <Badge textSize="sm" profile={member} />
          </div>
          <a href="/user/{member.id}" class="btn btn-neutral w-full">
            {m.visit_profile()} <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      {/each}
      <div
        class="card card-compact bg-base-200 shadow-md hover:shadow-xl transform transition-all rounded-md p-6 text-center"
      >
        <div class="flex justify-center mb-4">
          <img
            src="/images/we want you.webp"
            alt="Avatar"
            class="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-primary shadow-xl object-cover transition-transform duration-200"
          />
        </div>
        <h3 class="text-xl font-semibold mb-2">{m.about_you()}</h3>
        <a href="https://tally.so/r/w7gbd9" class="btn btn-neutral w-full">
          {m.about_apply()} <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
      </div>
    </div>
  </section>
</div>
