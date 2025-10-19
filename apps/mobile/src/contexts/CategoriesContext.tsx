import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import type { Database } from '@conecteja/types';

type Category = Database['public']['Tables']['categories']['Row'];

interface CategoriesContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export const CategoriesProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabase();

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;

      setCategories(data || []);
    } catch (err: unknown) {
      console.error('[CategoriesContext] Error fetching categories:', err);
      const message = err instanceof Error ? err.message : 'Error al cargar categorías';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Fetch categories on mount (Auth is already initialized by the time this runs)
  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        loading,
        error,
        refetch: fetchCategories,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
};

