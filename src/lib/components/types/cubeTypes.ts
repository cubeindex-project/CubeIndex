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
