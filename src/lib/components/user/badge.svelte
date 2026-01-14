<script lang="ts">
  import { m } from "$lib/paraglide/messages";

  const { profile, textSize } = $props();

  const roles = [
    {
      role: "Admin",
      label: m.user_badge_role_admin_label(),
      bgColor: "bg-red-600",
      icon: "fa-shield-halved",
    },
    {
      role: "Moderator",
      label: m.user_badge_role_moderator_label(),
      bgColor: "bg-green-600",
      icon: "fa-shield-halved",
    },
    {
      role: "Lead Developer",
      label: m.user_badge_role_lead_developer_label(),
      bgColor: "bg-blue-600",
      icon: "fa-computer",
    },
    {
      role: "Community Manager",
      label: m.user_badge_role_community_manager_label(),
      bgColor: "bg-purple-600",
      icon: "fa-people-group",
    },
    {
      role: "Database Manager",
      label: m.user_badge_role_database_manager_label(),
      bgColor: "bg-orange-600",
      icon: "fa-database",
    },
  ];

  const currentRole = roles.find((r) => r.role === profile.role);
</script>

{#if currentRole}
  <span
    class="inline-flex items-center px-2 py-1 rounded {currentRole.bgColor} text-{textSize} font-semibold text-white"
    title={currentRole.label}
  >
    <i class="fa-solid {currentRole.icon} mr-1"></i>
    {currentRole.label}
  </span>
{/if}
