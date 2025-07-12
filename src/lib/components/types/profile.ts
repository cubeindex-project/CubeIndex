// Enumerations for your PostgreSQL enum types.
// Fill in the actual members from your database schema.
export type UsersRoles =
  | "Admin"
  | "Moderator"
  | "Lead Developer"
  | "Community Manager"
  | "Database Manager"
  | "User";
// …add other roles defined in public.users_roles

export interface Profiles {
  /** Auto-generated ID */
  id: number;

  /** Creation timestamp ISO string, defaults to now() */
  created_at: string;

  /** Auth system UUID */
  user_id: string;

  /** Unique username */
  username: string;

  /** Whether the profile is private, defaults to false */
  private: boolean;

  /** URL to profile picture, defaults to empty string */
  profile_picture: string | null;

  /** User bio */
  bio: string | null;

  /** Social links/details as JSON */
  socials: Record<string, unknown> | null;

  /** Banner image URL */
  banner: string | null;

  /** Whether the user is verified, defaults to false */
  verified: boolean;

  /** Whether the user is certified, defaults to false */
  certified: boolean;

  /** User role, defaults to 'User' */
  role: UsersRoles;
}
