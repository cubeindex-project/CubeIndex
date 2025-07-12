// Enumerations for your PostgreSQL enum types.
export type CubeVersionType = "Base" | "Trim" | "Limited";

export type CubeSurfaceFinishes = "Frosted" | "UV Coated" | "Glossy";

export interface Cube {
  /** Brand, defaults to empty string */
  brand: string;

  /** URL to an image */
  image_url: string;

  /** Model name */
  model: string;

  /** Optional rating (real), defaults to 0 */
  rating?: number | null;

  /** Primary key and slug */
  slug: string;

  /** Creation timestamp, defaults to now() */
  created_at: string;

  /** Update timestamp, defaults to now() */
  updated_at: string;

  /** Cube type */
  type: string;

  /** Optional release date */
  release_date?: string | null;

  /** Optional series, defaults to empty string */
  series?: string | null;

  /** Auto-generated ID */
  id: number;

  /** Optional subtype enum */
  sub_type?: string | null;

  /** Weight (real) */
  weight: number;

  /** Optional relation to another cube’s slug */
  related_to?: string | null;

  /** Size (real) */
  size: number;

  /** Version type enum, defaults to 'Base' */
  version_type: CubeVersionType;

  /** Optional version name, defaults to empty string */
  version_name?: string | null;

  /** Optional surface finish enum */
  surface_finish?: CubeSurfaceFinishes | null;
}
