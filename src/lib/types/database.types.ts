export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      accessories: {
        Row: {
          approved: boolean;
          brand: string | null;
          category:
            | Database["public"]["Enums"]["accessories_categories"]
            | null;
          compatibility: string | null;
          created_at: string;
          discontinued: boolean;
          id: number;
          image_url: string | null;
          name: string;
          rating: number | null;
          release_date: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          approved?: boolean;
          brand?: string | null;
          category?:
            | Database["public"]["Enums"]["accessories_categories"]
            | null;
          compatibility?: string | null;
          created_at?: string;
          discontinued?: boolean;
          id?: number;
          image_url?: string | null;
          name: string;
          rating?: number | null;
          release_date: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          approved?: boolean;
          brand?: string | null;
          category?:
            | Database["public"]["Enums"]["accessories_categories"]
            | null;
          compatibility?: string | null;
          created_at?: string;
          discontinued?: boolean;
          id?: number;
          image_url?: string | null;
          name?: string;
          rating?: number | null;
          release_date?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      achievements: {
        Row: {
          category:
            | Database["public"]["Enums"]["achievements_categories"]
            | null;
          created_at: string;
          description: string;
          evolutive: boolean;
          evolves_from: string | null;
          hidden: boolean;
          icon: string;
          id: number;
          is_special: boolean;
          name: string;
          rarity: Database["public"]["Enums"]["badge-rarity"];
          slug: string;
          submitted_by_id: string;
          title: string | null;
          unlock_method: string;
          unlockable: boolean;
          updated_at: string;
        };
        Insert: {
          category?:
            | Database["public"]["Enums"]["achievements_categories"]
            | null;
          created_at?: string;
          description: string;
          evolutive?: boolean;
          evolves_from?: string | null;
          hidden?: boolean;
          icon: string;
          id?: number;
          is_special?: boolean;
          name: string;
          rarity?: Database["public"]["Enums"]["badge-rarity"];
          slug?: string;
          submitted_by_id?: string;
          title?: string | null;
          unlock_method?: string;
          unlockable?: boolean;
          updated_at?: string;
        };
        Update: {
          category?:
            | Database["public"]["Enums"]["achievements_categories"]
            | null;
          created_at?: string;
          description?: string;
          evolutive?: boolean;
          evolves_from?: string | null;
          hidden?: boolean;
          icon?: string;
          id?: number;
          is_special?: boolean;
          name?: string;
          rarity?: Database["public"]["Enums"]["badge-rarity"];
          slug?: string;
          submitted_by_id?: string;
          title?: string | null;
          unlock_method?: string;
          unlockable?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "achievements_submitted_by_id_fkey";
            columns: ["submitted_by_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "achievements_submitted_by_id_fkey";
            columns: ["submitted_by_id"];
            isOneToOne: false;
            referencedRelation: "v_detailed_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      awards_category: {
        Row: {
          created_at: string;
          description: string;
          event_id: number;
          id: number;
          name: string;
          slug: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          event_id: number;
          id?: number;
          name: string;
          slug?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          event_id?: number;
          id?: number;
          name?: string;
          slug?: string;
        };
        Relationships: [
          {
            foreignKeyName: "awards_category_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "awards_event";
            referencedColumns: ["id"];
          },
        ];
      };
      awards_event: {
        Row: {
          created_at: string;
          end_at: string;
          id: number;
          start_at: string;
          title: string;
          year: number;
        };
        Insert: {
          created_at?: string;
          end_at: string;
          id?: number;
          start_at: string;
          title: string;
          year: number;
        };
        Update: {
          created_at?: string;
          end_at?: string;
          id?: number;
          start_at?: string;
          title?: string;
          year?: number;
        };
        Relationships: [];
      };
      awards_nominee: {
        Row: {
          category_id: number;
          created_at: string;
          cube_id: number;
          extra_info: string | null;
          id: number;
        };
        Insert: {
          category_id: number;
          created_at?: string;
          cube_id: number;
          extra_info?: string | null;
          id?: number;
        };
        Update: {
          category_id?: number;
          created_at?: string;
          cube_id?: number;
          extra_info?: string | null;
          id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "awards_nominee_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "awards_category";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "awards_nominee_cube_id_fkey";
            columns: ["cube_id"];
            isOneToOne: false;
            referencedRelation: "cube_models";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "awards_nominee_cube_id_fkey";
            columns: ["cube_id"];
            isOneToOne: false;
            referencedRelation: "v_detailed_cube_models";
            referencedColumns: ["id"];
          },
        ];
      };
      awards_user_vote: {
        Row: {
          category_id: number;
          id: number;
          nominee_id: number;
          user_id: string;
          voted_at: string;
        };
        Insert: {
          category_id: number;
          id?: number;
          nominee_id: number;
          user_id: string;
          voted_at?: string;
        };
        Update: {
          category_id?: number;
          id?: number;
          nominee_id?: number;
          user_id?: string;
          voted_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "awards_user_vote_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "awards_category";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "awards_user_vote_nominee_category_fkey";
            columns: ["nominee_id", "category_id"];
            isOneToOne: false;
            referencedRelation: "awards_nominee";
            referencedColumns: ["id", "category_id"];
          },
          {
            foreignKeyName: "awards_user_vote_nominee_id_fkey";
            columns: ["nominee_id"];
            isOneToOne: false;
            referencedRelation: "awards_nominee";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "awards_user_vote_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "awards_user_vote_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "v_detailed_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      brands: {
        Row: {
          added_by_id: string;
          created_at: string;
          id: number;
          name: string;
        };
        Insert: {
          added_by_id: string;
          created_at?: string;
          id?: number;
          name?: string;
        };
        Update: {
          added_by_id?: string;
          created_at?: string;
          id?: number;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "brands_added_by_id_fkey";
            columns: ["added_by_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "brands_added_by_id_fkey";
            columns: ["added_by_id"];
            isOneToOne: false;
            referencedRelation: "v_detailed_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      cube_features: {
        Row: {
          code: string;
          created_at: string;
          id: number;
          label: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          id?: number;
          label: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          id?: number;
          label?: string;
        };
        Relationships: [];
      };
      cube_models: {
        Row: {
          brand: string;
          created_at: string;
          discontinued: boolean;
          id: number;
          image_url: string;
          model: string;
          notes: string | null;
          rating: number | null;
          related_to: string | null;
          release_date: string | null;
          series: string | null;
          size: string | null;
          slug: string;
          status: Database["public"]["Enums"]["submission_status"];
          sub_type: Database["public"]["Enums"]["cubes_subtypes"] | null;
          submitted_by_id: string;
          surface_finish:
            | Database["public"]["Enums"]["cube_surface_finishes"]
            | null;
          type: string;
          updated_at: string;
          verified_at: string | null;
          verified_by_id: string | null;
          version_name: string | null;
          version_type: Database["public"]["Enums"]["cube_version_type"];
          weight: number;
        };
        Insert: {
          brand?: string;
          created_at?: string;
          discontinued?: boolean;
          id?: number;
          image_url: string;
          model: string;
          notes?: string | null;
          rating?: number | null;
          related_to?: string | null;
          release_date?: string | null;
          series?: string | null;
          size?: string | null;
          slug: string;
          status?: Database["public"]["Enums"]["submission_status"];
          sub_type?: Database["public"]["Enums"]["cubes_subtypes"] | null;
          submitted_by_id?: string;
          surface_finish?:
            | Database["public"]["Enums"]["cube_surface_finishes"]
            | null;
          type: string;
          updated_at?: string;
          verified_at?: string | null;
          verified_by_id?: string | null;
          version_name?: string | null;
          version_type?: Database["public"]["Enums"]["cube_version_type"];
          weight: number;
        };
        Update: {
          brand?: string;
          created_at?: string;
          discontinued?: boolean;
          id?: number;
          image_url?: string;
          model?: string;
          notes?: string | null;
          rating?: number | null;
          related_to?: string | null;
          release_date?: string | null;
          series?: string | null;
          size?: string | null;
          slug?: string;
          status?: Database["public"]["Enums"]["submission_status"];
          sub_type?: Database["public"]["Enums"]["cubes_subtypes"] | null;
          submitted_by_id?: string;
          surface_finish?:
            | Database["public"]["Enums"]["cube_surface_finishes"]
            | null;
          type?: string;
          updated_at?: string;
          verified_at?: string | null;
          verified_by_id?: string | null;
          version_name?: string | null;
          version_type?: Database["public"]["Enums"]["cube_version_type"];
          weight?: number;
        };
        Relationships: [
          {
            foreignKeyName: "cube_models_related_to_fkey";
            columns: ["related_to"];
            isOneToOne: false;
            referencedRelation: "cube_models";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "cube_models_related_to_fkey";
            columns: ["related_to"];
            isOneToOne: false;
            referencedRelation: "v_awards_category_winners";
            referencedColumns: ["nominee_slug"];
          },
          {
            foreignKeyName: "cube_models_related_to_fkey";
            columns: ["related_to"];
            isOneToOne: false;
            referencedRelation: "v_detailed_cube_models";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "cube_models_submitted_by_id_fkey";
            columns: ["submitted_by_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "cube_models_submitted_by_id_fkey";
            columns: ["submitted_by_id"];
            isOneToOne: false;
            referencedRelation: "v_detailed_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "cube_models_verified_by_id_fkey";
            columns: ["verified_by_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "cube_models_verified_by_id_fkey";
            columns: ["verified_by_id"];
            isOneToOne: false;
            referencedRelation: "v_detailed_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      cube_scrap_runs: {
        Row: {
          created_at: string;
          error_message: string | null;
          finished_at: string | null;
          id: number;
          name: string | null;
          started_at: string | null;
          status: Database["public"]["Enums"]["cube_scrap_runs_status"];
          url: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          error_message?: string | null;
          finished_at?: string | null;
          id?: number;
          name?: string | null;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["cube_scrap_runs_status"];
          url: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          error_message?: string | null;
          finished_at?: string | null;
          id?: number;
          name?: string | null;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["cube_scrap_runs_status"];
          url?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cube_scrap_runs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "cube_scrap_runs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "v_detailed_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      cube_types: {
        Row: {
          added_by_id: string | null;
          created_at: string;
          id: number;
          name: string;
          popularity: number;
          shape_family: string;
        };
        Insert: {
          added_by_id?: string | null;
          created_at?: string;
          id?: number;
          name: string;
          popularity?: number;
          shape_family?: string;
        };
        Update: {
          added_by_id?: string | null;
          created_at?: string;
          id?: number;
          name?: string;
          popularity?: number;
          shape_family?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cube_types_added_by_id_fkey";
            columns: ["added_by_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "cube_types_added_by_id_fkey";
            columns: ["added_by_id"];
            isOneToOne: false;
            referencedRelation: "v_detailed_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      cube_vendor_links: {
        Row: {
          available: boolean;
          created_at: string;
          cube_slug: string;
          id: number;
          last_modified: string;
          price: number;
          updated_at: string;
          url: string;
          vendor_name: string;
        };
        Insert: {
          available?: boolean;
          created_at?: string;
          cube_slug: string;
          id?: number;
          last_modified?: string;
          price?: number;
          updated_at?: string;
          url: string;
          vendor_name: string;
        };
        Update: {
          available?: boolean;
          created_at?: string;
          cube_slug?: string;
          id?: number;
          last_modified?: string;
          price?: number;
          updated_at?: string;
          url?: string;
          vendor_name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cube_vendor_links_duplicate_cube_slug_fkey";
            columns: ["cube_slug"];
            isOneToOne: false;
            referencedRelation: "cube_models";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "cube_vendor_links_duplicate_cube_slug_fkey";
            columns: ["cube_slug"];
            isOneToOne: false;
            referencedRelation: "v_awards_category_winners";
            referencedColumns: ["nominee_slug"];
          },
          {
            foreignKeyName: "cube_vendor_links_duplicate_cube_slug_fkey";
            columns: ["cube_slug"];
            isOneToOne: false;
            referencedRelation: "v_detailed_cube_models";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "cube_vendor_links_duplicate_vendor_name_fkey";
            columns: ["vendor_name"];
            isOneToOne: false;
            referencedRelation: "v_detailed_cube_models";
            referencedColumns: ["image_source"];
          },
          {
            foreignKeyName: "cube_vendor_links_duplicate_vendor_name_fkey";
            columns: ["vendor_name"];
            isOneToOne: false;
            referencedRelation: "v_detailed_vendors";
            referencedColumns: ["name"];
          },
          {
            foreignKeyName: "cube_vendor_links_duplicate_vendor_name_fkey";
            columns: ["vendor_name"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["name"];
          },
        ];
      };
      cube_vendor_links_snapshot: {
        Row: {
          available: boolean;
          created_at: string;
          cube_slug: string;
          id: number;
          price: number;
          url: string;
          vendor_name: string;
        };
        Insert: {
          available?: boolean;
          created_at?: string;
          cube_slug: string;
          id?: number;
          price?: number;
          url: string;
          vendor_name: string;
        };
        Update: {
          available?: boolean;
          created_at?: string;
          cube_slug?: string;
          id?: number;
          price?: number;
          url?: string;
          vendor_name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cube_vendor_links_snapshot_cube_slug_fkey";
            columns: ["cube_slug"];
            isOneToOne: false;
            referencedRelation: "cube_models";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "cube_vendor_links_snapshot_cube_slug_fkey";
            columns: ["cube_slug"];
            isOneToOne: false;
            referencedRelation: "v_awards_category_winners";
            referencedColumns: ["nominee_slug"];
          },
          {
            foreignKeyName: "cube_vendor_links_snapshot_cube_slug_fkey";
            columns: ["cube_slug"];
            isOneToOne: false;
            referencedRelation: "v_detailed_cube_models";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "cube_vendor_links_snapshot_vendor_name_fkey";
            columns: ["vendor_name"];
            isOneToOne: false;
            referencedRelation: "v_detailed_cube_models";
            referencedColumns: ["image_source"];
          },
          {
            foreignKeyName: "cube_vendor_links_snapshot_vendor_name_fkey";
            columns: ["vendor_name"];
            isOneToOne: false;
            referencedRelation: "v_detailed_vendors";
            referencedColumns: ["name"];
          },
          {
            foreignKeyName: "cube_vendor_links_snapshot_vendor_name_fkey";
            columns: ["vendor_name"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["name"];
          },
        ];
      };
      cubes_model_features: {
        Row: {
          created_at: string;
          cube: string;
          feature: string;
          id: number;
        };
        Insert: {
          created_at?: string;
          cube?: string;
          feature?: string;
          id?: number;
        };
        Update: {
          created_at?: string;
          cube?: string;
          feature?: string;
          id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "cubes_model_features_cube_fkey";
            columns: ["cube"];
            isOneToOne: false;
            referencedRelation: "cube_models";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "cubes_model_features_cube_fkey";
            columns: ["cube"];
            isOneToOne: false;
            referencedRelation: "v_awards_category_winners";
            referencedColumns: ["nominee_slug"];
          },
          {
            foreignKeyName: "cubes_model_features_cube_fkey";
            columns: ["cube"];
            isOneToOne: false;
            referencedRelation: "v_detailed_cube_models";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "cubes_model_features_feature_fkey";
            columns: ["feature"];
            isOneToOne: false;
            referencedRelation: "cube_features";
            referencedColumns: ["code"];
          },
        ];
      };
      helpful_rating: {
        Row: {
          created_at: string;
          id: number;
          rating: number;
          rating_category: Database["public"]["Enums"]["rating_categories"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          rating: number;
          rating_category: Database["public"]["Enums"]["rating_categories"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          rating?: number;
          rating_category?: Database["public"]["Enums"]["rating_categories"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "helpful_rating_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "helpful_rating_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "v_detailed_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      helpful_review: {
        Row: {
          created_at: string;
          id: number;
          review_id: number;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          review_id: number;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          review_id?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "helpful_review_review_id_fkey";
            columns: ["review_id"];
            isOneToOne: false;
            referencedRelation: "user_cube_reviews";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "helpful_review_review_id_fkey";
            columns: ["review_id"];
            isOneToOne: false;
            referencedRelation: "v_detailed_user_cube_reviews";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "helpful_review_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "helpful_review_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "v_detailed_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      notifications: {
        Row: {
          created_at: string;
          icon: string | null;
          id: number;
          link: string | null;
          link_text: string | null;
          message: string;
          published_by_id: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          icon?: string | null;
          id?: number;
          link?: string | null;
          link_text?: string | null;
          message: string;
          published_by_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          icon?: string | null;
          id?: number;
          link?: string | null;
          link_text?: string | null;
          message?: string;
          published_by_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "announcement_published_by_id_fkey";
            columns: ["published_by_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "announcement_published_by_id_fkey";
            columns: ["published_by_id"];
            isOneToOne: false;
            referencedRelation: "v_detailed_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "v_detailed_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      profiles: {
        Row: {
          banner: string | null;
          beta_flags: Json;
          bio: string | null;
          certified: boolean;
          created_at: string;
          display_name: string | null;
          id: number;
          onboarded: boolean;
          private: boolean;
          profile_picture: string | null;
          role: Database["public"]["Enums"]["users_roles"];
          socials: Json | null;
          user_id: string;
          username: string | null;
          verified: boolean;
        };
        Insert: {
          banner?: string | null;
          beta_flags?: Json;
          bio?: string | null;
          certified?: boolean;
          created_at?: string;
          display_name?: string | null;
          id?: number;
          onboarded?: boolean;
          private?: boolean;
          profile_picture?: string | null;
          role?: Database["public"]["Enums"]["users_roles"];
          socials?: Json | null;
          user_id?: string;
          username?: string | null;
          verified?: boolean;
        };
        Update: {
          banner?: string | null;
          beta_flags?: Json;
          bio?: string | null;
          certified?: boolean;
          created_at?: string;
          display_name?: string | null;
          id?: number;
          onboarded?: boolean;
          private?: boolean;
          profile_picture?: string | null;
          role?: Database["public"]["Enums"]["users_roles"];
          socials?: Json | null;
          user_id?: string;
          username?: string | null;
          verified?: boolean;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          comment: string | null;
          created_at: string;
          id: number;
          image_url: string | null;
          report_type: Database["public"]["Enums"]["report_types"];
          reported: string;
          reporter: string;
          resolved: boolean;
          resolved_by: string | null;
          title: string;
        };
        Insert: {
          comment?: string | null;
          created_at?: string;
          id?: number;
          image_url?: string | null;
          report_type: Database["public"]["Enums"]["report_types"];
          reported: string;
          reporter: string;
          resolved?: boolean;
          resolved_by?: string | null;
          title?: string;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          id?: number;
          image_url?: string | null;
          report_type?: Database["public"]["Enums"]["report_types"];
          reported?: string;
          reporter?: string;
          resolved?: boolean;
          resolved_by?: string | null;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reports_reporter_fkey";
            columns: ["reporter"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "reports_reporter_fkey";
            columns: ["reporter"];
            isOneToOne: false;
            referencedRelation: "v_detailed_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "reports_resolved_by_fkey";
            columns: ["resolved_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "reports_resolved_by_fkey";
            columns: ["resolved_by"];
            isOneToOne: false;
            referencedRelation: "v_detailed_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      staff_logs: {
        Row: {
          action: Database["public"]["Enums"]["staff_actions"];
          created_at: string;
          id: number;
          new_data: Json | null;
          old_data: Json | null;
          staff_id: string;
          target_table: string;
        };
        Insert: {
          action: Database["public"]["Enums"]["staff_actions"];
          created_at?: string;
          id?: number;
          new_data?: Json | null;
          old_data?: Json | null;
          staff_id: string;
          target_table: string;
        };
        Update: {
          action?: Database["public"]["Enums"]["staff_actions"];
          created_at?: string;
          id?: number;
          new_data?: Json | null;
          old_data?: Json | null;
          staff_id?: string;
          target_table?: string;
        };
        Relationships: [
          {
            foreignKeyName: "staff_logs_staff_id_fkey";
            columns: ["staff_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "staff_logs_staff_id_fkey";
            columns: ["staff_id"];
            isOneToOne: false;
            referencedRelation: "v_detailed_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      user_achievements: {
        Row: {
          achievement_slug: string;
          awarded_at: string;
          awarded_by_id: string;
          user_id: string;
        };
        Insert: {
          achievement_slug: string;
          awarded_at?: string;
          awarded_by_id?: string;
          user_id: string;
        };
        Update: {
          achievement_slug?: string;
          awarded_at?: string;
          awarded_by_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_slug_fkey";
            columns: ["achievement_slug"];
            isOneToOne: false;
            referencedRelation: "achievements";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "user_achievements_achievement_slug_fkey";
            columns: ["achievement_slug"];
            isOneToOne: false;
            referencedRelation: "v_achievement_rarity";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "user_achievements_awarded_by_id_fkey";
            columns: ["awarded_by_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "user_achievements_awarded_by_id_fkey";
            columns: ["awarded_by_id"];
            isOneToOne: false;
            referencedRelation: "v_detailed_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "v_detailed_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      user_cube_ratings: {
        Row: {
          comment: string | null;
          created_at: string;
          cube_slug: string;
          id: number;
          rating: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          comment?: string | null;
          created_at?: string;
          cube_slug: string;
          id?: number;
          rating: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          cube_slug?: string;
          id?: number;
          rating?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_ratings_cube_slug_fkey";
            columns: ["cube_slug"];
            isOneToOne: false;
            referencedRelation: "cube_models";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "user_ratings_cube_slug_fkey";
            columns: ["cube_slug"];
            isOneToOne: false;
            referencedRelation: "v_awards_category_winners";
            referencedColumns: ["nominee_slug"];
          },
          {
            foreignKeyName: "user_ratings_cube_slug_fkey";
            columns: ["cube_slug"];
            isOneToOne: false;
            referencedRelation: "v_detailed_cube_models";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "user_ratings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "user_ratings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "v_detailed_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      user_cube_reviews: {
        Row: {
          created_at: string;
          cube: string;
          id: number;
          review: string;
          status: Database["public"]["Enums"]["cube_review_status"];
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          cube: string;
          id?: number;
          review: string;
          status?: Database["public"]["Enums"]["cube_review_status"];
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          cube?: string;
          id?: number;
          review?: string;
          status?: Database["public"]["Enums"]["cube_review_status"];
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_cube_reviews_cube_fkey";
            columns: ["cube"];
            isOneToOne: false;
            referencedRelation: "cube_models";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "user_cube_reviews_cube_fkey";
            columns: ["cube"];
            isOneToOne: false;
            referencedRelation: "v_awards_category_winners";
            referencedColumns: ["nominee_slug"];
          },
          {
            foreignKeyName: "user_cube_reviews_cube_fkey";
            columns: ["cube"];
            isOneToOne: false;
            referencedRelation: "v_detailed_cube_models";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "user_cube_reviews_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "user_cube_reviews_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "v_detailed_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      user_cube_reviews_categories: {
        Row: {
          active: boolean;
          created_at: string;
          id: number;
          label: string;
          slug: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          id?: number;
          label: string;
          slug: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          id?: number;
          label?: string;
          slug?: string;
        };
        Relationships: [];
      };
      user_cube_reviews_ratings: {
        Row: {
          category_id: number;
          created_at: string;
          rating: number;
          review_id: number;
        };
        Insert: {
          category_id: number;
          created_at?: string;
          rating: number;
          review_id: number;
        };
        Update: {
          category_id?: number;
          created_at?: string;
          rating?: number;
          review_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "user_cube_reviews_ratings_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "user_cube_reviews_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_cube_reviews_ratings_review_id_fkey";
            columns: ["review_id"];
            isOneToOne: false;
            referencedRelation: "user_cube_reviews";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_cube_reviews_ratings_review_id_fkey";
            columns: ["review_id"];
            isOneToOne: false;
            referencedRelation: "v_detailed_user_cube_reviews";
            referencedColumns: ["id"];
          },
        ];
      };
      user_cubes: {
        Row: {
          acquired_at: string | null;
          bought_from: string | null;
          condition: Database["public"]["Enums"]["user_cube_condition"];
          created_at: string;
          cube: string;
          id: number;
          main: boolean;
          modified_at: string;
          notes: string | null;
          purchase_price: number | null;
          quantity: number;
          status: Database["public"]["Enums"]["user_cube_status"];
          user_id: string;
        };
        Insert: {
          acquired_at?: string | null;
          bought_from?: string | null;
          condition: Database["public"]["Enums"]["user_cube_condition"];
          created_at?: string;
          cube: string;
          id?: number;
          main?: boolean;
          modified_at?: string;
          notes?: string | null;
          purchase_price?: number | null;
          quantity?: number;
          status: Database["public"]["Enums"]["user_cube_status"];
          user_id: string;
        };
        Update: {
          acquired_at?: string | null;
          bought_from?: string | null;
          condition?: Database["public"]["Enums"]["user_cube_condition"];
          created_at?: string;
          cube?: string;
          id?: number;
          main?: boolean;
          modified_at?: string;
          notes?: string | null;
          purchase_price?: number | null;
          quantity?: number;
          status?: Database["public"]["Enums"]["user_cube_status"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_cubes_bought_from_fkey";
            columns: ["bought_from"];
            isOneToOne: false;
            referencedRelation: "v_detailed_vendors";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "user_cubes_bought_from_fkey";
            columns: ["bought_from"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "user_cubes_cube_fkey";
            columns: ["cube"];
            isOneToOne: false;
            referencedRelation: "cube_models";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "user_cubes_cube_fkey";
            columns: ["cube"];
            isOneToOne: false;
            referencedRelation: "v_awards_category_winners";
            referencedColumns: ["nominee_slug"];
          },
          {
            foreignKeyName: "user_cubes_cube_fkey";
            columns: ["cube"];
            isOneToOne: false;
            referencedRelation: "v_detailed_cube_models";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "user_cubes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "user_cubes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "v_detailed_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      user_follows: {
        Row: {
          followed_at: string;
          follower_id: string;
          following_id: string;
          id: number;
        };
        Insert: {
          followed_at?: string;
          follower_id?: string;
          following_id?: string;
          id?: number;
        };
        Update: {
          followed_at?: string;
          follower_id?: string;
          following_id?: string;
          id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "user_follows_follower_id_fkey";
            columns: ["follower_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "user_follows_follower_id_fkey";
            columns: ["follower_id"];
            isOneToOne: false;
            referencedRelation: "v_detailed_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "user_follows_following_id_fkey";
            columns: ["following_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "user_follows_following_id_fkey";
            columns: ["following_id"];
            isOneToOne: false;
            referencedRelation: "v_detailed_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      user_notification_status: {
        Row: {
          notification_id: number;
          read: boolean;
          user_id: string;
        };
        Insert: {
          notification_id: number;
          read?: boolean;
          user_id: string;
        };
        Update: {
          notification_id?: number;
          read?: boolean;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_notification_status_notification_id_fkey";
            columns: ["notification_id"];
            isOneToOne: false;
            referencedRelation: "notifications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_notification_status_notification_id_fkey";
            columns: ["notification_id"];
            isOneToOne: false;
            referencedRelation: "v_notifications_for_user";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_notification_status_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "user_notification_status_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "v_detailed_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      user_onboarding: {
        Row: {
          discovered_via: string;
          id: number;
          interested_features: Json;
          other_text: string | null;
          user_id: string;
        };
        Insert: {
          discovered_via: string;
          id?: number;
          interested_features?: Json;
          other_text?: string | null;
          user_id?: string;
        };
        Update: {
          discovered_via?: string;
          id?: number;
          interested_features?: Json;
          other_text?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_onboarding_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "user_onboarding_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "v_detailed_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      vendors: {
        Row: {
          base_url: string;
          country_iso: string;
          created_at: string;
          currency: Database["public"]["Enums"]["currencies"];
          id: number;
          is_active: boolean;
          logo_url: string | null;
          name: string;
          rating: number;
          slug: string;
          sponsored: boolean;
          updated_at: string;
          verified: boolean;
        };
        Insert: {
          base_url: string;
          country_iso: string;
          created_at?: string;
          currency?: Database["public"]["Enums"]["currencies"];
          id?: number;
          is_active?: boolean;
          logo_url?: string | null;
          name: string;
          rating?: number;
          slug: string;
          sponsored?: boolean;
          updated_at?: string;
          verified?: boolean;
        };
        Update: {
          base_url?: string;
          country_iso?: string;
          created_at?: string;
          currency?: Database["public"]["Enums"]["currencies"];
          id?: number;
          is_active?: boolean;
          logo_url?: string | null;
          name?: string;
          rating?: number;
          slug?: string;
          sponsored?: boolean;
          updated_at?: string;
          verified?: boolean;
        };
        Relationships: [];
      };
    };
    Views: {
      v_achievement_rarity: {
        Row: {
          category:
            | Database["public"]["Enums"]["achievements_categories"]
            | null;
          created_at: string | null;
          description: string | null;
          hidden: boolean | null;
          holders_count: number | null;
          icon: string | null;
          id: number | null;
          name: string | null;
          rarity: string | null;
          rarity_percent: number | null;
          slug: string | null;
          title: string | null;
          unlock_method: string | null;
          unlockable: boolean | null;
        };
        Relationships: [];
      };
      v_awards_category_winners: {
        Row: {
          category_id: number | null;
          nominee_count: number | null;
          nominee_slug: string | null;
          vote_count: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "awards_nominee_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "awards_category";
            referencedColumns: ["id"];
          },
        ];
      };
      v_detailed_cube_models: {
        Row: {
          avg_price: number | null;
          ball_core: boolean | null;
          brand: string | null;
          created_at: string | null;
          discontinued: boolean | null;
          id: number | null;
          image_source: string | null;
          image_url: string | null;
          low_price: number | null;
          maglev: boolean | null;
          magnetic: boolean | null;
          modded: boolean | null;
          model: string | null;
          name: string | null;
          notes: string | null;
          popularity: number | null;
          rating: number | null;
          rating_count: number | null;
          related_to: string | null;
          release_date: string | null;
          series: string | null;
          size: string | null;
          slug: string | null;
          smart: boolean | null;
          status: Database["public"]["Enums"]["submission_status"] | null;
          stickered: boolean | null;
          sub_type: Database["public"]["Enums"]["cubes_subtypes"] | null;
          submitted_by_id: string | null;
          surface_finish:
            | Database["public"]["Enums"]["cube_surface_finishes"]
            | null;
          type: string | null;
          updated_at: string | null;
          verified_at: string | null;
          verified_by_id: string | null;
          version_name: string | null;
          version_type: Database["public"]["Enums"]["cube_version_type"] | null;
          wca_legal: boolean | null;
          weight: number | null;
          year: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "cube_models_related_to_fkey";
            columns: ["related_to"];
            isOneToOne: false;
            referencedRelation: "cube_models";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "cube_models_related_to_fkey";
            columns: ["related_to"];
            isOneToOne: false;
            referencedRelation: "v_awards_category_winners";
            referencedColumns: ["nominee_slug"];
          },
          {
            foreignKeyName: "cube_models_related_to_fkey";
            columns: ["related_to"];
            isOneToOne: false;
            referencedRelation: "v_detailed_cube_models";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "cube_models_submitted_by_id_fkey";
            columns: ["submitted_by_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "cube_models_submitted_by_id_fkey";
            columns: ["submitted_by_id"];
            isOneToOne: false;
            referencedRelation: "v_detailed_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "cube_models_verified_by_id_fkey";
            columns: ["verified_by_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "cube_models_verified_by_id_fkey";
            columns: ["verified_by_id"];
            isOneToOne: false;
            referencedRelation: "v_detailed_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      v_detailed_profiles: {
        Row: {
          banner: string | null;
          bio: string | null;
          certified: boolean | null;
          created_at: string | null;
          cube_reviews_count: number | null;
          display_name: string | null;
          id: number | null;
          onboarded: boolean | null;
          private: boolean | null;
          profile_picture: string | null;
          role: Database["public"]["Enums"]["users_roles"] | null;
          socials: Json | null;
          user_achievements_count: number | null;
          user_avg_rating_count: number | null;
          user_cube_ratings_count: number | null;
          user_cubes_count: number | null;
          user_follower_count: number | null;
          user_following_count: number | null;
          user_id: string | null;
          username: string | null;
          verified: boolean | null;
        };
        Relationships: [];
      };
      v_detailed_user_cube_reviews: {
        Row: {
          created_at: string | null;
          cube: string | null;
          helpful_count: number | null;
          id: number | null;
          ratings: Json | null;
          review: string | null;
          status: Database["public"]["Enums"]["cube_review_status"] | null;
          title: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_cube_reviews_cube_fkey";
            columns: ["cube"];
            isOneToOne: false;
            referencedRelation: "cube_models";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "user_cube_reviews_cube_fkey";
            columns: ["cube"];
            isOneToOne: false;
            referencedRelation: "v_awards_category_winners";
            referencedColumns: ["nominee_slug"];
          },
          {
            foreignKeyName: "user_cube_reviews_cube_fkey";
            columns: ["cube"];
            isOneToOne: false;
            referencedRelation: "v_detailed_cube_models";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "user_cube_reviews_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "user_cube_reviews_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "v_detailed_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      v_detailed_vendors: {
        Row: {
          base_url: string | null;
          buyer_count: number | null;
          country_iso: string | null;
          created_at: string | null;
          currency: Database["public"]["Enums"]["currencies"] | null;
          id: number | null;
          is_active: boolean | null;
          logo_url: string | null;
          name: string | null;
          rating: number | null;
          slug: string | null;
          sponsored: boolean | null;
          updated_at: string | null;
          verified: boolean | null;
        };
        Insert: {
          base_url?: string | null;
          buyer_count?: never;
          country_iso?: string | null;
          created_at?: string | null;
          currency?: Database["public"]["Enums"]["currencies"] | null;
          id?: number | null;
          is_active?: boolean | null;
          logo_url?: string | null;
          name?: string | null;
          rating?: number | null;
          slug?: string | null;
          sponsored?: boolean | null;
          updated_at?: string | null;
          verified?: boolean | null;
        };
        Update: {
          base_url?: string | null;
          buyer_count?: never;
          country_iso?: string | null;
          created_at?: string | null;
          currency?: Database["public"]["Enums"]["currencies"] | null;
          id?: number | null;
          is_active?: boolean | null;
          logo_url?: string | null;
          name?: string | null;
          rating?: number | null;
          slug?: string | null;
          sponsored?: boolean | null;
          updated_at?: string | null;
          verified?: boolean | null;
        };
        Relationships: [];
      };
      v_notifications_for_user: {
        Row: {
          created_at: string | null;
          icon: string | null;
          id: number | null;
          link: string | null;
          link_text: string | null;
          message: string | null;
          published_by_id: string | null;
          read: boolean | null;
          user_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "announcement_published_by_id_fkey";
            columns: ["published_by_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "announcement_published_by_id_fkey";
            columns: ["published_by_id"];
            isOneToOne: false;
            referencedRelation: "v_detailed_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "v_detailed_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      v_price_history: {
        Row: {
          cube_slug: string | null;
          price_history: Json | null;
          vendor_name: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "cube_vendor_links_snapshot_cube_slug_fkey";
            columns: ["cube_slug"];
            isOneToOne: false;
            referencedRelation: "cube_models";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "cube_vendor_links_snapshot_cube_slug_fkey";
            columns: ["cube_slug"];
            isOneToOne: false;
            referencedRelation: "v_awards_category_winners";
            referencedColumns: ["nominee_slug"];
          },
          {
            foreignKeyName: "cube_vendor_links_snapshot_cube_slug_fkey";
            columns: ["cube_slug"];
            isOneToOne: false;
            referencedRelation: "v_detailed_cube_models";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "cube_vendor_links_snapshot_vendor_name_fkey";
            columns: ["vendor_name"];
            isOneToOne: false;
            referencedRelation: "v_detailed_cube_models";
            referencedColumns: ["image_source"];
          },
          {
            foreignKeyName: "cube_vendor_links_snapshot_vendor_name_fkey";
            columns: ["vendor_name"];
            isOneToOne: false;
            referencedRelation: "v_detailed_vendors";
            referencedColumns: ["name"];
          },
          {
            foreignKeyName: "cube_vendor_links_snapshot_vendor_name_fkey";
            columns: ["vendor_name"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["name"];
          },
        ];
      };
      v_user_stats: {
        Row: {
          collection_value: number | null;
          cube_count: number | null;
          cubes_over_time: Json | null;
          cubes_per_brand: Json | null;
          cubes_per_condition: Json | null;
          cubes_per_store: Json | null;
          cubes_per_type: Json | null;
          rating_avg: number | null;
          rating_count: number | null;
          user_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_cubes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "user_cubes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "v_detailed_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
    };
    Functions: {
      build_v_detailed_cube_models: { Args: never; Returns: undefined };
      due_vendor_links_capped: {
        Args: {
          p_backoff_cap?: number;
          p_base?: string;
          p_limit?: number;
          p_per_vendor?: number;
        };
        Returns: {
          available: boolean;
          cube_slug: string;
          id: number;
          price: number;
          streak_unchanged: number;
          updated_at: string;
          url: string;
          vendor_name: string;
        }[];
      };
      get_types: { Args: { enum_type: string }; Returns: Json };
      update_password: {
        Args: {
          current_id: string;
          current_plain_password: string;
          new_plain_password: string;
        };
        Returns: string;
      };
    };
    Enums: {
      accessories_categories:
        | "Timer"
        | "Mat"
        | "Lube"
        | "Storage"
        | "Keychain"
        | "Charging pod"
        | "Bag"
        | "Stand";
      achievements_categories: "Website" | "Quantity";
      "badge-rarity":
        | "Special"
        | "Legendary"
        | "Mythic"
        | "Epic"
        | "Rare"
        | "Common";
      cube_review_status: "published" | "draft" | "hidden";
      cube_scrap_runs_status: "queued" | "done" | "running" | "failed";
      cube_surface_finish:
        | "Matte"
        | "Frosted"
        | "UV Coated"
        | "Glossy"
        | "Sculpted";
      cube_surface_finishes: "Frosted" | "UV Coated" | "Glossy" | "Sculpted";
      cube_version_type: "Base" | "Trim" | "Limited";
      cubes_subtypes:
        | "NxNxN"
        | "Square-N"
        | "Minx"
        | "Shape-Shifting"
        | "Cuboid"
        | "Non-Twisty"
        | "Corner-Turning"
        | "Gear"
        | "Other";
      cubes_subtypes__old_version_to_be_dropped:
        | "NxNxN"
        | "Square-N"
        | "Minx"
        | "Shape-Shifting"
        | "Cuboid"
        | "Non-Twisty"
        | "Corner-Turning";
      currencies:
        | "USD"
        | "GBP"
        | "EUR"
        | "ETB"
        | "AED"
        | "RON"
        | "INR"
        | "RUB"
        | "TRY"
        | "VES"
        | "XAF"
        | "XOF"
        | "ZAR"
        | "PLN"
        | "MXN"
        | "BRL"
        | "CAD"
        | "CHF";
      rating_categories: "cube" | "accessory";
      report_types: "user" | "cube" | "cube-rating" | "website";
      staff_actions: "INSERT" | "UPDATE" | "DELETE";
      submission_status: "Approved" | "Rejected" | "Pending";
      user_cube_condition:
        | "New in box"
        | "New"
        | "Good"
        | "Fair"
        | "Worn"
        | "Poor"
        | "Broken";
      user_cube_status: "Owned" | "Wishlist" | "Loaned" | "Borrowed" | "Lost";
      users_roles:
        | "Admin"
        | "Moderator"
        | "Lead Developer"
        | "Community Manager"
        | "Database Manager"
        | "User";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      accessories_categories: [
        "Timer",
        "Mat",
        "Lube",
        "Storage",
        "Keychain",
        "Charging pod",
        "Bag",
        "Stand",
      ],
      achievements_categories: ["Website", "Quantity"],
      "badge-rarity": [
        "Special",
        "Legendary",
        "Mythic",
        "Epic",
        "Rare",
        "Common",
      ],
      cube_review_status: ["published", "draft", "hidden"],
      cube_scrap_runs_status: ["queued", "done", "running", "failed"],
      cube_surface_finish: [
        "Matte",
        "Frosted",
        "UV Coated",
        "Glossy",
        "Sculpted",
      ],
      cube_surface_finishes: ["Frosted", "UV Coated", "Glossy", "Sculpted"],
      cube_version_type: ["Base", "Trim", "Limited"],
      cubes_subtypes: [
        "NxNxN",
        "Square-N",
        "Minx",
        "Shape-Shifting",
        "Cuboid",
        "Non-Twisty",
        "Corner-Turning",
        "Gear",
        "Other",
      ],
      cubes_subtypes__old_version_to_be_dropped: [
        "NxNxN",
        "Square-N",
        "Minx",
        "Shape-Shifting",
        "Cuboid",
        "Non-Twisty",
        "Corner-Turning",
      ],
      currencies: [
        "USD",
        "GBP",
        "EUR",
        "ETB",
        "AED",
        "RON",
        "INR",
        "RUB",
        "TRY",
        "VES",
        "XAF",
        "XOF",
        "ZAR",
        "PLN",
        "MXN",
        "BRL",
        "CAD",
        "CHF",
      ],
      rating_categories: ["cube", "accessory"],
      report_types: ["user", "cube", "cube-rating", "website"],
      staff_actions: ["INSERT", "UPDATE", "DELETE"],
      submission_status: ["Approved", "Rejected", "Pending"],
      user_cube_condition: [
        "New in box",
        "New",
        "Good",
        "Fair",
        "Worn",
        "Poor",
        "Broken",
      ],
      user_cube_status: ["Owned", "Wishlist", "Loaned", "Borrowed", "Lost"],
      users_roles: [
        "Admin",
        "Moderator",
        "Lead Developer",
        "Community Manager",
        "Database Manager",
        "User",
      ],
    },
  },
} as const;
