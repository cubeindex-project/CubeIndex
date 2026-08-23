import type { Enums } from "$lib/types/database.types";

type UserCubeStatusLabelMap = Record<Enums<"user_cube_status">, string>;

const USER_CUBE_STATUS_MAP = {
  owned: "Owned",
  wanted: "Wanted",
  previously_owned: "Previously owned",
} satisfies UserCubeStatusLabelMap;

export function getUserCubeStatusLabel(status: Enums<"user_cube_status">) {
  return USER_CUBE_STATUS_MAP[status];
}
