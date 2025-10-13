import { useMemo } from 'react';
import { createClient } from '@conecteja/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@conecteja/types';

/**
 * Custom hook to get a memoized Supabase client instance
 * This ensures we only create one client instance per component lifecycle
 */
export function useSupabase(): SupabaseClient<Database> {
  const supabase = useMemo(() => createClient(), []);
  return supabase;
}

