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
export type AchievementRarity =
  | "Special"
  | "Mythic"
  | "Legendary"
  | "Exotic"
  | "Epic"
  | "Rare"
  | "Uncommon"
  | "Common";
export type RatingHalfStep = 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 4.5 | 5;
export type CubeReviewStatus = "draft" | "published";

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

  currency: string;
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

  /** Price paid by the user when purchasing the cube */
  purchase_price: number | null;

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

  /** Achievement rarity enum, defaults to 'Common' */
  rarity: AchievementRarity;

  /** Optional achievement category enum */
  category: string | null;

  /** Optional display title */
  title: string | null;
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
  rating: RatingHalfStep;

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

export interface AwardsEvent {
  id: number;
  title: string;
  year: number;
  start_at: Date;
  end_at: Date;
  is_published: boolean;
  created_at: Date;
}

export interface AwardsCategory {
  id: number;
  event_id: number;
  name: string;
  description: string;
  created_at: Date;
  slug: string;
  icon: string;
}

export interface AwardsNominee {
  id: number;
  category_id: number;
  cube_id: number;
  extra_info: string | null;
  created_at: Date;
}

export interface AwardsUserVote {
  id: number;
  user_id: string;
  category_id: number;
  nominee_id: number;
  voted_at: Date;
}

export interface DetailedCube {
  brand: string | null;
  image_url: string;
  image_source: string | null; // vendor name

  model: string;
  rating: number | null;
  rating_count: number;
  slug: string;

  created_at: Date;
  updated_at: Date | null;

  type: string;
  discontinued: boolean | null;
  release_date: Date | null;
  series: string | null;

  id: number;
  sub_type: string | null;
  weight: number | null;
  related_to: string | null;
  version_type: string | null;
  version_name: string | null;
  status: string;
  notes: string | null;
  surface_finish: string | null;
  verified_at: Date | null;
  size: number | null;

  submitted_by_id: string | null; // UUID
  verified_by_id: string | null; // UUID

  ball_core: boolean;
  maglev: boolean;
  magnetic: boolean;
  modded: boolean;
  smart: boolean;
  stickered: boolean;
  wca_legal: boolean;

  name: string;
  year: number | null;
  popularity: number;
  avg_price: number | null;
  low_price: number | null;
}

export interface UserStats {
  user_id: string; // uuid

  cube_count: number; // bigint in SQL, but returned as number in many clients
  collection_value: number | null; // sum(...) can be null if all purchase_price are null

  rating_count: number;
  rating_avg: number | null; // avg(...) can be null if no ratings

  cubes_per_brand: Record<string, number>; // jsonb object: { "gancube": 5, ... }
  cubes_per_store: Record<string, number>; // jsonb object: { "Cubezz": 3, ... }
  cubes_per_type: Record<string, number>; // jsonb object: { "3x3": 10, ... }
  cubes_per_condition: Record<string, number>; // jsonb object: { "new": 2, "used": 5, ... }

  cubes_over_time: Record<string, number>; // jsonb object: { "2026-01": 4, "2026-02": 1, ... }
}

export interface PriceHistoryPoint {
  date: string; // "YYYY-MM-DD"
  price: number;
}

export interface PriceHistoryRow {
  cube_slug: string;
  vendor_name: string;
  price_history: PriceHistoryPoint[]; // aggregated JSON array
}

export interface UserCubeReviewsCategory {
  id: number; // bigint (JS numbers are safe up to 2^53-1)
  created_at: string; // timestamp with time zone (ISO string)
  slug: string; // text
  label: string; // text
  active: boolean; // boolean
}

export interface UserCubeReviewRating {
  created_at: string; // timestamp with time zone (ISO string)
  review_id: number; // bigint
  category_id: number; // bigint
  rating: RatingHalfStep; // real (allowed: > 0.5 and <= 5)
}

export interface UserCubeReview {
  id: number; // bigint (JS numbers are safe up to 2^53-1)
  created_at: string; // timestamp with time zone (ISO string)
  updated_at: string; // timestamp with time zone (ISO string)

  title: string; // text
  review: string; // text
  status: CubeReviewStatus;

  user_id: string; // uuid
  cube: string; // references cube_models.slug
}

export type DetailedUserCubeReviewRatings = Record<string, number>;

export interface DetailedUserCubeReview {
  id: number;
  created_at: string; // timestamptz ISO string
  updated_at: string; // timestamptz ISO string

  title: string;
  review: string;
  status: CubeReviewStatus; // from your enum union
  user_id: string; // uuid
  cube: string; // cube slug

  ratings: DetailedUserCubeReviewRatings; // { [categoryLabel]: rating }

  helpful_count: number;
}

export interface DetailedProfiles {
  id: number; // profiles.id (likely bigint identity)
  created_at: string; // timestamp/timestamptz ISO string
  user_id: string; // uuid
  username: string;
  private: boolean;
  profile_picture: string | null;
  bio: string | null;

  // If socials is json/jsonb in Postgres, keep it flexible.
  socials: Record<string, unknown> | null;

  banner: string | null;
  verified: boolean;
  certified: boolean;

  // If role is a Postgres enum, replace `string` with a union type.
  role: string;

  display_name: string;
  onboarded: boolean;

  // COALESCE(..., 0::bigint)
  user_cubes_count: number;
  user_achievements_count: number;
  user_following_count: number;
  user_follower_count: number;
  user_cube_ratings_count: number;
  cube_reviews_count: number;

  // COALESCE(..., 0::double precision)
  user_avg_rating_count: number;
}

export interface MarketplaceListing {
  id: number; // bigint identity
  created_at: string; // timestamptz ISO string
  updated_at: string; // timestamptz ISO string

  seller_id: string; // uuid (profiles.user_id)

  cube: string; // text (likely cube slug or id stored as text)
  condition: UserCubeCondition;

  price: number; // double precision
  currency: string; // default 'USD'

  location_country: string; // text
  location_region: string | null; // text nullable

  description: string | null; // text nullable
  contact_details: string; // text
  image_url: string | null; // text nullable

  status: string; // text default 'active'
}
