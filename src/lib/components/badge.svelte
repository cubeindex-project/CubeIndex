<script lang="ts">
  const { profile, textSize } = $props();

  const roles = [
    { role: "Admin", bgColor: "bg-red-600", icon: "fa-shield-halved" },
    {
      role: "Moderator",
      bgColor: "bg-green-600",
      icon: "fa-shield-halved",
    },
    { role: "Lead Developer", bgColor: "bg-blue-600", icon: "fa-computer" },
    {
      role: "Community Manager",
      bgColor: "bg-purple-600",
      icon: "fa-people-group",
    },
    {
      role: "Database Manager",
      bgColor: "bg-orange-600",
      icon: "fa-database",
    },
  ];

  const currentRole = roles.find((r) => r.role === profile.role);
</script>

{#if currentRole}
  <span
    class="inline-flex items-center px-2 py-1 rounded {currentRole.bgColor} text-{textSize} font-semibold text-white"
    title={currentRole.role}
  >
    <i class="fa-solid {currentRole.icon} mr-1"></i>
    {currentRole.role}
  </span>
{/if}
