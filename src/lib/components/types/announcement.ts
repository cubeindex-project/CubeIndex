// Enumeration for your PostgreSQL enum type.
// Fill in all possible values from public.disclaimer_purpose.
export type DisclaimerPurpose = "legal" | "maintenance" | "announcement" | "warning" | "alert" | "promo" | "info" | "update";
// …add other purposes defined in public.disclaimer_purpose

export interface Announcement {
  /** Auto-generated ID */
  id: number;

  /** Announcement message (unique) */
  message: string;

  /** Optional icon identifier, defaults to empty string */
  icon: string | null;

  /** Purpose of the announcement, defaults to 'info' */
  purpose: DisclaimerPurpose;

  /** Optional link URL */
  link: string | null;

  /** Announcement title */
  title: string;

  /** Text for the link, defaults to empty string */
  linkText: string | null;

  /** Creation timestamp ISO string, defaults to now() */
  created_at: string;

  /** Whether the announcement is archived, defaults to false */
  archived: boolean;

  /** Username of the publisher, references profiles.username */
  published_by: string | null;
}
