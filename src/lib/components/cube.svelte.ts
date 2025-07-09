export interface CubeType {
  brand: string;
  image_url: string;
  model: string;
  wca_legal: boolean;
  magnetic: boolean;
  rating?: number | null;
  smart: boolean;
  slug: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  modded: boolean;
  type: string; // Could be an enum if you know possible values
  discontinued: boolean;
  release_date: string; // ISO date string or null
  submitted_by: string;
  series: string;
  id: number;
  sub_type:
    | "NxNxN"
    | "Square-N"
    | "Minx"
    | "Shape-Shifting"
    | "Cuboid"
    | "Non-Twisty"
    | "Corner‑Turning";
  weight: number;
  maglev: boolean;
  related_to: string;
  size: number;
  version_type: "Base" | "Trim" | "Limited"; // Should match your cube_version_type enum/union
  version_name: string;
  surface_finish: string; // Should match your cube_surface_finish enum/union
  verified_by: string;
  stickered: boolean;
  status: string; // Should match your submission_status enum/union
  notes?: string;
}
