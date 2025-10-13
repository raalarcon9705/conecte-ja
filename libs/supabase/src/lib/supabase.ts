import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@conecteja/types';
import { ExpoSecureStoreAdapter } from './storage';

/**
 * Creates a Supabase client with the anonymous key for client-side operations
 * @returns SupabaseClient instance configured with anon key
 * @throws Error if SUPABASE_URL or SUPABASE_ANON_KEY environment variables are not set
 */
export function createClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env['SUPABASE_URL'] || process.env['EXPO_PUBLIC_SUPABASE_URL'] || process.env['NEXT_PUBLIC_SUPABASE_URL'];
  const supabaseAnonKey = process.env['SUPABASE_ANON_KEY'] || process.env['EXPO_PUBLIC_SUPABASE_ANON_KEY'] || process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL environment variable is not set');
  }

  if (!supabaseAnonKey) {
    throw new Error('SUPABASE_ANON_KEY environment variable is not set');
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Creates a Supabase admin client with the service role key for server-side operations
 * This client bypasses Row Level Security (RLS) policies and should only be used on the server
 * @returns SupabaseClient instance configured with service role key
 * @throws Error if SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables are not set
 */
export function createAdminClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env['SUPABASE_URL'] || process.env['EXPO_PUBLIC_SUPABASE_URL'] || process.env['NEXT_PUBLIC_SUPABASE_URL'];
  const supabaseServiceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY'] || process.env['SUPABASE_SERVICE_ROLE'];

  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL environment variable is not set');
  }

  if (!supabaseServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_ROLE environment variable is not set');
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
