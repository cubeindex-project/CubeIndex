// Enumerations for your PostgreSQL enum types.
export type CubeVersionType = "Base" | "Trim" | "Limited";

export type CubeSurfaceFinishes = "Frosted" | "UV Coated" | "Glossy";

export type SubmissionStatus = "Approved" | "Rejected" | "Pending";

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

  /** references profiles.username */
  submitted_by: string;

  /** references profiles.username */
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
