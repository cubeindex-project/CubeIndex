<script lang="ts">
  import type { Tables } from "$lib/types/database.types";

  interface Props {
    showRoleName: boolean;
    profile: Pick<Tables<"profiles">, "role">;
    textSize?: string;
  }

  const { showRoleName, profile, textSize }: Props = $props();

  const ROLE_MAP = {
    Admin: { bg: "bg-red-600", icon: "fa-shield-halved" },
    Moderator: { bg: "bg-green-600", icon: "fa-shield-halved" },
    "Lead Developer": { bg: "bg-blue-600", icon: "fa-computer" },
    "Community Manager": { bg: "bg-purple-600", icon: "fa-people-group" },
    "Database Manager": { bg: "bg-orange-600", icon: "fa-database" },
  } as const;

  const roleInfo = $derived(
    profile.role && profile.role in ROLE_MAP
      ? ROLE_MAP[profile.role as keyof typeof ROLE_MAP]
      : null,
  );
</script>

{#if roleInfo && profile.role}
  <span
    class="text-nowrap inline-flex items-center px-2 py-1 rounded {roleInfo.bg} text-{textSize} font-semibold text-base-content tooltip {showRoleName
      ? 'sm:before:hidden sm:after:hidden'
      : ''}"
    data-tip={profile.role}
  >
    <i class="fa-solid {roleInfo.icon}"></i>
    {#if showRoleName}
      <span class="ml-1 hidden sm:inline">{profile.role}</span>
    {/if}
  </span>
{/if}
