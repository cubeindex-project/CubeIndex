import type { Enums } from "$lib/types/database.types";

type UserCubeStatusLabelMap = Record<Enums<"user_cube_status">, string>;

const USER_CUBE_STATUS_MAP = {
  owned: "Owned",
  wanted: "Wanted",
  previously_owned: "Previously owned",
} satisfies UserCubeStatusLabelMap;

/** Shared visual identity for collection statuses. */
export const USER_CUBE_STATUS_PRESENTATION = {
  owned: {
    icon: "fa-solid fa-circle-check",
    badgeClass: "badge-success",
  },
  wanted: {
    icon: "fa-solid fa-heart",
    badgeClass: "badge-secondary",
  },
  previously_owned: {
    icon: "fa-solid fa-clock-rotate-left",
    badgeClass: "badge-outline",
  },
} satisfies Record<
  Enums<"user_cube_status">,
  {
    icon: string;
    badgeClass: string;
  }
>;

export function getUserCubeStatusLabel(status: Enums<"user_cube_status">) {
  return USER_CUBE_STATUS_MAP[status];
}
