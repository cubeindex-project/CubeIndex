import type { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { UsersRoles } from "$lib/components/dbTableTypes";

/**
 * Column selection shared by every `v_detailed_profiles` query.
 */
export const DETAILED_PROFILE_COLUMNS = [
	"id",
	"created_at",
	"user_id",
	"username",
	"private",
	"profile_picture",
	"bio",
	"socials",
	"banner",
	"verified",
	"certified",
	"role",
	"display_name",
	"onboarded",
	"user_cubes_count",
	"user_achievements_count",
	"user_following_count",
	"user_follower_count",
	"user_cube_ratings_count",
	"user_avg_rating_count",
].join(", ");

/**
 * Shape returned by the `v_detailed_profiles` view.
 */
export type DetailedProfile = Record<string, unknown> & {
        id: number;
        created_at: string;
        user_id: string;
        username: string;
	private: boolean;
	profile_picture: string | null;
	bio: string | null;
	socials: Record<string, unknown> | null;
	banner: string | null;
	verified: boolean;
	certified: boolean;
	role: UsersRoles;
	display_name: string;
	onboarded: boolean | null;
	user_cubes_count: number;
	user_achievements_count: number;
	user_following_count: number;
	user_follower_count: number;
        user_cube_ratings_count: number;
        user_avg_rating_count: number;
};

/**
 * Builds a reusable `v_detailed_profiles` query with a consistent column list.
 *
 * @param client - Supabase client used to build the query.
 * @returns Supabase query builder scoped to the view.
 */
export const queryDetailedProfiles = (client: SupabaseClient<any>) =>
	client
		.from("v_detailed_profiles")
		.select(DETAILED_PROFILE_COLUMNS) as PostgrestFilterBuilder<
			any,
			DetailedProfile,
			DetailedProfile[]
		>;
