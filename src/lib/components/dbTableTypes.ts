// Enumerations for your PostgreSQL enum types.
export type UserCubeCondition =
  | "New in box"
  | "New"
  | "Good"
  | "Fair"
  | "Worn"
  | "Poor"
  | "Broken";
export type UserCubeStatus =
  | "Owned"
  | "Wishlist"
  | "Loaned"
  | "Borrowed"
  | "Lost";
export type StaffActions = "INSERT" | "UPDATE" | "DELETE";
export type UsersRoles =
  | "Admin"
  | "Moderator"
  | "Lead Developer"
  | "Community Manager"
  | "Database Manager"
  | "User";
export type CubeVersionType = "Base" | "Trim" | "Limited";
export type CubeSurfaceFinishes = "Frosted" | "UV Coated" | "Glossy";
export type SubmissionStatus = "Approved" | "Rejected" | "Pending";
export type DisclaimerPurpose =
  | "legal"
  | "maintenance"
  | "announcement"
  | "warning"
  | "alert"
  | "promo"
  | "info"
  | "update";
export type UnlockMethod = "Automatic" | "Manual";
export type BadgeRarity =
  | "Special"
  | "Legendary"
  | "Mythic"
  | "Epic"
  | "Rare"
  | "Common";
export type AccessoriesCategories =
  | "Timer"
  | "Mat"
  | "Lube"
  | "Storage"
  | "Keychain"
  | "Charging pod"
  | "Bag"
  | "Stand";
export type PriceAlertChannel = "in_app" | "email";

export interface UserFollowsRow {
  /** BIGINT identity (not the primary key). Represented as string for 64‑bit safety. */
  id: string;
  /** UUID of the follower (FK -> profiles.user_id). */
  follower_id: string;
  /** UUID of the followed user (FK -> profiles.user_id). */
  following_id: string;
  /** timestamptz ISO string */
  followed_at: string;
}

export interface Vendors {
  /** Auto-generated ID */
  id: number;

  /** Unique slug identifier */
  slug: string;

  /** Creation timestamp ISO string, defaults to now() */
  created_at: string;

  /** Vendor display name */
  name: string;

  /** Base URL for vendor — must start with http:// or https:// */
  base_url: string;

  /** ISO country code (up to 2 characters) */
  country_iso: string;

  /** Update timestamp ISO string, defaults to now() */
  updated_at: string;

  /** Whether the vendor is active, defaults to true */
  is_active: boolean;

  /** Vendor rating (real), defaults to 0 */
  rating: number;

  /** Optional logo image URL */
  logo_url: string | null;
}

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

  /** Shop the user bought the cube from */
  bought_from: string | null;

  /** Optional notes, defaults to empty string */
  notes: string | null;

  /** Last modification timestamp ISO string, defaults to now() */
  modified_at: string;

  /** Creation timestamp ISO string, defaults to now() */
  created_at: string;

  /** Date acquired, if known */
  acquired_at: string | null;
}

export interface UserAchievements {
  /** Username — references profiles.username */
  username: string;

  /** Achievement name — references achievements.name */
  achievement: string;

  /** Who awarded it, defaults to 'CubeIndex' — references profiles.username */
  awarded_by: string;

  /** When it was awarded (ISO timestamp), defaults to now() */
  awarded_at: string;
}

export interface StaffLogs {
  /** Auto-generated ID */
  id: number;

  /** Username of the staff member — references profiles.username */
  staff: string;

  /** Action performed, constrained by staff_actions enum */
  action: StaffActions;

  /** Name of the table targeted by the action */
  target_table: string;

  /** JSON blob of the previous data state */
  old_data: Record<string, unknown> | null;

  /** JSON blob of the new data state */
  new_data: Record<string, unknown> | null;

  /** Timestamp of when the log entry was created */
  created_at: string;
}

export interface Profiles {
  /** Auto-generated ID */
  id: number;

  /** Creation timestamp ISO string, defaults to now() */
  created_at: string;

  /** Auth system UUID */
  user_id: string;

  /** User choosen username */
  display_name: string;

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

export interface CubeVendorLinks {
  /** Vendor name — references vendors.name */
  vendor_name: string;

  /** URL to the vendor’s page for the cube */
  url: string;

  /** Creation timestamp ISO string, defaults to now() */
  created_at: string;

  /** Auto-generated ID */
  id: number;

  /** Update timestamp ISO string, defaults to now() */
  updated_at: string;

  /** Whether the cube is currently available, defaults to true */
  available: boolean;

  /** Slug of the cube — references cube_models.slug */
  cube_slug: string;

  /** Price at this vendor, defaults to 0 */
  price: number;
}

export interface CubeTypes {
  /** Auto-generated ID */
  id: number;

  /** Type name (unique) */
  name: string;

  /** Popularity count, defaults to 0 */
  popularity: number;

  /** Creation timestamp ISO string, defaults to now() */
  created_at: string;

  /** Shape family, defaults to empty string */
  shape_family: string;

  /** Username who added this type, defaults to 'CubeIndex' — references profiles.username */
  added_by: string;
}

export interface Cube {
  /** Brand, defaults to empty string */
  brand: string;

  /** URL to an image */
  image_url: string;

  /** Model name */
  model: string;

  /** Optional rating (real), defaults to 0 */
  rating?: number | undefined;

  /** Primary key and slug */
  slug: string;

  /** Creation timestamp, defaults to now() */
  created_at: string;

  /** Update timestamp, defaults to now() */
  updated_at: string;

  /** Cube type */
  type: string;

  /** Optional release date */
  release_date: string | undefined;

  /** Optional series, defaults to empty string */
  series?: string | undefined;

