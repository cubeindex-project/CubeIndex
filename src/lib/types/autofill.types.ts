import type { Enums } from "$lib/types/database.types";

export interface AutofillState {
  storeURL: string;
  errorMessage: string;
  loading: boolean;
  success: boolean;
  reset: () => void;
}

export interface CubeDetailsAutofillResult {
  name?: string;
  brand_id?: number;
  image_url?: string;

  type_id?: number;
  discontinued?: boolean;
  release_date?: string;
  weight?: number;
  version_type?: Enums<"cube_version_type">;
  surface_finish?: Enums<"cube_surface_finish">;
  size?: string;

  magnetic?: boolean;
  maglev?: boolean;
  smart?: boolean;
  stickered?: boolean;
  wca_legal?: boolean;
  modded?: boolean;
  ball_core?: boolean;
}

export interface VendorOfferAutofillResult {
  price?: number;
  availability?: boolean;
}
