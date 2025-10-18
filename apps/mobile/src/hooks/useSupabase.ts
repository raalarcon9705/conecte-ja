import { createClient } from '@conecteja/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@conecteja/types';

// Create a single Supabase client instance for the entire app
// This prevents "Multiple GoTrueClient instances" warning
let supabaseInstance: SupabaseClient<Database> | null = null;

function getSupabaseInstance(): SupabaseClient<Database> {
  if (!supabaseInstance) {
    supabaseInstance = createClient();
  }
  return supabaseInstance;
}

/**
 * Custom hook to get the singleton Supabase client instance
 * This ensures we only create ONE client instance for the entire app
 */
export function useSupabase(): SupabaseClient<Database> {
  return getSupabaseInstance();
}

