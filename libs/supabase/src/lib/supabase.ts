import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@conecteja/types';
import { ExpoSecureStoreAdapter } from './storage';

/**
 * Helper function to get environment variables from multiple sources
 * Supports Node.js process.env, Expo Constants, and Next.js
 */
function getEnvVar(name: string): string | undefined {
  // For Expo apps, try expo-constants first (works reliably in both web and native)
  try {
    const Constants = require('expo-constants').default;
    if (Constants?.expoConfig?.extra) {
      const keyMap: Record<string, string> = {
        'SUPABASE_URL': 'supabaseUrl',
        'SUPABASE_ANON_KEY': 'supabaseAnonKey',
      };
      const mappedKey = keyMap[name];
      if (mappedKey && Constants.expoConfig.extra[mappedKey]) {
        return Constants.expoConfig.extra[mappedKey];
      }
    }
  } catch (error) {
    console.error(`[Supabase] expo-constants not available:`, error);
  }

  // Try to get from process.env (Node.js, Next.js, Expo Web with Metro)
  if (typeof process !== 'undefined' && process.env) {
    // Try different prefixes
    const variants = [
      name,                          // Direct name
      `EXPO_PUBLIC_${name}`,         // Expo prefix
      `NEXT_PUBLIC_${name}`,         // Next.js prefix
    ];

    for (const variant of variants) {
      const value = process.env[variant];
      if (value) {
        return value;
      }
    }

  }

  return undefined;
}

/**
 * Creates a Supabase client with the anonymous key for client-side operations
 * @returns SupabaseClient instance configured with anon key
 * @throws Error if SUPABASE_URL or SUPABASE_ANON_KEY environment variables are not set
 */
export function createClient(): SupabaseClient<Database> {
  const supabaseUrl = getEnvVar('SUPABASE_URL');
  const supabaseAnonKey = getEnvVar('SUPABASE_ANON_KEY');

  if (!supabaseUrl) {
    console.error('[Supabase] ❌ Could not find SUPABASE_URL. Check your .env file and app.config.js');
    throw new Error('SUPABASE_URL environment variable is not set');
  }

  if (!supabaseAnonKey) {
    console.error('[Supabase] ❌ Could not find SUPABASE_ANON_KEY. Check your .env file and app.config.js');
    throw new Error('SUPABASE_ANON_KEY environment variable is not set');
  }

  // Use the ExpoSecureStoreAdapter that handles both web and native
  // Don't set storageKey - let Supabase use its default based on project URL
  const client = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
    },
  });

  return client;
}

/**
 * Creates a Supabase admin client with the service role key for server-side operations
 * This client bypasses Row Level Security (RLS) policies and should only be used on the server
 * @returns SupabaseClient instance configured with service role key
 * @throws Error if SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables are not set
 */
export function createAdminClient(): SupabaseClient<Database> {
  const supabaseUrl = getEnvVar('SUPABASE_URL');
  const supabaseServiceRoleKey =
    (typeof process !== 'undefined' && process.env ?
      (process.env['SUPABASE_SERVICE_ROLE_KEY'] || process.env['SUPABASE_SERVICE_ROLE']) :
      undefined);

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
