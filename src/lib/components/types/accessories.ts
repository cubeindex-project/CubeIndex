// Enumeration for your PostgreSQL enum type.
// Fill in the actual members from public.accessories_categories
export type AccessoriesCategories =
  | "Timer"
  | "Mat"
  | "Lube"
  | "Storage"
  | "Keychain"
  | "Charging pod"
  | "Bag"
  | "Stand";
// …add other categories defined in public.accessories_categories

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
