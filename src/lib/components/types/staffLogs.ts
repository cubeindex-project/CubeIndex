// Enumeration for your PostgreSQL enum type.
// Fill in all possible actions from public.staff_actions.
export type StaffActions = "INSERT" | "UPDATE" | "DELETE";
// …add other actions defined in public.staff_actions

export interface StaffLogs {
  /** Auto-generated ID */
  id: number;

  /** Username of the staff member — references profiles.username */
  staff: string;

  /** Action performed, constrained by staff_actions enum */
  action: StaffActions;

  /** Name of the table targeted by the action */
  target_table: string;

  /** JSON blob of the previous data state */
  old_data: Record<string, unknown> | null;

  /** JSON blob of the new data state */
  new_data: Record<string, unknown> | null;

  /** Timestamp of when the log entry was created */
  created_at: string;
}
