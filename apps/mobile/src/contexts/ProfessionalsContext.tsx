import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import type { Database } from '@conecteja/types';

// Type for professional with all related data
type ProfessionalProfile = Database['public']['Tables']['professional_profiles']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

export interface Professional extends ProfessionalProfile {
  profiles: Profile;
  categories: Category;
  subscription_plan?: {
    name: string;
    slug: string;
  };
}

interface ProfessionalsContextType {
  professionals: Professional[];
  currentProfessional: Professional | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  fetchNearbyProfessionals: (latitude: number, longitude: number, radiusKm?: number) => Promise<void>;
  fetchProfessionalsByCategory: (categoryId: string) => Promise<void>;
  fetchProfessionalById: (professionalId: string) => Promise<Professional | null>;
}

const ProfessionalsContext = createContext<ProfessionalsContextType | undefined>(undefined);

export const ProfessionalsProvider = ({ children }: { children: ReactNode }) => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [currentProfessional, setCurrentProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabase();

  const fetchProfessionals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('professional_profiles')
        .select(`
          *,
          profiles:profile_id (
            id,
            full_name,
            avatar_url,
            city,
            state,
            latitude,
            longitude
          ),
          categories:category_id (
            id,
            name,
            slug
          )
        `)
        .eq('is_verified', true)
        .limit(20);

      if (fetchError) {
        throw fetchError;
      }

      setProfessionals(data as unknown as Professional[] || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar profesionales';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const fetchNearbyProfessionals = useCallback(async (
    latitude: number,
    longitude: number,
    radiusKm = 10
  ) => {
    try {
      setLoading(true);
      setError(null);

      // For now, fetch all professionals and filter client-side
      // TODO: Implement PostGIS distance calculation on backend
      const { data, error: fetchError } = await supabase
        .from('professional_profiles')
        .select(`
          *,
          profiles:profile_id (
            id,
            full_name,
            avatar_url,
            city,
            state,
            latitude,
            longitude
          ),
          categories:category_id (
            id,
            name,
            slug
          )
        `)
        .eq('is_verified', true);

      if (fetchError) throw fetchError;

      // Filter by distance client-side (simple approximation)
      const filtered = (data || []).filter((prof: unknown) => {
        const professional = prof as Professional;
        if (!professional.profiles?.latitude || !professional.profiles?.longitude) return false;
        
        const lat1 = latitude;
        const lon1 = longitude;
        const lat2 = professional.profiles.latitude;
        const lon2 = professional.profiles.longitude;
        
        // Simple distance calculation (Haversine approximation)
        const R = 6371; // Earth radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        
        return distance <= radiusKm;
      });

      setProfessionals(filtered as unknown as Professional[]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar profesionales cercanos';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const fetchProfessionalsByCategory = useCallback(async (categoryId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('professional_profiles')
        .select(`
          *,
          profiles:profile_id (
            id,
            full_name,
            avatar_url,
            city,
            state,
            latitude,
            longitude
          ),
          categories:category_id (
            id,
            name,
            slug
          )
        `)
        .eq('category_id', categoryId)
        .eq('is_verified', true)
        .limit(20);

      if (fetchError) throw fetchError;

      setProfessionals(data as unknown as Professional[] || []);
    } catch (err: unknown) {
      console.error('Error fetching professionals by category:', err);
      const message = err instanceof Error ? err.message : 'Error al cargar profesionales';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const fetchProfessionalById = useCallback(async (professionalId: string): Promise<Professional | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('professional_profiles')
        .select(`
          *,
          profiles:profile_id (
            id,
            full_name,
            avatar_url,
            city,
            state,
            latitude,
            longitude,
            bio
          ),
          categories:category_id (
            id,
            name,
            slug
          )
        `)
        .eq('id', professionalId)
        .single();

      if (fetchError) throw fetchError;

      const professional = data as unknown as Professional;
      setCurrentProfessional(professional);
      return professional;
    } catch (err: unknown) {
      console.error('Error fetching professional by id:', err);
      const message = err instanceof Error ? err.message : 'Error al cargar profesional';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Fetch professionals on mount (Auth is already initialized by the time this runs)
  useEffect(() => {
    fetchProfessionals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ProfessionalsContext.Provider
      value={{
        professionals,
        currentProfessional,
        loading,
        error,
        refetch: fetchProfessionals,
        fetchNearbyProfessionals,
        fetchProfessionalsByCategory,
        fetchProfessionalById,
      }}
    >
      {children}
    </ProfessionalsContext.Provider>
  );
};

export const useProfessionals = () => {
  const context = useContext(ProfessionalsContext);
  if (context === undefined) {
    throw new Error('useProfessionals must be used within a ProfessionalsProvider');
  }
  return context;
};

