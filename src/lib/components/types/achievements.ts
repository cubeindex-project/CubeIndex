// Enumerations for your PostgreSQL enum types.
// Fill in the actual members from your database schema.
export type BadgeRarity = "Special" | "Legendary" | "Mythic" | "Epic" | "Rare" | "Common";
// …add other rarities defined in public."badge-rarity"

export type UnlockMethod = "Automatic" | "Manual";

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

  /** Username of who submitted it, references profiles.username */
  submitted_by: string | null;

  /** Badge rarity enum, defaults to 'Common' */
  rarity: BadgeRarity;

  /** Optional achievement category enum */
  category: string | null;

  /** Optional display title */
  title: string | null;
}
