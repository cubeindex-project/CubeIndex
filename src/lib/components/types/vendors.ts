export interface Vendors {
  /** Auto-generated ID */
  id: number

  /** Unique slug identifier */
  slug: string

  /** Creation timestamp ISO string, defaults to now() */
  created_at: string

  /** Vendor display name */
  name: string

  /** Base URL for vendor — must start with http:// or https:// */
  base_url: string

  /** ISO country code (up to 2 characters) */
  country_iso: string

  /** Update timestamp ISO string, defaults to now() */
  updated_at: string

  /** Whether the vendor is active, defaults to true */
  is_active: boolean

  /** Vendor rating (real), defaults to 0 */
  rating: number

  /** Optional logo image URL */
  logo_url: string | null
}
