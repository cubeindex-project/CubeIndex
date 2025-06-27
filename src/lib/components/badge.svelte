<script lang="ts">
  import { m } from "$lib/paraglide/messages";
  const { profile, textSize } = $props();

  const roles = [
    { role: `${m.admin}`, bgColor: "bg-red-600", icon: "fa-shield-halved" },
    {
      role: `${m.moderator()}`,
      bgColor: "bg-green-600",
      icon: "fa-shield-halved",
    },
    {
      role: `${m.lead_developer()}`,
      bgColor: "bg-blue-600",
      icon: "fa-computer",
    },
    {
      role: `${m.community_manager()}`,
      bgColor: "bg-purple-600",
      icon: "fa-people-group",
    },
    {
      role: `${m.database_manager()}`,
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
