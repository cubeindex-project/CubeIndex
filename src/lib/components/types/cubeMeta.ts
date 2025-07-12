// If you know all the possible statuses, list them here:
export type SubmissionStatus = "Approved" | "Rejected" | "Pending";
// …add other statuses defined in public.submission_status

export interface CubeModelsMetadata {
  /** Primary key — references cube_models.slug */
  cube: string;

  /** TIMESTAMP WITH TIME ZONE, defaults to now() */
  created_at: string;

  /** TIMESTAMP WITH TIME ZONE, defaults to now() */
  updated_at: string;

  /** references profiles.username */
  submitted_by: string;

  /** references profiles.username */
  verified_by: string;

  /** public.submission_status, defaults to 'Pending' */
  status: SubmissionStatus;

  /** Optional notes field */
  notes?: string | null;
}
