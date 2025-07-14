export interface CubeVendorLinks {
  /** Vendor name — references vendors.name */
  vendor_name: string

  /** URL to the vendor’s page for the cube */
  url: string

  /** Creation timestamp ISO string, defaults to now() */
  created_at: string

  /** Auto-generated ID */
  id: number

  /** Update timestamp ISO string, defaults to now() */
  updated_at: string

  /** Whether the cube is currently available, defaults to true */
  available: boolean

  /** Slug of the cube — references cube_models.slug */
  cube_slug: string

  /** Price at this vendor, defaults to 0 */
  price: number
}
