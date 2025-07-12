// Enumerations for your PostgreSQL enum types.
// Fill in all actual values from public.user_cube_condition and public.user_cube_status.
export type UserCubeCondition = "New in box" | "New" | "Good" | "Fair" | "Worn" | "Poor" | "Broken";
// …add other conditions defined in public.user_cube_condition

export type UserCubeStatus = "Owned" | "Wishlist" | "Loaned" | "Borrowed" | "Lost";
// …add other statuses defined in public.user_cube_status

export interface UserCubes {
  /** Slug of the cube — references cube_models.slug */
  cube: string;

  /** Username — references profiles.username */
  username: string;

  /** Whether this is the user's main cube, defaults to false */
  main: boolean;

  /** Quantity owned, defaults to 1 */
  quantity: number;

  /** Physical condition of the cube */
  condition: UserCubeCondition;

  /** User-specific status of the cube */
  status: UserCubeStatus;

  /** Optional notes, defaults to empty string */
  notes: string | null;

  /** Last modification timestamp ISO string, defaults to now() */
  modified_at: string;

  /** Creation timestamp ISO string, defaults to now() */
  created_at: string;

  /** Date acquired, if known */
  acquired_at: string | null;
}