  /** Auto-generated ID */
  id: number;

  /** Optional subtype enum */
  sub_type?: string | undefined;

  /** Weight (real) */
  weight: number;

  /** Optional relation to another cube’s slug */
  related_to?: string | undefined;

  /** Size (real) */
  size: number;

  /** Version type enum, defaults to 'Base' */
  version_type: CubeVersionType;

  /** Optional version name, defaults to empty string */
  version_name?: string | undefined;

  /** Optional surface finish enum */
  surface_finish?: CubeSurfaceFinishes | undefined;

  /** references profiles.user_id */
  submitted_by: string;

  /** references profiles.user_id */
  verified_by: string;

  /** public.submission_status, defaults to 'Pending' */
  status: SubmissionStatus;

  /** Optional notes field */
  notes?: string | null;

  /** Discontinued */
  discontinued: boolean;

  /** when the cube was verified by moderator, defaults to null */
  verified_at: string | null;
}

export interface Notifications {
  /** Auto-generated ID — bigint in DB, kept as string to avoid precision issues */
  id: string;

  /** Notification message (non-null) */
  message: string;

  /** Optional icon identifier; from DB: text, null allowed, default '' if not provided */
  icon: string | null;

  /** Optional URL link target for the notification */
  link: string | null;

  /** Text to display for the link; from DB: link_text, default '' or null */
  link_text: string | null;

  /** Creation timestamp ISO string; corresponds to timestamptz in DB */
  created_at: string;

  /** UUID of the user who published the notification; can be null (if system or anonymous) */
  published_by_id: string | null;

  /** UUID of the user for whom this notification is intended; null if broadcast */
  user_id: string | null;

  /** Whether the notification has been read by the user (non-null, default false) */
  read: boolean;
}

export interface CubePriceAlertSubscriptions {
  /** UUID primary key */
  id: string;

  /** Timestamp when the subscription was created */
  created_at: string;

  /** Timestamp when the subscription was last updated */
  updated_at: string;

  /** UUID of the user who owns the subscription */
  user_id: string;

  /** Slug of the cube the alert monitors */
  cube_slug: string;

  /** Desired trigger price (numeric(10,2) in DB) */
  desired_price: number;

  /** Delivery channel for the alert */
  channel: PriceAlertChannel;

  /** Whether the subscription is active */
  active: boolean;

  /** Timestamp when the alert last fired, if ever */
  last_notified_at: string | null;
}

export interface CubePriceAlertEmailQueue {
  /** UUID primary key */
  id: string;

  /** When the email job was enqueued */
  created_at: string;

  /** When the email job was processed */
  processed_at: string | null;

  /** Related alert subscription */
  subscription_id: string;

  /** Target user for the email */
  user_id: string;

  /** Cube slug the alert references */
  cube_slug: string;

  /** Vendor where the price condition was met */
  vendor_name: string | null;

  /** Price used when scheduling the email */
  price: number | null;

  /** Timestamp of the snapshot that triggered the alert */
  snapshot_at: string;

  /** Structured payload for downstream email workers */
  payload: Record<string, unknown>;
}

export interface Achievements {
  /** Auto-generated smallint ID */
  id: number;

  /** Achievement name (unique) */
  name: string;

  /** Icon identifier or URL */
  icon: string;

  /** Description (unique) */
  description: string;

  /** Creation timestamp ISO string, defaults to now() */
  created_at: string;

  /** Update timestamp ISO string, defaults to now() */
  updated_at: string;

  /** Whether the achievement can be unlocked, defaults to false */
  unlockable: boolean;

  /** Slug identifier, defaults to empty string */
  slug: string;

  /** How the achievement is unlocked, constrained to 'Automatic' or 'Manual' */
  unlock_method: UnlockMethod;

  /** Username of who submitted it, references profiles.user_id */
  submitted_by: string | null;

  /** Badge rarity enum, defaults to 'Common' */
  rarity: BadgeRarity;

  /** Optional achievement category enum */
  category: string | null;

  /** Optional display title */
  title: string | null;
}

export interface Accessories {
  /** Release date (ISO date string) */
  release_date: string;

  /** Optional brand, defaults to empty string */
  brand: string | null;

  /** Optional image URL */
  image_url: string | null;

  /** Accessory name (unique) */
  name: string;

  /** Optional rating (real), defaults to 0 */
  rating: number | null;

  /** Creation timestamp (ISO string), defaults to now() */
  created_at: string;

  /** Update timestamp (ISO string), defaults to now() */
  updated_at: string;

  /** Whether approved, defaults to false */
  approved: boolean;

  /** Whether discontinued, defaults to false */
  discontinued: boolean;

  /** Auto-generated ID */
  id: number;

  /** Unique slug identifier */
  slug: string;

  /** Optional category enum */
  category: AccessoriesCategories | null;

  /** Optional compatibility info */
  compatibility: string | null;
}

export interface CubesModelFeatures {
  /** Primary key ID */
  id: number;

  /** Slug of the cube model (FK to cube_models.slug) */
  cube: string;

  /** Code of the feature (FK to cube_features.code) */
  feature: string;

  /** Creation timestamp */
  created_at: string; // ISO 8601 timestamp format
}

export interface UserCubeRatings {
  /** Slug of the cube (FK to cube_models.slug) */
  cube_slug: string;

  /** User's rating for the cube (0.5 to 5) */
  rating: number;

  /** Optional comment from the user */
  comment: string | null;

  /** Last update timestamp */
  updated_at: string; // ISO 8601

  /** Creation timestamp */
  created_at: string; // ISO 8601

  /** Unique internal ID */
  id: number;

  /** ID of the user (FK to profiles.user_id) */
  user_id: string; // UUID
}
