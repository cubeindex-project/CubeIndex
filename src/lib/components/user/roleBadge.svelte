<script lang="ts">
  import type { Tables } from "$lib/types/database.types";

  interface Props {
    showRoleName: boolean;
    profile: Pick<Tables<"profiles">, "role">;
    textSize: string;
  }

  const { showRoleName, profile, textSize }: Props = $props();

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

  const currentRole = $derived(roles.find((r) => r.role === profile.role));
</script>

{#if currentRole}
  <span
    class="text-nowrap inline-flex items-center px-2 py-1 rounded {currentRole.bgColor} text-{textSize} font-semibold text-base-content"
    title={currentRole.role}
  >
    <i class="fa-solid {currentRole.icon}"></i>
    {#if showRoleName}
      <span class="ml-1">{currentRole.role}</span>
    {/if}
  </span>
{/if}
