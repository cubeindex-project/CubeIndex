<script>
  const { data } = $props();
  const { profile } = data;

  const roleData = [
    {
      role: "Admin",
      icon: `fa-user-tie`,
      description:
        "As an admin, you're entrusted with moderation powers and system management. You can:",
      items: [
        "Approve or reject new cube submissions",
        "Delete or correct incorrect cube data",
        "Monitor suspicious accounts or abuse",
        "Assign achievements to users",
        "And more...",
      ],
    },
    {
      role: "Moderator",
      icon: "fa-shield-halved",
      description:
        "As a Moderator, you help keep CubeIndex safe, respectful, and welcoming. You monitor activity, enforce rules, and support the community. You can:",
      items: [
        "Watch public chats and stop spam, harassment, or rule-breaking",
        "Use warnings, timeouts, or bans when necessary",
        "Review user reports from the CubeIndex platform",
        "Support event moderation and help enforce event rules",
        "Greet and assist new members in finding their way",
        "Flag serious issues to Admins or escalate platform concerns",
      ],
    },
    {
      role: "Lead Developer",
      icon: "fa-computer",
      description:
        "As Lead Developer, you're responsible for CubeIndex’s codebase and technical direction. You keep the platform stable, scalable, and efficient. You can:",
      items: [
        "Review and merge pull requests on GitHub",
        "Maintain clean code standards and structure",
        "Manage CI/CD pipelines and release deployments",
        "Guide contributors and review developer submissions",
        "Help design new features and backend architecture",
        "Collaborate with Admins and DB Managers on platform needs",
        "Write developer docs and update the contribution guide",
      ],
    },
    {
      role: "Community Manager",
      icon: "fa-people-group",
      description:
        "As a Community Manager, you're the voice and energy of CubeIndex. You help grow the community, boost engagement, and maintain a strong public presence. You can:",
      items: [
        "Plan and host events like contests, AMAs, and weekly challenges",
        "Write and schedule announcements on Discord and CubeIndex",
        "Manage our content calendar and social media posts",
        "Reach out to brands, creators, and partners for collabs",
        "Welcome newcomers and gather community feedback",
        "Track engagement stats and report monthly insights",
        "Review new user form entries and flag suspicious cases",
        "Help manage staff applications and onboard new team members",
      ],
    },
    {
      role: "Database Manager",
      icon: "fa-database",
      description:
        "As a Database Manager, you maintain CubeIndex’s product data—ensuring everything is accurate, clean, and organized. You can:",
      items: [
        "Add or update cube, accessory, and vendor entries",
        "Review and approve user-submitted data",
        "Check for duplicates, broken links, and incorrect pricing",
        "Delete invalid database entries",
        "Follow formatting rules for clean data consistency",
        "Collaborate with Developers on structure and display",
        "Flag suspicious or spam submissions to Admins",
      ],
    },
  ];

  const tools = [
    {
      href: "/staff/cubes",
      icon: "🧊",
      label: "Manage Cubes",
      implemented: true,
    },
    {
      href: "/staff/users",
      icon: "👤",
      label: "Manage Users",
      implemented: false,
    },
    {
      href: "/staff/badges",
      icon: "🏅",
      label: "Assign Achievements",
      implemented: false,
    },
    {
      href: "/staff/reports",
      icon: "🛠️",
      label: "View Reports",
      implemented: false,
    },
    {
      href: "/staff/announcements",
      icon: "📣",
      label: "Manage Announcement",
      implemented: true,
    },
    {
      href: "/staff/reports",
      icon: "🚩",
      label: "User Reports",
      implemented: false,
    },
    {
      href: "/staff/feedback",
      icon: "📝",
      label: "User Feedbacks",
      implemented: false,
    },
  ];

  const currentRole = roleData.find((r) => r.role === profile.role);
</script>

<section class="min-h-screen px-4 py-12">
  <div class="max-w-4xl mx-auto space-y-10">
    <!-- Header -->
    <header class="flex flex-col items-center gap-2 mb-2">
      <div
        class="bg-primary rounded-full px-4 py-1 mb-2 animate-fade-in shadow-sm"
      >
        <span
          class="text-primary-content font-semibold tracking-wider uppercase text-xs"
          >CubeIndex Manager</span
        >
      </div>
      <h1
        class="text-4xl font-black text-primary font-clash drop-shadow mb-2 tracking-tight"
      >
        {profile.role} Control Panel
      </h1>
      <p class="text-base font-medium">
        Welcome, trusted staff member. You help keep CubeIndex <span
          class="text-primary font-bold">clean, fair, and awesome</span
        >.
      </p>
    </header>

    {#if currentRole}
      <section
        class="bg-base-200 p-7 rounded-3xl border border-base-300 flex flex-col sm:flex-row items-start gap-6 animate-fade-in"
      >
        <div class="flex-shrink-0">
          <div class="bg-primary rounded-xl p-4 h-14 w-12">
            <i class="fa-solid {currentRole.icon} text-primary-content"></i>
          </div>
        </div>
        <div>
          <h2 class="text-2xl font-semibold mb-2 text-primary">
            The <span class="lowercase">{profile.role}</span> role:
          </h2>
          <p class="text-sm leading-relaxed mb-2">
            {currentRole.description}
          </p>
          <ul class="space-y-1 text-sm list-inside list-disc pl-2">
            {#each currentRole.items as item}
              <li>{item}</li>
            {/each}
          </ul>
        </div>
      </section>
    {/if}

    <!-- Instructions & Actions -->
    <section
      class="bg-base-200 p-7 rounded-3xl border border-base-300 animate-fade-in"
    >
      <h2 class="text-2xl font-semibold mb-4 text-primary">Available Tools</h2>
      <p class="text-sm mb-7">
        Use the tools below to manage CubeIndex content. Each section is
        self-contained and safe, explore confidently!
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {#each tools as tool}
          {#if tool.implemented}
            <a href={tool.href} class="card bg-base-300">
              <div class="card-body">
                <div class="flex justify-center items-center relative">
                  <span class="card-title text-2xl mb-2">{tool.icon}</span>
                </div>
                <p class="font-bold text-center">{tool.label}</p>
              </div>
            </a>
          {:else}
            <div class="card bg-base-300">
              <div class="card-body">
                <div class="flex justify-center items-center relative">
                  <span class="card-title text-2xl mb-2">{tool.icon}</span>
                  <span
                    class="absolute top-0 right-0 text-xs bg-red-500 text-white px-1 rounded"
                  >
                    Soon
                  </span>
                </div>
                <p class="font-bold text-center">{tool.label}</p>
              </div>
            </div>
          {/if}
        {/each}
      </div>
    </section>

    <!-- Reminder -->
    <div class="text-sm text-center mt-10 tracking-wide italic">
      All actions you take here are <span class="text-primary">logged</span>
      for transparency.<br />
      Be fair, clear, and kind. <span class="text-lg">🫶</span>
    </div>
  </div>
</section>

<style>
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fade-in {
    animation: fade-in 0.5s cubic-bezier(0.3, 2, 0.5, 1) both;
  }
</style>
