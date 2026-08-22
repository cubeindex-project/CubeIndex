import type { MergeDeep } from "type-fest";
import type { Database as DatabaseGenerated } from "./database-generated.types";
export { Constants } from "./database-generated.types";

type PriceHistory = {
  date: string;
  price: number;
};

type ProfileSocials = {
  x?: string;
  wca?: string;
  reddit?: string;
  discord?: string;
  website?: string;
  youtube?: string;
};

/**
 * A release date and its precision are either both populated or both `null`.
 */
type ReleaseDateFields =
  | {
      release_date: string;
      release_date_precision: DatabaseGenerated["public"]["Enums"]["date_precision"];
    }
  | {
      release_date: null;
      release_date_precision: null;
    };

/**
 * Input may provide a complete release-date pair, a pair of `null` values, or neither field.
 */
type ReleaseDateInput =
  | ReleaseDateFields
  | {
      release_date?: never;
      release_date_precision?: never;
    };

/**
 * Replaces an entity's release-date fields with the required paired-field invariant.
 */
type WithReleaseDate<T> = Omit<T, "release_date" | "release_date_precision"> &
  ReleaseDateFields;

/**
 * Replaces an entity's release-date input fields while preserving the paired-field invariant.
 */
type WithReleaseDateInput<T> = Omit<
  T,
  "release_date" | "release_date_precision"
> &
  ReleaseDateInput;

export type Database = MergeDeep<
  DatabaseGenerated,
  {
    public: {
      Tables: {
        profiles: {
          Row: { socials: ProfileSocials };
          Insert: { socials?: ProfileSocials };
          Update: { socials?: ProfileSocials };
        };
        cube_models: {
          Row: WithReleaseDate<
            DatabaseGenerated["public"]["Tables"]["cube_models"]["Row"]
          >;
        };
      };
      Views: {
        v_detailed_profiles: {
          Row: DatabaseGenerated["public"]["Tables"]["profiles"]["Row"];
        };
        v_detailed_cube_models: {
          Row: WithReleaseDate<
            DatabaseGenerated["public"]["Tables"]["cube_models"]["Row"]
          >;
          Insert: WithReleaseDateInput<
            DatabaseGenerated["public"]["Tables"]["cube_models"]["Insert"]
          >;
          Update: WithReleaseDateInput<
            DatabaseGenerated["public"]["Tables"]["cube_models"]["Update"]
          >;
        };
        v_achievement_rarity: {
          Row: DatabaseGenerated["public"]["Tables"]["achievements"]["Row"];
        };
        v_user_stats: {
          Row: {
            cubes_per_brand: Record<string, number> | null;
            cubes_per_store: Record<string, number> | null;
            cubes_over_time: Record<string, number> | null;
            cubes_per_type: Record<string, number> | null;
            cubes_per_condition: Record<string, number> | null;
          };
        };
        v_detailed_user_cube_reviews: {
          Row: Omit<
            DatabaseGenerated["public"]["Tables"]["user_cube_reviews"]["Row"],
            "ratings" | "helpful_count"
          > & {
            ratings: Record<string, number>;
            helpful_count: number;
          };
        };
        v_detailed_vendors: {
          Row: DatabaseGenerated["public"]["Tables"]["vendors"]["Row"];
        };
        v_price_history: {
          Row: { vendor_name: string; price_history: PriceHistory[] };
        };
        v_notifications_for_user: {
          Row: {
            id: number;
            created_at: string;
          };
        };
      };
    };
  }
>;

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;
