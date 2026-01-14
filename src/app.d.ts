import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "./database.types.ts"; // import generated types
import type { AppLogger } from "$lib/server/logger";
import type { Meta } from "$lib/types/meta";

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      reqId: string;
      log: AppLogger;
      supabase: SupabaseClient<Database>;
      safeGetSession: () => Promise<{
        session: Session | null;
        user: User | null;
      }>;
      session: Session | null;
      user: User | null;
    }
    interface PageData {
      session: Session | null;
      meta?: Meta;
    }
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
